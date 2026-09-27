import type { Intensite, Qualite } from "@/types";
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
    terminee: { label: "Terminée", className: "bg-accent/20 text-accent" },
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

export function IntensiteBadge({ intensite }: { intensite: Intensite }) {
  const map = {
    faible: { label: "Intensité faible", className: "bg-surface-muted text-foreground-muted" },
    moderee: { label: "Intensité modérée", className: "bg-surface-muted text-foreground" },
    elevee: { label: "Intensité élevée", className: "bg-danger/15 text-danger" },
  } as const;
  const info = map[intensite];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${info.className}`}
    >
      {info.label}
    </span>
  );
}
