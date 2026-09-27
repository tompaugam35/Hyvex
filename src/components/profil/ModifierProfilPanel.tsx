"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectCard } from "@/components/ui/SelectCard";
import { Stepper } from "@/components/ui/Stepper";
import { ChampNombre } from "@/components/ui/ChampNombre";
import {
  niveaux,
  qualiteOptions,
  qualiteLabelLong,
  objectifPlaceholder,
  materielOptions,
} from "@/lib/quiz-options";
import type { ProfilInput } from "@/lib/ia/schema";
import type { AutreSport, PerformanceCourse, PerformanceMuscu, ProfilUtilisateur, Qualite } from "@/types";

export function ModifierProfilPanel({
  profil,
  onFermer,
  onEnregistrer,
}: {
  profil: ProfilUtilisateur;
  onFermer: () => void;
  onEnregistrer: (input: ProfilInput) => Promise<void>;
}) {
  const [prenom, setPrenom] = useState(profil.prenom);
  const [niveau, setNiveau] = useState(profil.niveau);
  const [tailleCm, setTailleCm] = useState<number | undefined>(profil.tailleCm);
  const [poidsKg, setPoidsKg] = useState<number | undefined>(profil.poidsKg);
  const [poidsObjectifKg, setPoidsObjectifKg] = useState<number | undefined>(
    profil.poidsObjectifKg
  );
  const [qualites, setQualites] = useState<Qualite[]>(profil.qualitesPrioritaires);
  const [performanceCourse, setPerformanceCourse] = useState<PerformanceCourse>(
    profil.performanceCourse
  );
  const [performanceMuscu, setPerformanceMuscu] = useState<PerformanceMuscu>(
    profil.performanceMuscu
  );
  const [objectifsTexte, setObjectifsTexte] = useState(profil.objectifsTexte);
  const [autresSports, setAutresSports] = useState<AutreSport[]>(profil.autresSports);
  const [nouveauSportNom, setNouveauSportNom] = useState("");
  const [nouveauSportFreq, setNouveauSportFreq] = useState(1);
  const [seances, setSeances] = useState(profil.seancesParSemaine);
  const [duree, setDuree] = useState(profil.dureeSeanceMinutes);
  // Ne garde que les options encore valides : une ancienne valeur (liste de matériel
  // modifiée depuis) n'a plus de case à cocher, donc resterait bloquée sans ce filtre.
  const [materiel, setMateriel] = useState<string[]>(
    profil.materiel.filter((m) => materielOptions.includes(m))
  );
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const sommeAutresSports = autresSports.reduce((t, s) => t + s.frequenceParSemaine, 0);
  const plancherSeances = sommeAutresSports + 1;
  const seancesEffectif = Math.max(seances, plancherSeances);
  const seancesHybrid = seancesEffectif - sommeAutresSports;

  function toggleQualite(q: Qualite) {
    setQualites((prev) => {
      if (prev.length === 3) return [q];
      if (prev.includes(q)) return prev.filter((x) => x !== q);
      if (prev.length >= 2) return prev;
      return [...prev, q];
    });
  }

  function toggleMateriel(option: string) {
    setMateriel((prev) =>
      prev.includes(option) ? prev.filter((m) => m !== option) : [...prev, option]
    );
  }

  function ajouterSport() {
    const nom = nouveauSportNom.trim();
    if (!nom) return;
    setAutresSports((prev) => [...prev, { nom, frequenceParSemaine: nouveauSportFreq }]);
    setNouveauSportNom("");
    setNouveauSportFreq(1);
  }

  const valide = prenom.trim().length > 0 && materiel.length > 0 && qualites.length > 0;

  async function enregistrer() {
    if (!valide) return;
    setEnregistrement(true);
    setErreur(null);
    try {
      await onEnregistrer({
        prenom: prenom.trim(),
        niveau,
        tailleCm,
        poidsKg,
        poidsObjectifKg,
        qualitesPrioritaires: qualites,
        performanceCourse,
        performanceMuscu,
        objectifsTexte,
        autresSports,
        seancesParSemaine: seancesEffectif,
        dureeSeanceMinutes: duree,
        materiel,
      });
    } catch (e) {
      const detail = e instanceof Error ? e.message : "erreur inconnue";
      setErreur(`L'enregistrement a échoué : ${detail}`);
    }
    setEnregistrement(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold">Modifier mon profil</h2>
        <button onClick={onFermer} className="text-sm text-foreground-muted">
          Fermer
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="cascade flex flex-col gap-8">
          <Question title="Prénom">
            <input
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
            />
          </Question>

          <Question title="Niveau actuel">
            <div className="flex flex-col gap-3">
              {niveaux.map((n) => (
                <SelectCard key={n.value} selected={niveau === n.value} onClick={() => setNiveau(n.value)}>
                  <p className="font-medium">{n.label}</p>
                  <p className="text-sm text-foreground-muted">{n.desc}</p>
                </SelectCard>
              ))}
            </div>
          </Question>

          <Question title="Taille et poids">
            <div className="flex flex-col gap-4">
              <ChampNombre
                label="Taille"
                value={tailleCm}
                onChange={setTailleCm}
                unite="cm"
                placeholder="Optionnel — ex : 178"
              />
              <ChampNombre
                label="Poids"
                value={poidsKg}
                onChange={setPoidsKg}
                unite="kg"
                placeholder="Optionnel — ex : 72"
                decimales
              />
            </div>
          </Question>

          <Question title="Sur quoi progresser">
            <div className="flex flex-col gap-3">
              {qualiteOptions.map((q) => (
                <SelectCard
                  key={q.value}
                  selected={qualites.includes(q.value)}
                  disabled={qualites.length === 2 && !qualites.includes(q.value)}
                  onClick={() => toggleQualite(q.value)}
                >
                  <p className="font-medium">{q.label}</p>
                </SelectCard>
              ))}
              <SelectCard
                selected={qualites.length === 3}
                disabled={qualites.length > 0 && qualites.length < 3}
                onClick={() => setQualites(["course", "muscu", "explosivite"])}
              >
                <p className="font-medium">Les trois</p>
              </SelectCard>
            </div>
          </Question>

          {(qualites.includes("course") || qualites.includes("muscu")) && (
            <Question title="Niveau actuel">
              <div className="flex flex-col gap-6">
                {qualites.includes("course") && (
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-semibold text-foreground-muted">Course à pied</h4>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-foreground-muted">Temps sur 5 km</label>
                      <input
                        value={performanceCourse.temps5km ?? ""}
                        onChange={(e) =>
                          setPerformanceCourse((prev) => ({ ...prev, temps5km: e.target.value }))
                        }
                        placeholder="Optionnel — ex : 22:30"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-foreground-muted">Temps sur 10 km</label>
                      <input
                        value={performanceCourse.temps10km ?? ""}
                        onChange={(e) =>
                          setPerformanceCourse((prev) => ({ ...prev, temps10km: e.target.value }))
                        }
                        placeholder="Optionnel — ex : 47:00"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-foreground-muted">
                        Temps sur semi (21 km)
                      </label>
                      <input
                        value={performanceCourse.temps21km ?? ""}
                        onChange={(e) =>
                          setPerformanceCourse((prev) => ({ ...prev, temps21km: e.target.value }))
                        }
                        placeholder="Optionnel — ex : 1h45"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
                      />
                    </div>
                  </div>
                )}

                {qualites.includes("muscu") && (
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-semibold text-foreground-muted">Musculation</h4>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-foreground-muted">Développé couché</label>
                      <input
                        value={performanceMuscu.developpeCouche ?? ""}
                        onChange={(e) =>
                          setPerformanceMuscu((prev) => ({
                            ...prev,
                            developpeCouche: e.target.value,
                          }))
                        }
                        placeholder="Optionnel — ex : 80kg"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-foreground-muted">Soulevé de terre</label>
                      <input
                        value={performanceMuscu.souleveDeTerre ?? ""}
                        onChange={(e) =>
                          setPerformanceMuscu((prev) => ({
                            ...prev,
                            souleveDeTerre: e.target.value,
                          }))
                        }
                        placeholder="Optionnel — ex : 120kg"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-foreground-muted">Squat</label>
                      <input
                        value={performanceMuscu.squat ?? ""}
                        onChange={(e) =>
                          setPerformanceMuscu((prev) => ({ ...prev, squat: e.target.value }))
                        }
                        placeholder="Optionnel — ex : 100kg"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
                      />
                    </div>
                  </div>
                )}
              </div>
            </Question>
          )}

          {qualites.length > 0 && (
            <Question title="Objectifs précis">
              <div className="flex flex-col gap-4">
                {qualites.map((q) => (
                  <div key={q} className="flex flex-col gap-2">
                    <label className="text-sm text-foreground-muted">{qualiteLabelLong[q]}</label>
                    <input
                      value={objectifsTexte[q] ?? ""}
                      onChange={(e) =>
                        setObjectifsTexte((prev) => ({ ...prev, [q]: e.target.value }))
                      }
                      placeholder={objectifPlaceholder[q]}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
                    />
                  </div>
                ))}
              </div>
            </Question>
          )}

          <Question title="Autres sports pratiqués">
            <div className="flex flex-col gap-3">
              {autresSports.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <span className="font-medium">{s.nom}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground-muted">
                      {s.frequenceParSemaine}x/semaine
                    </span>
                    <button
                      onClick={() => setAutresSports((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-sm text-danger"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4">
                <input
                  value={nouveauSportNom}
                  onChange={(e) => setNouveauSportNom(e.target.value)}
                  placeholder="Ex : Escalade"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
                />
                <Stepper
                  label="Fois par semaine"
                  value={nouveauSportFreq}
                  min={1}
                  max={7}
                  onChange={setNouveauSportFreq}
                />
                <Button
                  variant="secondary"
                  disabled={nouveauSportNom.trim().length === 0}
                  onClick={ajouterSport}
                >
                  Ajouter ce sport
                </Button>
              </div>
            </div>
          </Question>

          <Question title="Disponibilités">
            <div className="flex flex-col gap-6">
              <Stepper
                label={
                  autresSports.length > 0
                    ? `Séances par semaine (au total, y compris ${autresSports.map((s) => s.nom).join(", ")})`
                    : "Séances par semaine"
                }
                value={seancesEffectif}
                min={plancherSeances}
                max={14}
                onChange={(v) => setSeances(Math.max(v, plancherSeances))}
              />
              <Stepper
                label="Durée par séance (min)"
                value={duree}
                min={30}
                max={90}
                step={15}
                onChange={setDuree}
              />
              {autresSports.length > 0 && (
                <p className="text-xs text-foreground-muted">
                  Sur ces {seancesEffectif} séances,{" "}
                  {seancesHybrid > 1
                    ? `${seancesHybrid} seront générées`
                    : `${seancesHybrid} sera générée`}{" "}
                  par ton coach.
                </p>
              )}
            </div>
          </Question>

          <Question title="Matériel disponible">
            <div className="flex flex-wrap gap-2">
              {materielOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleMateriel(option)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    materiel.includes(option)
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-surface text-foreground-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </Question>

          <Question title="Objectif de poids">
            <ChampNombre
              label="Poids souhaité"
              value={poidsObjectifKg}
              onChange={setPoidsObjectifKg}
              unite="kg"
              placeholder="Optionnel — ex : 70"
              decimales
            />
            <p className="mt-2 text-xs text-foreground-muted">
              Utilisé pour recalculer tes objectifs quotidiens de calories et de macronutriments
              sur la page Calories.
            </p>
          </Question>

          <p className="text-xs text-foreground-muted">
            Ces changements s&apos;appliqueront à partir de la prochaine semaine générée par ton
            coach.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border px-5 py-4">
        {erreur && (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {erreur}
          </p>
        )}
        <Button onClick={enregistrer} disabled={!valide || enregistrement} className="w-full">
          {enregistrement ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground-muted">{title}</h3>
      {children}
    </div>
  );
}
