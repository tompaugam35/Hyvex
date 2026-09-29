import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { aAccesComplet } from "@/lib/abonnement";
import { versRepas } from "@/lib/supabase/mappers";
import { analyserRepasIA } from "@/lib/ia/analyser-repas";

const MEDIA_TYPES_ACCEPTES = ["image/jpeg", "image/png", "image/webp"] as const;

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
  const { image, mediaType } = body as { image?: string; mediaType?: string };

  if (!image || !mediaType) {
    return NextResponse.json({ erreur: "Photo manquante" }, { status: 400 });
  }
  if (!MEDIA_TYPES_ACCEPTES.includes(mediaType as (typeof MEDIA_TYPES_ACCEPTES)[number])) {
    return NextResponse.json({ erreur: "Format de photo non supporté" }, { status: 400 });
  }

  try {
    const analyse = await analyserRepasIA(
      image,
      mediaType as (typeof MEDIA_TYPES_ACCEPTES)[number]
    );

    const { data, error } = await supabase
      .from("repas")
      .insert({
        user_id: user.id,
        titre: analyse.titre,
        calories: Math.round(analyse.calories),
        proteines_g: analyse.proteinesG,
        glucides_g: analyse.glucidesG,
        lipides_g: analyse.lipidesG,
        photo: `data:${mediaType};base64,${image}`,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ repas: versRepas(data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[/api/analyser-repas] échec :", error);
    return NextResponse.json({ erreur: message }, { status: 502 });
  }
}
