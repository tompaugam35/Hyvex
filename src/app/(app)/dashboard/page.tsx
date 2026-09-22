"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CalendrierSemaine } from "@/components/dashboard/CalendrierSemaine";
import { useProgramme } from "@/lib/use-programme";
import { joursDeLaSemaineEnCours } from "@/lib/semaine";

export default function DashboardPage() {
  const { profil, programme, placerSeance, placerAutreSport } = useProgramme();

  if (!profil || !programme) return null;

  const seancesCompletees = programme.seances.filter((s) => s.statut === "terminee").length;

  const aujourdHui = new Date();
  aujourdHui.setHours(0, 0, 0, 0);

  const prochaine = joursDeLaSemaineEnCours()
    .filter((j) => j.date >= aujourdHui)
    .flatMap((j) =>
      programme.seances
        .filter((s) => s.jour === j.nom && s.statut === "a_venir")
        .map((seance) => ({ seance, jourInfo: j }))
    )[0];

  const nbNonPlacees = programme.seances.filter(
    (s) => s.jour === null && s.statut === "a_venir"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground-muted">Semaine {programme.numeroSemaine}</p>
          <h1 className="text-2xl font-semibold">Salut {profil.prenom} 👋</h1>
        </div>
        <div className="text-right text-sm text-foreground-muted">
          {seancesCompletees}/{programme.seances.length} séances faites
        </div>
      </header>

      {prochaine ? (
        <Link href={`/seances/${prochaine.seance.id}`}>
          <div className="rounded-2xl bg-foreground p-4 text-background">
            <p className="text-xs uppercase tracking-wide text-background/60">
              Prochaine séance — {prochaine.jourInfo.nom}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{prochaine.seance.titre}</h2>
            <p className="mt-1 text-sm text-background/70">
              {prochaine.seance.dureeEstimeeMinutes} min · {prochaine.seance.exercices.length}{" "}
              exercices
            </p>
          </div>
        </Link>
      ) : (
        nbNonPlacees > 0 && (
          <Card className="bg-surface-muted">
            <p className="text-sm">
              {nbNonPlacees} séance{nbNonPlacees > 1 ? "s" : ""} à placer dans ta semaine 👇
            </p>
          </Card>
        )
      )}

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground-muted">Cette semaine</h3>
        <CalendrierSemaine
          seances={programme.seances}
          autresSportsPlaces={programme.autresSportsPlaces}
          onPlacer={placerSeance}
          onPlacerAutreSport={placerAutreSport}
        />
      </section>
    </div>
  );
}
