"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function ReinitialiserMotDePassePage() {
  const router = useRouter();
  const [pret, setPret] = useState(false);
  const [lienInvalide, setLienInvalide] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [etat, setEtat] = useState<"idle" | "en_cours" | "erreur">("idle");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function verifierSession() {
      // Le lien de réinitialisation contient la session dans son URL : on laisse
      // le client Supabase la détecter et l'installer avant d'afficher le formulaire.
      const supabase = creerClientNavigateur();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLienInvalide(true);
        return;
      }
      setPret(true);
    }

    verifierSession();
  }, []);

  const motDePasseValide = motDePasse.length >= 6 && motDePasse === confirmation;

  async function changerMotDePasse() {
    if (!motDePasseValide) return;
    setEtat("en_cours");
    setErreur("");
    const supabase = creerClientNavigateur();
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    if (error) {
      setErreur("Impossible de changer le mot de passe. Réessaie.");
      setEtat("erreur");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-8">
      {lienInvalide ? (
        <>
          <div>
            <h1 className="text-2xl font-semibold">Lien invalide ou expiré</h1>
            <p className="mt-1 text-sm text-foreground-muted">
              Redemande un lien de réinitialisation depuis la page de connexion.
            </p>
          </div>
          <a href="/connexion" className="text-sm text-foreground-muted underline">
            Retour à la connexion
          </a>
        </>
      ) : !pret ? (
        <div className="flex justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-semibold">Choisis un nouveau mot de passe</h1>
            <p className="mt-1 text-sm text-foreground-muted">6 caractères minimum.</p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              autoFocus
              type="password"
              autoComplete="new-password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
            />
            <input
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Confirme le mot de passe"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-foreground"
            />
          </div>

          {etat === "erreur" && (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {erreur}
            </p>
          )}

          <Button
            onClick={changerMotDePasse}
            disabled={!motDePasseValide || etat === "en_cours"}
            className="w-full"
          >
            {etat === "en_cours" ? "Un instant…" : "Changer le mot de passe"}
          </Button>
        </>
      )}
    </div>
  );
}
