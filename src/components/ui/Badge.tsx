import type { Qualite } from "@/types";
import { qualiteInfo } from "@/lib/qualites";

export function QualiteBadge({ qualite }: { qualite: Qualite }) {
  const info = qualiteInfo[qualite];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${info.className}`}
    >
      {info.label}
    </span>
  );
}

export function StatutBadge({
  statut,
}: {
  statut: "a_venir" | "terminee" | "manquee";
}) {
  const map = {
    a_venir: { label: "À venir", className: "bg-surface-muted text-foreground-muted" },
    terminee: { label: "Terminée", className: "bg-accent/20 text-[#4a5c00]" },
    manquee: { label: "Manquée", className: "bg-danger/15 text-danger" },
  } as const;
  const info = map[statut];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${info.className}`}
    >
      {info.label}
    </span>
  );
}
