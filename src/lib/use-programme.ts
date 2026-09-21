"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ProfilUtilisateur, ProgrammeSemaine, StatutSeance } from "@/types";
import { chargerProgramme, sauvegarderProgramme } from "./programme-store";
import { profilMock, programmeMock } from "./mock-data";

interface Donnees {
  profil: ProfilUtilisateur;
  programme: ProgrammeSemaine;
}

const etatServeur: Donnees = { profil: profilMock, programme: programmeMock };
let etatActuel: Donnees = etatServeur;
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

function getSnapshot(): Donnees {
  if (!hydrateDepuisStockage) {
    const stocke = chargerProgramme();
    if (stocke) etatActuel = stocke;
    hydrateDepuisStockage = true;
  }
  return etatActuel;
}

function getServerSnapshot(): Donnees {
  return etatServeur;
}

export function definirProgramme(donnees: Donnees) {
  etatActuel = donnees;
  hydrateDepuisStockage = true;
  sauvegarderProgramme(donnees);
  notifierAbonnes();
}

export function useProgramme() {
  const donnees = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const marquerSeanceTerminee = useCallback((seanceId: string) => {
    const suivant: Donnees = {
      profil: etatActuel.profil,
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

  return {
    profil: donnees.profil,
    programme: donnees.programme,
    marquerSeanceTerminee,
    charge: hydrateDepuisStockage,
  };
}
