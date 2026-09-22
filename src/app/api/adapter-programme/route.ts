import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { versProfil, versProgramme, versJournalEntree } from "@/lib/supabase/mappers";
import { adapterProgrammeIA } from "@/lib/ia/adapter-programme";
import { versProgrammeSemaine, calculerChargeParQualite } from "@/lib/ia/mapper";
import type { BilanHebdomadaire, SeanceLog } from "@/types";

export async function POST() {
  const supabase = await creerClientServeur();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const [{ data: ligneProfil }, { data: ligneProgramme }] = await Promise.all([
    supabase.from("profils").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("programmes").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!ligneProfil || !ligneProgramme) {
    return NextResponse.json({ erreur: "Profil ou programme introuvable" }, { status: 404 });
  }

  const profil = versProfil(ligneProfil);
  const programmePrecedent = versProgramme(ligneProgramme);

  const { data: lignesJournal } = await supabase
    .from("journal_seances")
    .select("*")
    .eq("user_id", user.id)
    .eq("numero_semaine", programmePrecedent.numeroSemaine);

  // Le prompt d'adaptation ignore déjà les logs pour la course (pas de données
  // tant que Strava n'est pas branché) : on ne transmet que muscu/explosivité,
  // pour lesquelles rpe/fatigue/retours sont toujours renseignés.
  const logs: SeanceLog[] = (lignesJournal ?? [])
    .filter((l) => l.qualite !== "course")
    .map((ligne) => {
      const entree = versJournalEntree(ligne);
      return {
        seanceId: entree.seanceId,
        date: entree.date,
        complete: true,
        rpe: entree.rpe ?? 5,
        fatigue: entree.fatigue ?? 5,
        retoursExercices: entree.retoursExercices ?? [],
        notes: entree.notes,
      };
    });

  try {
    const resultat = await adapterProgrammeIA({
      profil,
      seancesPrecedentes: programmePrecedent.seances,
      logs,
      numeroSemainePrecedente: programmePrecedent.numeroSemaine,
    });

    const programme = versProgrammeSemaine(
      { seances: resultat.seances },
      programmePrecedent.numeroSemaine + 1
    );

    const bilan: BilanHebdomadaire = {
      semaineId: programme.id,
      constats: resultat.constats,
      ajustements: resultat.ajustements,
      chargeParQualite: calculerChargeParQualite(programme),
    };

    const nbSeancesTerminees = programmePrecedent.seances.filter(
      (s) => s.statut !== "a_venir"
    ).length;

    const { error: erreurArchive } = await supabase.from("semaines_historique").upsert(
      {
        user_id: user.id,
        numero_semaine: programmePrecedent.numeroSemaine,
        date_debut: programmePrecedent.dateDebut,
        nb_seances_prevues: programmePrecedent.seances.length,
        nb_seances_terminees: nbSeancesTerminees,
        bilan,
      },
      { onConflict: "user_id,numero_semaine" }
    );
    if (erreurArchive) throw new Error(erreurArchive.message);

    const { error } = await supabase
      .from("programmes")
      .update({
        id: programme.id,
        numero_semaine: programme.numeroSemaine,
        date_debut: programme.dateDebut,
        seances: programme.seances,
        dernier_bilan: bilan,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ programme, bilan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ erreur: message }, { status: 502 });
  }
}
