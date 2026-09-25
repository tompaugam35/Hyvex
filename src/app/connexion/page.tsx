"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"connexion" | "mot-de-passe-oublie">("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [etat, setEtat] = useState<"idle" | "en_cours" | "erreur">("idle");
  const [erreur, setErreur] = useState("");
  const [emailEnvoye, setEmailEnvoye] = useState(false);

  const emailValide = /\S+@\S+\.\S+/.test(email);
  const formulaireValide = emailValide && motDePasse.length > 0;

  async function seConnecter() {
    setEtat("en_cours");
    setErreur("");
    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
    if (error) {
      setErreur("Email ou mot de passe incorrect.");
      setEtat("erreur");
      return;
    }
    router.push("/dashboard");
  }

  async function envoyerLienReinitialisation() {
    setEtat("en_cours");
    setErreur("");
    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/connexion/reinitialiser`,
    });
    if (error) {
      setErreur("Impossible d'envoyer l'email. Vérifie ton adresse.");
      setEtat("erreur");
      return;
    }
    setEtat("idle");
    setEmailEnvoye(true);
  }

  function revenirALaConnexion() {
    setMode("connexion");
    setEtat("idle");
    setErreur("");
    setEmailEnvoye(false);
  }

  if (mode === "mot-de-passe-oublie") {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-8">
        <div>
          <h1 className="text-2xl font-semibold">
            {emailEnvoye ? "Vérifie ta boîte mail" : "Mot de passe oublié"}
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {emailEnvoye
              ? `On vient d'envoyer un lien à ${email} pour choisir un nouveau mot de passe.`
              : "On t'envoie un lien par email pour choisir un nouveau mot de passe."}
          </p>
        </div>

        {!emailEnvoye && (
          <input
            autoFocus
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@email.com"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
          />
        )}

        {etat === "erreur" && (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {erreur}
          </p>
        )}

        {!emailEnvoye && (
          <Button
            onClick={envoyerLienReinitialisation}
            disabled={!emailValide || etat === "en_cours"}
            className="w-full"
          >
            {etat === "en_cours" ? "Un instant…" : "Envoyer le lien"}
          </Button>
        )}

        <button
          onClick={revenirALaConnexion}
          className="self-center text-sm text-foreground-muted underline"
        >
          Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Content de te revoir</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Connecte-toi avec ton email et ton mot de passe.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          autoFocus
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ton@email.com"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
        />
        <input
          type="password"
          autoComplete="current-password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          placeholder="Mot de passe"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
        />
        <button
          onClick={() => {
            setMode("mot-de-passe-oublie");
            setEtat("idle");
            setErreur("");
          }}
          className="self-end text-sm text-foreground-muted underline"
        >
          Mot de passe oublié ?
        </button>
      </div>

      {etat === "erreur" && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {erreur}
        </p>
      )}

      <Button
        onClick={seConnecter}
        disabled={!formulaireValide || etat === "en_cours"}
        className="w-full"
      >
        {etat === "en_cours" ? "Un instant…" : "Se connecter"}
      </Button>

      <p className="text-center text-sm text-foreground-muted">
        Pas encore de compte ?{" "}
        <a href="/onboarding" className="font-medium text-foreground underline">
          Crée ton programme
        </a>
      </p>
    </div>
  );
}
