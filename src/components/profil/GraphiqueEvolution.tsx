"use client";

import { useEffect, useState } from "react";
import type { PointEvolution } from "@/types";

const LARGEUR = 300;
const HAUTEUR_COURBE = 100;
const MARGE_X = 10;
const HAUT_COURBE = 14;

function x(index: number, nb: number) {
  return MARGE_X + (index * (LARGEUR - MARGE_X * 2)) / (nb - 1);
}

// "YYYY-MM-DD" -> Date locale à minuit (évite le décalage d'un jour que
// `new Date("YYYY-MM-DD")`, interprété en UTC, peut provoquer à l'affichage).
export function dateLocale(cle: string) {
  const [annee, mois, jour] = cle.split("-").map(Number);
  return new Date(annee, mois - 1, jour);
}

// Catmull-Rom -> Bézier cubique (tension 1/6) : donne la courbe lisse en
// "vagues" arrondies de la maquette, sans dépendre de tous les jours (les
// jours sans donnée sont simplement absents de `pts`).
function cheminLisse(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function echelle(valeurs: number[], min: number, max: number) {
  const bas = HAUT_COURBE;
  const haut = HAUT_COURBE + HAUTEUR_COURBE;
  const etendue = max - min || 1;
  return (v: number) => haut - ((v - min) / etendue) * (haut - bas);
}

export function GraphiqueEvolution({
  points,
  onSelectionner,
}: {
  points: PointEvolution[];
  onSelectionner: (point: PointEvolution) => void;
}) {
  const indexAvecDonnee = points
    .map((p, i) => (p.poidsKg !== undefined || p.fatigue !== undefined ? i : -1))
    .filter((i) => i >= 0);

  const dernierIndexAvecDonnee = indexAvecDonnee[indexAvecDonnee.length - 1] ?? null;
  const [selectionne, setSelectionne] = useState<number | null>(dernierIndexAvecDonnee);

  useEffect(() => {
    // Ramène le repère sur le jour le plus récent quand de nouvelles données
    // arrivent (ex. poids du jour tout juste enregistré) : resynchronisation
    // avec une prop externe, pas de rendu en cascade évitable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectionne(dernierIndexAvecDonnee);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  if (indexAvecDonnee.length === 0) {
    return (
      <div className="flex h-[170px] flex-col items-center justify-center rounded-2xl bg-[#0b0c0e] px-4 text-center">
        <p className="text-sm text-[#9a9ca3]">
          Pas encore de poids ou de fatigue enregistrés ce mois-ci.
        </p>
      </div>
    );
  }

  const poidsValeurs = points.filter((p) => p.poidsKg !== undefined).map((p) => p.poidsKg!);
  const echellePoids =
    poidsValeurs.length > 0
      ? echelle(poidsValeurs, Math.min(...poidsValeurs) - 1, Math.max(...poidsValeurs) + 1)
      : null;
  const echelleFatigue = echelle([], 1, 10);

  const ptsPoids = points
    .map((p, i) => (p.poidsKg !== undefined && echellePoids ? { x: x(i, points.length), y: echellePoids(p.poidsKg) } : null))
    .filter((p): p is { x: number; y: number } => p !== null);

  const ptsFatigue = points
    .map((p, i) => (p.fatigue !== undefined ? { x: x(i, points.length), y: echelleFatigue(p.fatigue) } : null))
    .filter((p): p is { x: number; y: number } => p !== null);

  const baseline = HAUT_COURBE + HAUTEUR_COURBE;
  const chemin = cheminLisse(ptsPoids);
  const cheminAire =
    ptsPoids.length > 0
      ? `${chemin} L ${ptsPoids[ptsPoids.length - 1].x} ${baseline} L ${ptsPoids[0].x} ${baseline} Z`
      : "";
  const cheminFatigue = cheminLisse(ptsFatigue);

  function choisir(index: number) {
    setSelectionne(index);
    onSelectionner(points[index]);
  }

  // Jusqu'à 5 repères de jours, répartis sur toute la largeur.
  const nbReperes = Math.min(5, points.length);
  const reperes = Array.from({ length: nbReperes }, (_, i) =>
    Math.round((i * (points.length - 1)) / (nbReperes - 1 || 1))
  );

  return (
    <div className="rounded-2xl bg-[#0b0c0e] p-4">
      <svg viewBox={`0 0 ${LARGEUR} ${HAUT_COURBE + HAUTEUR_COURBE + 24}`} className="w-full">
        <defs>
          <linearGradient id="degradePoids" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5c5c" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ff5c5c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {indexAvecDonnee.map((i) => (
          <line
            key={i}
            x1={x(i, points.length)}
            x2={x(i, points.length)}
            y1={HAUT_COURBE - 4}
            y2={baseline}
            stroke={i === selectionne ? "#f4f5f3" : "#f4f5f3"}
            strokeOpacity={i === selectionne ? 0.5 : 0.12}
            strokeWidth={1}
            strokeDasharray="2 3"
          />
        ))}

        {cheminAire && <path d={cheminAire} fill="url(#degradePoids)" />}
        {chemin && <path d={chemin} fill="none" stroke="#ff5c5c" strokeWidth={2} />}
        {cheminFatigue && <path d={cheminFatigue} fill="none" stroke="#4da3ff" strokeWidth={1.5} strokeOpacity={0.8} />}

        {ptsFatigue.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2} fill="#4da3ff" />
        ))}

        {selectionne !== null && echellePoids && points[selectionne].poidsKg !== undefined && (
          <circle cx={x(selectionne, points.length)} cy={echellePoids(points[selectionne].poidsKg!)} r={5} fill="#0b0c0e" stroke="#f4f5f3" strokeWidth={2} />
        )}
        {selectionne !== null && !(echellePoids && points[selectionne].poidsKg !== undefined) && points[selectionne].fatigue !== undefined && (
          <circle cx={x(selectionne, points.length)} cy={echelleFatigue(points[selectionne].fatigue!)} r={5} fill="#0b0c0e" stroke="#4da3ff" strokeWidth={2} />
        )}

        {indexAvecDonnee.map((i) => (
          <rect
            key={`hit-${i}`}
            x={x(i, points.length) - 10}
            y={0}
            width={20}
            height={HAUT_COURBE + HAUTEUR_COURBE}
            fill="transparent"
            onClick={() => choisir(i)}
            style={{ cursor: "pointer" }}
          />
        ))}

        {reperes.map((i) => (
          <text
            key={i}
            x={x(i, points.length)}
            y={HAUT_COURBE + HAUTEUR_COURBE + 18}
            textAnchor="middle"
            fontSize={9}
            fill="#9a9ca3"
          >
            {dateLocale(points[i].date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </text>
        ))}
      </svg>
    </div>
  );
}
