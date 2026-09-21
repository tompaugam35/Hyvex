import { z } from "zod";

export const profilInputSchema = z.object({
  prenom: z.string().min(1).max(50),
  niveau: z.enum(["debutant", "intermediaire", "avance"]),
  priorite: z.enum(["course", "muscu", "explosivite", "equilibre"]),
  joursDisponibles: z.number().int().min(2).max(6),
  dureeSeanceMinutes: z.number().int().min(30).max(90),
  materiel: z.array(z.string()).min(1),
});

export type ProfilInput = z.infer<typeof profilInputSchema>;

const qualiteSchema = z.enum(["course", "muscu", "explosivite"]);

export const exerciceGenereSchema = z.object({
  nom: z.string(),
  qualite: qualiteSchema,
  series: z.number().int().optional(),
  repetitions: z.string().optional(),
  charge: z.string().optional(),
  reposSecondes: z.number().int().optional(),
});

export const seanceGenereeSchema = z.object({
  jour: z.enum([
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ]),
  titre: z.string(),
  qualite: qualiteSchema,
  dureeEstimeeMinutes: z.number().int(),
  exercices: z.array(exerciceGenereSchema).min(1),
});

export const programmeGenereSchema = z.object({
  seances: z.array(seanceGenereeSchema).min(1),
});

export type ProgrammeGenere = z.infer<typeof programmeGenereSchema>;
