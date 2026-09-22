"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectCard } from "@/components/ui/SelectCard";
import { Stepper } from "@/components/ui/Stepper";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { sauvegarderBrouillon } from "@/lib/onboarding-brouillon";
import {
  niveaux,
  qualiteOptions,
  qualiteLabelLong,
  objectifPlaceholder,
  materielOptions,
} from "@/lib/quiz-options";
import type { AutreSport, NiveauSportif, PerformanceCourse, PerformanceMuscu, Qualite } from "@/types";

type StepKey =
  | "prenom"
  | "niveau"
  | "qualites"
  | "niveau-performance"
  | "objectifs"
  | "autres-sports"
  | "dispo"
  | "materiel"
  | "compte";

function calculerSteps(qualites: Qualite[]): StepKey[] {
  const inclureNiveauPerf = qualites.includes("course") || qualites.includes("muscu");
  return [
    "prenom",
    "niveau",
    "qualites",
    ...(inclureNiveauPerf ? (["niveau-performance"] as StepKey[]) : []),
    "objectifs",
    "autres-sports",
    "dispo",
    "materiel",
    "compte",
  ];
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [prenom, setPrenom] = useState("");
  const [niveau, setNiveau] = useState<NiveauSportif | null>(null);
  const [qualites, setQualites] = useState<Qualite[]>([]);
  const [performanceCourse, setPerformanceCourse] = useState<PerformanceCourse>({});
  const [performanceMuscu, setPerformanceMuscu] = useState<PerformanceMuscu>({});
  const [objectifsTexte, setObjectifsTexte] = useState<Partial<Record<Qualite, string>>>({});
  const [autresSports, setAutresSports] = useState<AutreSport[]>([]);
  const [nouveauSportNom, setNouveauSportNom] = useState("");
  const [nouveauSportFreq, setNouveauSportFreq] = useState(1);
  const [seances, setSeances] = useState(4);
  const [duree, setDuree] = useState(60);
  const [materiel, setMateriel] = useState<string[]>([]);

  const [email, setEmail] = useState("");
  const [lienEnvoye, setLienEnvoye] = useState(false);
  const [authEtat, setAuthEtat] = useState<"idle" | "en_cours" | "erreur">("idle");
  const [authErreur, setAuthErreur] = useState("");

  const steps = calculerSteps(qualites);
  const stepKey = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const emailValide = /\S+@\S+\.\S+/.test(email);
  const sommeAutresSports = autresSports.reduce((t, s) => t + s.frequenceParSemaine, 0);
  const plancherSeances = sommeAutresSports + 1;
  const seancesEffectif = Math.max(seances, plancherSeances);
  const seancesHybrid = seancesEffectif - sommeAutresSports;

  const canNext = {
    prenom: prenom.trim().length > 0,
    niveau: niveau !== null,
    qualites: qualites.length > 0,
    "niveau-performance": true,
    objectifs: true,
    "autres-sports": true,
    dispo: true,
    materiel: materiel.length > 0,
    compte: emailValide && !lienEnvoye,
  }[stepKey];

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

  async function envoyerLien() {
    if (!niveau || qualites.length === 0) return;

    setAuthEtat("en_cours");
    setAuthErreur("");

    sauvegarderBrouillon({
      prenom,
      niveau,
      qualitesPrioritaires: qualites,
      performanceCourse,
      performanceMuscu,
      objectifsTexte,
      autresSports,
      seancesParSemaine: seancesEffectif,
      dureeSeanceMinutes: duree,
      materiel,
    });

    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/onboarding/finaliser`,
      },
    });

    if (error) {
      setAuthErreur("Impossible d'envoyer le lien. Vérifie ton adresse email.");
      setAuthEtat("erreur");
      return;
    }

    setAuthEtat("idle");
    setLienEnvoye(true);
  }

  async function next() {
    if (stepKey === "compte") {
      await envoyerLien();
      return;
    }
    setStep(step + 1);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-8">
      <div className="mb-8 flex items-center gap-3">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="text-sm text-foreground-muted"
          >
            ← Retour
          </button>
        ) : (
          <span />
        )}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1">
        {stepKey === "prenom" && (
          <StepBlock title="Comment tu t'appelles ?">
            <input
              autoFocus
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              placeholder="Ton prénom"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
            />
          </StepBlock>
        )}

        {stepKey === "niveau" && (
          <StepBlock title="Quel est ton niveau actuel ?">
            <div className="flex flex-col gap-3">
              {niveaux.map((n) => (
                <SelectCard
                  key={n.value}
                  selected={niveau === n.value}
                  onClick={() => setNiveau(n.value)}
                >
                  <p className="font-medium">{n.label}</p>
                  <p className="text-sm text-foreground-muted">{n.desc}</p>
                </SelectCard>
              ))}
            </div>
          </StepBlock>
        )}

        {stepKey === "qualites" && (
          <StepBlock title="Sur quoi as-tu envie de progresser ?">
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
            <p className="mt-3 text-xs text-foreground-muted">
              Tu peux choisir une ou deux qualités, ou les trois.
            </p>
          </StepBlock>
        )}

        {stepKey === "niveau-performance" && (
          <StepBlock title="Quel est ton niveau actuel ?">
            <div className="flex flex-col gap-6">
              {qualites.includes("course") && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-foreground-muted">Course à pied</h3>
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
                    <label className="text-sm text-foreground-muted">Temps sur semi (21 km)</label>
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
                  <h3 className="text-sm font-semibold text-foreground-muted">Musculation</h3>
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

              <p className="text-xs text-foreground-muted">
                Rien n&apos;est obligatoire — plus tu réponds, plus ton coach IA pourra te
                proposer un programme précis.
              </p>
            </div>
          </StepBlock>
        )}

        {stepKey === "objectifs" && (
          <StepBlock title="As-tu des objectifs précis ?">
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
          </StepBlock>
        )}

        {stepKey === "autres-sports" && (
          <StepBlock title="Pratiques-tu d'autres sports ?">
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
          </StepBlock>
        )}

        {stepKey === "dispo" && (
          <StepBlock title="Tes disponibilités">
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
                  par ton coach IA — les{" "}
                  {sommeAutresSports > 1
                    ? `${sommeAutresSports} autres correspondent`
                    : `${sommeAutresSports} autre correspond`}{" "}
                  à tes séances de {autresSports.map((s) => s.nom).join(", ")}.
                </p>
              )}
            </div>
          </StepBlock>
        )}

        {stepKey === "materiel" && (
          <StepBlock title="Quel matériel as-tu ?">
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
          </StepBlock>
        )}

        {stepKey === "compte" && (
          <StepBlock
            title={
              lienEnvoye ? "Vérifie ta boîte mail" : "Crée ton compte pour voir ton programme"
            }
          >
            {!lienEnvoye ? (
              <>
                <p className="text-sm text-foreground-muted">
                  Pas de mot de passe à retenir : on t&apos;envoie un lien de connexion par
                  email. En cliquant dessus, ton programme sera généré automatiquement.
                </p>
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
                />
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-foreground-muted">
                  On vient d&apos;envoyer un lien à{" "}
                  <span className="font-medium text-foreground">{email}</span>. Ouvre cet email
                  et clique sur le lien pour générer ton programme.
                </p>
                <button
                  onClick={() => {
                    setLienEnvoye(false);
                    setAuthErreur("");
                  }}
                  className="self-start text-sm text-foreground-muted underline"
                >
                  Changer d&apos;email
                </button>
              </div>
            )}
            {authEtat === "erreur" && (
              <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {authErreur}
              </p>
            )}
          </StepBlock>
        )}
      </div>

      {!(stepKey === "compte" && lienEnvoye) && (
        <Button
          onClick={next}
          disabled={!canNext || authEtat === "en_cours"}
          className="w-full"
        >
          {stepKey === "compte"
            ? authEtat === "en_cours"
              ? "Un instant…"
              : "Recevoir mon lien"
            : "Continuer"}
        </Button>
      )}
    </div>
  );
}

function StepBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children}
    </div>
  );
}
