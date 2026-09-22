"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useProgramme } from "@/lib/use-programme";

export default function BilanPage() {
  const { programme, dernierBilan, rafraichir } = useProgramme();
  const [etat, setEtat] = useState<"idle" | "en_cours" | "erreur">("idle");

  if (!programme) return null;

  const seancesRealisees = programme.seances.filter((s) => s.statut !== "a_venir");
  const peutGenerer = seancesRealisees.length > 0 && etat !== "en_cours";

  async function genererBilan() {
    setEtat("en_cours");
    try {
      const reponse = await fetch("/api/adapter-programme", { method: "POST" });
      if (!reponse.ok) throw new Error("La génération a échoué");
      await rafraichir();
      setEtat("idle");
    } catch {
      setEtat("erreur");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Bilan de la semaine</h1>
        <p className="text-sm text-foreground-muted">
          {dernierBilan
            ? `Analyse de la semaine ${programme.numeroSemaine - 1} par ton coach IA`
            : "Ton bilan apparaîtra ici une fois généré."}
        </p>
      </header>

      {dernierBilan ? (
        <>
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground-muted">
              Ce que l&apos;IA a constaté
            </h3>
            <Card className="flex flex-col gap-3">
              {dernierBilan.constats.map((constat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground-muted" />
                  <p className="text-sm">{constat}</p>
                </div>
              ))}
            </Card>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground-muted">
              Ce qui a changé pour la semaine {programme.numeroSemaine}
            </h3>
            <Card className="flex flex-col gap-3 border-accent/40 bg-accent/10">
              {dernierBilan.ajustements.map((ajustement, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5c6b0f]" />
                  <p className="text-sm">{ajustement}</p>
                </div>
              ))}
            </Card>
          </section>
        </>
      ) : (
        <Card>
          <p className="text-sm text-foreground-muted">
            Termine au moins une séance de ta semaine, puis génère ton premier bilan pour que
            ton coach IA adapte la semaine suivante.
          </p>
        </Card>
      )}

      {etat === "erreur" && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          La génération du bilan a échoué. Réessaie dans un instant.
        </p>
      )}

      <Button onClick={genererBilan} disabled={!peutGenerer} className="w-full">
        {etat === "en_cours"
          ? "Analyse en cours…"
          : seancesRealisees.length === 0
          ? "Termine une séance pour débloquer ton bilan"
          : `Générer le bilan et la semaine ${programme.numeroSemaine + 1}`}
      </Button>
    </div>
  );
}
