"use client";

import { useCallback, useEffect, useState } from "react";
import { creerClientNavigateur } from "./supabase/client";

interface ResultatSynchro {
  nbImportees: number;
  nbAssociees: number;
}

export function useStrava() {
  const [connecte, setConnecte] = useState(false);
  const [charge, setCharge] = useState(false);
  const [synchroEnCours, setSynchroEnCours] = useState(false);
  const [dernierResultat, setDernierResultat] = useState<ResultatSynchro | null>(null);

  const rafraichirStatut = useCallback(async () => {
    const supabase = creerClientNavigateur();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCharge(true);
      return;
    }

    const { data } = await supabase
      .from("strava_tokens")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    setConnecte(!!data);
    setCharge(true);
  }, []);

  useEffect(() => {
    // Chargement initial du statut de connexion Strava : pas de rendu en cascade synchrone.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    rafraichirStatut();
  }, [rafraichirStatut]);

  const connecter = useCallback(() => {
    // Navigation complète requise : cette route redirige elle-même vers Strava (hors app Next.js).
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/strava/connect";
  }, []);

  const synchroniser = useCallback(async () => {
    setSynchroEnCours(true);
    try {
      const reponse = await fetch("/api/strava/sync", { method: "POST" });
      if (reponse.ok) {
        const resultat = await reponse.json();
        setDernierResultat(resultat);
        return resultat as ResultatSynchro;
      }
    } finally {
      setSynchroEnCours(false);
    }
    return null;
  }, []);

  return {
    connecte,
    charge,
    synchroEnCours,
    dernierResultat,
    connecter,
    synchroniser,
    rafraichirStatut,
  };
}
