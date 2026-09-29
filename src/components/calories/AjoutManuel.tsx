"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChampNombre } from "@/components/ui/ChampNombre";

interface AlimentSaisi {
  nom: string;
  poidsGrammes: number | undefined;
}

interface DonneesRepasAliments {
  titre: string;
  aliments: { nom: string; poidsGrammes: number }[];
}

function alimentVide(): AlimentSaisi {
  return { nom: "", poidsGrammes: undefined };
}

export function AjoutManuel({
  enCours,
  onAjouter,
}: {
  enCours: boolean;
  onAjouter: (donnees: DonneesRepasAliments) => Promise<void>;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [titre, setTitre] = useState("");
  const [aliments, setAliments] = useState<AlimentSaisi[]>([alimentVide()]);

  const alimentsValides = aliments.filter(
    (a): a is { nom: string; poidsGrammes: number } =>
      a.nom.trim().length > 0 && a.poidsGrammes !== undefined && a.poidsGrammes > 0
  );
  const valide = titre.trim().length > 0 && alimentsValides.length > 0;

  function reinitialiser() {
    setTitre("");
    setAliments([alimentVide()]);
  }

  function renommerAliment(index: number, nom: string) {
    setAliments((prev) => prev.map((a, i) => (i === index ? { ...a, nom } : a)));
  }

  function pesserAliment(index: number, poidsGrammes: number | undefined) {
    setAliments((prev) => prev.map((a, i) => (i === index ? { ...a, poidsGrammes } : a)));
  }

  function ajouterLigne() {
    setAliments((prev) => [...prev, alimentVide()]);
  }

  function retirerLigne(index: number) {
    setAliments((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  async function valider() {
    if (!valide) return;
    await onAjouter({
      titre: titre.trim(),
      aliments: alimentsValides.map((a) => ({ nom: a.nom.trim(), poidsGrammes: a.poidsGrammes })),
    });
    setOuvert(false);
    reinitialiser();
  }

  return (
    <div className="cascade-skip">
      <button
        data-pro
        onClick={() => setOuvert(true)}
        aria-label="Ajouter un repas manuellement"
        className="bouton-flottant fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl font-semibold leading-none text-accent-foreground shadow-lg transition-opacity hover:opacity-90 md:bottom-8"
      >
        +
      </button>

      {ouvert && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
          <div className="cascade flex max-h-[85dvh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-3xl bg-background p-6 sm:rounded-3xl">
            <h2 className="text-lg font-semibold">Ajouter un repas</h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground-muted">Nom du plat</label>
              <input
                autoFocus
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="ex : Poulet riz brocolis"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-foreground-muted">Aliments</label>
              {aliments.map((aliment, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={aliment.nom}
                    onChange={(e) => renommerAliment(i, e.target.value)}
                    placeholder="ex : Riz cuit"
                    className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
                  />
                  <div className="w-24 shrink-0">
                    <ChampNombre
                      value={aliment.poidsGrammes}
                      onChange={(v) => pesserAliment(i, v)}
                      unite="g"
                      placeholder="150"
                    />
                  </div>
                  <button
                    onClick={() => retirerLigne(i)}
                    disabled={aliments.length === 1}
                    aria-label="Retirer cet aliment"
                    className="shrink-0 rounded-full p-2.5 text-foreground-muted hover:bg-surface-muted disabled:opacity-30"
                  >
                    ×
                  </button>
                </div>
              ))}
              <Button variant="secondary" onClick={ajouterLigne} className="w-full">
                Ajouter un aliment
              </Button>
            </div>

            <p className="text-xs text-foreground-muted">
              Le coach calcule les calories et macronutriments à partir des aliments et de leur
              poids.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setOuvert(false);
                  reinitialiser();
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button onClick={valider} disabled={!valide || enCours} className="flex-1">
                {enCours ? "Calcul…" : "Calculer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
