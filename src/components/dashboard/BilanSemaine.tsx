"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { QualiteBadge, IntensiteBadge } from "@/components/ui/Badge";
import type { BilanHebdomadaire, ProgrammeSemaine } from "@/types";

type Etat = "ferme" | "confirmation" | "chargement" | "resultat" | "erreur";

interface Resultat {
  bilan: BilanHebdomadaire;
  programme: ProgrammeSemaine;
}

export function BilanSemaine({
  programme,
  onBilanGenere,
}: {
  programme: ProgrammeSemaine;
  onBilanGenere: () => Promise<void>;
}) {
  const [etat, setEtat] = useState<Etat>("ferme");
  const [resultat, setResultat] = useState<Resultat | null>(null);

  const seancesRealisees = programme.seances.filter((s) => s.statut !== "a_venir").length;
  const peutGenerer = seancesRealisees > 0;

  async function genererBilan() {
    setEtat("chargement");
    try {
      const reponse = await fetch("/api/adapter-programme", { method: "POST" });
      if (!reponse.ok) throw new Error("La génération a échoué");
      const donnees = (await reponse.json()) as Resultat;
      setResultat(donnees);
      await onBilanGenere();
      setEtat("resultat");
    } catch {
      setEtat("erreur");
    }
  }

  function fermer() {
    setEtat("ferme");
    setResultat(null);
  }

  return (
    <div>
      <div className="flex flex-col items-center gap-2 pb-2 pt-4 text-center">
        <Button
          variant="secondary"
          disabled={!peutGenerer}
          onClick={() => setEtat("confirmation")}
          className="w-full"
        >
          Faire le bilan de la semaine
        </Button>
        {!peutGenerer && (
          <p className="text-xs text-foreground-muted">
            Termine au moins une séance pour débloquer ton bilan.
          </p>
        )}
      </div>

      {etat !== "ferme" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="cascade flex max-h-[85dvh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-3xl bg-background p-6 sm:rounded-3xl">
            {etat === "confirmation" && (
              <>
                <div>
                  <h2 className="text-lg font-semibold">Faire le bilan de ta semaine ?</h2>
                  <p className="mt-2 text-sm text-foreground-muted">
                    Ton coach va analyser tes séances de la semaine {programme.numeroSemaine} et
                    préparer le programme de la semaine {programme.numeroSemaine + 1}.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={fermer} className="flex-1">
                    Annuler
                  </Button>
                  <Button onClick={genererBilan} className="flex-1">
                    Oui
                  </Button>
                </div>
              </>
            )}

            {etat === "chargement" && (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
                <p className="text-sm text-foreground-muted">Ton coach analyse ta semaine…</p>
              </div>
            )}

            {etat === "erreur" && (
              <>
                <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                  La génération du bilan a échoué. Réessaie dans un instant.
                </p>
                <Button onClick={fermer} className="w-full">
                  Fermer
                </Button>
              </>
            )}

            {etat === "resultat" && resultat && (
              <>
                <h2 className="text-lg font-semibold">
                  Bilan de la semaine {resultat.programme.numeroSemaine - 1}
                </h2>

                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold text-foreground-muted">
                    Ce que ton coach a constaté
                  </h3>
                  <div className="flex flex-col gap-2">
                    {resultat.bilan.constats.map((constat, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground-muted" />
                        <p>{constat}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold text-foreground-muted">
                    Ce qui change semaine {resultat.programme.numeroSemaine}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {resultat.bilan.ajustements.map((ajustement, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <p>{ajustement}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-semibold text-foreground-muted">
                    Programme de la semaine {resultat.programme.numeroSemaine}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {resultat.programme.seances.map((seance) => (
                      <div
                        key={seance.id}
                        className="flex items-center justify-between gap-2 rounded-xl bg-surface-muted p-3"
                      >
                        <div className="flex flex-col gap-1.5">
                          <p className="text-sm font-medium">{seance.titre}</p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <QualiteBadge qualite={seance.qualite} />
                            {seance.intensite && <IntensiteBadge intensite={seance.intensite} />}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-foreground-muted">
                          {seance.dureeEstimeeMinutes} min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={fermer} className="w-full">
                  Prêt à commencer ta nouvelle semaine
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
