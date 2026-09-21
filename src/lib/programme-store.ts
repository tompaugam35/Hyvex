import type {
  BilanHebdomadaire,
  ProfilUtilisateur,
  ProgrammeSemaine,
  SeanceLog,
} from "@/types";

const CLE_STOCKAGE = "hybrid:programme-actuel";

export interface DonneesStockees {
  profil: ProfilUtilisateur;
  programme: ProgrammeSemaine;
  logs: SeanceLog[];
  dernierBilan?: BilanHebdomadaire;
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
    const donnees = JSON.parse(brut) as Partial<DonneesStockees>;
    if (!donnees.profil || !donnees.programme) return null;
    return { ...donnees, logs: donnees.logs ?? [] } as DonneesStockees;
  } catch {
    return null;
  }
}
