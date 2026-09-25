// Le modèle renvoie parfois un JSON valide mais mal emboîté : soit un champ
// censé être un tableau arrive sous forme de texte JSON, soit tout l'objet
// est emballé dans une seule clé sous forme de texte, soit le texte imite le
// format XML d'appel d'outil (`<parameter name="x">...</parameter>`) ou un
// bloc de code markdown (```json ... ```) au lieu du JSON attendu par le
// tool_use natif. Ces fonctions dépilent ces cas avant la validation zod.

// Retire une éventuelle enveloppe `<parameter name="...">...</parameter>` et/ou
// un bloc de code markdown que le modèle imite parfois autour du JSON attendu.
function retirerEnveloppeTexte(texte: string): string {
  let resultat = texte.trim();

  const parametre = resultat.match(
    /^<parameter\s+name="[^"]*"\s*>([\s\S]*?)(?:<\/parameter>\s*)?$/i
  );
  if (parametre) {
    resultat = parametre[1].trim();
  }

  const blocCode = resultat.match(/^```[a-z]*\n?([\s\S]*?)\n?```$/i);
  if (blocCode) {
    resultat = blocCode[1].trim();
  }

  return resultat;
}

export function deplierEnveloppeUnique(input: unknown): unknown {
  if (input && typeof input === "object") {
    const entrees = Object.entries(input as Record<string, unknown>);
    if (entrees.length === 1 && typeof entrees[0][1] === "string") {
      try {
        const parse = JSON.parse(retirerEnveloppeTexte(entrees[0][1] as string));
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
      valeur = JSON.parse(retirerEnveloppeTexte(valeur));
    } catch {
      break;
    }
  }
  if (!Array.isArray(valeur) && valeur && typeof valeur === "object" && cle in valeur) {
    valeur = (valeur as Record<string, unknown>)[cle];
  }
  return valeur;
}

// Nettoie une phrase individuelle : retire un éventuel bloc de code markdown
// (```json ... ``` ou `...`) et déplie les cas où le modèle a renvoyé du JSON
// brut à la place d'une phrase, pour ne jamais afficher du "code" à l'écran.
function nettoyerPhrase(valeur: string): string {
  let texte = retirerEnveloppeTexte(valeur.trim());

  if (texte.startsWith("`") && texte.endsWith("`") && texte.length > 1) {
    texte = texte.slice(1, -1).trim();
  }

  if (texte.startsWith("{") || texte.startsWith("[")) {
    try {
      const parse: unknown = JSON.parse(texte);
      if (typeof parse === "string") return parse.trim();
      if (Array.isArray(parse)) {
        const chaines = parse.filter((v): v is string => typeof v === "string");
        if (chaines.length > 0) return chaines.join(" ");
      } else if (parse && typeof parse === "object") {
        const valeurs = Object.values(parse).filter((v): v is string => typeof v === "string");
        if (valeurs.length > 0) return valeurs.join(" ");
      }
    } catch {
      // laisse tel quel
    }
  }

  return texte;
}

// Filet de sécurité pour les champs "liste de phrases" (constats, ajustements) :
// si le modèle renvoie un paragraphe brut plutôt qu'un tableau JSON, on le
// découpe en lignes plutôt que d'échouer la validation ; et si un élément du
// tableau est lui-même du JSON ou un bloc de code, on le nettoie en phrase.
export function versListeDeChaines(valeur: unknown): unknown {
  let resultat = valeur;

  if (typeof resultat === "string") {
    const lignes = resultat
      .split(/\n+/)
      .map((ligne) => ligne.replace(/^[-•*\d.)\s]+/, "").trim())
      .filter(Boolean);
    resultat = lignes.length > 0 ? lignes : [resultat];
  }

  if (Array.isArray(resultat)) {
    return resultat.map((item) => (typeof item === "string" ? nettoyerPhrase(item) : item));
  }

  return resultat;
}
