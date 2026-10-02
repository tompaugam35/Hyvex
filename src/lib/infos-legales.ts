// Informations légales affichées dans les CGV, la politique de confidentialité
// et les mentions légales. Une valeur à null n'est pas encore connue : les pages
// affichent alors une mention neutre au lieu d'une information inventée.
export const infosLegales: {
  nomService: string;
  site: string;
  editeur: string;
  directeurPublication: string;
  email: string;
  statut: string | null;
  siret: string | null;
  adresse: string | null;
  tva: string | null;
  mediateur: { nom: string; site: string } | null;
  miseAJour: string;
} = {
  nomService: "Hyvex",
  site: "https://www.hyvex.fr",
  editeur: "Tom Paugam",
  directeurPublication: "Tom Paugam",
  email: "tom.paugam35@gmail.com",
  statut: null,
  siret: null,
  adresse: null,
  tva: null,
  mediateur: null,
  miseAJour: "2 octobre 2026",
};
