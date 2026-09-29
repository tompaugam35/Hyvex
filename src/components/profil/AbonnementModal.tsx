"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { creerClientNavigateur } from "@/lib/supabase/client";

interface Abonnement {
  statut: string;
  offre: string | null;
  fin_periode: string | null;
  resiliation_prevue: boolean;
}

const nomOffre: Record<string, string> = { starter: "Starter pack", pro: "Pro", offert: "Accès offert" };

const libelleStatut: Record<string, string> = {
  active: "Actif",
  trialing: "Période d'essai",
  past_due: "Paiement en retard",
  unpaid: "Impayé",
  canceled: "Résilié",
  incomplete: "Paiement incomplet",
  incomplete_expired: "Paiement expiré",
};

export function AbonnementModal({ onFermer }: { onFermer: () => void }) {
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null);
  const [charge, setCharge] = useState(false);
  const [ouverture, setOuverture] = useState(false);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    const supabase = creerClientNavigateur();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase
          .from("abonnements")
          .select("statut, offre, fin_periode, resiliation_prevue")
          .eq("user_id", user.id)
          .maybeSingle();
        setAbonnement(data);
      }
      setCharge(true);
    });
  }, []);

  async function gerer() {
    setOuverture(true);
    setErreur(false);
    try {
      const reponse = await fetch("/api/stripe/portail", { method: "POST" });
      const { url } = (await reponse.json()) as { url?: string };
      if (!reponse.ok || !url) throw new Error();
      window.location.href = url;
    } catch {
      setOuverture(false);
      setErreur(true);
    }
  }

  const offert = abonnement?.offre === "offert";
  const finPeriode = abonnement?.fin_periode
    ? new Date(abonnement.fin_periode).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="cascade flex w-full max-w-md flex-col gap-5 rounded-t-3xl bg-background p-6 sm:rounded-3xl">
        <div>
          <h2 className="text-lg font-semibold">Ton abonnement</h2>
          {!charge ? (
            <p className="mt-1 text-sm text-foreground-muted">Chargement…</p>
          ) : abonnement ? (
            <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-foreground-muted">Offre</span>
                <span className="font-medium">{nomOffre[abonnement.offre ?? ""] ?? "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-foreground-muted">Statut</span>
                <span className="font-medium">
                  {abonnement.resiliation_prevue && abonnement.statut === "active"
                    ? "Résilié"
                    : (libelleStatut[abonnement.statut] ?? abonnement.statut)}
                </span>
              </div>
              {finPeriode && (
                <div className="flex justify-between gap-3">
                  <span className="text-foreground-muted">
                    {abonnement.statut === "canceled" || abonnement.resiliation_prevue
                      ? "Accès jusqu'au"
                      : "Prochain paiement"}
                  </span>
                  <span className="font-medium">{finPeriode}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-foreground-muted">Tu n&apos;as pas encore d&apos;abonnement.</p>
          )}
        </div>

        {erreur && (
          <p className="text-sm text-danger">Impossible d&apos;ouvrir la gestion de l&apos;abonnement. Réessaie.</p>
        )}

        <div className="flex flex-col gap-2">
          {abonnement && !offert ? (
            <Button onClick={gerer} disabled={ouverture} className="w-full">
              {ouverture ? "Ouverture…" : "Gérer mon abonnement"}
            </Button>
          ) : (
            charge &&
            !offert && (
              <Link href="/tarifs">
                <Button className="w-full">Voir les offres</Button>
              </Link>
            )
          )}
          <Button variant="ghost" onClick={onFermer} className="w-full">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
