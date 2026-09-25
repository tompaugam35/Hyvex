import type { AutreSport, PerformanceCourse, PerformanceMuscu, Qualite } from "@/types";

const labelQualite: Record<Qualite, string> = {
  course: "la course à pied",
  muscu: "la musculation",
  explosivite: "l'explosivité",
};

export function decrirePriorite(qualites: Qualite[]): string {
  if (qualites.length >= 3) {
    return "progresser de façon équilibrée sur les trois qualités (course à pied, musculation, explosivité)";
  }
  const noms = qualites.map((q) => labelQualite[q]).join(" et ");
  return `s'entraîner uniquement sur ${noms} — aucune séance des autres qualités physiques`;
}

// Règle d'exclusion stricte des qualités non choisies, à insérer dans les contraintes
// du prompt (pas de génération partielle "pour rester hybride" quand l'athlète n'a
// choisi qu'une ou deux qualités).
export function regleExclusionQualites(qualites: Qualite[]): string | null {
  if (qualites.length >= 3) return null;
  const noms = qualites.map((q) => labelQualite[q]).join(" et ");
  return `Ne génère des séances QUE pour ${noms}. N'inclus strictement aucune séance des autres qualités physiques, même en petit volume.`;
}

export function decrireObjectifsTexte(
  objectifsTexte: Partial<Record<Qualite, string>> | undefined
): string {
  if (!objectifsTexte) return "aucun objectif précis communiqué";
  const lignes = Object.entries(objectifsTexte)
    .filter((entree): entree is [Qualite, string] => !!entree[1]?.trim())
    .map(([q, texte]) => `${labelQualite[q as Qualite]} : "${texte.trim()}"`);
  return lignes.length > 0 ? lignes.join(" ; ") : "aucun objectif précis communiqué";
}

export function decrireAutresSports(autresSports: AutreSport[] | undefined): string {
  if (!autresSports || autresSports.length === 0) return "aucun";
  return autresSports.map((s) => `${s.nom} (${s.frequenceParSemaine}x/semaine)`).join(", ");
}

export function decrirePerformanceCourse(perf: PerformanceCourse | undefined): string {
  const lignes: string[] = [];
  if (perf?.temps5km) lignes.push(`5 km en ${perf.temps5km}`);
  if (perf?.temps10km) lignes.push(`10 km en ${perf.temps10km}`);
  if (perf?.temps21km) lignes.push(`semi (21 km) en ${perf.temps21km}`);
  return lignes.length > 0 ? lignes.join(", ") : "non communiqué";
}

export function decrirePerformanceMuscu(perf: PerformanceMuscu | undefined): string {
  const lignes: string[] = [];
  if (perf?.developpeCouche) lignes.push(`développé couché ${perf.developpeCouche}`);
  if (perf?.souleveDeTerre) lignes.push(`soulevé de terre ${perf.souleveDeTerre}`);
  if (perf?.squat) lignes.push(`squat ${perf.squat}`);
  return lignes.length > 0 ? lignes.join(", ") : "non communiqué";
}

export function decrireMorphologie(tailleCm: number | undefined, poidsKg: number | undefined): string {
  if (tailleCm && poidsKg) return `${tailleCm} cm, ${poidsKg} kg`;
  if (tailleCm) return `${tailleCm} cm, poids non communiqué`;
  if (poidsKg) return `${poidsKg} kg, taille non communiquée`;
  return "non communiquée";
}
