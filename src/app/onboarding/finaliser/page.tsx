"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { chargerBrouillon, effacerBrouillon } from "@/lib/onboarding-brouillon";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function FinaliserOnboardingPage() {
  const router = useRouter();
  const [etat, setEtat] = useState<"en_cours" | "erreur">("en_cours");

  useEffect(() => {
    async function finaliser() {
      // Le lien email contient la session dans son URL : on laisse le client
      // Supabase la détecter et l'installer avant d'appeler l'API.
      const supabase = creerClientNavigateur();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setEtat("erreur");
        return;
      }

      const brouillon = chargerBrouillon();
      if (!brouillon) {
        router.replace("/dashboard");
        return;
      }

      try {
        const reponse = await fetch("/api/generer-programme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(brouillon),
        });
        if (!reponse.ok) throw new Error("La génération a échoué");
        effacerBrouillon();
        router.push("/dashboard");
      } catch {
        setEtat("erreur");
      }
    }

    finaliser();
  }, [router]);

  return (
    <div className="cascade mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-5 py-8 text-center">
      {etat === "en_cours" ? (
        <>
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
          <p className="text-sm text-foreground-muted">
            Génération de ton programme personnalisé…
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-danger">
            Ce lien est invalide ou a expiré. Recommence l&apos;inscription pour en recevoir un
            nouveau.
          </p>
          <a href="/onboarding" className="text-sm text-foreground-muted underline">
            Retour à l&apos;inscription
          </a>
        </>
      )}
    </div>
  );
}
