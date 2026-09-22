import type { ProfilInput } from "@/lib/ia/schema";

const CLE = "hybrid:onboarding-brouillon";

export function sauvegarderBrouillon(donnees: ProfilInput) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE, JSON.stringify(donnees));
  } catch {
    // ignore
  }
}

export function chargerBrouillon(): ProfilInput | null {
  if (typeof window === "undefined") return null;
  try {
    const brut = window.localStorage.getItem(CLE);
    return brut ? (JSON.parse(brut) as ProfilInput) : null;
  } catch {
    return null;
  }
}

export function effacerBrouillon() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    // ignore
  }
}
