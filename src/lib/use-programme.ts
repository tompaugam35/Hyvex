"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { BilanHebdomadaire, ProgrammeSemaine, SeanceLog, StatutSeance } from "@/types";
import {
  chargerProgramme,
  sauvegarderProgramme,
  type DonneesStockees,
} from "./programme-store";
import { profilMock, programmeMock } from "./mock-data";

const etatServeur: DonneesStockees = {
  profil: profilMock,
  programme: programmeMock,
  logs: [],
};
let etatActuel: DonneesStockees = etatServeur;
let hydrateDepuisStockage = false;
const abonnes = new Set<() => void>();

function notifierAbonnes() {
  abonnes.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  abonnes.add(fn);
  return () => {
    abonnes.delete(fn);
  };
}

function getSnapshot(): DonneesStockees {
  if (!hydrateDepuisStockage) {
    const stocke = chargerProgramme();
    if (stocke) etatActuel = stocke;
    hydrateDepuisStockage = true;
  }
  return etatActuel;
}

function getServerSnapshot(): DonneesStockees {
  return etatServeur;
}

export function definirProgramme(donnees: DonneesStockees) {
  etatActuel = donnees;
  hydrateDepuisStockage = true;
  sauvegarderProgramme(donnees);
  notifierAbonnes();
}

export function useProgramme() {
  const donnees = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const marquerSeanceTerminee = useCallback((seanceId: string) => {
    const suivant: DonneesStockees = {
      ...etatActuel,
      programme: {
        ...etatActuel.programme,
        seances: etatActuel.programme.seances.map((seance) =>
          seance.id === seanceId
            ? { ...seance, statut: "terminee" as StatutSeance }
            : seance
        ),
      },
    };
    etatActuel = suivant;
    sauvegarderProgramme(suivant);
    notifierAbonnes();
  }, []);

  const enregistrerRetourSeance = useCallback((log: SeanceLog) => {
    const suivant: DonneesStockees = {
      ...etatActuel,
      programme: {
        ...etatActuel.programme,
        seances: etatActuel.programme.seances.map((seance) =>
          seance.id === log.seanceId
            ? { ...seance, statut: "terminee" as StatutSeance }
            : seance
        ),
      },
      logs: [
        ...etatActuel.logs.filter((l) => l.seanceId !== log.seanceId),
        log,
      ],
    };
    etatActuel = suivant;
    sauvegarderProgramme(suivant);
    notifierAbonnes();
  }, []);

  const appliquerAdaptation = useCallback(
    (programme: ProgrammeSemaine, bilan: BilanHebdomadaire) => {
      const suivant: DonneesStockees = {
        ...etatActuel,
        programme,
        logs: [],
        dernierBilan: bilan,
      };
      etatActuel = suivant;
      sauvegarderProgramme(suivant);
      notifierAbonnes();
    },
    []
  );

  return {
    profil: donnees.profil,
    programme: donnees.programme,
    logs: donnees.logs,
    dernierBilan: donnees.dernierBilan,
    marquerSeanceTerminee,
    enregistrerRetourSeance,
    appliquerAdaptation,
    charge: hydrateDepuisStockage,
  };
}
