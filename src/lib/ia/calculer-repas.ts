import { anthropicClient } from "./client";
import { deplierEnveloppeUnique } from "./normaliser";
import { repasAnalyseSchema, type RepasAnalyse } from "./schema";

const MODEL = "claude-sonnet-5";

const CALCULER_REPAS_TOOL = {
  name: "calculer_repas",
  description:
    "Enregistre l'estimation nutritionnelle totale du repas, calculée à partir de ses aliments et de leur poids.",
  input_schema: {
    type: "object" as const,
    properties: {
      calories: { type: "number", description: "Total des calories du repas, en kcal" },
      proteinesG: { type: "number", description: "Total des protéines, en grammes" },
      glucidesG: { type: "number", description: "Total des glucides, en grammes" },
      lipidesG: { type: "number", description: "Total des lipides, en grammes" },
    },
    required: ["calories", "proteinesG", "glucidesG", "lipidesG"],
  },
};

interface Aliment {
  nom: string;
  poidsGrammes: number;
}

export async function calculerRepasIA(titre: string, aliments: Aliment[]): Promise<RepasAnalyse> {
  const client = anthropicClient();

  const listeAliments = aliments.map((a) => `- ${a.nom} : ${a.poidsGrammes} g`).join("\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      "Tu es un nutritionniste expert. À partir d'une liste d'aliments et de leur poids en " +
      "grammes, tu calcules le total des calories et macronutriments (protéines, glucides, " +
      "lipides) du repas, en te basant sur des valeurs nutritionnelles standards par aliment " +
      "(pour 100g). Fais toujours une estimation raisonnable même en cas d'incertitude sur " +
      "l'aliment exact ou son mode de préparation. Tu réponds uniquement en appelant l'outil " +
      "fourni.",
    messages: [
      {
        role: "user",
        content: `Repas : "${titre}"\nAliments :\n${listeAliments}\n\nCalcule le total des calories et macronutriments de ce repas.`,
      },
    ],
    tools: [CALCULER_REPAS_TOOL],
    tool_choice: { type: "tool", name: "calculer_repas" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("L'IA n'a pas renvoyé de calcul structuré.");
  }

  const input = deplierEnveloppeUnique(toolUse.input) as Record<string, unknown>;
  const parsed = repasAnalyseSchema.safeParse({ titre, ...input });
  if (!parsed.success) {
    throw new Error("Le calcul du repas est invalide : " + parsed.error.message);
  }

  return parsed.data;
}
