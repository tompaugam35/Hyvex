import { anthropicClient } from "./client";
import {
  deplierEnveloppeUnique,
  depilerChampTableau,
  versListeDeChaines,
} from "./normaliser";
import {
  bilanEtProgrammeSchema,
  type AdapterRequest,
  type BilanEtProgramme,
} from "./schema";

const MODEL = "claude-sonnet-5";

const ANALYSER_TOOL = {
  name: "analyser_et_adapter",
  description:
    "Enregistre le bilan de la semaine écoulée et le programme adapté de la semaine suivante.",
  input_schema: {
    type: "object" as const,
    properties: {
      constats: {
        type: "array",
        description:
          "2 à 4 constats courts et concrets sur la semaine écoulée (charge, fatigue, régularité, ressenti par qualité physique).",
        items: { type: "string" },
      },
      ajustements: {
        type: "array",
        description:
          "2 à 4 changements concrets appliqués au programme de la semaine suivante, et pourquoi.",
        items: { type: "string" },
      },
      seances: {
        type: "array",
        description: "Les séances de la semaine suivante, réparties sur les jours disponibles.",
        items: {
          type: "object",
          properties: {
            jour: {
              type: "string",
              enum: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
            },
            titre: { type: "string" },
            qualite: { type: "string", enum: ["course", "muscu", "explosivite"] },
            dureeEstimeeMinutes: { type: "number" },
            exercices: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  nom: { type: "string" },
                  qualite: { type: "string", enum: ["course", "muscu", "explosivite"] },
                  series: { type: "number" },
                  repetitions: { type: "string" },
                  charge: { type: "string" },
                  reposSecondes: { type: "number" },
                },
                required: ["nom", "qualite"],
              },
            },
          },
          required: ["jour", "titre", "qualite", "dureeEstimeeMinutes", "exercices"],
        },
      },
    },
    required: ["constats", "ajustements", "seances"],
  },
};

const niveauLabel: Record<AdapterRequest["profil"]["niveau"], string> = {
  debutant: "débutant",
  intermediaire: "intermédiaire",
  avance: "avancé",
};

const difficulteLabel = {
  facile: "trop facile",
  parfait: "parfait",
  difficile: "trop difficile",
};

function decrireSeance(
  seance: AdapterRequest["seancesPrecedentes"][number],
  logs: AdapterRequest["logs"]
): string {
  if (seance.statut === "a_venir") {
    return `- ${seance.jour} — ${seance.titre} (${seance.qualite}) : non réalisée`;
  }

  if (seance.qualite === "course") {
    return `- ${seance.jour} — ${seance.titre} (course) : réalisée, mais données de performance pas encore disponibles (intégration Strava à venir) — se baser uniquement sur le fait qu'elle a été complétée.`;
  }

  const log = logs.find((l) => l.seanceId === seance.id);
  if (!log) {
    return `- ${seance.jour} — ${seance.titre} (${seance.qualite}) : réalisée, sans détail de ressenti.`;
  }

  const retoursExercices = log.retoursExercices
    .map((r) => {
      const exercice = seance.exercices.find((e) => e.id === r.exerciceId);
      return `${exercice?.nom ?? "exercice"} (${difficulteLabel[r.difficulte]})`;
    })
    .join(", ");

  return `- ${seance.jour} — ${seance.titre} (${seance.qualite}) : réalisée. RPE ${log.rpe}/10, fatigue ${log.fatigue}/10. Exercices : ${retoursExercices}.${log.notes ? ` Notes : "${log.notes}"` : ""}`;
}

function construirePrompt(requete: AdapterRequest): string {
  const { profil, seancesPrecedentes, logs, numeroSemainePrecedente } = requete;

  const detailSeances = seancesPrecedentes
    .map((s) => decrireSeance(s, logs))
    .join("\n");

  return `Profil de l'athlète :
- Prénom : ${profil.prenom}
- Niveau : ${niveauLabel[profil.niveau]}
- Objectifs (pondération) : ${profil.objectifs.course}% course, ${profil.objectifs.muscu}% muscu, ${profil.objectifs.explosivite}% explosivité
- Disponibilité : ${profil.joursDisponibles} jours/semaine, environ ${profil.dureeSeanceMinutes} minutes par séance
- Matériel disponible : ${profil.materiel.join(", ")}

Bilan de la semaine ${numeroSemainePrecedente} :
${detailSeances}

Analyse cette semaine et génère le programme de la semaine ${numeroSemainePrecedente + 1}. Règles :
- Pour la musculation et l'explosivité, ajuste charges/volumes/exercices en te basant sur le RPE, la fatigue et la difficulté par exercice (ex : si plusieurs exercices étaient "trop facile" et le RPE bas, augmente la charge ou le volume ; si "trop difficile" ou RPE/fatigue élevés, allège ou stabilise).
- Pour la course, comme les données de performance ne sont pas encore disponibles, ajuste seulement en fonction de la complétion (séance faite ou non) : garde un volume prudent et stable si elle a été faite, n'augmente pas agressivement.
- Une séance "non réalisée" ne doit pas être ignorée : réduis légèrement la charge globale ou adapte la répartition plutôt que d'accumuler le volume manqué.
- Respecte toujours ${profil.joursDisponibles} séances, ~${profil.dureeSeanceMinutes} minutes chacune, avec le matériel disponible.
- Les constats et ajustements doivent être courts, concrets et directement liés aux données ci-dessus (pas de généralités).
- Utilise le français pour tout.

Appelle l'outil analyser_et_adapter avec le résultat.`;
}

export async function adapterProgrammeIA(
  requete: AdapterRequest
): Promise<BilanEtProgramme> {
  const client = anthropicClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system:
      "Tu es un coach sportif expert en préparation d'athlètes hybrides (course à pied, musculation, explosivité). Tu analyses les données d'une semaine d'entraînement et adaptes le programme suivant pour faire progresser l'athlète sans le blesser. Tu réponds uniquement en appelant l'outil fourni, en français.",
    messages: [{ role: "user", content: construirePrompt(requete) }],
    tools: [ANALYSER_TOOL],
    tool_choice: { type: "tool", name: "analyser_et_adapter" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("L'IA n'a pas renvoyé de bilan structuré.");
  }

  const input = deplierEnveloppeUnique(toolUse.input) as Record<string, unknown>;
  const donnees = {
    constats: versListeDeChaines(depilerChampTableau(input?.constats, "constats")),
    ajustements: versListeDeChaines(depilerChampTableau(input?.ajustements, "ajustements")),
    seances: depilerChampTableau(input?.seances, "seances"),
  };

  const parsed = bilanEtProgrammeSchema.safeParse(donnees);
  if (!parsed.success) {
    throw new Error("Le bilan généré par l'IA est invalide : " + parsed.error.message);
  }

  return parsed.data;
}
