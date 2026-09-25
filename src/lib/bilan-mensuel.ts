import type { BilanMensuel, JournalEntree, Qualite, SemaineHistorique } from "@/types";

export function cleMois(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Premier jour du mois précédant la référence (le mois "révolu" à récapituler).
export function moisPrecedent(reference = new Date()) {
  return new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
}

function nbJoursDansLeMois(premierJour: Date) {
  return new Date(premierJour.getFullYear(), premierJour.getMonth() + 1, 0).getDate();
}

export function calculerBilanMensuel({
  premierJourMois,
  prenom,
  journalMois,
  comptesParMois,
  semainesMois,
  seancesParSemaineProfil,
}: {
  premierJourMois: Date;
  prenom: string;
  journalMois: JournalEntree[];
  comptesParMois: Map<string, number>; // clé "YYYY-MM" -> nb séances validées ce mois-là (tous mois confondus)
  semainesMois: SemaineHistorique[];
  seancesParSemaineProfil: number;
}): BilanMensuel {
  const mois = cleMois(premierJourMois);

  const parQualite: Record<Qualite, number> = { course: 0, muscu: 0, explosivite: 0 };
  let distanceTotaleMetres = 0;
  let deniveleTotalMetres = 0;
  let dureeTotaleSecondes = 0;
  let dureeCourseSecondes = 0;
  let distanceCourseMetres = 0;
  let plusLongueSortieMetres: number | null = null;

  for (const entree of journalMois) {
    parQualite[entree.qualite] += 1;
    if (entree.dureeEstimeeMinutes) dureeTotaleSecondes += entree.dureeEstimeeMinutes * 60;

    if (entree.qualite === "course") {
      if (entree.distanceMetres) {
        distanceTotaleMetres += entree.distanceMetres;
        distanceCourseMetres += entree.distanceMetres;
        plusLongueSortieMetres = Math.max(plusLongueSortieMetres ?? 0, entree.distanceMetres);
      }
      if (entree.deniveleMetres) deniveleTotalMetres += entree.deniveleMetres;
      if (entree.dureeSecondes) dureeCourseSecondes += entree.dureeSecondes;
    }
  }

  const allureMoyenneSecondesParKm =
    distanceCourseMetres > 0 ? dureeCourseSecondes / (distanceCourseMetres / 1000) : null;

  const nbSeancesPrevues =
    semainesMois.length > 0
      ? semainesMois.reduce((total, s) => total + s.nbSeancesPrevues, 0)
      : Math.round(seancesParSemaineProfil * (nbJoursDansLeMois(premierJourMois) / 7));

  const semainesReussies = semainesMois.filter(
    (s) => s.nbSeancesTerminees >= s.nbSeancesPrevues && s.nbSeancesPrevues > 0
  ).length;

  const moisPrecedentCle = cleMois(new Date(premierJourMois.getFullYear(), premierJourMois.getMonth() - 1, 1));
  const nbSeances = journalMois.length;

  const autresMoisComptes = [...comptesParMois.entries()]
    .filter(([cle]) => cle !== mois)
    .map(([, n]) => n);
  const meilleurMoisAnnee =
    nbSeances > 0 && nbSeances >= Math.max(0, ...autresMoisComptes);

  return {
    mois,
    libelleMois: premierJourMois.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    prenom,
    nbSeances,
    nbSeancesPrevues,
    tauxCompletion: nbSeancesPrevues > 0 ? Math.round((nbSeances / nbSeancesPrevues) * 100) : 0,
    parQualite,
    distanceTotaleMetres,
    deniveleTotalMetres,
    dureeTotaleSecondes,
    allureMoyenneSecondesParKm,
    plusLongueSortieMetres,
    deltaVsMoisPrecedent: nbSeances - (comptesParMois.get(moisPrecedentCle) ?? 0),
    semainesReussies,
    semainesTotal: semainesMois.length,
    meilleurMoisAnnee,
  };
}
