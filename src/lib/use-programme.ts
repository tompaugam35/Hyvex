"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BilanHebdomadaire,
  ProfilUtilisateur,
  ProgrammeSemaine,
  SeanceLog,
  StatutSeance,
} from "@/types";
import { creerClientNavigateur } from "./supabase/client";
import { versProfil, versProgramme } from "./supabase/mappers";
import { jourDepuisDate } from "./semaine";

interface EtatProgramme {
  userId: string | null;
  profil: ProfilUtilisateur | null;
  programme: ProgrammeSemaine | null;
  dernierBilan?: BilanHebdomadaire;
}

const etatInitial: EtatProgramme = {
  userId: null,
  profil: null,
  programme: null,
};

export function useProgramme() {
  const [etat, setEtat] = useState<EtatProgramme>(etatInitial);
  const [charge, setCharge] = useState(false);
  const etatRef = useRef(etat);
  useEffect(() => {
    etatRef.current = etat;
  });

  const rafraichir = useCallback(async () => {
    const supabase = creerClientNavigateur();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setEtat(etatInitial);
      setCharge(true);
      return;
    }

    const [{ data: ligneProfil }, { data: ligneProgramme }] = await Promise.all([
      supabase.from("profils").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("programmes").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    setEtat({
      userId: user.id,
      profil: ligneProfil ? versProfil(ligneProfil) : null,
      programme: ligneProgramme ? versProgramme(ligneProgramme) : null,
      dernierBilan: (ligneProgramme?.dernier_bilan as BilanHebdomadaire | null) ?? undefined,
    });
    setCharge(true);
  }, []);

  useEffect(() => {
    // Chargement initial depuis Supabase : setState différé après l'appel réseau,
    // pas de rendu en cascade synchrone.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    rafraichir();
  }, [rafraichir]);

  const enregistrerRetourSeance = useCallback(async (log: SeanceLog) => {
    const actuel = etatRef.current;
    if (!actuel.programme || !actuel.userId) return;

    const seance = actuel.programme.seances.find((s) => s.id === log.seanceId);
    if (!seance) return;

    const seances = actuel.programme.seances.map((s) =>
      s.id === log.seanceId ? { ...s, statut: "terminee" as StatutSeance } : s
    );

    setEtat((prev) =>
      prev.programme ? { ...prev, programme: { ...prev.programme, seances } } : prev
    );

    const supabase = creerClientNavigateur();
    await Promise.all([
      supabase
        .from("programmes")
        .update({ seances, updated_at: new Date().toISOString() })
        .eq("user_id", actuel.userId),
      supabase.from("journal_seances").insert({
        user_id: actuel.userId,
        numero_semaine: actuel.programme.numeroSemaine,
        seance_id: seance.id,
        jour: seance.jour ?? jourDepuisDate(new Date(log.date)),
        titre: seance.titre,
        qualite: seance.qualite,
        date: log.date,
        rpe: log.rpe,
        fatigue: log.fatigue ?? null,
        retours_exercices: log.retoursExercices ?? null,
        notes: log.notes ?? null,
        distance_metres: log.distanceMetres ?? null,
        duree_secondes: log.dureeSecondes ?? null,
        denivele_metres: log.deniveleMetres ?? null,
        terrain: log.terrain ?? null,
      }),
    ]);
  }, []);

  const placerSeance = useCallback(async (seanceId: string, jour: string | null) => {
    const actuel = etatRef.current;
    if (!actuel.programme || !actuel.userId) return;

    const seances = actuel.programme.seances.map((s) =>
      s.id === seanceId ? { ...s, jour } : s
    );

    setEtat((prev) =>
      prev.programme ? { ...prev, programme: { ...prev.programme, seances } } : prev
    );

    const supabase = creerClientNavigateur();
    await supabase
      .from("programmes")
      .update({ seances, updated_at: new Date().toISOString() })
      .eq("user_id", actuel.userId);
  }, []);

  return {
    profil: etat.profil,
    programme: etat.programme,
    dernierBilan: etat.dernierBilan,
    enregistrerRetourSeance,
    placerSeance,
    rafraichir,
    charge,
  };
}
