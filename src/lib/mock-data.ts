import type {
  BilanHebdomadaire,
  ProfilUtilisateur,
  ProgrammeSemaine,
} from "@/types";

export const profilMock: ProfilUtilisateur = {
  id: "u1",
  prenom: "Tom",
  niveau: "intermediaire",
  objectifs: { course: 40, muscu: 35, explosivite: 25 },
  joursDisponibles: 4,
  dureeSeanceMinutes: 60,
  materiel: ["Salle de sport", "Extérieur"],
};

export const programmeMock: ProgrammeSemaine = {
  id: "p1",
  numeroSemaine: 6,
  dateDebut: "2026-09-21",
  seances: [
    {
      id: "s1",
      jour: "Lundi",
      titre: "Course — Endurance fondamentale",
      qualite: "course",
      dureeEstimeeMinutes: 45,
      statut: "terminee",
      exercices: [
        {
          id: "e1",
          nom: "Footing allure facile",
          qualite: "course",
          repetitions: "8 km",
          charge: "allure 5:30/km",
        },
      ],
    },
    {
      id: "s2",
      jour: "Mardi",
      titre: "Muscu — Bas du corps",
      qualite: "muscu",
      dureeEstimeeMinutes: 60,
      statut: "terminee",
      exercices: [
        { id: "e2", nom: "Squat", qualite: "muscu", series: 4, repetitions: "6-8", charge: "70kg", reposSecondes: 120 },
        { id: "e3", nom: "Fentes marchées", qualite: "muscu", series: 3, repetitions: "10/jambe", charge: "16kg", reposSecondes: 90 },
        { id: "e4", nom: "Mollets debout", qualite: "muscu", series: 3, repetitions: "12-15", charge: "40kg", reposSecondes: 60 },
      ],
    },
    {
      id: "s3",
      jour: "Jeudi",
      titre: "Explosivité — Pliométrie",
      qualite: "explosivite",
      dureeEstimeeMinutes: 40,
      statut: "a_venir",
      exercices: [
        { id: "e5", nom: "Squat jump", qualite: "explosivite", series: 4, repetitions: "6", reposSecondes: 90 },
        { id: "e6", nom: "Bondissements", qualite: "explosivite", series: 4, repetitions: "20m", reposSecondes: 90 },
        { id: "e7", nom: "Skipping haute intensité", qualite: "explosivite", series: 3, repetitions: "15s", reposSecondes: 60 },
      ],
    },
    {
      id: "s4",
      jour: "Samedi",
      titre: "Course — Fractionné",
      qualite: "course",
      dureeEstimeeMinutes: 50,
      statut: "a_venir",
      exercices: [
        { id: "e8", nom: "Fractionné 400m", qualite: "course", repetitions: "8x400m", charge: "allure 4:15/km", reposSecondes: 90 },
      ],
    },
  ],
};

export const bilanMock: BilanHebdomadaire = {
  semaineId: "p0",
  constats: [
    "Volume de course bien absorbé, fatigue stable sur la semaine.",
    "Charges en squat en progression constante depuis 3 semaines.",
    "Fatigue perçue plus élevée après les séances d'explosivité du jeudi.",
  ],
  ajustements: [
    "Légère hausse du volume de course (+10%) la semaine prochaine.",
    "Charge de squat augmentée de 2,5kg.",
    "Un jour de récupération ajouté entre muscu et explosivité.",
  ],
  chargeParQualite: { course: 45, muscu: 35, explosivite: 20 },
};
