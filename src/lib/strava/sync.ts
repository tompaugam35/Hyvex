import type { creerClientServeur } from "@/lib/supabase/server";
import { jourDepuisDate } from "@/lib/semaine";
import {
  echangerCodeContreJeton,
  rafraichirJetonStrava,
  recupererActivitesDeCourse,
  type ActiviteStrava,
} from "./api";

type ClientSupabase = Awaited<ReturnType<typeof creerClientServeur>>;

function versLigneJournal(activite: ActiviteStrava, userId: string) {
  const date = new Date(activite.start_date_local);
  return {
    user_id: userId,
    jour: jourDepuisDate(date),
    titre: activite.name || "Course",
    qualite: "course",
    date: activite.start_date_local,
    source: "strava",
    strava_activity_id: activite.id,
    distance_metres: activite.distance,
    duree_secondes: activite.moving_time,
  };
}

export async function synchroniserStrava(supabase: ClientSupabase, userId: string) {
  const { data: jeton } = await supabase
    .from("strava_tokens")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!jeton) throw new Error("Strava non connecté");

  let accessToken: string = jeton.access_token;
  const maintenant = Math.floor(Date.now() / 1000);

  if (jeton.expires_at <= maintenant) {
    const rafraichi = await rafraichirJetonStrava(jeton.refresh_token);
    accessToken = rafraichi.access_token;
    await supabase
      .from("strava_tokens")
      .update({
        access_token: rafraichi.access_token,
        refresh_token: rafraichi.refresh_token,
        expires_at: rafraichi.expires_at,
      })
      .eq("user_id", userId);
  }

  const apres = jeton.derniere_synchro
    ? Math.floor(new Date(jeton.derniere_synchro).getTime() / 1000)
    : Math.floor(Date.now() / 1000) - 30 * 24 * 3600;

  const activites = await recupererActivitesDeCourse(accessToken, apres);

  if (activites.length > 0) {
    const lignes = activites.map((a) => versLigneJournal(a, userId));
    const { error } = await supabase
      .from("journal_seances")
      .upsert(lignes, { onConflict: "user_id,strava_activity_id", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }

  await supabase
    .from("strava_tokens")
    .update({ derniere_synchro: new Date().toISOString() })
    .eq("user_id", userId);

  return { nbImportees: activites.length };
}

export async function connecterStrava(supabase: ClientSupabase, userId: string, code: string) {
  const jeton = await echangerCodeContreJeton(code);
  const { error } = await supabase.from("strava_tokens").upsert({
    user_id: userId,
    access_token: jeton.access_token,
    refresh_token: jeton.refresh_token,
    expires_at: jeton.expires_at,
    athlete_id: jeton.athlete?.id ?? null,
  });
  if (error) throw new Error(error.message);
  return synchroniserStrava(supabase, userId);
}
