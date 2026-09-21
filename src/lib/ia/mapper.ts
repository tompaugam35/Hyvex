import type { ProgrammeSemaine, Qualite } from "@/types";
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

export function calculerChargeParQualite(
  programme: ProgrammeSemaine
): Record<Qualite, number> {
  const brut: Record<Qualite, number> = { course: 0, muscu: 0, explosivite: 0 };
  for (const seance of programme.seances) {
    brut[seance.qualite] += seance.dureeEstimeeMinutes;
  }
  const total = brut.course + brut.muscu + brut.explosivite || 1;
  return {
    course: Math.round((brut.course / total) * 100),
    muscu: Math.round((brut.muscu / total) * 100),
    explosivite: Math.round((brut.explosivite / total) * 100),
  };
}
