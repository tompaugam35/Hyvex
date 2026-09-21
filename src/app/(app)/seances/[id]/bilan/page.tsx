"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useProgramme } from "@/lib/use-programme";
import type { Difficulte, SeanceLog } from "@/types";

const difficulteOptions: { value: Difficulte; label: string }[] = [
  { value: "facile", label: "Trop facile" },
  { value: "parfait", label: "Parfait" },
  { value: "difficile", label: "Trop difficile" },
];

export default function BilanSeancePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { programme, enregistrerRetourSeance, charge } = useProgramme();

  const seance = programme.seances.find((s) => s.id === params.id);

  const [retours, setRetours] = useState<Record<string, Difficulte>>({});
  const [rpe, setRpe] = useState(5);
  const [fatigue, setFatigue] = useState(5);
  const [notes, setNotes] = useState("");

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

  function valider() {
    if (!seance) return;
    const log: SeanceLog = {
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

      <Button onClick={valider} disabled={!tousLesExercicesRenseignes} className="w-full">
        Valider et adapter la suite
      </Button>
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
