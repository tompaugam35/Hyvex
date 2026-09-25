"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RoueHeure } from "@/components/ui/RoueHeure";

export function SelecteurHeure({
  valeur,
  onChange,
}: {
  valeur: string | undefined;
  onChange: (heure: string) => void;
}) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <button
        onClick={() => setOuvert(true)}
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
      >
        {valeur ? `Heure : ${valeur}` : "Ajouter une heure"}
      </button>

      {ouvert && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          onClick={() => setOuvert(false)}
        >
          <div
            className="flex w-full max-w-md flex-col items-center gap-5 rounded-t-3xl bg-background p-6 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Heure de la séance</h2>
            <RoueHeure valeur={valeur} onChange={onChange} />
            <Button onClick={() => setOuvert(false)} className="w-full">
              Terminé
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
