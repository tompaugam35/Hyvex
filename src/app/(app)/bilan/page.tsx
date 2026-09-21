import { Card } from "@/components/ui/Card";
import { bilanMock, programmeMock } from "@/lib/mock-data";

export default function BilanPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Bilan de la semaine</h1>
        <p className="text-sm text-foreground-muted">
          Analyse de la semaine {programmeMock.numeroSemaine - 1} par ton coach IA
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground-muted">Ce que l&apos;IA a constaté</h3>
        <Card className="flex flex-col gap-3">
          {bilanMock.constats.map((constat, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground-muted" />
              <p className="text-sm">{constat}</p>
            </div>
          ))}
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground-muted">
          Ce qui change cette semaine
        </h3>
        <Card className="flex flex-col gap-3 border-accent/40 bg-accent/10">
          {bilanMock.ajustements.map((ajustement, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5c6b0f]" />
              <p className="text-sm">{ajustement}</p>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
