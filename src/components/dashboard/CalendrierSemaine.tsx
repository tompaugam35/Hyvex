"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QualiteBadge } from "@/components/ui/Badge";
import { ValiderAutreSportModal } from "@/components/dashboard/ValiderAutreSportModal";
import { qualiteInfo } from "@/lib/qualites";
import { joursDeLaSemaineEnCours, estAujourdHui } from "@/lib/semaine";
import { cn } from "@/lib/utils";
import type { AutreSportPlace, Seance } from "@/types";

type TypeGlisse = "seance" | "sport";

interface ApercuGlisse {
  type: TypeGlisse;
  id: string;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
}

interface SuiviGlisse {
  type: TypeGlisse;
  id: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  width: number;
  enCours: boolean;
}

// Distance (px) avant qu'un appui soit considéré comme un glissement plutôt qu'un tap
// (laisse les taps normaux — ouvrir une séance, toucher le ×) fonctionner sans interférence.
const SEUIL_GLISSE = 6;

export function CalendrierSemaine({
  seances,
  autresSportsPlaces,
  onPlacer,
  onPlacerAutreSport,
  onValiderAutreSport,
}: {
  seances: Seance[];
  autresSportsPlaces: AutreSportPlace[];
  onPlacer: (seanceId: string, jour: string | null) => void;
  onPlacerAutreSport: (id: string, jour: string | null) => void;
  onValiderAutreSport: (id: string, fatigue: number) => Promise<void>;
}) {
  const [sportAValider, setSportAValider] = useState<AutreSportPlace | null>(null);
  const aujourdHuiMinuit = new Date();
  aujourdHuiMinuit.setHours(0, 0, 0, 0);
  // Les jours passés ne sont plus affichés ici : ils sont déjà dans l'historique.
  // Une séance passée non validée reste accessible via SeancesEnAttente, en bas de page.
  const jours = joursDeLaSemaineEnCours().filter((j) => j.date >= aujourdHuiMinuit);
  const seancesNonPlacees = seances.filter((s) => s.jour === null);
  const sportsNonPlaces = autresSportsPlaces.filter((s) => s.jour === null);
  const rienAPlacer = seancesNonPlacees.length === 0 && sportsNonPlaces.length === 0;

  const [apercu, setApercu] = useState<ApercuGlisse | null>(null);
  const [jourSurvole, setJourSurvole] = useState<string | null>(null);
  const [bandeauSurvole, setBandeauSurvole] = useState(false);
  const suiviRef = useRef<SuiviGlisse | null>(null);

  function surDeplacement(e: PointerEvent) {
    const suivi = suiviRef.current;
    if (!suivi) return;

    if (!suivi.enCours) {
      const dx = e.clientX - suivi.startX;
      const dy = e.clientY - suivi.startY;
      if (Math.hypot(dx, dy) < SEUIL_GLISSE) return;
      suivi.enCours = true;
    }

    e.preventDefault();
    setApercu({
      type: suivi.type,
      id: suivi.id,
      x: e.clientX,
      y: e.clientY,
      offsetX: suivi.offsetX,
      offsetY: suivi.offsetY,
      width: suivi.width,
    });

    const cible = document.elementFromPoint(e.clientX, e.clientY);
    const jourEl = cible?.closest<HTMLElement>("[data-jour]");
    setJourSurvole(jourEl?.dataset.jour ?? null);
    setBandeauSurvole(!jourEl && !!cible?.closest("[data-bandeau]"));
  }

  function surRelachement(e: PointerEvent) {
    window.removeEventListener("pointermove", surDeplacement);
    window.removeEventListener("pointerup", surRelachement);

    const suivi = suiviRef.current;
    suiviRef.current = null;

    if (suivi?.enCours) {
      const cible = document.elementFromPoint(e.clientX, e.clientY);
      const jourEl = cible?.closest<HTMLElement>("[data-jour]");
      const jour = jourEl?.dataset.jour;
      if (jour) {
        if (suivi.type === "seance") onPlacer(suivi.id, jour);
        else onPlacerAutreSport(suivi.id, jour);
      } else if (cible?.closest("[data-bandeau]")) {
        if (suivi.type === "seance") onPlacer(suivi.id, null);
        else onPlacerAutreSport(suivi.id, null);
      }
    } else if (suivi && suivi.type === "sport") {
      // Tap simple (pas de glissement) sur un autre sport déjà placé : ouvre la
      // validation. Un sport encore dans le bandeau (non placé) n'a rien à valider.
      const sport = autresSportsPlaces.find((s) => s.id === suivi.id);
      if (sport && sport.jour !== null) setSportAValider(sport);
    }

    setApercu(null);
    setJourSurvole(null);
    setBandeauSurvole(false);
  }

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", surDeplacement);
      window.removeEventListener("pointerup", surRelachement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function demarrerGlisse(e: React.PointerEvent, type: TypeGlisse, id: string) {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    suiviRef.current = {
      type,
      id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      enCours: false,
    };
    window.addEventListener("pointermove", surDeplacement);
    window.addEventListener("pointerup", surRelachement);
  }

  const itemApercu = apercu
    ? apercu.type === "seance"
      ? seances.find((s) => s.id === apercu.id)
      : autresSportsPlaces.find((s) => s.id === apercu.id)
    : null;

  return (
    <div className="flex select-none flex-col gap-3">
      <div
        data-bandeau="true"
        className={cn(
          "flex flex-col gap-1 rounded-2xl p-1 transition-colors",
          bandeauSurvole && "border-2 border-dashed border-accent bg-accent/10"
        )}
      >
        <p className="text-[11px] text-foreground-muted">
          {rienAPlacer ? "Glisse ici pour retirer une séance" : "Glisse pour placer, ou ici pour retirer"}
        </p>
        {!rienAPlacer && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {seancesNonPlacees.map((seance) => (
              <div
                key={seance.id}
                onPointerDown={(e) => demarrerGlisse(e, "seance", seance.id)}
                className={cn(
                  "flex shrink-0 touch-none select-none flex-col gap-1 rounded-xl border border-border bg-surface px-3 py-2 text-left transition-opacity",
                  apercu?.type === "seance" && apercu.id === seance.id && "opacity-30"
                )}
              >
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: `var(${qualiteInfo[seance.qualite].colorVar})` }}
                  />
                  {seance.titre}
                </span>
                <span className="text-xs text-foreground-muted">
                  {seance.dureeEstimeeMinutes} min
                </span>
              </div>
            ))}
            {sportsNonPlaces.map((sport) => (
              <div
                key={sport.id}
                onPointerDown={(e) => demarrerGlisse(e, "sport", sport.id)}
                className={cn(
                  "flex shrink-0 touch-none select-none items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-left text-xs font-medium transition-opacity",
                  apercu?.type === "sport" && apercu.id === sport.id && "opacity-30"
                )}
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-foreground-muted" />
                {sport.nom}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {jours.map(({ nom, date }) => {
          const seancesJour = seances.filter((s) => s.jour === nom);
          const sportsJour = autresSportsPlaces.filter((s) => s.jour === nom);
          const vide = seancesJour.length === 0 && sportsJour.length === 0;
          const jourTermine =
            !vide &&
            seancesJour.every((s) => s.statut === "terminee") &&
            sportsJour.every((s) => s.valide);
          const aujourdhui = estAujourdHui(date);
          return (
            <div
              key={nom}
              data-jour={nom}
              className={cn(
                "flex flex-col gap-1 rounded-2xl border p-1.5 transition-colors",
                jourSurvole === nom
                  ? "border-dashed border-accent bg-accent/10"
                  : "border-border bg-surface"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">{nom}</span>
                <span className="text-sm text-foreground-muted">
                  {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
                {aujourdhui && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                    Aujourd&apos;hui
                  </span>
                )}
                {jourTermine && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-[#4a5c00]">
                    Terminée
                  </span>
                )}
                {vide && (
                  <span className="ml-auto text-sm text-foreground-muted">Aucune séance</span>
                )}
              </div>

              {!vide && (
                <div className="flex flex-col gap-1">
                  {seancesJour.map((seance) => (
                    <div
                      key={seance.id}
                      onPointerDown={(e) => demarrerGlisse(e, "seance", seance.id)}
                      className={cn(
                        "flex touch-none select-none items-center justify-between gap-2 rounded-xl transition-opacity",
                        aujourdhui ? "bg-accent/20 p-2.5" : "bg-surface-muted p-1.5",
                        apercu?.type === "seance" && apercu.id === seance.id && "opacity-30"
                      )}
                    >
                      <Link
                        href={`/seances/${seance.id}`}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className="flex min-w-0 flex-1 flex-col gap-1"
                      >
                        <p
                          className={cn(
                            "truncate font-semibold",
                            aujourdhui ? "text-lg text-[#3c4a00]" : "text-base font-medium"
                          )}
                        >
                          {seance.titre}
                        </p>
                        <div className="flex flex-wrap items-center gap-1">
                          <QualiteBadge qualite={seance.qualite} />
                          <span
                            className={cn(
                              aujourdhui ? "text-sm text-[#3c4a00]/70" : "text-sm text-foreground-muted"
                            )}
                          >
                            {seance.heure && `${seance.heure} · `}
                            {seance.dureeEstimeeMinutes} min
                          </span>
                        </div>
                      </Link>
                      {seance.statut === "a_venir" && (
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => onPlacer(seance.id, null)}
                          aria-label="Retirer du calendrier"
                          className="shrink-0 rounded-full p-1.5 text-foreground-muted hover:bg-border"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {sportsJour.map((sport) => (
                    <div
                      key={sport.id}
                      onPointerDown={(e) => demarrerGlisse(e, "sport", sport.id)}
                      className={cn(
                        "flex touch-none select-none items-center justify-between gap-2 rounded-xl border p-1.5 transition-opacity",
                        sport.valide
                          ? "border-border bg-surface-muted"
                          : "border-dashed border-border",
                        apercu?.type === "sport" && apercu.id === sport.id && "opacity-30"
                      )}
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-base font-medium text-foreground-muted">
                          {sport.nom}
                        </span>
                        {sport.valide && (
                          <span className="text-xs text-foreground-muted">
                            Fatigue {sport.fatigue}/10 · validée
                          </span>
                        )}
                      </div>
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onPlacerAutreSport(sport.id, null)}
                        aria-label="Retirer du calendrier"
                        className="shrink-0 rounded-full p-1.5 text-foreground-muted hover:bg-border"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {apercu && itemApercu && (
        <div
          style={{
            position: "fixed",
            left: apercu.x - apercu.offsetX,
            top: apercu.y - apercu.offsetY,
            width: apercu.width,
          }}
          className="pointer-events-none z-50 rounded-xl border border-accent bg-surface px-3 py-2 text-sm font-medium shadow-lg"
        >
          {apercu.type === "seance"
            ? (itemApercu as Seance).titre
            : (itemApercu as AutreSportPlace).nom}
        </div>
      )}

      {sportAValider && (
        <ValiderAutreSportModal
          nom={sportAValider.nom}
          fatigueActuelle={sportAValider.fatigue}
          onValider={(fatigue) => onValiderAutreSport(sportAValider.id, fatigue)}
          onFermer={() => setSportAValider(null)}
        />
      )}
    </div>
  );
}
