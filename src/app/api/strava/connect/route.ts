import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { urlAutorisationStrava } from "@/lib/strava/api";

export async function GET(request: Request) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  const redirectUri = new URL("/api/strava/callback", request.url).toString();
  return NextResponse.redirect(urlAutorisationStrava(redirectUri));
}
