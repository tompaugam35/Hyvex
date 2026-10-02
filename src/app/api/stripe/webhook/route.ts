import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { offreDuPrix, stripe } from "@/lib/stripe";

const STATUTS_ACTIFS = ["active", "trialing"];

async function enregistrerAbonnement(abonnementId: string, userIdSecours?: string | null) {
  // Toujours relire l'abonnement chez Stripe : les événements peuvent arriver
  // dans le désordre, seul l'état actuel fait foi.
  const abo = await stripe().subscriptions.retrieve(abonnementId);
  const userId = abo.metadata.user_id || userIdSecours;
  if (!userId) return;

  const admin = creerClientAdmin();
  const { data: existant } = await admin
    .from("abonnements")
    .select("stripe_subscription_id, statut")
    .eq("user_id", userId)
    .maybeSingle();

  // Un ancien abonnement qui se termine ne doit pas écraser un nouvel abonnement actif.
  if (
    existant?.stripe_subscription_id &&
    existant.stripe_subscription_id !== abo.id &&
    STATUTS_ACTIFS.includes(existant.statut) &&
    !STATUTS_ACTIFS.includes(abo.status)
  ) {
    return;
  }

  const element = abo.items.data[0];
  const { error } = await admin.from("abonnements").upsert(
    {
      user_id: userId,
      statut: abo.status,
      offre: offreDuPrix(element?.price.id),
      fin_periode: element ? new Date(element.current_period_end * 1000).toISOString() : null,
      resiliation_prevue: abo.cancel_at_period_end || abo.cancel_at !== null,
      stripe_customer_id: typeof abo.customer === "string" ? abo.customer : abo.customer.id,
      stripe_subscription_id: abo.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  // 23503 : le compte a été supprimé entre-temps, il n'y a plus rien à mettre à jour.
  if (error && error.code !== "23503") throw new Error(error.message);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ erreur: "Signature manquante" }, { status: 400 });
  }

  let evenement: Stripe.Event;
  try {
    evenement = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ erreur: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (evenement.type) {
      case "checkout.session.completed": {
        const session = evenement.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          await enregistrerAbonnement(id, session.client_reference_id);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await enregistrerAbonnement(evenement.data.object.id);
        break;
    }
  } catch (erreur) {
    console.error("[/api/stripe/webhook] échec :", erreur);
    // 500 : Stripe renverra l'événement plus tard.
    return NextResponse.json({ erreur: "Traitement échoué" }, { status: 500 });
  }

  return NextResponse.json({ recu: true });
}
