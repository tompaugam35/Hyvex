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
import { objectifsDepuisQualites } from "./ia/mapper";
import type { ProfilInput } from "./ia/schema";

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

  const mettreAJourProfil = useCallback(async (input: ProfilInput) => {
    const actuel = etatRef.current;
    if (!actuel.userId) return;

    const nouveauProfil: ProfilUtilisateur = {
      id: actuel.userId,
      prenom: input.prenom,
      niveau: input.niveau,
      qualitesPrioritaires: input.qualitesPrioritaires,
      performanceCourse: input.performanceCourse,
      performanceMuscu: input.performanceMuscu,
      objectifsTexte: input.objectifsTexte,
      autresSports: input.autresSports,
      objectifs: objectifsDepuisQualites(input.qualitesPrioritaires),
      seancesParSemaine: input.seancesParSemaine,
      dureeSeanceMinutes: input.dureeSeanceMinutes,
      materiel: input.materiel,
    };

    const supabase = creerClientNavigateur();
    const { data, error } = await supabase
      .from("profils")
      .update({
        prenom: nouveauProfil.prenom,
        niveau: nouveauProfil.niveau,
        qualites_prioritaires: nouveauProfil.qualitesPrioritaires,
        performance_course: nouveauProfil.performanceCourse,
        performance_muscu: nouveauProfil.performanceMuscu,
        objectifs_texte: nouveauProfil.objectifsTexte,
        autres_sports: nouveauProfil.autresSports,
        objectifs: nouveauProfil.objectifs,
        seances_par_semaine: nouveauProfil.seancesParSemaine,
        duree_seance_minutes: nouveauProfil.dureeSeanceMinutes,
        materiel: nouveauProfil.materiel,
      })
      .eq("user_id", actuel.userId)
      .select("user_id");

    // On ne met à jour l'état local qu'après confirmation de l'écriture : sinon un
    // échec silencieux de Supabase laisse croire que la modification a été prise en
    // compte alors qu'elle sera perdue au prochain rechargement. Une erreur Postgres
    // n'est renvoyée que si la requête est invalide : si le filtre user_id ne
    // correspond à aucune ligne (RLS ou incohérence), .update() "réussit" quand même
    // avec 0 ligne modifiée — on le détecte via .select() pour ne pas se faire piéger.
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      throw new Error("Aucune ligne de profil mise à jour (user_id introuvable).");
    }

    setEtat((prev) => ({ ...prev, profil: nouveauProfil }));
  }, []);

  const placerAutreSport = useCallback(async (id: string, jour: string | null) => {
    const actuel = etatRef.current;
    if (!actuel.programme || !actuel.userId) return;

    const autresSportsPlaces = actuel.programme.autresSportsPlaces.map((s) =>
      s.id === id ? { ...s, jour } : s
    );

    setEtat((prev) =>
      prev.programme ? { ...prev, programme: { ...prev.programme, autresSportsPlaces } } : prev
    );

    const supabase = creerClientNavigateur();
    await supabase
      .from("programmes")
      .update({ autres_sports_places: autresSportsPlaces, updated_at: new Date().toISOString() })
      .eq("user_id", actuel.userId);
  }, []);

  return {
    profil: etat.profil,
    programme: etat.programme,
    dernierBilan: etat.dernierBilan,
    enregistrerRetourSeance,
    placerSeance,
    placerAutreSport,
    mettreAJourProfil,
    rafraichir,
    charge,
  };
}
