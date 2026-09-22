"use client";

import { useState } from "react";
import Link from "next/link";
import { IntensiteBadge, QualiteBadge, StatutBadge } from "@/components/ui/Badge";
import { qualiteInfo } from "@/lib/qualites";
import { joursDeLaSemaineEnCours, estAujourdHui } from "@/lib/semaine";
import { cn } from "@/lib/utils";
import type { Seance } from "@/types";

export function CalendrierSemaine({
  seances,
  onPlacer,
}: {
  seances: Seance[];
  onPlacer: (seanceId: string, jour: string | null) => void;
}) {
  const [seanceSelectionneeId, setSeanceSelectionneeId] = useState<string | null>(null);
  const jours = joursDeLaSemaineEnCours();
  const nonPlacees = seances.filter((s) => s.jour === null);

  function choisirJour(jour: string) {
    if (!seanceSelectionneeId) return;
    onPlacer(seanceSelectionneeId, jour);
    setSeanceSelectionneeId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {nonPlacees.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-foreground-muted">
            {seanceSelectionneeId
              ? "Touche un jour ci-dessous pour y placer la séance."
              : "Touche une séance à placer, puis un jour du calendrier."}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {nonPlacees.map((seance) => (
              <button
                key={seance.id}
                onClick={() =>
                  setSeanceSelectionneeId((id) => (id === seance.id ? null : seance.id))
                }
                className={cn(
                  "flex shrink-0 flex-col gap-1 rounded-xl border px-3 py-2 text-left transition-colors",
                  seanceSelectionneeId === seance.id
                    ? "border-accent bg-accent/10"
                    : "border-border bg-surface"
                )}
              >
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: `var(${qualiteInfo[seance.qualite].colorVar})` }}
                  />
                  {seance.titre}
                </span>
                <span className="text-xs text-foreground-muted">
                  {seance.dureeEstimeeMinutes} min
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {jours.map(({ nom, date }) => {
          const seancesJour = seances.filter((s) => s.jour === nom);
          return (
            <div
              key={nom}
              onClick={() => choisirJour(nom)}
              className={cn(
                "flex flex-col gap-2 rounded-2xl border p-3 transition-colors",
                seanceSelectionneeId
                  ? "cursor-pointer border-dashed border-accent bg-accent/5"
                  : "border-border bg-surface"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{nom}</span>
                <span className="text-xs text-foreground-muted">
                  {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
                {estAujourdHui(date) && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                    Aujourd&apos;hui
                  </span>
                )}
              </div>

              {seancesJour.length === 0 ? (
                <p className="text-xs text-foreground-muted">Aucune séance</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {seancesJour.map((seance) => (
                    <div
                      key={seance.id}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between gap-2 rounded-xl bg-surface-muted p-2.5"
                    >
                      <Link href={`/seances/${seance.id}`} className="flex flex-1 flex-col gap-1.5">
                        <p className="text-sm font-medium">{seance.titre}</p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <QualiteBadge qualite={seance.qualite} />
                          {seance.intensite && <IntensiteBadge intensite={seance.intensite} />}
                          {seance.statut !== "a_venir" && <StatutBadge statut={seance.statut} />}
                          <span className="text-xs text-foreground-muted">
                            {seance.dureeEstimeeMinutes} min
                          </span>
                        </div>
                      </Link>
                      {seance.statut === "a_venir" && (
                        <button
                          onClick={() => onPlacer(seance.id, null)}
                          aria-label="Retirer du calendrier"
                          className="shrink-0 rounded-full p-1.5 text-foreground-muted hover:bg-border"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
