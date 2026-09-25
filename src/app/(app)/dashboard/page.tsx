"use client";

import { useEffect, useRef } from "react";
import { CalendrierSemaine } from "@/components/dashboard/CalendrierSemaine";
import { BilanSemaine } from "@/components/dashboard/BilanSemaine";
import { BilanMensuelModal } from "@/components/dashboard/BilanMensuelModal";
import { ExporterCalendrier } from "@/components/dashboard/ExporterCalendrier";
import { SeancesEnAttente } from "@/components/dashboard/SeancesEnAttente";
import { useProgramme } from "@/lib/use-programme";
import { useStrava } from "@/lib/use-strava";
import { useBilanMensuel } from "@/lib/use-bilan-mensuel";
import { joursDeLaSemaineEnCours } from "@/lib/semaine";

export default function DashboardPage() {
  const { profil, programme, placerSeance, placerAutreSport, validerAutreSport, rafraichir } =
    useProgramme();
  const { connecte: stravaConnecte, charge: stravaCharge, synchroniser } = useStrava();
  const { bilan: bilanMensuel, ouvert: bilanMensuelOuvert, fermer: fermerBilanMensuel } =
    useBilanMensuel(profil);
  const synchroLancee = useRef(false);

  useEffect(() => {
    // Dès que l'app s'ouvre avec Strava connecté, on va chercher les courses
    // terminées depuis la dernière visite pour les rattacher à la séance du jour.
    if (!stravaCharge || !stravaConnecte || synchroLancee.current) return;
    synchroLancee.current = true;
    synchroniser().then((resultat) => {
      if (resultat && resultat.nbAssociees > 0) rafraichir();
    });
  }, [stravaCharge, stravaConnecte, synchroniser, rafraichir]);

  if (!profil || !programme) return null;

  const seancesCompletees =
    programme.seances.filter((s) => s.statut === "terminee").length +
    programme.autresSportsPlaces.filter((s) => s.valide).length;
  const totalActivites = programme.seances.length + programme.autresSportsPlaces.length;
  const pourcentageComplete = totalActivites > 0 ? (seancesCompletees / totalActivites) * 100 : 0;

  const aujourdHuiMinuit = new Date();
  aujourdHuiMinuit.setHours(0, 0, 0, 0);
  const joursPasses = new Set<string>(
    joursDeLaSemaineEnCours()
      .filter((j) => j.date < aujourdHuiMinuit)
      .map((j) => j.nom)
  );
  const seancesEnAttente = programme.seances.filter(
    (s) => s.jour !== null && joursPasses.has(s.jour) && s.statut === "a_venir"
  );

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Semaine {programme.numeroSemaine}</h1>
      </header>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${pourcentageComplete}%` }}
          />
        </div>
        <span className="shrink-0 text-sm font-medium text-foreground-muted">
          {seancesCompletees}/{totalActivites} séances
        </span>
      </div>

      <section className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-foreground-muted">Cette semaine</h3>
        <CalendrierSemaine
          seances={programme.seances}
          autresSportsPlaces={programme.autresSportsPlaces}
          onPlacer={placerSeance}
          onPlacerAutreSport={placerAutreSport}
          onValiderAutreSport={validerAutreSport}
        />
      </section>

      <BilanSemaine programme={programme} onBilanGenere={rafraichir} />

      <ExporterCalendrier seances={programme.seances} />

      <SeancesEnAttente seances={seancesEnAttente} onPlacer={placerSeance} />

      {bilanMensuelOuvert && bilanMensuel && (
        <BilanMensuelModal bilan={bilanMensuel} onFermer={fermerBilanMensuel} />
      )}
    </div>
  );
}
