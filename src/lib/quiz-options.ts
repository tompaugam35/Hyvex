import type { NiveauSportif, Qualite } from "@/types";

export const niveaux: { value: NiveauSportif; label: string; desc: string }[] = [
  { value: "debutant", label: "Débutant", desc: "Je démarre ou reprends le sport" },
  {
    value: "intermediaire",
    label: "Intermédiaire",
    desc: "Je m'entraîne régulièrement depuis un moment",
  },
  {
    value: "avance",
    label: "Avancé",
    desc: "Je m'entraîne sérieusement depuis plusieurs années",
  },
];

export const qualiteOptions: { value: Qualite; label: string }[] = [
  { value: "course", label: "Course à pied" },
  { value: "muscu", label: "Musculation" },
  { value: "explosivite", label: "Explosivité" },
];

export const qualiteLabelLong: Record<Qualite, string> = {
  course: "Course à pied",
  muscu: "Musculation",
  explosivite: "Explosivité",
};

export const objectifPlaceholder: Record<Qualite, string> = {
  course: "Optionnel — ex : courir un semi sous 1h40",
  muscu: "Optionnel — ex : bench 100kg",
  explosivite: "Optionnel — ex : sauter plus haut",
};

export const materielOptions = [
  "Salle de musculation",
  "Parc de street workout",
  "Terrain d'athlétisme",
  "Sentier trail",
  "Extérieur",
  "Haltères à la maison",
  "Pas d'outils de musculation",
];
