"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { IntensiteBadge, QualiteBadge, StatutBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useProgramme } from "@/lib/use-programme";

export default function SeanceDetailPage() {
  const params = useParams<{ id: string }>();
  const { programme, charge } = useProgramme();

  const seance = programme?.seances.find((s) => s.id === params.id);

  if (charge && !seance) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/dashboard" className="text-sm text-foreground-muted">
          ← Retour au programme
        </Link>
        <p className="text-sm text-foreground-muted">Séance introuvable.</p>
      </div>
    );
  }

  if (!seance) return null;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard" className="text-sm text-foreground-muted">
        ← Retour au programme
      </Link>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <QualiteBadge qualite={seance.qualite} />
          {seance.intensite && <IntensiteBadge intensite={seance.intensite} />}
          <StatutBadge statut={seance.statut} />
        </div>
        <h1 className="text-2xl font-semibold">{seance.titre}</h1>
        <p className="text-sm text-foreground-muted">
          {seance.jour ?? "Pas encore placée"} · {seance.dureeEstimeeMinutes} min estimées
        </p>
      </header>

      <section className="flex flex-col gap-3">
        {seance.exercices.map((exercice, i) => (
          <Card key={exercice.id} className="flex items-center gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold">
              {i + 1}
            </span>
            <div className="flex flex-1 flex-col">
              <p className="font-medium">{exercice.nom}</p>
              <p className="text-sm text-foreground-muted">
                {[
                  exercice.series && `${exercice.series} séries`,
                  exercice.repetitions,
                  exercice.charge,
                  exercice.reposSecondes && `repos ${exercice.reposSecondes}s`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </Card>
        ))}
      </section>

      {seance.statut === "a_venir" && (
        <Link href={`/seances/${seance.id}/bilan`}>
          <Button className="w-full">Terminer la séance</Button>
        </Link>
      )}
    </div>
  );
}
