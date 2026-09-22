"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [lienEnvoye, setLienEnvoye] = useState(false);
  const [etat, setEtat] = useState<"idle" | "en_cours" | "erreur">("idle");
  const [erreur, setErreur] = useState("");

  const emailValide = /\S+@\S+\.\S+/.test(email);

  async function envoyerLien() {
    setEtat("en_cours");
    setErreur("");
    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/connexion/confirmation`,
      },
    });
    if (error) {
      setErreur("Impossible d'envoyer le lien. Vérifie ton adresse email.");
      setEtat("erreur");
      return;
    }
    setEtat("idle");
    setLienEnvoye(true);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-8">
      <div>
        <h1 className="text-2xl font-semibold">
          {lienEnvoye ? "Vérifie ta boîte mail" : "Content de te revoir"}
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          {lienEnvoye
            ? `On vient d'envoyer un lien à ${email}. Clique dessus pour te connecter.`
            : "Connecte-toi avec ton email, sans mot de passe."}
        </p>
      </div>

      {!lienEnvoye && (
        <input
          autoFocus
          type="email"
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

      {lienEnvoye ? (
        <button
          onClick={() => {
            setLienEnvoye(false);
            setErreur("");
          }}
          className="self-start text-sm text-foreground-muted underline"
        >
          Changer d&apos;email
        </button>
      ) : (
        <Button onClick={envoyerLien} disabled={!emailValide || etat === "en_cours"} className="w-full">
          {etat === "en_cours" ? "Un instant…" : "Recevoir mon lien"}
        </Button>
      )}
    </div>
  );
}
