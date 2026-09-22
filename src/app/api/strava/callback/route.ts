import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { connecterStrava } from "@/lib/strava/sync";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const erreurAutorisation = url.searchParams.get("error");

  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  if (erreurAutorisation || !code) {
    return NextResponse.redirect(new URL("/profil?strava=refuse", request.url));
  }

  try {
    await connecterStrava(supabase, user.id, code);
    return NextResponse.redirect(new URL("/profil?strava=connecte", request.url));
  } catch {
    return NextResponse.redirect(new URL("/profil?strava=erreur", request.url));
  }
}
