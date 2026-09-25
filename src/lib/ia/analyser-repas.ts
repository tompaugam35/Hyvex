import { anthropicClient } from "./client";
import { deplierEnveloppeUnique } from "./normaliser";
import { repasAnalyseSchema, type RepasAnalyse } from "./schema";

const MODEL = "claude-sonnet-5";

type MediaType = "image/jpeg" | "image/png" | "image/webp";

const ANALYSER_REPAS_TOOL = {
  name: "analyser_repas",
  description: "Enregistre l'estimation nutritionnelle du repas visible sur la photo.",
  input_schema: {
    type: "object" as const,
    properties: {
      titre: {
        type: "string",
        description: "Nom court et concret du plat, ex : \"Poulet riz brocolis\"",
      },
      calories: { type: "number", description: "Estimation des calories totales, en kcal" },
      proteinesG: { type: "number", description: "Estimation des protéines, en grammes" },
      glucidesG: { type: "number", description: "Estimation des glucides, en grammes" },
      lipidesG: { type: "number", description: "Estimation des lipides, en grammes" },
    },
    required: ["titre", "calories", "proteinesG", "glucidesG", "lipidesG"],
  },
};

export async function analyserRepasIA(
  imageBase64: string,
  mediaType: MediaType
): Promise<RepasAnalyse> {
  const client = anthropicClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      "Tu es un nutritionniste expert. À partir d'une photo de repas, tu estimes le plus " +
      "précisément possible les calories et macronutriments (protéines, glucides, lipides), en " +
      "te basant sur les aliments visibles, leurs quantités apparentes et leur mode de cuisson. " +
      "Fais toujours une estimation raisonnable même en cas d'incertitude, ne refuse jamais de " +
      "répondre. Tu réponds uniquement en appelant l'outil fourni, en français.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          {
            type: "text",
            text: "Analyse ce repas et estime ses calories et macronutriments.",
          },
        ],
      },
    ],
    tools: [ANALYSER_REPAS_TOOL],
    tool_choice: { type: "tool", name: "analyser_repas" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("L'IA n'a pas renvoyé d'analyse structurée.");
  }

  const input = deplierEnveloppeUnique(toolUse.input);
  const parsed = repasAnalyseSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("L'analyse du repas est invalide : " + parsed.error.message);
  }

  return parsed.data;
}
