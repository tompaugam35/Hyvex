"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase/client";

export default function ConfirmationConnexionPage() {
  const router = useRouter();
  const [etat, setEtat] = useState<"en_cours" | "erreur">("en_cours");

  useEffect(() => {
    async function confirmer() {
      const supabase = creerClientNavigateur();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setEtat("erreur");
        return;
      }

      router.push("/dashboard");
    }

    confirmer();
  }, [router]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-5 py-8 text-center">
      {etat === "en_cours" ? (
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
      ) : (
        <>
          <p className="text-sm text-danger">Ce lien est invalide ou a expiré.</p>
          <a href="/connexion" className="text-sm text-foreground-muted underline">
            Réessayer
          </a>
        </>
      )}
    </div>
  );
}
