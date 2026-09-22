import type {
  BilanHebdomadaire,
  JournalEntree,
  ProfilUtilisateur,
  ProgrammeSemaine,
  SemaineHistorique,
} from "@/types";

// Convertit les lignes Supabase (snake_case) vers les types de l'app (camelCase).

export interface LigneProfil {
  user_id: string;
  prenom: string;
  niveau: string;
  objectifs: Record<string, number>;
  jours_disponibles: number;
  duree_seance_minutes: number;
  materiel: string[];
}

export interface LigneProgramme {
  id: string;
  user_id: string;
  numero_semaine: number;
  date_debut: string;
  seances: unknown;
  dernier_bilan: unknown;
}

export interface LigneJournalEntree {
  id: string;
  numero_semaine: number;
  seance_id: string;
  jour: string;
  titre: string;
  qualite: string;
  date: string;
  rpe: number | null;
  fatigue: number | null;
  retours_exercices: unknown;
  notes: string | null;
}

export interface LigneSemaineHistorique {
  numero_semaine: number;
  date_debut: string;
  nb_seances_prevues: number;
  nb_seances_terminees: number;
  bilan: unknown;
}

export function versProfil(ligne: LigneProfil): ProfilUtilisateur {
  return {
    id: ligne.user_id,
    prenom: ligne.prenom,
    niveau: ligne.niveau as ProfilUtilisateur["niveau"],
    objectifs: ligne.objectifs as ProfilUtilisateur["objectifs"],
    joursDisponibles: ligne.jours_disponibles,
    dureeSeanceMinutes: ligne.duree_seance_minutes,
    materiel: ligne.materiel,
  };
}

export function versProgramme(ligne: LigneProgramme): ProgrammeSemaine {
  return {
    id: ligne.id,
    numeroSemaine: ligne.numero_semaine,
    dateDebut: ligne.date_debut,
    seances: ligne.seances as ProgrammeSemaine["seances"],
  };
}

export function versJournalEntree(ligne: LigneJournalEntree): JournalEntree {
  return {
    id: ligne.id,
    numeroSemaine: ligne.numero_semaine,
    seanceId: ligne.seance_id,
    jour: ligne.jour,
    titre: ligne.titre,
    qualite: ligne.qualite as JournalEntree["qualite"],
    date: ligne.date,
    rpe: ligne.rpe ?? undefined,
    fatigue: ligne.fatigue ?? undefined,
    retoursExercices: (ligne.retours_exercices as JournalEntree["retoursExercices"]) ?? undefined,
    notes: ligne.notes ?? undefined,
  };
}

export function versSemaineHistorique(ligne: LigneSemaineHistorique): SemaineHistorique {
  return {
    numeroSemaine: ligne.numero_semaine,
    dateDebut: ligne.date_debut,
    nbSeancesPrevues: ligne.nb_seances_prevues,
    nbSeancesTerminees: ligne.nb_seances_terminees,
    bilan: (ligne.bilan as BilanHebdomadaire | null) ?? undefined,
  };
}
