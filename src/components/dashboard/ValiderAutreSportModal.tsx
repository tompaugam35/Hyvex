"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ValiderAutreSportModal({
  nom,
  fatigueActuelle,
  onValider,
  onFermer,
}: {
  nom: string;
  fatigueActuelle?: number;
  onValider: (fatigue: number) => Promise<void>;
  onFermer: () => void;
}) {
  const [fatigue, setFatigue] = useState(fatigueActuelle ?? 5);
  const [enregistrement, setEnregistrement] = useState(false);

  async function valider() {
    setEnregistrement(true);
    await onValider(fatigue);
    setEnregistrement(false);
    onFermer();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="cascade flex w-full max-w-md flex-col gap-5 rounded-t-3xl bg-background p-6 sm:rounded-3xl">
        <div>
          <h2 className="text-lg font-semibold">Valider {nom}</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Comment te sens-tu après cette séance ?
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground-muted">Fatigue</p>
          <p className="text-xs text-foreground-muted">1 = en pleine forme, 10 = épuisé</p>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setFatigue(n)}
                className={cn(
                  "rounded-lg py-2 text-xs font-semibold transition-colors",
                  fatigue === n
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface-muted text-foreground-muted"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={valider} disabled={enregistrement} className="w-full">
          {enregistrement ? "Enregistrement…" : "Valider la séance"}
        </Button>
      </div>
    </div>
  );
}
