import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { data: abonnement } = await supabase
    .from("abonnements")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!abonnement?.stripe_customer_id) {
    return NextResponse.json({ erreur: "Aucun abonnement" }, { status: 404 });
  }

  const session = await stripe().billingPortal.sessions.create({
    customer: abonnement.stripe_customer_id,
    locale: "fr",
    return_url: `${new URL(request.url).origin}/profil`,
  });

  return NextResponse.json({ url: session.url });
}
