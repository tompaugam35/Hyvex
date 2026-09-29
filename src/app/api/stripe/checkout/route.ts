import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { aAccesComplet } from "@/lib/abonnement";
import { prixDeLOffre, stripe, type Offre } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { offre } = (await request.json().catch(() => ({}))) as { offre?: Offre };
  if (offre !== "starter" && offre !== "pro") {
    return NextResponse.json({ erreur: "Offre inconnue" }, { status: 400 });
  }

  const origine = new URL(request.url).origin;

  if (await aAccesComplet(supabase, user.id)) {
    return NextResponse.json({ url: `${origine}/dashboard` });
  }

  const { data: abonnement } = await supabase
    .from("abonnements")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: prixDeLOffre(offre), quantity: 1 }],
    client_reference_id: user.id,
    ...(abonnement?.stripe_customer_id
      ? { customer: abonnement.stripe_customer_id }
      : { customer_email: user.email }),
    subscription_data: { metadata: { user_id: user.id } },
    allow_promotion_codes: true,
    locale: "fr",
    success_url: `${origine}/dashboard?paiement=ok`,
    cancel_url: `${origine}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
