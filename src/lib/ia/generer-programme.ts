import { anthropicClient } from "./client";
import {
  programmeGenereSchema,
  type ProfilInput,
  type ProgrammeGenere,
} from "./schema";
import { deplierEnveloppeUnique, depilerChampTableau } from "./normaliser";

const MODEL = "claude-sonnet-5";

const CREER_PROGRAMME_TOOL = {
  name: "creer_programme",
  description: "Enregistre le programme d'entraînement hebdomadaire généré pour l'utilisateur.",
  input_schema: {
    type: "object" as const,
    properties: {
      seances: {
        type: "array",
        description: "Les séances de la semaine (le jour de réalisation sera choisi par l'athlète).",
        items: {
          type: "object",
          properties: {
            titre: { type: "string", description: "Ex: \"Course — Fractionné\"" },
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
                  series: { type: "number", description: "Nombre de séries, si pertinent" },
                  repetitions: {
                    type: "string",
                    description: "Ex: \"8-10\", \"6x400m\", \"20 min\"",
                  },
                  charge: {
                    type: "string",
                    description: "Ex: \"60kg\", \"allure 5:00/km\", laisser vide si non pertinent",
                  },
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
    required: ["seances"],
  },
};

const niveauLabel: Record<ProfilInput["niveau"], string> = {
  debutant: "débutant (découvre ou reprend le sport)",
  intermediaire: "intermédiaire (s'entraîne régulièrement)",
  avance: "avancé (s'entraîne sérieusement depuis plusieurs années)",
};

const prioriteLabel: Record<ProfilInput["priorite"], string> = {
  course: "prioriser la course à pied (vitesse/endurance)",
  muscu: "prioriser la musculation (force)",
  explosivite: "prioriser l'explosivité (puissance, pliométrie)",
  equilibre: "progresser de façon équilibrée sur les trois qualités",
};

function construirePrompt(profil: ProfilInput): string {
  return `Profil de l'athlète :
- Prénom : ${profil.prenom}
- Niveau : ${niveauLabel[profil.niveau]}
- Priorité : ${prioriteLabel[profil.priorite]}
- Disponibilité : ${profil.joursDisponibles} jours d'entraînement par semaine, environ ${profil.dureeSeanceMinutes} minutes par séance
- Matériel disponible : ${profil.materiel.join(", ")}

Génère le programme d'entraînement de la première semaine pour cet athlète hybride (course à pied + musculation + explosivité). L'athlète choisira lui-même quel jour placer chaque séance : ne les attribue donc pas à des jours précis. Contraintes :
- Exactement ${profil.joursDisponibles} séances.
- Chaque séance dure environ ${profil.dureeSeanceMinutes} minutes.
- N'utilise que du matériel parmi : ${profil.materiel.join(", ")}.
- Adapte le volume et l'intensité au niveau ${profil.niveau}.
- Respecte la priorité indiquée tout en gardant un minimum des deux autres qualités physiques pour rester "hybride".
- Indique un niveau d'intensité (faible, modérée, élevée) cohérent pour chaque séance, pour que l'athlète puisse lui-même espacer les séances intenses en les plaçant dans la semaine.
- Utilise le français pour tous les titres et noms d'exercices.

Appelle l'outil creer_programme avec le résultat.`;
}

export async function genererProgrammeIA(
  profil: ProfilInput
): Promise<ProgrammeGenere> {
  const client = anthropicClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system:
      "Tu es un coach sportif expert en préparation d'athlètes hybrides (course à pied, musculation, explosivité). Tu conçois des programmes hebdomadaires progressifs, sûrs et personnalisés. Tu réponds uniquement en appelant l'outil fourni, en français.",
    messages: [{ role: "user", content: construirePrompt(profil) }],
    tools: [CREER_PROGRAMME_TOOL],
    tool_choice: { type: "tool", name: "creer_programme" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("L'IA n'a pas renvoyé de programme structuré.");
  }

  const input = deplierEnveloppeUnique(toolUse.input);
  const seances = depilerChampTableau(
    (input as { seances?: unknown })?.seances,
    "seances"
  );

  const parsed = programmeGenereSchema.safeParse({ seances });
  if (!parsed.success) {
    throw new Error("Le programme généré par l'IA est invalide : " + parsed.error.message);
  }

  return parsed.data;
}
