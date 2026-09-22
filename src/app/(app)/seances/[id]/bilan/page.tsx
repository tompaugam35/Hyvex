"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useProgramme } from "@/lib/use-programme";
import type { Difficulte, SeanceLog, TerrainCourse } from "@/types";

const difficulteOptions: { value: Difficulte; label: string }[] = [
  { value: "facile", label: "Trop facile" },
  { value: "parfait", label: "Parfait" },
  { value: "difficile", label: "Trop difficile" },
];

const terrainOptions: { value: TerrainCourse; label: string }[] = [
  { value: "route", label: "Route" },
  { value: "trail", label: "Trail" },
  { value: "piste", label: "Piste" },
];

export default function BilanSeancePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { programme, enregistrerRetourSeance, charge } = useProgramme();

  const seance = programme?.seances.find((s) => s.id === params.id);
  const estCourse = seance?.qualite === "course";

  const [retours, setRetours] = useState<Record<string, Difficulte>>({});
  const [rpe, setRpe] = useState(5);
  const [fatigue, setFatigue] = useState(5);
  const [notes, setNotes] = useState("");

  const [distanceKm, setDistanceKm] = useState(5);
  const [allureMin, setAllureMin] = useState(5);
  const [allureSec, setAllureSec] = useState(30);
  const [denivele, setDenivele] = useState(0);
  const [terrain, setTerrain] = useState<TerrainCourse | null>(null);
  const [ressenti, setRessenti] = useState(5);

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

  const tousLesExercicesRenseignes = seance.exercices.every((e) => retours[e.id]);
  const formulaireCourseValide = distanceKm > 0 && terrain !== null;

  function valider() {
    if (!seance) return;

    const log: SeanceLog = estCourse
      ? {
          seanceId: seance.id,
          date: new Date().toISOString(),
          complete: true,
          rpe: ressenti,
          notes: notes.trim() || undefined,
          distanceMetres: Math.round(distanceKm * 1000),
          dureeSecondes: Math.round((allureMin * 60 + allureSec) * distanceKm),
          deniveleMetres: denivele,
          terrain: terrain!,
        }
      : {
          seanceId: seance.id,
          date: new Date().toISOString(),
          complete: true,
          rpe,
          fatigue,
          retoursExercices: seance.exercices.map((e) => ({
            exerciceId: e.id,
            difficulte: retours[e.id],
          })),
          notes: notes.trim() || undefined,
        };

    enregistrerRetourSeance(log);
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href={`/seances/${seance.id}`} className="text-sm text-foreground-muted">
        ← Retour à la séance
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Comment s&apos;est passée ta séance ?</h1>
        <p className="text-sm text-foreground-muted">{seance.titre}</p>
      </header>

      {estCourse ? (
        <>
          <Card className="flex flex-col gap-4">
            <ChampNombre
              label="Distance (km)"
              value={distanceKm}
              onChange={setDistanceKm}
              decimales
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground-muted">
                Allure moyenne (par km)
              </label>
              <div className="flex items-center gap-2">
                <ChampNombre value={allureMin} onChange={setAllureMin} unite="min" />
                <span className="text-foreground-muted">:</span>
                <ChampNombre value={allureSec} onChange={setAllureSec} unite="sec" />
              </div>
            </div>
            <ChampNombre
              label="Dénivelé positif (m)"
              value={denivele}
              onChange={setDenivele}
            />
          </Card>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground-muted">Terrain</h3>
            <div className="grid grid-cols-3 gap-2">
              {terrainOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTerrain(option.value)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                    terrain === option.value
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface text-foreground-muted"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <EchelleRessenti
              label="Ressenti"
              aide="1 = très facile, 10 = très dur"
              value={ressenti}
              onChange={setRessenti}
            />
          </section>
        </>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground-muted">Exercice par exercice</h3>
            <div className="flex flex-col gap-3">
              {seance.exercices.map((exercice) => (
                <Card key={exercice.id} className="flex flex-col gap-3">
                  <p className="font-medium">{exercice.nom}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {difficulteOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setRetours((prev) => ({ ...prev, [exercice.id]: option.value }))
                        }
                        className={cn(
                          "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                          retours[exercice.id] === option.value
                            ? "border-accent bg-accent/10"
                            : "border-border bg-surface text-foreground-muted"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <EchelleRessenti
              label="Effort ressenti (RPE)"
              aide="1 = très facile, 10 = effort maximal"
              value={rpe}
              onChange={setRpe}
            />
            <EchelleRessenti
              label="Fatigue générale"
              aide="1 = en pleine forme, 10 = épuisé"
              value={fatigue}
              onChange={setFatigue}
            />
          </section>
        </>
      )}

      <section className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground-muted" htmlFor="notes">
          Notes (optionnel)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Douleur, gêne, contexte particulier..."
          rows={3}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-foreground"
        />
      </section>

      <Button
        onClick={valider}
        disabled={estCourse ? !formulaireCourseValide : !tousLesExercicesRenseignes}
        className="w-full"
      >
        {estCourse ? "Valider la séance" : "Valider et adapter la suite"}
      </Button>
    </div>
  );
}

function ChampNombre({
  label,
  value,
  onChange,
  unite,
  decimales,
}: {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  unite?: string;
  decimales?: boolean;
}) {
  const [texte, setTexte] = useState(String(value));
  const motif = decimales ? /^\d*[.,]?\d*$/ : /^\d*$/;

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-semibold text-foreground-muted">{label}</label>}
      <div className="relative">
        <input
          type="text"
          inputMode={decimales ? "decimal" : "numeric"}
          value={texte}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const saisie = e.target.value;
            if (!motif.test(saisie)) return;
            setTexte(saisie);
            const nombre = parseFloat(saisie.replace(",", "."));
            onChange(Number.isNaN(nombre) ? 0 : nombre);
          }}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-foreground"
        />
        {unite && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-foreground-muted">
            {unite}
          </span>
        )}
      </div>
    </div>
  );
}

function EchelleRessenti({
  label,
  aide,
  value,
  onChange,
}: {
  label: string;
  aide: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-sm font-semibold text-foreground-muted">{label}</p>
        <p className="text-xs text-foreground-muted">{aide}</p>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              "rounded-lg py-2 text-xs font-semibold transition-colors",
              value === n
                ? "bg-accent text-accent-foreground"
                : "bg-surface-muted text-foreground-muted"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
