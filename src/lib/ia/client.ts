import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function anthropicClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY manquante. Ajoute-la dans le fichier .env.local à la racine du projet."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}
