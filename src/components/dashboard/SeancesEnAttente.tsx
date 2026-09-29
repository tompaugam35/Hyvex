"use client";

import { useState } from "react";
import Link from "next/link";
import { QualiteBadge } from "@/components/ui/Badge";
import { jourDepuisDate } from "@/lib/semaine";
import type { Seance } from "@/types";

// Séances des jours passés de cette semaine, jamais validées (ni terminées, ni
// retirées du calendrier). Repliées par défaut : à l'utilisateur de choisir s'il
// veut encore s'en occuper plutôt que de les lui imposer en permanence.
export function SeancesEnAttente({
  seances,
  onPlacer,
}: {
  seances: Seance[];
  onPlacer: (seanceId: string, jour: string | null) => void;
}) {
  const [ouvert, setOuvert] = useState(false);

  if (seances.length === 0) return null;

  const jourAujourdhui = jourDepuisDate(new Date());

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3">
      <button
        onClick={() => setOuvert((v) => !v)}
        className="flex items-center justify-between gap-2 text-sm font-medium"
      >
        <span>
          {seances.length} séance{seances.length > 1 ? "s" : ""} pas encore validée
          {seances.length > 1 ? "s" : ""}
        </span>
        <span className="text-xs text-foreground-muted">{ouvert ? "Masquer" : "Afficher"}</span>
      </button>

      {ouvert && (
        <div className="flex flex-col gap-2">
          {seances.map((seance) => (
            <div
              key={seance.id}
              className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-surface-muted p-2.5"
            >
              <Link href={`/seances/${seance.id}`} className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="donnee truncate text-sm font-medium">{seance.titre}</p>
                <div className="flex items-center gap-1.5">
                  <QualiteBadge qualite={seance.qualite} />
                  <span className="text-xs text-foreground-muted">{seance.jour}</span>
                </div>
              </Link>
              <button
                onClick={() => onPlacer(seance.id, jourAujourdhui)}
                className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"
              >
                Remettre aujourd&apos;hui
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
