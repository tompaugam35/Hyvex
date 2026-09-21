import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { QualiteBadge } from "@/components/ui/Badge";
import { bilanMock, programmeMock } from "@/lib/mock-data";
import type { Qualite } from "@/types";

const historiqueSemaines = [
  { numero: 4, seancesFaites: 4, seancesPrevues: 4 },
  { numero: 5, seancesFaites: 3, seancesPrevues: 4 },
  { numero: 6, seancesFaites: 2, seancesPrevues: 4 },
];

export default function HistoriquePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Historique</h1>
        <p className="text-sm text-foreground-muted">
          Ta régularité et la répartition de ton entraînement dans le temps
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground-muted">
          Répartition actuelle par qualité
        </h3>
        <Card className="flex flex-col gap-4">
          {(Object.keys(bilanMock.chargeParQualite) as Qualite[]).map((q) => (
            <div key={q} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <QualiteBadge qualite={q} />
                <span className="text-sm text-foreground-muted">
                  {bilanMock.chargeParQualite[q]}%
                </span>
              </div>
              <ProgressBar
                value={bilanMock.chargeParQualite[q]}
                colorClassName={
                  q === "course"
                    ? "bg-running"
                    : q === "muscu"
                    ? "bg-strength"
                    : "bg-power"
                }
              />
            </div>
          ))}
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground-muted">Régularité par semaine</h3>
        <div className="flex flex-col gap-3">
          {historiqueSemaines.map((s) => (
            <Card key={s.numero} className="flex items-center justify-between">
              <span className="font-medium">Semaine {s.numero}</span>
              <div className="flex items-center gap-3">
                <div className="w-28">
                  <ProgressBar value={(s.seancesFaites / s.seancesPrevues) * 100} />
                </div>
                <span className="w-14 text-right text-sm text-foreground-muted">
                  {s.seancesFaites}/{s.seancesPrevues}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground-muted">
          Semaine {programmeMock.numeroSemaine} en cours
        </h3>
        <Card>
          <p className="text-sm text-foreground-muted">
            {programmeMock.seances.filter((s) => s.statut === "terminee").length} séance(s)
            terminée(s) sur {programmeMock.seances.length} prévues.
          </p>
        </Card>
      </section>
    </div>
  );
}
