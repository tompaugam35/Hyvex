export type Qualite = "course" | "muscu" | "explosivite";

export type NiveauSportif = "debutant" | "intermediaire" | "avance";

export interface ProfilUtilisateur {
  id: string;
  prenom: string;
  niveau: NiveauSportif;
  objectifs: Record<Qualite, number>; // pondération 0-100, somme = 100
  joursDisponibles: number; // par semaine
  dureeSeanceMinutes: number;
  materiel: string[];
}

export type StatutSeance = "a_venir" | "terminee" | "manquee";

export interface Exercice {
  id: string;
  nom: string;
  qualite: Qualite;
  series?: number;
  repetitions?: string; // ex: "8-10" ou "400m"
  charge?: string; // ex: "60kg" ou "allure 4:30/km"
  reposSecondes?: number;
}

export interface Seance {
  id: string;
  jour: string; // ex: "Lundi"
  titre: string;
  qualite: Qualite;
  dureeEstimeeMinutes: number;
  statut: StatutSeance;
  exercices: Exercice[];
}

export type Difficulte = "facile" | "parfait" | "difficile";

export interface RetourExercice {
  exerciceId: string;
  difficulte: Difficulte;
}

export interface SeanceLog {
  seanceId: string;
  date: string; // ISO
  complete: boolean;
  rpe: number; // ressenti d'effort global 1-10
  fatigue: number; // 1-10
  retoursExercices: RetourExercice[];
  notes?: string;
}

export interface ProgrammeSemaine {
  id: string;
  numeroSemaine: number;
  dateDebut: string;
  seances: Seance[];
}

export interface BilanHebdomadaire {
  semaineId: string;
  constats: string[];
  ajustements: string[];
  chargeParQualite: Record<Qualite, number>; // volume relatif 0-100
}
