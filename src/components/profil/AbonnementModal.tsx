"use client";

import { Button } from "@/components/ui/Button";

export function AbonnementModal({ onFermer }: { onFermer: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex w-full max-w-md flex-col gap-5 rounded-t-3xl bg-background p-6 sm:rounded-3xl">
        <div>
          <h2 className="text-lg font-semibold">Ton abonnement</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            La gestion de l&apos;abonnement arrive bientôt. Tu pourras suivre ton offre et la
            modifier directement ici.
          </p>
        </div>

        <Button variant="ghost" onClick={onFermer} className="w-full">
          Fermer
        </Button>
      </div>
    </div>
  );
}
