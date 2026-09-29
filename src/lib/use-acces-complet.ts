"use client";

import { useEffect, useState } from "react";
import { creerClientNavigateur } from "./supabase/client";
import { PAYWALL_ACTIF, aAccesComplet } from "./abonnement";

export function useAccesComplet() {
  const [etat, setEtat] = useState<{ charge: boolean; actif: boolean }>({
    charge: !PAYWALL_ACTIF,
    actif: !PAYWALL_ACTIF,
  });

  useEffect(() => {
    if (!PAYWALL_ACTIF) return;
    const supabase = creerClientNavigateur();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const actif = user ? await aAccesComplet(supabase, user.id) : false;
      setEtat({ charge: true, actif });
    });
  }, []);

  return etat;
}
