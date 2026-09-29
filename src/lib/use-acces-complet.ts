"use client";

import { useEffect, useState } from "react";
import { creerClientNavigateur } from "./supabase/client";
import { PAYWALL_ACTIF, aAccesComplet } from "./abonnement";

const ESSAIS_MAX = 15;

interface EtatAcces {
  charge: boolean;
  actif: boolean;
  // Retour de la page de paiement Stripe : le webhook peut mettre quelques
  // secondes à enregistrer l'abonnement, on revérifie en attendant.
  validationPaiement: boolean;
  vientDePayer: boolean;
}

export function useAccesComplet() {
  const [etat, setEtat] = useState<EtatAcces>({
    charge: !PAYWALL_ACTIF,
    actif: !PAYWALL_ACTIF,
    validationPaiement: false,
    vientDePayer: false,
  });

  useEffect(() => {
    if (!PAYWALL_ACTIF) return;
    const supabase = creerClientNavigateur();
    const retourPaiement = new URLSearchParams(window.location.search).get("paiement") === "ok";
    let essais = 0;
    let annule = false;

    async function verifier() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const actif = user ? await aAccesComplet(supabase, user.id) : false;
      if (annule) return;

      if (!actif && retourPaiement && essais < ESSAIS_MAX) {
        essais++;
        setEtat({ charge: true, actif: false, validationPaiement: true, vientDePayer: false });
        setTimeout(verifier, 2000);
        return;
      }

      if (retourPaiement) window.history.replaceState(null, "", window.location.pathname);
      setEtat({ charge: true, actif, validationPaiement: false, vientDePayer: actif && retourPaiement });
    }

    verifier();
    return () => {
      annule = true;
    };
  }, []);

  return etat;
}
