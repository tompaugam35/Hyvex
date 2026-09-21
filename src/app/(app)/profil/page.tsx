import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { profilMock } from "@/lib/mock-data";

const niveauLabel = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export default function ProfilPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-xl font-semibold">
          {profilMock.prenom[0]}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{profilMock.prenom}</h1>
          <p className="text-sm text-foreground-muted">
            Niveau {niveauLabel[profilMock.niveau]}
          </p>
        </div>
      </header>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">Objectifs</span>
          <span className="text-sm">
            {profilMock.objectifs.course}% course · {profilMock.objectifs.muscu}% muscu ·{" "}
            {profilMock.objectifs.explosivite}% explosivité
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">Disponibilité</span>
          <span className="text-sm">{profilMock.joursDisponibles} jours / semaine</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">Durée par séance</span>
          <span className="text-sm">{profilMock.dureeSeanceMinutes} min</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">Matériel</span>
          <span className="text-sm">{profilMock.materiel.join(", ")}</span>
        </div>
      </Card>

      <Button variant="secondary">Modifier mes objectifs et disponibilités</Button>
      <Button variant="ghost" className="text-danger">
        Se déconnecter
      </Button>
    </div>
  );
}
