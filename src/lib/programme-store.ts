import type { ProfilUtilisateur, ProgrammeSemaine } from "@/types";

const CLE_STOCKAGE = "hybrid:programme-actuel";

interface DonneesStockees {
  profil: ProfilUtilisateur;
  programme: ProgrammeSemaine;
}

export function sauvegarderProgramme(donnees: DonneesStockees) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE_STOCKAGE, JSON.stringify(donnees));
  } catch {
    // stockage indisponible (navigation privée...) — on ignore silencieusement
  }
}

export function chargerProgramme(): DonneesStockees | null {
  if (typeof window === "undefined") return null;
  try {
    const brut = window.localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return null;
    return JSON.parse(brut) as DonneesStockees;
  } catch {
    return null;
  }
}
