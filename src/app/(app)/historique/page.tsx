"use client";

import { Card } from "@/components/ui/Card";
import { GraphiqueMensuel } from "@/components/historique/GraphiqueMensuel";
import { BilanPrecedent } from "@/components/historique/BilanPrecedent";
import { qualiteInfo } from "@/lib/qualites";
import { useHistorique } from "@/lib/use-historique";
import type { JournalEntree, Qualite, TerrainCourse } from "@/types";

const qualites: Qualite[] = ["course", "muscu", "explosivite"];

const labelDerniereSeance: Record<Qualite, string> = {
  course: "Dernière séance de course",
  muscu: "Dernière séance de musculation",
  explosivite: "Dernière séance d'explosivité",
};

const labelTerrain: Record<TerrainCourse, string> = {
  route: "Route",
  trail: "Trail",
  piste: "Piste",
};

function formaterDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formaterDureeCourse(secondes: number) {
  const min = Math.floor(secondes / 60);
  const sec = Math.round(secondes % 60);
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function formaterCourse(distanceMetres: number, dureeSecondes: number) {
  const km = distanceMetres / 1000;
  const allureSecondes = dureeSecondes / km;
  return `${km.toFixed(1)} km en ${formaterDureeCourse(dureeSecondes)} (allure ${formaterDureeCourse(allureSecondes)}/km)`;
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
    <div className="cascade flex flex-col gap-6">
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
        <h3 className="text-sm font-semibold text-foreground-muted">Bilan précédent</h3>
        {semaines.length > 0 ? (
          <BilanPrecedent semaine={semaines[0]} />
        ) : (
          charge && (
            <Card>
              <p className="text-sm text-foreground-muted">
                Ton bilan de semaine apparaîtra ici après ta première génération.
              </p>
            </Card>
          )
        )}
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
                    {entree.distanceMetres !== undefined && entree.dureeSecondes !== undefined && (
                      <p className="text-sm text-foreground-muted">
                        {formaterCourse(entree.distanceMetres, entree.dureeSecondes)}
                      </p>
                    )}
                    {(entree.terrain || !!entree.deniveleMetres) && (
                      <p className="text-sm text-foreground-muted">
                        {[
                          entree.terrain && labelTerrain[entree.terrain],
                          entree.deniveleMetres ? `D+ ${entree.deniveleMetres} m` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    {(entree.rpe !== undefined || entree.fatigue !== undefined) && (
                      <p className="text-sm text-foreground-muted">
                        {entree.rpe !== undefined &&
                          `${qualite === "course" ? "Ressenti" : "RPE"} ${entree.rpe}/10`}
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
