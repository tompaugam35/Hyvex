import type { creerClientServeur } from "@/lib/supabase/server";
import { jourDepuisDate } from "@/lib/semaine";
import type { Seance } from "@/types";
import {
  echangerCodeContreJeton,
  rafraichirJetonStrava,
  recupererActivitesDeCourse,
  type ActiviteStrava,
} from "./api";

type ClientSupabase = Awaited<ReturnType<typeof creerClientServeur>>;

// Une activité ne peut être rattachée qu'à une séance de course déjà placée sur le
// bon jour de la semaine en cours (pas encore terminée) : un run un lundi ne doit
// pas se raccrocher au lundi d'une semaine passée ou future.
function estDansSemaineEnCours(date: Date, dateDebut: string) {
  const debut = new Date(dateDebut);
  debut.setHours(0, 0, 0, 0);
  const fin = new Date(debut);
  fin.setDate(fin.getDate() + 7);
  return date >= debut && date < fin;
}

function versLigneJournal(
  activite: ActiviteStrava,
  userId: string,
  numeroSemaine: number | null,
  seance?: Seance
) {
  const date = new Date(activite.start_date_local);
  return {
    user_id: userId,
    numero_semaine: seance ? numeroSemaine : null,
    seance_id: seance?.id ?? null,
    jour: jourDepuisDate(date),
    titre: seance?.titre ?? (activite.name || "Course"),
    qualite: "course",
    date: activite.start_date_local,
    source: "strava",
    strava_activity_id: activite.id,
    distance_metres: activite.distance,
    duree_secondes: activite.moving_time,
    duree_estimee_minutes: seance?.dureeEstimeeMinutes ?? null,
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

  // On regarde toujours au moins 2 jours en arrière, même si la dernière synchro est
  // très récente : une activité ajoutée après coup sur Strava avec une heure de début
  // antérieure à cet horodatage (ex. saisie manuelle, upload en retard) ne doit pas être
  // définitivement manquée. Sans danger de doublon : la contrainte unique sur
  // strava_activity_id ignore les activités déjà importées.
  const DELAI_SECURITE_SECONDES = 2 * 24 * 3600;
  const apres = jeton.derniere_synchro
    ? Math.min(
        Math.floor(new Date(jeton.derniere_synchro).getTime() / 1000),
        maintenant - DELAI_SECURITE_SECONDES
      )
    : maintenant - 30 * 24 * 3600;

  const activites = await recupererActivitesDeCourse(accessToken, apres);

  let nbAssociees = 0;

  if (activites.length > 0) {
    const { data: ligneProgramme } = await supabase
      .from("programmes")
      .select("seances, date_debut, numero_semaine")
      .eq("user_id", userId)
      .maybeSingle();

    let seances = (ligneProgramme?.seances as Seance[] | undefined) ?? [];
    const seancesDejaAssociees = new Set<string>();

    const lignes = activites.map((activite) => {
      const date = new Date(activite.start_date_local);
      const jour = jourDepuisDate(date);

      const correspondance =
        ligneProgramme && estDansSemaineEnCours(date, ligneProgramme.date_debut)
          ? seances.find(
              (s) =>
                s.qualite === "course" &&
                s.jour === jour &&
                s.statut === "a_venir" &&
                !seancesDejaAssociees.has(s.id)
            )
          : undefined;

      if (correspondance) {
        seancesDejaAssociees.add(correspondance.id);
        seances = seances.map((s) =>
          s.id === correspondance.id ? { ...s, statut: "terminee" as const } : s
        );
      }

      return versLigneJournal(
        activite,
        userId,
        ligneProgramme?.numero_semaine ?? null,
        correspondance
      );
    });

    if (seancesDejaAssociees.size > 0) {
      nbAssociees = seancesDejaAssociees.size;
      await supabase
        .from("programmes")
        .update({ seances, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
    }

    const { error } = await supabase
      .from("journal_seances")
      .upsert(lignes, { onConflict: "user_id,strava_activity_id", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }

  await supabase
    .from("strava_tokens")
    .update({ derniere_synchro: new Date().toISOString() })
    .eq("user_id", userId);

  return { nbImportees: activites.length, nbAssociees };
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
