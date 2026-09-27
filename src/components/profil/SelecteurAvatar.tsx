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
        className="cascade flex max-h-[80dvh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-3xl bg-background p-6 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-semibold">Choisis ta photo de profil</h2>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map((avatar, index) => (
            <button
              key={avatar.id}
              onClick={() => {
                onChoisir(avatar.id);
                onFermer();
              }}
              aria-label="Choisir cet avatar"
              className={cn(
                "flex aspect-square items-center justify-center transition-transform",
                valeur === avatar.id && "scale-110"
              )}
              style={{
                background: avatar.url ? undefined : avatar.couleur,
                borderRadius: avatar.url ? undefined : "9999px",
                overflow: avatar.url ? undefined : "hidden",
              }}
            >
              {avatar.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar.url}
                  alt=""
                  className="avatar-orb h-full w-full object-cover"
                  style={{
                    animationDuration: `${70 + index * 6}s`,
                    animationDirection: index % 2 === 0 ? "normal" : "reverse",
                  }}
                />
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
