import Stripe from "stripe";

export type Offre = "starter" | "pro";

let client: Stripe | null = null;

export function stripe() {
  if (!client) {
    const cle = process.env.STRIPE_SECRET_KEY;
    if (!cle) throw new Error("STRIPE_SECRET_KEY manquante.");
    client = new Stripe(cle);
  }
  return client;
}

export function prixDeLOffre(offre: Offre) {
  const prix = offre === "starter" ? process.env.STRIPE_PRIX_STARTER : process.env.STRIPE_PRIX_PRO;
  if (!prix) throw new Error(`Identifiant de prix Stripe manquant pour l'offre ${offre}.`);
  return prix;
}

export function offreDuPrix(prixId: string | undefined): Offre | null {
  if (prixId && prixId === process.env.STRIPE_PRIX_STARTER) return "starter";
  if (prixId && prixId === process.env.STRIPE_PRIX_PRO) return "pro";
  return null;
}
