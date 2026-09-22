"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { sauvegarderBrouillon } from "@/lib/onboarding-brouillon";

type Niveau = "debutant" | "intermediaire" | "avance";
type Priorite = "course" | "muscu" | "explosivite" | "equilibre";

const niveaux: { value: Niveau; label: string; desc: string }[] = [
  { value: "debutant", label: "Débutant", desc: "Je démarre ou reprends le sport" },
  { value: "intermediaire", label: "Intermédiaire", desc: "Je m'entraîne régulièrement depuis un moment" },
  { value: "avance", label: "Avancé", desc: "Je m'entraîne sérieusement depuis plusieurs années" },
];

const priorites: { value: Priorite; label: string }[] = [
  { value: "course", label: "Courir plus vite / plus loin" },
  { value: "muscu", label: "Devenir plus fort" },
  { value: "explosivite", label: "Gagner en explosivité" },
  { value: "equilibre", label: "Progresser partout, de façon équilibrée" },
];

const materielOptions = ["Salle de sport", "Extérieur", "Haltères à la maison", "Aucun matériel"];

const steps = ["prenom", "niveau", "priorite", "dispo", "materiel", "compte"] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [prenom, setPrenom] = useState("");
  const [niveau, setNiveau] = useState<Niveau | null>(null);
  const [priorite, setPriorite] = useState<Priorite | null>(null);
  const [jours, setJours] = useState(4);
  const [duree, setDuree] = useState(60);
  const [materiel, setMateriel] = useState<string[]>([]);

  const [email, setEmail] = useState("");
  const [lienEnvoye, setLienEnvoye] = useState(false);
  const [authEtat, setAuthEtat] = useState<"idle" | "en_cours" | "erreur">("idle");
  const [authErreur, setAuthErreur] = useState("");

  const stepKey = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const emailValide = /\S+@\S+\.\S+/.test(email);

  const canNext = {
    prenom: prenom.trim().length > 0,
    niveau: niveau !== null,
    priorite: priorite !== null,
    dispo: true,
    materiel: materiel.length > 0,
    compte: emailValide && !lienEnvoye,
  }[stepKey];

  function toggleMateriel(option: string) {
    setMateriel((prev) =>
      prev.includes(option) ? prev.filter((m) => m !== option) : [...prev, option]
    );
  }

  async function envoyerLien() {
    if (!niveau || !priorite) return;

    setAuthEtat("en_cours");
    setAuthErreur("");

    sauvegarderBrouillon({
      prenom,
      niveau,
      priorite,
      joursDisponibles: jours,
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

        {stepKey === "priorite" && (
          <StepBlock title="Qu'est-ce qui est le plus important pour toi ?">
            <div className="flex flex-col gap-3">
              {priorites.map((p) => (
                <SelectCard
                  key={p.value}
                  selected={priorite === p.value}
                  onClick={() => setPriorite(p.value)}
                >
                  <p className="font-medium">{p.label}</p>
                </SelectCard>
              ))}
            </div>
          </StepBlock>
        )}

        {stepKey === "dispo" && (
          <StepBlock title="Tes disponibilités">
            <div className="flex flex-col gap-6">
              <Stepper
                label="Jours d'entraînement / semaine"
                value={jours}
                min={2}
                max={6}
                onChange={setJours}
              />
              <Stepper
                label="Durée par séance (min)"
                value={duree}
                min={30}
                max={90}
                step={15}
                onChange={setDuree}
              />
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

function SelectCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
        selected ? "border-accent bg-accent/10" : "border-border bg-surface"
      }`}
    >
      {children}
    </button>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-foreground-muted">{label}</span>
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-lg"
        >
          −
        </button>
        <span className="text-lg font-semibold">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}
