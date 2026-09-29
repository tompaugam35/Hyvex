"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav, Sidebar } from "@/components/layout/NavLinks";
import { Paywall } from "@/components/paywall/Paywall";
import { AccesContexte } from "@/components/paywall/AccesContexte";
import { useProgramme } from "@/lib/use-programme";
import { useAccesComplet } from "@/lib/use-acces-complet";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { charge, profil, programme, erreurChargement, rafraichir } = useProgramme();
  const acces = useAccesComplet();
  const router = useRouter();
  const pathname = usePathname();
  const verrouille = acces.charge && !acces.actif;
  const [paywallOuvert, setPaywallOuvert] = useState(true);

  useEffect(() => {
    if (charge && (!profil || !programme)) {
      router.replace("/onboarding");
    }
  }, [charge, profil, programme, router]);

  // Le détail d'une séance est réservé aux abonnés : pas de contournement par l'URL.
  useEffect(() => {
    if (verrouille && pathname.startsWith("/seances")) {
      router.replace("/dashboard");
    }
  }, [verrouille, pathname, router]);

  if (!charge || !acces.charge || !profil || !programme) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        {erreurChargement ? (
          <>
            <p className="text-sm text-foreground-muted">
              Impossible de charger ton compte. Vérifie ta connexion et réessaie.
            </p>
            <button
              onClick={() => rafraichir()}
              className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium"
            >
              Réessayer
            </button>
          </>
        ) : (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
        )}
      </div>
    );
  }

  // Sans abonnement, l'app reste navigable mais les actions payantes (ouvrir une
  // séance, analyser un repas, faire son bilan…) rouvrent le paywall.
  function intercepterActionsPro(e: React.MouseEvent) {
    if (!verrouille) return;
    const cible = (e.target as HTMLElement).closest('a[href^="/seances/"], [data-pro]');
    if (!cible) return;
    e.preventDefault();
    e.stopPropagation();
    setPaywallOuvert(true);
  }

  return (
    <AccesContexte.Provider value={{ verrouille, ouvrirPaywall: () => setPaywallOuvert(true) }}>
      <div
        onClickCapture={intercepterActionsPro}
        className={cn("flex min-h-screen w-full max-w-6xl mx-auto md:gap-6", verrouille && "verrouille")}
      >
        <Sidebar />
        <main className={cn("min-w-0 flex-1 px-4 pt-6 md:px-0", verrouille ? "pb-44 md:pb-28" : "pb-24 md:pb-10")}>
          {children}
        </main>
        <BottomNav />
      </div>
      {verrouille && (
        <Paywall
          prenom={profil.prenom}
          programme={programme}
          ouvert={paywallOuvert}
          onOuvrir={() => setPaywallOuvert(true)}
          onFermer={() => setPaywallOuvert(false)}
        />
      )}
    </AccesContexte.Provider>
  );
}
