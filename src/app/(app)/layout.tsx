"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav, Sidebar } from "@/components/layout/NavLinks";
import { useProgramme } from "@/lib/use-programme";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { charge, profil, programme, erreurChargement, rafraichir } = useProgramme();
  const router = useRouter();

  useEffect(() => {
    if (charge && (!profil || !programme)) {
      router.replace("/onboarding");
    }
  }, [charge, profil, programme, router]);

  if (!charge || !profil || !programme) {
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

  return (
    <div className="flex min-h-screen w-full max-w-6xl mx-auto md:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-0 md:pb-10">{children}</main>
      <BottomNav />
    </div>
  );
}
