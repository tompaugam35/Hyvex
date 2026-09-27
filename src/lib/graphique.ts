// Helpers partagés par tous les graphiques du site, pour garder le même style
// de courbe lisse en "vagues" (cf. GraphiqueEvolution et GraphiqueMensuel).

// "YYYY-MM-DD" -> Date locale à minuit (évite le décalage d'un jour que
// `new Date("YYYY-MM-DD")`, interprété en UTC, peut provoquer à l'affichage).
export function dateLocale(cle: string) {
  const [annee, mois, jour] = cle.split("-").map(Number);
  return new Date(annee, mois - 1, jour);
}

// Catmull-Rom -> Bézier cubique (tension 1/6) : donne la courbe lisse en
// "vagues" arrondies de la maquette, sans dépendre de tous les points (les
// jours sans donnée sont simplement absents de `pts`).
export function cheminLisse(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function positionX(index: number, nb: number, largeur: number, margeX: number) {
  return margeX + (index * (largeur - margeX * 2)) / (nb - 1);
}

export function echelle(min: number, max: number, hautCourbe: number, hauteurCourbe: number) {
  const bas = hautCourbe;
  const haut = hautCourbe + hauteurCourbe;
  const etendue = max - min || 1;
  return (v: number) => haut - ((v - min) / etendue) * (haut - bas);
}
