"use client";

import { Button } from "@/components/ui/Button";
import type { PointEvolution } from "@/types";
import { dateLocale } from "./GraphiqueEvolution";

export function DetailJourModal({ point, onFermer }: { point: PointEvolution; onFermer: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex w-full max-w-md flex-col gap-5 rounded-t-3xl bg-background p-6 sm:rounded-3xl">
        <h2 className="text-lg font-semibold capitalize">
          {dateLocale(point.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h2>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
            <span className="text-sm text-foreground-muted">Poids</span>
            <span className="text-sm font-medium">
              {point.poidsKg !== undefined ? `${point.poidsKg} kg` : "Non renseigné"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
            <span className="text-sm text-foreground-muted">Fatigue</span>
            <span className="text-sm font-medium">
              {point.fatigue !== undefined ? `${point.fatigue.toFixed(1)}/10` : "Aucune séance ce jour-là"}
            </span>
          </div>
        </div>

        <Button variant="ghost" onClick={onFermer} className="w-full">
          Fermer
        </Button>
      </div>
    </div>
  );
}
