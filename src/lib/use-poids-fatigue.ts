"use client";

import { useCallback, useEffect, useState } from "react";
import type { PointEvolution } from "@/types";
import { creerClientNavigateur } from "./supabase/client";

const NB_JOURS = 30;

// Clé de jour en heure locale (et non UTC), pour rester cohérent avec les
// autres graphiques de l'app (voir GraphiqueMensuel).
function cleDate(date: Date) {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

export function usePoidsFatigue() {
  const [points, setPoints] = useState<PointEvolution[]>([]);
  const [fatigueMoyenne, setFatigueMoyenne] = useState<number | null>(null);
  const [charge, setCharge] = useState(false);

  const rafraichir = useCallback(async () => {
    const supabase = creerClientNavigateur();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCharge(true);
      return;
    }

    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);
    const debut = new Date(aujourdHui);
    debut.setDate(debut.getDate() - (NB_JOURS - 1));

    const [{ data: lignesPoids }, { data: lignesJournal }, { data: toutLeJournal }] =
      await Promise.all([
        supabase
          .from("poids_historique")
          .select("poids_kg, date")
          .eq("user_id", user.id)
          .gte("date", cleDate(debut)),
        supabase
          .from("journal_seances")
          .select("date, fatigue")
          .eq("user_id", user.id)
          .not("fatigue", "is", null)
          .gte("date", debut.toISOString()),
        supabase.from("journal_seances").select("fatigue").eq("user_id", user.id).not("fatigue", "is", null),
      ]);

    const parJour = new Map<string, PointEvolution>();
    for (let i = 0; i < NB_JOURS; i++) {
      const d = new Date(debut);
      d.setDate(d.getDate() + i);
      parJour.set(cleDate(d), { date: cleDate(d) });
    }

    for (const ligne of lignesPoids ?? []) {
      const point = parJour.get(ligne.date);
      if (point) point.poidsKg = ligne.poids_kg;
    }

    const fatigueParJour = new Map<string, number[]>();
    for (const ligne of lignesJournal ?? []) {
      const cle = cleDate(new Date(ligne.date));
      const liste = fatigueParJour.get(cle);
      if (liste) liste.push(ligne.fatigue as number);
      else fatigueParJour.set(cle, [ligne.fatigue as number]);
    }
    for (const [cle, valeurs] of fatigueParJour) {
      const point = parJour.get(cle);
      if (point) point.fatigue = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
    }

    setPoints([...parJour.values()]);

    const toutesFatigues = (toutLeJournal ?? []).map((l) => l.fatigue as number);
    setFatigueMoyenne(
      toutesFatigues.length > 0
        ? toutesFatigues.reduce((a, b) => a + b, 0) / toutesFatigues.length
        : null
    );
    setCharge(true);
  }, []);

  useEffect(() => {
    // Chargement initial depuis Supabase : setState différé après l'appel réseau,
    // pas de rendu en cascade synchrone.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    rafraichir();
  }, [rafraichir]);

  return { points, fatigueMoyenne, charge, rafraichir };
}
