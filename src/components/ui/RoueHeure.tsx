"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const HEURES = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

// Lignes plus hautes = moins sensible (plus de défilement nécessaire pour
// changer de valeur) et roue plus longue, comme demandé.
const HAUTEUR_ITEM = 56;
const HAUTEUR_CONTENEUR = HAUTEUR_ITEM * 5;
const HAUTEUR_ESPACEUR = (HAUTEUR_CONTENEUR - HAUTEUR_ITEM) / 2;

function Colonne({
  valeurs,
  valeur,
  onChange,
}: {
  valeurs: number[];
  valeur: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const minuteurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Positionne la roue sur la valeur actuelle une seule fois au montage — les
  // défilements suivants viennent uniquement du geste de l'utilisateur.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = valeur * HAUTEUR_ITEM;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function surScroll() {
    if (minuteurRef.current) clearTimeout(minuteurRef.current);
    // Attend la fin du défilement (molette/inertie tactile) avant de lire la
    // valeur centrée, plutôt que de réagir à chaque micro-mouvement.
    minuteurRef.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const index = Math.round(el.scrollTop / HAUTEUR_ITEM);
      const bornee = Math.min(valeurs.length - 1, Math.max(0, index));
      if (valeurs[bornee] !== valeur) onChange(valeurs[bornee]);
    }, 120);
  }

  return (
    <div
      ref={ref}
      onScroll={surScroll}
      style={{ height: HAUTEUR_CONTENEUR, WebkitOverflowScrolling: "touch" }}
      className="w-14 snap-y snap-proximity overflow-y-scroll overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div style={{ height: HAUTEUR_ESPACEUR }} />
      {valeurs.map((v) => (
        <div
          key={v}
          style={{ height: HAUTEUR_ITEM }}
          className={cn(
            "flex snap-center items-center justify-center text-2xl font-semibold tabular-nums transition-colors",
            v === valeur ? "text-foreground" : "text-foreground-muted/40"
          )}
        >
          {String(v).padStart(2, "0")}
        </div>
      ))}
      <div style={{ height: HAUTEUR_ESPACEUR }} />
    </div>
  );
}

export function RoueHeure({
  valeur,
  onChange,
}: {
  valeur: string | undefined; // "HH:MM"
  onChange: (heure: string) => void;
}) {
  const [hInitial, mInitial] = (valeur ?? "08:00").split(":").map((n) => parseInt(n, 10));
  const heures = Number.isFinite(hInitial) ? hInitial : 8;
  const minutes = Number.isFinite(mInitial) ? mInitial : 0;

  function formater(h: number, m: number) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return (
    <div className="relative inline-flex select-none items-center gap-1 rounded-2xl border border-border bg-surface px-3 py-2">
      <div
        className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 rounded-xl bg-surface-muted"
        style={{ height: HAUTEUR_ITEM }}
      />
      <div className="relative z-10 flex items-center gap-1">
        <Colonne
          valeurs={HEURES}
          valeur={heures}
          onChange={(h) => onChange(formater(h, minutes))}
        />
        <span className="text-xl font-semibold text-foreground-muted">:</span>
        <Colonne
          valeurs={MINUTES}
          valeur={minutes}
          onChange={(m) => onChange(formater(heures, m))}
        />
      </div>
    </div>
  );
}
