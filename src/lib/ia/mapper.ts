import type { ProgrammeSemaine } from "@/types";
import type { ProgrammeGenere } from "./schema";

export function versProgrammeSemaine(
  genere: ProgrammeGenere,
  numeroSemaine = 1
): ProgrammeSemaine {
  return {
    id: crypto.randomUUID(),
    numeroSemaine,
    dateDebut: new Date().toISOString().slice(0, 10),
    seances: genere.seances.map((seance) => ({
      id: crypto.randomUUID(),
      jour: seance.jour,
      titre: seance.titre,
      qualite: seance.qualite,
      dureeEstimeeMinutes: seance.dureeEstimeeMinutes,
      statut: "a_venir",
      exercices: seance.exercices.map((exercice) => ({
        id: crypto.randomUUID(),
        ...exercice,
      })),
    })),
  };
}
