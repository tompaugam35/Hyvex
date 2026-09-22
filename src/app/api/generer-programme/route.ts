import { NextResponse } from "next/server";
import { profilInputSchema } from "@/lib/ia/schema";
import { genererProgrammeIA } from "@/lib/ia/generer-programme";
import { versProgrammeSemaine, objectifsDepuisPriorite } from "@/lib/ia/mapper";
import { creerClientServeur } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profilInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erreur: "Profil invalide", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const genere = await genererProgrammeIA(parsed.data);
    const programme = versProgrammeSemaine(genere);

    const { error: erreurProfil } = await supabase.from("profils").upsert({
      user_id: user.id,
      prenom: parsed.data.prenom,
      niveau: parsed.data.niveau,
      objectifs: objectifsDepuisPriorite(parsed.data.priorite),
      jours_disponibles: parsed.data.joursDisponibles,
      duree_seance_minutes: parsed.data.dureeSeanceMinutes,
      materiel: parsed.data.materiel,
    });
    if (erreurProfil) throw new Error(erreurProfil.message);

    const { error: erreurProgramme } = await supabase.from("programmes").upsert({
      user_id: user.id,
      id: programme.id,
      numero_semaine: programme.numeroSemaine,
      date_debut: programme.dateDebut,
      seances: programme.seances,
      dernier_bilan: null,
      updated_at: new Date().toISOString(),
    });
    if (erreurProgramme) throw new Error(erreurProgramme.message);

    return NextResponse.json({ programme });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ erreur: message }, { status: 502 });
  }
}
