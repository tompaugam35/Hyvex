"use client";

import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { GraphiqueMensuel } from "@/components/historique/GraphiqueMensuel";
import { qualiteInfo } from "@/lib/qualites";
import { useHistorique } from "@/lib/use-historique";
import type { JournalEntree, Qualite } from "@/types";

const qualites: Qualite[] = ["course", "muscu", "explosivite"];

const labelDerniereSeance: Record<Qualite, string> = {
  course: "Dernière séance de course",
  muscu: "Dernière séance de musculation",
  explosivite: "Dernière séance d'explosivité",
};

function formaterDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function HistoriquePage() {
  const { journal, semaines, charge } = useHistorique();

  const derniereParQualite: Partial<Record<Qualite, JournalEntree>> = {};
  for (const entree of journal) {
    if (!derniereParQualite[entree.qualite]) {
      derniereParQualite[entree.qualite] = entree;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Historique</h1>
        <p className="text-sm text-foreground-muted">
          Ta régularité et la répartition de ton entraînement dans le temps
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground-muted">30 derniers jours</h3>
        <Card>
          <GraphiqueMensuel entrees={journal} />
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground-muted">Dernières semaines</h3>
        {charge && semaines.length === 0 && (
          <Card>
            <p className="text-sm text-foreground-muted">
              Ton historique de semaines apparaîtra ici après ton premier bilan.
            </p>
          </Card>
        )}
        <div className="flex flex-col gap-3">
          {semaines.map((s) => (
            <Card key={s.numeroSemaine} className="flex items-center justify-between">
              <span className="font-medium">Semaine {s.numeroSemaine}</span>
              <div className="flex items-center gap-3">
                <div className="w-28">
                  <ProgressBar
                    value={(s.nbSeancesTerminees / s.nbSeancesPrevues) * 100}
                  />
                </div>
                <span className="w-14 text-right text-sm text-foreground-muted">
                  {s.nbSeancesTerminees}/{s.nbSeancesPrevues}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground-muted">Dernières séances</h3>
        <div className="flex flex-col gap-3">
          {qualites.map((qualite) => {
            const entree = derniereParQualite[qualite];
            return (
              <Card key={qualite} className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-foreground-muted">
                  {labelDerniereSeance[qualite]}
                </p>
                {entree ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{entree.titre}</p>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${qualiteInfo[qualite].className}`}>
                        {qualiteInfo[qualite].label}
                      </span>
                    </div>
                    <p className="text-sm capitalize text-foreground-muted">
                      {formaterDate(entree.date)}
                    </p>
                    {(entree.rpe !== undefined || entree.fatigue !== undefined) && (
                      <p className="text-sm text-foreground-muted">
                        {entree.rpe !== undefined && `RPE ${entree.rpe}/10`}
                        {entree.rpe !== undefined && entree.fatigue !== undefined && " · "}
                        {entree.fatigue !== undefined && `Fatigue ${entree.fatigue}/10`}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-foreground-muted">Pas encore de séance validée.</p>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
