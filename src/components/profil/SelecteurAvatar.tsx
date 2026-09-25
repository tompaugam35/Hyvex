"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AVATARS } from "@/lib/avatars";

export function SelecteurAvatar({
  valeur,
  onChoisir,
  onFermer,
}: {
  valeur?: string;
  onChoisir: (id: string) => void;
  onFermer: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onFermer}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-3xl bg-background p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-semibold">Choisis ta photo de profil</h2>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => {
                onChoisir(avatar.id);
                onFermer();
              }}
              aria-label="Choisir cet avatar"
              className={cn(
                "flex aspect-square items-center justify-center overflow-hidden rounded-full border-2 transition-colors",
                valeur === avatar.id ? "border-accent" : "border-transparent"
              )}
              style={{ background: avatar.url ? undefined : avatar.couleur }}
            >
              {avatar.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar.url} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>

        <Button variant="ghost" onClick={onFermer} className="w-full">
          Fermer
        </Button>
      </div>
    </div>
  );
}
