"use client";

import { useCallback, useEffect, useState } from "react";
import type { JournalEntree, SemaineHistorique } from "@/types";
import { creerClientNavigateur } from "./supabase/client";
import { versJournalEntree, versSemaineHistorique } from "./supabase/mappers";

export function useHistorique() {
  const [journal, setJournal] = useState<JournalEntree[]>([]);
  const [semaines, setSemaines] = useState<SemaineHistorique[]>([]);
  const [charge, setCharge] = useState(false);

  const rafraichir = useCallback(async () => {
    const supabase = creerClientNavigateur();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setJournal([]);
      setSemaines([]);
      setCharge(true);
      return;
    }

    const [{ data: lignesJournal }, { data: lignesSemaines }] = await Promise.all([
      supabase
        .from("journal_seances")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(200),
      supabase
        .from("semaines_historique")
        .select("*")
        .eq("user_id", user.id)
        .order("numero_semaine", { ascending: false })
        .limit(3),
    ]);

    setJournal((lignesJournal ?? []).map(versJournalEntree));
    setSemaines((lignesSemaines ?? []).map(versSemaineHistorique));
    setCharge(true);
  }, []);

  useEffect(() => {
    // Chargement initial depuis Supabase : setState différé après l'appel réseau,
    // pas de rendu en cascade synchrone.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    rafraichir();
  }, [rafraichir]);

  return { journal, semaines, charge };
}
