import type { AutreSport, AutreSportPlace, ProgrammeSemaine, Qualite } from "@/types";
import type { ProgrammeGenere } from "./schema";

// Qualités non choisies (quand ce n'est pas "les trois") : exclusion totale, 0%,
// aucune séance générée pour elles.
export function objectifsDepuisQualites(qualites: Qualite[]): Record<Qualite, number> {
  if (qualites.length >= 3) {
    return { course: 34, muscu: 33, explosivite: 33 };
  }
  const poids = qualites.length === 1 ? 100 : 50;
  const objectifs: Record<Qualite, number> = { course: 0, muscu: 0, explosivite: 0 };
  for (const q of qualites) objectifs[q] = poids;
  return objectifs;
}

export function seancesHybrideDepuisTotal(
  seancesParSemaine: number,
  autresSports: AutreSport[]
): number {
  const sommeAutres = autresSports.reduce((total, s) => total + s.frequenceParSemaine, 0);
  return Math.max(1, seancesParSemaine - sommeAutres);
}

export function genererAutresSportsPlaces(autresSports: AutreSport[]): AutreSportPlace[] {
  return autresSports.flatMap((sport) =>
    Array.from({ length: sport.frequenceParSemaine }, () => ({
      id: crypto.randomUUID(),
      nom: sport.nom,
      jour: null,
    }))
  );
}

export function versProgrammeSemaine(
  genere: ProgrammeGenere,
  autresSportsPlaces: AutreSportPlace[],
  numeroSemaine = 1
): ProgrammeSemaine {
  return {
    id: crypto.randomUUID(),
    numeroSemaine,
    dateDebut: new Date().toISOString().slice(0, 10),
    autresSportsPlaces,
    seances: genere.seances.map((seance) => ({
      id: crypto.randomUUID(),
      jour: null,
      titre: seance.titre,
      qualite: seance.qualite,
      dureeEstimeeMinutes: seance.dureeEstimeeMinutes,
      intensite: seance.intensite,
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
