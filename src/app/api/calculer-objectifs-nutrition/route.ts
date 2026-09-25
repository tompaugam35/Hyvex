import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { calculerObjectifsNutritionIA } from "@/lib/ia/calculer-objectifs-nutrition";

export async function POST() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const { data: ligneProfil } = await supabase
    .from("profils")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ligneProfil) {
    return NextResponse.json({ erreur: "Profil introuvable" }, { status: 404 });
  }

  try {
    const objectifs = await calculerObjectifsNutritionIA({
      niveau: ligneProfil.niveau,
      tailleCm: ligneProfil.taille_cm ?? undefined,
      poidsKg: ligneProfil.poids_kg ?? undefined,
      poidsObjectifKg: ligneProfil.poids_objectif_kg ?? undefined,
      seancesParSemaine: ligneProfil.seances_par_semaine,
    });

    const { error } = await supabase
      .from("profils")
      .update({
        objectif_calories: Math.round(objectifs.calories),
        objectif_proteines_g: objectifs.proteinesG,
        objectif_glucides_g: objectifs.glucidesG,
        objectif_lipides_g: objectifs.lipidesG,
      })
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ objectifs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[/api/calculer-objectifs-nutrition] échec :", error);
    return NextResponse.json({ erreur: message }, { status: 502 });
  }
}
