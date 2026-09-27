"use client";

import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { CapturePhoto } from "@/components/calories/CapturePhoto";
import { SemaineCalories } from "@/components/calories/SemaineCalories";
import { AjoutManuel } from "@/components/calories/AjoutManuel";
import { useRepas } from "@/lib/use-repas";
import { useProgramme } from "@/lib/use-programme";

function arrondi(n: number) {
  return Math.round(n).toString();
}

export default function CaloriesPage() {
  const { repas, totaux, caloriesParJour, enCours, erreur, ajouterRepas, ajouterRepasParAliments } =
    useRepas();
  const { profil } = useProgramme();
  const objectifs = profil?.objectifsNutrition;

  return (
    <div className="cascade flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Calories</h1>
        <p className="text-sm text-foreground-muted">Aujourd&apos;hui</p>
      </header>

      <SemaineCalories caloriesParJour={caloriesParJour} objectifCalories={objectifs?.calories} />

      <Card className="flex flex-col items-center gap-5 py-6">
        <div className="text-center">
          <p className="text-4xl font-bold">
            {arrondi(totaux.calories)}
            {objectifs && (
              <span className="text-lg font-normal text-foreground-muted">
                {" "}
                / {arrondi(objectifs.calories)}
              </span>
            )}
          </p>
          <p className="text-sm text-foreground-muted">calories aujourd&apos;hui</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-3">
          <Macro
            label="Protéines"
            grammes={totaux.proteinesG}
            objectifGrammes={objectifs?.proteinesG}
            couleur="bg-running"
          />
          <Macro
            label="Glucides"
            grammes={totaux.glucidesG}
            objectifGrammes={objectifs?.glucidesG}
            couleur="bg-power"
          />
          <Macro
            label="Lipides"
            grammes={totaux.lipidesG}
            objectifGrammes={objectifs?.lipidesG}
            couleur="bg-strength"
          />
        </div>
      </Card>

      <CapturePhoto enCours={enCours} onPhoto={ajouterRepas} />

      {erreur && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {erreur}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground-muted">Repas du jour</h3>
        {repas.length === 0 ? (
          <Card>
            <p className="text-sm text-foreground-muted">
              Aucun repas enregistré pour l&apos;instant. Prends une photo de ton assiette pour
              commencer.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {repas.map((r) => (
              <Card key={r.id} className="flex items-center gap-3">
                {r.photo ? (
                  <Image
                    src={r.photo}
                    alt={r.titre}
                    width={56}
                    height={56}
                    unoptimized
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-xl bg-surface-muted" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{r.titre}</p>
                  <p className="text-xs text-foreground-muted">
                    {arrondi(r.calories)} kcal · P {arrondi(r.proteinesG)}g · G{" "}
                    {arrondi(r.glucidesG)}g · L {arrondi(r.lipidesG)}g
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <AjoutManuel enCours={enCours} onAjouter={ajouterRepasParAliments} />
    </div>
  );
}

function Macro({
  label,
  grammes,
  objectifGrammes,
  couleur,
}: {
  label: string;
  grammes: number;
  objectifGrammes?: number;
  couleur: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-surface-muted p-3">
      <span className={`h-2 w-2 rounded-full ${couleur}`} />
      <p className="text-lg font-semibold">
        {arrondi(grammes)}g
        {objectifGrammes !== undefined && (
          <span className="text-xs font-normal text-foreground-muted">
            {" "}
            / {arrondi(objectifGrammes)}g
          </span>
        )}
      </p>
      <p className="text-xs text-foreground-muted">{label}</p>
    </div>
  );
}
