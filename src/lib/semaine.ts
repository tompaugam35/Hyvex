// Lundi en premier : ordre d'affichage du calendrier et des séances générées par l'IA.
export const JOURS_SEMAINE = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;

// Indexé comme Date.getDay() (0 = dimanche), pour convertir une date réelle en nom de jour.
const JOURS_DEPUIS_DIMANCHE = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export function jourDepuisDate(date: Date) {
  return JOURS_DEPUIS_DIMANCHE[date.getDay()];
}

function lundiDeLaSemaine(reference: Date) {
  const jour = reference.getDay();
  const decalage = jour === 0 ? -6 : 1 - jour;
  const lundi = new Date(reference);
  lundi.setHours(0, 0, 0, 0);
  lundi.setDate(lundi.getDate() + decalage);
  return lundi;
}

export function joursDeLaSemaineEnCours(reference = new Date()) {
  const lundi = lundiDeLaSemaine(reference);
  return JOURS_SEMAINE.map((nom, i) => {
    const date = new Date(lundi);
    date.setDate(date.getDate() + i);
    return { nom, date };
  });
}

export function estAujourdHui(date: Date) {
  const aujourdhui = new Date();
  return (
    date.getFullYear() === aujourdhui.getFullYear() &&
    date.getMonth() === aujourdhui.getMonth() &&
    date.getDate() === aujourdhui.getDate()
  );
}
