"use client";

import { Button } from "@/components/ui/Button";
import { genererIcsSemaine, telechargerIcs } from "@/lib/ics";
import type { Seance } from "@/types";

export function ExporterCalendrier({ seances }: { seances: Seance[] }) {
  const seancesPlacees = seances.filter((s) => s.jour !== null);
  const peutExporter = seancesPlacees.length > 0;

  function exporter() {
    const contenu = genererIcsSemaine(seances);
    telechargerIcs(contenu, "hyvex-semaine.ics");
  }

  return (
    <div className="flex flex-col items-center gap-2 pb-2 pt-2 text-center">
      <Button data-pro variant="secondary" onClick={exporter} disabled={!peutExporter} className="w-full">
        Ajouter la semaine à mon calendrier
      </Button>
      {!peutExporter && (
        <p className="text-xs text-foreground-muted">
          Place au moins une séance dans ta semaine pour l&apos;ajouter à ton calendrier.
        </p>
      )}
    </div>
  );
}
