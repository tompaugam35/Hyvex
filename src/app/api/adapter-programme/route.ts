import { NextResponse } from "next/server";
import { adapterRequestSchema } from "@/lib/ia/schema";
import { adapterProgrammeIA } from "@/lib/ia/adapter-programme";
import { versProgrammeSemaine, calculerChargeParQualite } from "@/lib/ia/mapper";
import type { BilanHebdomadaire } from "@/types";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = adapterRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erreur: "Requête invalide", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const resultat = await adapterProgrammeIA(parsed.data);
    const programme = versProgrammeSemaine(
      { seances: resultat.seances },
      parsed.data.numeroSemainePrecedente + 1
    );

    const bilan: BilanHebdomadaire = {
      semaineId: programme.id,
      constats: resultat.constats,
      ajustements: resultat.ajustements,
      chargeParQualite: calculerChargeParQualite(programme),
    };

    return NextResponse.json({ programme, bilan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ erreur: message }, { status: 502 });
  }
}
