"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useProgramme } from "@/lib/use-programme";

const niveauLabel = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export default function ProfilPage() {
  const { profil } = useProgramme();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-xl font-semibold">
          {profil.prenom[0]}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{profil.prenom}</h1>
          <p className="text-sm text-foreground-muted">
            Niveau {niveauLabel[profil.niveau]}
          </p>
        </div>
      </header>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">Objectifs</span>
          <span className="text-sm">
            {profil.objectifs.course}% course · {profil.objectifs.muscu}% muscu ·{" "}
            {profil.objectifs.explosivite}% explosivité
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">Disponibilité</span>
          <span className="text-sm">{profil.joursDisponibles} jours / semaine</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">Durée par séance</span>
          <span className="text-sm">{profil.dureeSeanceMinutes} min</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">Matériel</span>
          <span className="text-sm">{profil.materiel.join(", ")}</span>
        </div>
      </Card>

      <Button variant="secondary">Modifier mes objectifs et disponibilités</Button>
      <Button variant="ghost" className="text-danger">
        Se déconnecter
      </Button>
    </div>
  );
}
