import { NextResponse } from "next/server";
import { creerClientServeur } from "@/lib/supabase/server";
import { versJournalEntree, versSemaineHistorique } from "@/lib/supabase/mappers";
import { calculerBilanMensuel, cleMois, moisPrecedent } from "@/lib/bilan-mensuel";

export async function GET() {
  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié" }, { status: 401 });
  }

  const premierJourMois = moisPrecedent();
  const premierJourMoisSuivant = new Date(
    premierJourMois.getFullYear(),
    premierJourMois.getMonth() + 1,
    1
  );

  const [{ data: ligneProfil }, { data: lignesJournal }, { data: lignesSemaines }] =
    await Promise.all([
      supabase
        .from("profils")
        .select("prenom, seances_par_semaine")
        .eq("user_id", user.id)
        .maybeSingle(),
      // Tout le journal (pas seulement le mois cible) : sert aussi à comparer
      // le mois au reste de l'historique (mois précédent, meilleur mois).
      supabase
        .from("journal_seances")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(2000),
      supabase
        .from("semaines_historique")
        .select("*")
        .eq("user_id", user.id)
        .gte("date_debut", premierJourMois.toISOString().slice(0, 10))
        .lt("date_debut", premierJourMoisSuivant.toISOString().slice(0, 10)),
    ]);

  if (!ligneProfil) {
    return NextResponse.json({ erreur: "Profil introuvable" }, { status: 404 });
  }

  const journal = (lignesJournal ?? []).map(versJournalEntree);

  const comptesParMois = new Map<string, number>();
  const journalMois = [];
  for (const entree of journal) {
    const cle = cleMois(new Date(entree.date));
    comptesParMois.set(cle, (comptesParMois.get(cle) ?? 0) + 1);
    if (cle === cleMois(premierJourMois)) journalMois.push(entree);
  }

  const bilan = calculerBilanMensuel({
    premierJourMois,
    prenom: ligneProfil.prenom,
    journalMois,
    comptesParMois,
    semainesMois: (lignesSemaines ?? []).map(versSemaineHistorique),
    seancesParSemaineProfil: ligneProfil.seances_par_semaine,
  });

  return NextResponse.json(bilan);
}
