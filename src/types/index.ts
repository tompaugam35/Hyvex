export type Qualite = "course" | "muscu" | "explosivite";

export type NiveauSportif = "debutant" | "intermediaire" | "avance";

export interface AutreSport {
  nom: string;
  frequenceParSemaine: number;
}

// Niveau de performance actuel, saisi librement (ex: "22:30", "1h45", "80kg").
// Tous les champs sont optionnels : plus l'athlète en renseigne, plus le programme
// généré peut être calibré précisément.
export interface PerformanceCourse {
  temps5km?: string;
  temps10km?: string;
  temps21km?: string;
}

export interface PerformanceMuscu {
  developpeCouche?: string;
  souleveDeTerre?: string;
  squat?: string;
}

// Objectifs quotidiens de nutrition, calculés par l'IA à partir du poids souhaité.
export interface ObjectifsNutrition {
  calories: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
}

export interface ProfilUtilisateur {
  id: string;
  prenom: string;
  niveau: NiveauSportif;
  tailleCm?: number;
  poidsKg?: number;
  poidsObjectifKg?: number;
  objectifsNutrition?: ObjectifsNutrition;
  dernierBilanMensuelVu?: string; // "YYYY-MM" du dernier bilan mensuel déjà affiché
  photoUrl?: string; // avatar choisi parmi la galerie proposée
  qualitesPrioritaires: Qualite[]; // 1 à 3 qualités choisies ; longueur 3 = équilibre
  performanceCourse: PerformanceCourse;
  performanceMuscu: PerformanceMuscu;
  objectifsTexte: Partial<Record<Qualite, string>>; // objectif libre par qualité choisie
  autresSports: AutreSport[];
  objectifs: Record<Qualite, number>; // pondération 0-100, dérivée de qualitesPrioritaires
  seancesParSemaine: number; // total hebdo, autres sports inclus
  dureeSeanceMinutes: number;
  materiel: string[];
}

export type StatutSeance = "a_venir" | "terminee" | "manquee";

export type Intensite = "faible" | "moderee" | "elevee";

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
  jour: string | null; // ex: "Lundi", choisi par l'utilisateur ; null tant que non placée
  heure?: string; // "HH:MM", choisie par l'utilisateur, optionnelle
  titre: string;
  qualite: Qualite;
  dureeEstimeeMinutes: number;
  intensite?: Intensite;
  statut: StatutSeance;
  exercices: Exercice[];
}

export type Difficulte = "facile" | "parfait" | "difficile";

export type TerrainCourse = "route" | "trail" | "piste";

export interface RetourExercice {
  exerciceId: string;
  difficulte: Difficulte;
}

export interface SeanceLog {
  seanceId: string;
  date: string; // ISO
  complete: boolean;
  rpe: number; // ressenti d'effort global 1-10
  fatigue?: number; // 1-10, non renseigné pour la course
  retoursExercices?: RetourExercice[];
  notes?: string;
  // Saisie manuelle d'une séance de course.
  distanceMetres?: number;
  dureeSecondes?: number;
  deniveleMetres?: number;
  terrain?: TerrainCourse;
}

// Repère visuel sur le calendrier pour un autre sport pratiqué (pas de détail de séance,
// juste de quoi organiser sa semaine — le site ne planifie que les séances hybrid).
// Validation minimale : une fatigue ressentie suffit, pas de bilan complet comme
// pour les séances hybrid.
export interface AutreSportPlace {
  id: string;
  nom: string;
  jour: string | null;
  valide?: boolean;
  fatigue?: number; // 1-10
}

export interface ProgrammeSemaine {
  id: string;
  numeroSemaine: number;
  dateDebut: string;
  seances: Seance[];
  autresSportsPlaces: AutreSportPlace[];
}

export interface BilanHebdomadaire {
  semaineId: string;
  constats: string[];
  ajustements: string[];
  chargeParQualite: Record<Qualite, number>; // volume relatif 0-100
}

// Une ligne par séance validée, conservée indéfiniment (jamais écrasée).
export interface JournalEntree {
  id: string;
  numeroSemaine?: number;
  seanceId?: string; // absent pour les entrées importées depuis Strava
  jour: string;
  titre: string;
  qualite: Qualite;
  date: string; // ISO, date réelle de complétion
  rpe?: number;
  fatigue?: number;
  retoursExercices?: RetourExercice[];
  notes?: string;
  source?: "manuel" | "strava";
  distanceMetres?: number;
  dureeSecondes?: number;
  deniveleMetres?: number;
  terrain?: TerrainCourse;
  // Durée prévue de la séance au moment de sa validation (pas la durée réelle) :
  // sert à estimer le temps total d'entraînement, y compris pour la muscu et
  // l'explosivité qui n'ont pas de chrono réel.
  dureeEstimeeMinutes?: number;
}

// Récapitulatif d'un mois complet et révolu, affiché en fenêtre à l'ouverture de
// l'app le mois suivant, et exportable en image pour les réseaux sociaux.
export interface BilanMensuel {
  mois: string; // "YYYY-MM"
  libelleMois: string; // "Septembre 2026"
  prenom: string;
  nbSeances: number;
  nbSeancesPrevues: number;
  tauxCompletion: number; // 0-100, arrondi
  parQualite: Record<Qualite, number>;
  distanceTotaleMetres: number;
  deniveleTotalMetres: number;
  dureeTotaleSecondes: number;
  allureMoyenneSecondesParKm: number | null;
  plusLongueSortieMetres: number | null;
  deltaVsMoisPrecedent: number;
  semainesReussies: number;
  semainesTotal: number;
  meilleurMoisAnnee: boolean;
}

// Un jour du graphique d'évolution poids/fatigue de la page profil (30 derniers
// jours). Les deux valeurs sont indépendantes : un jour peut n'avoir que l'une,
// l'autre ou aucune.
export interface PointEvolution {
  date: string; // "YYYY-MM-DD"
  poidsKg?: number;
  fatigue?: number; // moyenne du jour si plusieurs séances renseignées
}

// Résumé d'une semaine passée, créé au moment où l'IA génère la semaine suivante.
export interface SemaineHistorique {
  numeroSemaine: number;
  dateDebut: string;
  nbSeancesPrevues: number;
  nbSeancesTerminees: number;
  bilan?: BilanHebdomadaire;
}

// Un repas photographié et analysé par l'IA (estimation nutritionnelle).
export interface Repas {
  id: string;
  date: string; // ISO, horodatage de l'ajout
  titre: string;
  calories: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
  photo?: string; // data URL (base64), miniature redimensionnée côté client
}
