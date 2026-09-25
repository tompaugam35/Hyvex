import { anthropicClient } from "./client";
import { deplierEnveloppeUnique } from "./normaliser";
import { objectifsNutritionSchema, type ObjectifsNutrition } from "./schema";

const MODEL = "claude-sonnet-5";

const CALCULER_OBJECTIFS_TOOL = {
  name: "calculer_objectifs_nutrition",
  description:
    "Enregistre les objectifs quotidiens de calories et macronutriments adaptés à l'athlète et à son poids souhaité.",
  input_schema: {
    type: "object" as const,
    properties: {
      calories: { type: "number", description: "Objectif quotidien de calories, en kcal" },
      proteinesG: { type: "number", description: "Objectif quotidien de protéines, en grammes" },
      glucidesG: { type: "number", description: "Objectif quotidien de glucides, en grammes" },
      lipidesG: { type: "number", description: "Objectif quotidien de lipides, en grammes" },
    },
    required: ["calories", "proteinesG", "glucidesG", "lipidesG"],
  },
};

const niveauLabel: Record<string, string> = {
  debutant: "débutant",
  intermediaire: "intermédiaire",
  avance: "avancé",
};

interface ProfilPourNutrition {
  niveau: string;
  tailleCm?: number;
  poidsKg?: number;
  poidsObjectifKg?: number;
  seancesParSemaine: number;
}

export async function calculerObjectifsNutritionIA(
  profil: ProfilPourNutrition
): Promise<ObjectifsNutrition> {
  const client = anthropicClient();

  const prompt = `Profil de l'athlète :
- Niveau sportif : ${niveauLabel[profil.niveau] ?? profil.niveau}
- Taille : ${profil.tailleCm ? `${profil.tailleCm} cm` : "non communiquée"}
- Poids actuel : ${profil.poidsKg ? `${profil.poidsKg} kg` : "non communiqué"}
- Poids souhaité : ${profil.poidsObjectifKg ? `${profil.poidsObjectifKg} kg` : "non communiqué"}
- Activité : ${profil.seancesParSemaine} séances de sport par semaine (course à pied, musculation, explosivité)

Calcule des objectifs quotidiens de calories et macronutriments (protéines, glucides, lipides) réalistes et sûrs pour aider cet athlète hybride à évoluer vers son poids souhaité tout en soutenant son niveau d'activité sportive. Priorise toujours un apport protéique suffisant pour la récupération musculaire. Si le poids actuel, le poids souhaité ou la taille ne sont pas communiqués, fais une estimation raisonnable pour un adulte sportif actif plutôt que de refuser.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      "Tu es un nutritionniste sportif expert. Tu calcules des objectifs nutritionnels " +
      "quotidiens sûrs, réalistes et jamais extrêmes (pas de déficit ou surplus calorique " +
      "dangereux). Tu réponds uniquement en appelant l'outil fourni, en français.",
    messages: [{ role: "user", content: prompt }],
    tools: [CALCULER_OBJECTIFS_TOOL],
    tool_choice: { type: "tool", name: "calculer_objectifs_nutrition" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("L'IA n'a pas renvoyé d'objectifs structurés.");
  }

  const input = deplierEnveloppeUnique(toolUse.input);
  const parsed = objectifsNutritionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Les objectifs nutritionnels sont invalides : " + parsed.error.message);
  }

  return parsed.data;
}
