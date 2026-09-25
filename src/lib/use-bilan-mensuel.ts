"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BilanMensuel, ProfilUtilisateur } from "@/types";
import { creerClientNavigateur } from "./supabase/client";
import { cleMois, moisPrecedent } from "./bilan-mensuel";

export function useBilanMensuel(profil: ProfilUtilisateur | null) {
  const [bilan, setBilan] = useState<BilanMensuel | null>(null);
  const [ouvert, setOuvert] = useState(false);
  const dejaVerifie = useRef(false);

  const marquerVu = useCallback(async (mois: string) => {
    const supabase = creerClientNavigateur();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profils").update({ dernier_bilan_mensuel_vu: mois }).eq("user_id", user.id);
  }, []);

  useEffect(() => {
    // Un seul contrôle par session : le mois précédent ne change pas pendant
    // qu'on a l'app ouverte, inutile de re-vérifier à chaque rafraîchissement.
    if (!profil || dejaVerifie.current) return;
    const cle = cleMois(moisPrecedent());
    if (profil.dernierBilanMensuelVu === cle) return;
    dejaVerifie.current = true;

    fetch("/api/bilan-mensuel").then(async (reponse) => {
      if (!reponse.ok) return;
      const donnees = (await reponse.json()) as BilanMensuel;
      if (donnees.nbSeances === 0) {
        // Rien à raconter (mois vide ou compte trop récent) : on ne réaffichera
        // pas la fenêtre pour rien à chaque ouverture du mois en cours.
        marquerVu(cle);
        return;
      }
      setBilan(donnees);
      setOuvert(true);
    });
  }, [profil, marquerVu]);

  const fermer = useCallback(() => {
    setOuvert(false);
    if (bilan) marquerVu(bilan.mois);
  }, [bilan, marquerVu]);

  return { bilan, ouvert, fermer };
}
