import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { synchroniserStrava } from "@/lib/strava/sync";

export async function POST() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  try {
    const resultat = await synchroniserStrava(supabase, user.id);
    return NextResponse.json(resultat);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ erreur: message }, { status: 502 });
  }
}
