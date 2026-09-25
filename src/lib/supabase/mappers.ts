import type {
  BilanHebdomadaire,
  JournalEntree,
  ProfilUtilisateur,
  ProgrammeSemaine,
  Repas,
  SemaineHistorique,
} from "@/types";

// Convertit les lignes Supabase (snake_case) vers les types de l'app (camelCase).

export interface LigneProfil {
  user_id: string;
  prenom: string;
  niveau: string;
  taille_cm: number | null;
  poids_kg: number | null;
  poids_objectif_kg: number | null;
  dernier_bilan_mensuel_vu: string | null;
  photo_url: string | null;
  objectif_calories: number | null;
  objectif_proteines_g: number | null;
  objectif_glucides_g: number | null;
  objectif_lipides_g: number | null;
  qualites_prioritaires: string[] | null;
  performance_course: Record<string, string> | null;
  performance_muscu: Record<string, string> | null;
  objectifs_texte: Record<string, string> | null;
  autres_sports: { nom: string; frequenceParSemaine: number }[] | null;
  objectifs: Record<string, number>;
  seances_par_semaine: number;
  duree_seance_minutes: number;
  materiel: string[];
}

export interface LigneProgramme {
  id: string;
  user_id: string;
  numero_semaine: number;
  date_debut: string;
  seances: unknown;
  autres_sports_places: unknown;
  dernier_bilan: unknown;
}

export interface LigneJournalEntree {
  id: string;
  numero_semaine: number | null;
  seance_id: string | null;
  jour: string;
  titre: string;
  qualite: string;
  date: string;
  rpe: number | null;
  fatigue: number | null;
  retours_exercices: unknown;
  notes: string | null;
  source: string | null;
  distance_metres: number | null;
  duree_secondes: number | null;
  denivele_metres: number | null;
  terrain: string | null;
  duree_estimee_minutes: number | null;
}

export interface LigneSemaineHistorique {
  numero_semaine: number;
  date_debut: string;
  nb_seances_prevues: number;
  nb_seances_terminees: number;
  bilan: unknown;
}

export interface LigneRepas {
  id: string;
  created_at: string;
  titre: string;
  calories: number;
  proteines_g: number;
  glucides_g: number;
  lipides_g: number;
  photo: string | null;
}

export function versProfil(ligne: LigneProfil): ProfilUtilisateur {
  return {
    id: ligne.user_id,
    prenom: ligne.prenom,
    niveau: ligne.niveau as ProfilUtilisateur["niveau"],
    tailleCm: ligne.taille_cm ?? undefined,
    poidsKg: ligne.poids_kg ?? undefined,
    poidsObjectifKg: ligne.poids_objectif_kg ?? undefined,
    dernierBilanMensuelVu: ligne.dernier_bilan_mensuel_vu ?? undefined,
    photoUrl: ligne.photo_url ?? undefined,
    objectifsNutrition:
      ligne.objectif_calories !== null &&
      ligne.objectif_proteines_g !== null &&
      ligne.objectif_glucides_g !== null &&
      ligne.objectif_lipides_g !== null
        ? {
            calories: ligne.objectif_calories,
            proteinesG: ligne.objectif_proteines_g,
            glucidesG: ligne.objectif_glucides_g,
            lipidesG: ligne.objectif_lipides_g,
          }
        : undefined,
    qualitesPrioritaires:
      (ligne.qualites_prioritaires as ProfilUtilisateur["qualitesPrioritaires"]) ?? [],
    performanceCourse: (ligne.performance_course as ProfilUtilisateur["performanceCourse"]) ?? {},
    performanceMuscu: (ligne.performance_muscu as ProfilUtilisateur["performanceMuscu"]) ?? {},
    objectifsTexte: (ligne.objectifs_texte as ProfilUtilisateur["objectifsTexte"]) ?? {},
    autresSports: ligne.autres_sports ?? [],
    objectifs: ligne.objectifs as ProfilUtilisateur["objectifs"],
    seancesParSemaine: ligne.seances_par_semaine,
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
    autresSportsPlaces: (ligne.autres_sports_places as ProgrammeSemaine["autresSportsPlaces"]) ?? [],
  };
}

export function versJournalEntree(ligne: LigneJournalEntree): JournalEntree {
  return {
    id: ligne.id,
    numeroSemaine: ligne.numero_semaine ?? undefined,
    seanceId: ligne.seance_id ?? undefined,
    jour: ligne.jour,
    titre: ligne.titre,
    qualite: ligne.qualite as JournalEntree["qualite"],
    date: ligne.date,
    rpe: ligne.rpe ?? undefined,
    fatigue: ligne.fatigue ?? undefined,
    retoursExercices: (ligne.retours_exercices as JournalEntree["retoursExercices"]) ?? undefined,
    notes: ligne.notes ?? undefined,
    source: (ligne.source as JournalEntree["source"]) ?? undefined,
    distanceMetres: ligne.distance_metres ?? undefined,
    dureeSecondes: ligne.duree_secondes ?? undefined,
    deniveleMetres: ligne.denivele_metres ?? undefined,
    terrain: (ligne.terrain as JournalEntree["terrain"]) ?? undefined,
    dureeEstimeeMinutes: ligne.duree_estimee_minutes ?? undefined,
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

export function versRepas(ligne: LigneRepas): Repas {
  return {
    id: ligne.id,
    date: ligne.created_at,
    titre: ligne.titre,
    calories: ligne.calories,
    proteinesG: ligne.proteines_g,
    glucidesG: ligne.glucides_g,
    lipidesG: ligne.lipides_g,
    photo: ligne.photo ?? undefined,
  };
}
