import { z } from "zod";

const qualiteSchema = z.enum(["course", "muscu", "explosivite"]);

export const autreSportSchema = z.object({
  nom: z.string().min(1).max(40),
  frequenceParSemaine: z.number().int().min(1).max(7),
});

// Objectif libre par qualité, toutes optionnelles (Partial<Record<Qualite, string>>) —
// z.record() avec un enum de clés produirait un objet requis sur les trois clés.
const objectifsTexteSchema = z.object({
  course: z.string().optional(),
  muscu: z.string().optional(),
  explosivite: z.string().optional(),
});

// Niveau de performance actuel, saisi librement, tous champs optionnels.
const performanceCourseSchema = z.object({
  temps5km: z.string().optional(),
  temps10km: z.string().optional(),
  temps21km: z.string().optional(),
});

const performanceMuscuSchema = z.object({
  developpeCouche: z.string().optional(),
  souleveDeTerre: z.string().optional(),
  squat: z.string().optional(),
});

export const profilInputSchema = z.object({
  prenom: z.string().min(1).max(50),
  niveau: z.enum(["debutant", "intermediaire", "avance"]),
  qualitesPrioritaires: z.array(qualiteSchema).min(1).max(3),
  performanceCourse: performanceCourseSchema.default({}),
  performanceMuscu: performanceMuscuSchema.default({}),
  objectifsTexte: objectifsTexteSchema.default({}),
  autresSports: z.array(autreSportSchema).max(5).default([]),
  seancesParSemaine: z.number().int().min(2).max(14),
  dureeSeanceMinutes: z.number().int().min(30).max(90),
  materiel: z.array(z.string()).min(1),
});

export type ProfilInput = z.infer<typeof profilInputSchema>;

export const exerciceGenereSchema = z.object({
  nom: z.string(),
  qualite: qualiteSchema,
  series: z.number().int().optional(),
  repetitions: z.string().optional(),
  charge: z.string().optional(),
  reposSecondes: z.number().int().optional(),
});

export const intensiteSchema = z.enum(["faible", "moderee", "elevee"]);

export const seanceGenereeSchema = z.object({
  titre: z.string(),
  qualite: qualiteSchema,
  dureeEstimeeMinutes: z.number().int(),
  intensite: intensiteSchema,
  exercices: z.array(exerciceGenereSchema).min(1),
});

export const programmeGenereSchema = z.object({
  seances: z.array(seanceGenereeSchema).min(1),
});

export type ProgrammeGenere = z.infer<typeof programmeGenereSchema>;

const statutSeanceSchema = z.enum(["a_venir", "terminee", "manquee"]);
const difficulteSchema = z.enum(["facile", "parfait", "difficile"]);

export const profilCompletSchema = z.object({
  prenom: z.string().min(1).max(50),
  niveau: z.enum(["debutant", "intermediaire", "avance"]),
  qualitesPrioritaires: z.array(qualiteSchema).min(1).max(3),
  performanceCourse: performanceCourseSchema.default({}),
  performanceMuscu: performanceMuscuSchema.default({}),
  objectifsTexte: objectifsTexteSchema.default({}),
  autresSports: z.array(autreSportSchema).default([]),
  objectifs: z.record(qualiteSchema, z.number()),
  seancesParSemaine: z.number().int(),
  dureeSeanceMinutes: z.number().int(),
  materiel: z.array(z.string()),
});

export const seanceRealiseeSchema = z.object({
  id: z.string(),
  jour: z.string().nullable(),
  titre: z.string(),
  qualite: qualiteSchema,
  dureeEstimeeMinutes: z.number(),
  intensite: intensiteSchema.optional(),
  statut: statutSeanceSchema,
  exercices: z.array(
    z.object({
      id: z.string(),
      nom: z.string(),
      qualite: qualiteSchema,
      series: z.number().optional(),
      repetitions: z.string().optional(),
      charge: z.string().optional(),
      reposSecondes: z.number().optional(),
    })
  ),
});

export const seanceLogInputSchema = z.object({
  seanceId: z.string(),
  date: z.string(),
  complete: z.boolean(),
  rpe: z.number(),
  fatigue: z.number().optional(),
  retoursExercices: z
    .array(
      z.object({
        exerciceId: z.string(),
        difficulte: difficulteSchema,
      })
    )
    .optional(),
  notes: z.string().optional(),
  // Saisie manuelle d'une séance de course.
  distanceMetres: z.number().optional(),
  dureeSecondes: z.number().optional(),
  deniveleMetres: z.number().optional(),
  terrain: z.enum(["route", "trail", "piste"]).optional(),
});

export const adapterRequestSchema = z.object({
  profil: profilCompletSchema,
  seancesPrecedentes: z.array(seanceRealiseeSchema).min(1),
  logs: z.array(seanceLogInputSchema),
  numeroSemainePrecedente: z.number().int(),
});

export type AdapterRequest = z.infer<typeof adapterRequestSchema>;

export const bilanEtProgrammeSchema = z.object({
  constats: z.array(z.string()).min(1).max(5),
  ajustements: z.array(z.string()).min(1).max(5),
  seances: z.array(seanceGenereeSchema).min(1),
});

export type BilanEtProgramme = z.infer<typeof bilanEtProgrammeSchema>;
