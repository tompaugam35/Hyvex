"use client";

import { useCallback, useEffect, useState } from "react";
import type { Repas } from "@/types";
import { creerClientNavigateur } from "./supabase/client";
import { versRepas } from "./supabase/mappers";
import { joursDeLaSemaineEnCours } from "./semaine";

// Clé de jour en heure locale (et non UTC), cohérente avec cleDate dans
// GraphiqueMensuel.tsx pour les mêmes raisons de fuseau horaire.
function cleJour(date: Date) {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

function debutSemaine() {
  return joursDeLaSemaineEnCours()[0].date.toISOString();
}

async function poster(url: string, corps: unknown) {
  const reponse = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corps),
  });
  if (!reponse.ok) {
    const corpsErreur = await reponse.json().catch(() => null);
    throw new Error(corpsErreur?.erreur ?? "L'opération a échoué");
  }
}

export function useRepas() {
  const [repasSemaine, setRepasSemaine] = useState<Repas[]>([]);
  const [charge, setCharge] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const rafraichir = useCallback(async () => {
    const supabase = creerClientNavigateur();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setRepasSemaine([]);
      setCharge(true);
      return;
    }

    const { data } = await supabase
      .from("repas")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", debutSemaine())
      .order("created_at", { ascending: false });

    setRepasSemaine((data ?? []).map(versRepas));
    setCharge(true);
  }, []);

  useEffect(() => {
    // Chargement initial depuis Supabase : setState différé après l'appel réseau,
    // pas de rendu en cascade synchrone.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    rafraichir();
  }, [rafraichir]);

  const ajouterRepas = useCallback(
    async (imageBase64: string, mediaType: string) => {
      setEnCours(true);
      setErreur(null);
      try {
        await poster("/api/analyser-repas", { image: imageBase64, mediaType });
        await rafraichir();
      } catch (e) {
        setErreur(e instanceof Error ? e.message : "Erreur inconnue");
      }
      setEnCours(false);
    },
    [rafraichir]
  );

  const ajouterRepasParAliments = useCallback(
    async (donnees: { titre: string; aliments: { nom: string; poidsGrammes: number }[] }) => {
      setEnCours(true);
      setErreur(null);
      try {
        await poster("/api/calculer-repas", donnees);
        await rafraichir();
      } catch (e) {
        setErreur(e instanceof Error ? e.message : "Erreur inconnue");
      }
      setEnCours(false);
    },
    [rafraichir]
  );

  const aujourdHui = cleJour(new Date());
  const repas = repasSemaine.filter((r) => cleJour(new Date(r.date)) === aujourdHui);

  const totaux = repas.reduce(
    (acc, r) => ({
      calories: acc.calories + r.calories,
      proteinesG: acc.proteinesG + r.proteinesG,
      glucidesG: acc.glucidesG + r.glucidesG,
      lipidesG: acc.lipidesG + r.lipidesG,
    }),
    { calories: 0, proteinesG: 0, glucidesG: 0, lipidesG: 0 }
  );

  const caloriesParJour = new Map<string, number>();
  for (const r of repasSemaine) {
    const cle = cleJour(new Date(r.date));
    caloriesParJour.set(cle, (caloriesParJour.get(cle) ?? 0) + r.calories);
  }

  return {
    repas,
    totaux,
    caloriesParJour,
    charge,
    enCours,
    erreur,
    ajouterRepas,
    ajouterRepasParAliments,
  };
}
