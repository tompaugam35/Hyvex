import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { QualiteBadge, StatutBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { programmeMock } from "@/lib/mock-data";

export default async function SeanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seance = programmeMock.seances.find((s) => s.id === id);
  if (!seance) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard" className="text-sm text-foreground-muted">
        ← Retour au programme
      </Link>

      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <QualiteBadge qualite={seance.qualite} />
          <StatutBadge statut={seance.statut} />
        </div>
        <h1 className="text-2xl font-semibold">{seance.titre}</h1>
        <p className="text-sm text-foreground-muted">
          {seance.jour} · {seance.dureeEstimeeMinutes} min estimées
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
        <Button className="w-full">Marquer la séance comme terminée</Button>
      )}
    </div>
  );
}
