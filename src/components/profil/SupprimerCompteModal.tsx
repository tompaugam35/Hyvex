"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { creerClientNavigateur } from "@/lib/supabase/client";

const MOT_DE_CONFIRMATION = "SUPPRIMER";

export function SupprimerCompteModal({ onFermer }: { onFermer: () => void }) {
  const router = useRouter();
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  const confirme = saisie.trim().toUpperCase() === MOT_DE_CONFIRMATION;

  async function supprimer() {
    setEnCours(true);
    setErreur("");
    try {
      const reponse = await fetch("/api/compte/supprimer", { method: "POST" });
      if (!reponse.ok) {
        const { erreur: message } = (await reponse.json().catch(() => ({}))) as { erreur?: string };
        throw new Error(message ?? "La suppression a échoué.");
      }
      await creerClientNavigateur().auth.signOut();
      router.push("/");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "La suppression a échoué.");
      setEnCours(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="cascade flex w-full max-w-md flex-col gap-5 rounded-t-3xl bg-background p-6 sm:rounded-3xl">
        <div>
          <h2 className="text-lg font-semibold">Supprimer mon compte</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Ton compte et toutes tes données seront définitivement effacés : programme, séances,
            repas, poids, historique et connexion Strava. Si tu as un abonnement, il sera résilié
            immédiatement, sans remboursement de la période en cours.
          </p>
          <p className="mt-2 text-sm font-medium">Cette action est irréversible.</p>
        </div>

        <label className="flex flex-col gap-2 text-sm text-foreground-muted">
          Pour confirmer, écris {MOT_DE_CONFIRMATION} :
          <input
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-foreground"
          />
        </label>

        {erreur && (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {erreur}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button
            onClick={supprimer}
            disabled={!confirme || enCours}
            className="w-full bg-danger text-background hover:opacity-90"
          >
            {enCours ? "Suppression…" : "Supprimer définitivement"}
          </Button>
          <Button variant="ghost" onClick={onFermer} disabled={enCours} className="w-full">
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}
