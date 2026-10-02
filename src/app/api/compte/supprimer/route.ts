import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { creerClientAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { deautoriserStrava, rafraichirJetonStrava } from "@/lib/strava/api";

const STATUTS_TERMINES = ["canceled", "incomplete_expired"];

export async function POST() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const admin = creerClientAdmin();

  // D'abord l'abonnement : on ne supprime jamais un compte qui continuerait à être prélevé.
  const { data: abonnement } = await admin
    .from("abonnements")
    .select("statut, stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (abonnement?.stripe_subscription_id && !STATUTS_TERMINES.includes(abonnement.statut)) {
    try {
      await stripe().subscriptions.cancel(abonnement.stripe_subscription_id);
    } catch (erreur) {
      console.error("[/api/compte/supprimer] résiliation Stripe impossible :", erreur);
      return NextResponse.json(
        { erreur: "Impossible de résilier ton abonnement pour le moment." },
        { status: 502 }
      );
    }
  }

  // Strava : on retire l'accès accordé à Hyvex (au mieux, sans bloquer la suppression).
  const { data: jeton } = await admin
    .from("strava_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (jeton) {
    try {
      const expire = jeton.expires_at <= Math.floor(Date.now() / 1000);
      const accessToken = expire
        ? (await rafraichirJetonStrava(jeton.refresh_token)).access_token
        : jeton.access_token;
      await deautoriserStrava(accessToken);
    } catch (erreur) {
      console.error("[/api/compte/supprimer] déconnexion Strava impossible :", erreur);
    }
  }

  // Toutes les tables sont liées au compte avec suppression en cascade.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[/api/compte/supprimer] suppression impossible :", error);
    return NextResponse.json({ erreur: "La suppression a échoué." }, { status: 500 });
  }

  return NextResponse.json({ supprime: true });
}
