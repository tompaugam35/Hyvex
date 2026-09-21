// Le modèle renvoie parfois un JSON valide mais mal emboîté : soit un champ
// censé être un tableau arrive sous forme de texte JSON, soit tout l'objet
// est emballé dans une seule clé sous forme de texte. Ces deux fonctions
// dépilent ces cas avant la validation zod.

export function deplierEnveloppeUnique(input: unknown): unknown {
  if (input && typeof input === "object") {
    const entrees = Object.entries(input as Record<string, unknown>);
    if (entrees.length === 1 && typeof entrees[0][1] === "string") {
      try {
        const parse = JSON.parse(entrees[0][1] as string);
        if (parse && typeof parse === "object") return parse;
      } catch {
        // laisse tel quel
      }
    }
  }
  return input;
}

export function depilerChampTableau(valeurBrute: unknown, cle: string): unknown {
  let valeur = valeurBrute;
  while (typeof valeur === "string") {
    try {
      valeur = JSON.parse(valeur);
    } catch {
      break;
    }
  }
  if (!Array.isArray(valeur) && valeur && typeof valeur === "object" && cle in valeur) {
    valeur = (valeur as Record<string, unknown>)[cle];
  }
  return valeur;
}

// Filet de sécurité pour les champs "liste de phrases" (constats, ajustements) :
// si le modèle renvoie un paragraphe brut plutôt qu'un tableau JSON, on le
// découpe en lignes plutôt que d'échouer la validation.
export function versListeDeChaines(valeur: unknown): unknown {
  if (typeof valeur !== "string") return valeur;
  const lignes = valeur
    .split(/\n+/)
    .map((ligne) => ligne.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter(Boolean);
  return lignes.length > 0 ? lignes : [valeur];
}
