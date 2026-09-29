import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { aAccesComplet } from "@/lib/abonnement";
import { versRepas } from "@/lib/supabase/mappers";
import { calculerRepasIA } from "@/lib/ia/calculer-repas";

export async function POST(request: Request) {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  if (!(await aAccesComplet(supabase, user.id))) {
    return NextResponse.json({ erreur: "Abonnement requis" }, { status: 402 });
  }

  const body = await request.json();
  const { titre, aliments } = body as {
    titre?: string;
    aliments?: { nom: string; poidsGrammes: number }[];
  };

  if (!titre || !aliments || aliments.length === 0) {
    return NextResponse.json({ erreur: "Titre ou aliments manquants" }, { status: 400 });
  }

  try {
    const analyse = await calculerRepasIA(titre, aliments);

    const { data, error } = await supabase
      .from("repas")
      .insert({
        user_id: user.id,
        titre: analyse.titre,
        calories: Math.round(analyse.calories),
        proteines_g: analyse.proteinesG,
        glucides_g: analyse.glucidesG,
        lipides_g: analyse.lipidesG,
        photo: null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ repas: versRepas(data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[/api/calculer-repas] échec :", error);
    return NextResponse.json({ erreur: message }, { status: 502 });
  }
}
