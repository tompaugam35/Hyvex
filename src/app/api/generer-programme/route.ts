import { NextResponse } from "next/server";
import { profilInputSchema } from "@/lib/ia/schema";
import { genererProgrammeIA } from "@/lib/ia/generer-programme";
import { versProgrammeSemaine } from "@/lib/ia/mapper";

export async function POST(request: Request) {
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
    return NextResponse.json({ programme });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ erreur: message }, { status: 502 });
  }
}
