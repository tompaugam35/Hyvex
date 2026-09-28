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
import {
  decrireAutresSports,
  decrireMorphologie,
  decrireObjectifsTexte,
  decrirePerformanceCourse,
  decrirePerformanceMuscu,
  decrirePriorite,
  regleExclusionQualites,
} from "./contexte";
import { seancesHybrideDepuisTotal } from "./mapper";

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
        description:
          "Les séances de la semaine suivante (le jour de réalisation sera choisi par l'athlète).",
        items: {
          type: "object",
          properties: {
            titre: { type: "string" },
            qualite: { type: "string", enum: ["course", "muscu", "explosivite"] },
            dureeEstimeeMinutes: { type: "number" },
            intensite: {
              type: "string",
              enum: ["faible", "moderee", "elevee"],
              description: "Niveau d'intensité perçu de la séance.",
            },
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
          required: ["titre", "qualite", "dureeEstimeeMinutes", "intensite", "exercices"],
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

function formaterDureeCourse(secondes: number) {
  const min = Math.floor(secondes / 60);
  const sec = Math.round(secondes % 60);
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function decrireCourse(
  jour: string,
  seance: AdapterRequest["seancesPrecedentes"][number],
  log: AdapterRequest["logs"][number] | undefined
): string {
  if (!log) {
    return `- ${jour} — ${seance.titre} (course) : réalisée, sans détail.`;
  }

  const details: string[] = [];
  if (log.distanceMetres && log.dureeSecondes) {
    const km = log.distanceMetres / 1000;
    const allureSecondes = log.dureeSecondes / km;
    details.push(
      `${km.toFixed(1)} km en ${formaterDureeCourse(log.dureeSecondes)} (allure ${formaterDureeCourse(allureSecondes)}/km)`
    );
  }
  if (log.deniveleMetres) details.push(`D+ ${log.deniveleMetres}m`);
  if (log.terrain) details.push(log.terrain);
  details.push(`ressenti ${log.rpe}/10`);
  if (log.notes) details.push(`notes : "${log.notes}"`);

  return `- ${jour} — ${seance.titre} (course) : réalisée. ${details.join(", ")}.`;
}

function decrireSeance(
  seance: AdapterRequest["seancesPrecedentes"][number],
  logs: AdapterRequest["logs"]
): string {
  const jour = seance.jour ?? "jour non placé";

  if (seance.statut === "a_venir") {
    return `- ${jour} — ${seance.titre} (${seance.qualite}) : non réalisée`;
  }

  const log = logs.find((l) => l.seanceId === seance.id);

  if (seance.qualite === "course") {
    return decrireCourse(jour, seance, log);
  }

  if (!log) {
    return `- ${jour} — ${seance.titre} (${seance.qualite}) : réalisée, sans détail de ressenti.`;
  }

  const retoursExercices = (log.retoursExercices ?? [])
    .map((r) => {
      const exercice = seance.exercices.find((e) => e.id === r.exerciceId);
      return `${exercice?.nom ?? "exercice"} (${difficulteLabel[r.difficulte]})`;
    })
    .join(", ");

  return `- ${jour} — ${seance.titre} (${seance.qualite}) : réalisée. RPE ${log.rpe}/10, fatigue ${log.fatigue}/10. Exercices : ${retoursExercices}.${log.notes ? ` Notes : "${log.notes}"` : ""}`;
}

function construirePrompt(requete: AdapterRequest): string {
  const { profil, seancesPrecedentes, logs, numeroSemainePrecedente } = requete;

  const detailSeances = seancesPrecedentes
    .map((s) => decrireSeance(s, logs))
    .join("\n");

  const seancesHybrid = seancesHybrideDepuisTotal(profil.seancesParSemaine, profil.autresSports);
  const exclusion = regleExclusionQualites(profil.qualitesPrioritaires);

  return `Profil de l'athlète :
- Prénom : ${profil.prenom}
- Niveau : ${niveauLabel[profil.niveau]}
- Taille / poids : ${decrireMorphologie(profil.tailleCm, profil.poidsKg)}
- Priorité : ${decrirePriorite(profil.qualitesPrioritaires)}
- Niveau course à pied (temps réalisés) : ${decrirePerformanceCourse(profil.performanceCourse)}
- Niveau musculation (charges actuelles) : ${decrirePerformanceMuscu(profil.performanceMuscu)}
- Objectifs précis communiqués : ${decrireObjectifsTexte(profil.objectifsTexte)}
- Autres sports pratiqués (hors app) : ${decrireAutresSports(profil.autresSports)}
- Objectifs (pondération) : ${profil.objectifs.course}% course, ${profil.objectifs.muscu}% muscu, ${profil.objectifs.explosivite}% explosivité
- Disponibilité totale : ${profil.seancesParSemaine} séances de sport par semaine, dont ${seancesHybrid} à générer ici ; environ ${profil.dureeSeanceMinutes} minutes par séance
- Matériel disponible : ${profil.materiel.join(", ")}

Bilan de la semaine ${numeroSemainePrecedente} :
${detailSeances}

Analyse cette semaine et génère le programme de la semaine ${numeroSemainePrecedente + 1}. Règles :
- Pour la musculation et l'explosivité, ajuste charges/volumes/exercices en te basant sur le RPE, la fatigue et la difficulté par exercice (ex : si plusieurs exercices étaient "trop facile" et le RPE bas, augmente la charge ou le volume ; si "trop difficile" ou RPE/fatigue élevés, allège ou stabilise).
- Pour la course, ajuste distance/allure/dénivelé en te basant sur le ressenti, l'allure réelle et le terrain communiqués (ex : ressenti bas avec allure rapide → tu peux augmenter légèrement le volume ou l'intensité ; ressenti élevé ou allure en difficulté → stabilise ou allège). Si aucune donnée n'est disponible pour une séance réalisée, garde un volume prudent et stable.
- Une séance "non réalisée" ne doit pas être ignorée : réduis légèrement la charge globale ou adapte la répartition plutôt que d'accumuler le volume manqué.
- Si des temps de course ou des charges de musculation sont communiqués, calibre précisément les allures et les charges proposées sur ces données réelles plutôt que sur des estimations génériques.
- Si la taille et/ou le poids sont communiqués, tiens-en compte pour ajuster les charges de musculation (ex : ratio charge/poids de corps) et les repères des exercices de course et d'explosivité (foulée, hauteur de saut, mobilité).
- Si l'athlète pratique d'autres sports, tiens compte de la charge et de la fatigue que ça représente déjà.${exclusion ? `\n- ${exclusion}` : ""}
- Respecte toujours ${seancesHybrid} séances, ~${profil.dureeSeanceMinutes} minutes chacune, avec le matériel disponible.
- L'athlète choisira lui-même quel jour placer chaque séance : ne les attribue pas à des jours précis, mais indique un niveau d'intensité (faible, modérée, élevée) cohérent pour chacune, pour qu'il puisse les espacer correctement.
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
