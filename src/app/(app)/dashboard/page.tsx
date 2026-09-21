"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { QualiteBadge, StatutBadge } from "@/components/ui/Badge";
import { useProgramme } from "@/lib/use-programme";

export default function DashboardPage() {
  const { profil, programme } = useProgramme();

  const prochaineSeance = programme.seances.find((s) => s.statut === "a_venir");
  const seancesCompletees = programme.seances.filter(
    (s) => s.statut === "terminee"
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

      {prochaineSeance && (
        <Link href={`/seances/${prochaineSeance.id}`}>
          <div className="rounded-2xl bg-foreground p-4 text-background">
            <p className="text-xs uppercase tracking-wide text-background/60">
              Prochaine séance — {prochaineSeance.jour}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{prochaineSeance.titre}</h2>
            <p className="mt-1 text-sm text-background/70">
              {prochaineSeance.dureeEstimeeMinutes} min · {prochaineSeance.exercices.length} exercices
            </p>
          </div>
        </Link>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground-muted">Programme de la semaine</h3>
        <div className="flex flex-col gap-3">
          {programme.seances.map((seance) => (
            <Link key={seance.id} href={`/seances/${seance.id}`}>
              <Card className="flex items-center justify-between gap-3 hover:border-foreground/20">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-foreground-muted">{seance.jour}</p>
                  <p className="font-medium">{seance.titre}</p>
                  <div className="flex items-center gap-2">
                    <QualiteBadge qualite={seance.qualite} />
                    <span className="text-xs text-foreground-muted">
                      {seance.dureeEstimeeMinutes} min
                    </span>
                  </div>
                </div>
                <StatutBadge statut={seance.statut} />
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
