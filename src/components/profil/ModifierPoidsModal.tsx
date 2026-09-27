"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChampNombre } from "@/components/ui/ChampNombre";

export function ModifierPoidsModal({
  poidsActuel,
  onEnregistrer,
  onFermer,
}: {
  poidsActuel?: number;
  onEnregistrer: (poidsKg: number) => Promise<void>;
  onFermer: () => void;
}) {
  const [poids, setPoids] = useState<number | undefined>(poidsActuel);
  const [enregistrement, setEnregistrement] = useState(false);

  async function valider() {
    if (poids === undefined) return;
    setEnregistrement(true);
    await onEnregistrer(poids);
    setEnregistrement(false);
    onFermer();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="cascade flex w-full max-w-md flex-col gap-5 rounded-t-3xl bg-background p-6 sm:rounded-3xl">
        <div>
          <h2 className="text-lg font-semibold">Ton poids aujourd&apos;hui</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Utilisé pour ton graphique d&apos;évolution et tes objectifs nutritionnels.
          </p>
        </div>

        <ChampNombre label="Poids (kg)" value={poids} onChange={setPoids} decimales />

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onFermer} className="flex-1">
            Annuler
          </Button>
          <Button onClick={valider} disabled={poids === undefined || enregistrement} className="flex-1">
            {enregistrement ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
