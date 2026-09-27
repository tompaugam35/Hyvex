"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { SemaineHistorique } from "@/types";

export function BilanPrecedent({ semaine }: { semaine: SemaineHistorique }) {
  const [ouvert, setOuvert] = useState(false);

  if (!semaine.bilan) return null;
  const bilan = semaine.bilan;

  return (
    <div>
      <Button variant="secondary" onClick={() => setOuvert(true)} className="w-full">
        Revoir le bilan de la semaine {semaine.numeroSemaine}
      </Button>

      {ouvert && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="cascade flex max-h-[85dvh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-3xl bg-background p-6 sm:rounded-3xl">
            <div>
              <h2 className="text-lg font-semibold">Bilan de la semaine {semaine.numeroSemaine}</h2>
              <p className="mt-1 text-xs text-foreground-muted">
                {semaine.nbSeancesTerminees}/{semaine.nbSeancesPrevues} séances réalisées
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-foreground-muted">
                Ce que ton coach a constaté
              </h3>
              <div className="flex flex-col gap-2">
                {bilan.constats.map((constat, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground-muted" />
                    <p>{constat}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-foreground-muted">Ce qui a changé</h3>
              <div className="flex flex-col gap-2">
                {bilan.ajustements.map((ajustement, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <p>{ajustement}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => setOuvert(false)} className="w-full">
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
