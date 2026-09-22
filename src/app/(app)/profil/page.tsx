"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useProgramme } from "@/lib/use-programme";
import { useStrava } from "@/lib/use-strava";
import { creerClientNavigateur } from "@/lib/supabase/client";

const niveauLabel = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export default function ProfilPage() {
  const { profil } = useProgramme();
  const { connecte, charge: chargeStrava, synchroEnCours, connecter, synchroniser } = useStrava();
  const router = useRouter();
  const [statutStrava, setStatutStrava] = useState<string | null>(null);

  useEffect(() => {
    const valeur = new URLSearchParams(window.location.search).get("strava");
    if (valeur) {
      // Lecture ponctuelle du paramètre de retour Strava, puis nettoyage de l'URL.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatutStrava(valeur);
      router.replace("/profil");
    }
  }, [router]);

  if (!profil) return null;

  async function seDeconnecter() {
    const supabase = creerClientNavigateur();
    await supabase.auth.signOut();
    router.push("/");
  }

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

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Strava</span>
          {chargeStrava && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                connecte
                  ? "bg-running/15 text-running"
                  : "bg-surface-muted text-foreground-muted"
              }`}
            >
              {connecte ? "Connecté" : "Non connecté"}
            </span>
          )}
        </div>
        {statutStrava === "connecte" && (
          <p className="text-sm text-running">
            Compte Strava connecté, tes dernières courses ont été importées.
          </p>
        )}
        {statutStrava === "erreur" && (
          <p className="text-sm text-danger">La connexion à Strava a échoué, réessaie.</p>
        )}
        {statutStrava === "refuse" && (
          <p className="text-sm text-foreground-muted">Connexion Strava annulée.</p>
        )}
        {connecte ? (
          <Button variant="secondary" onClick={synchroniser} disabled={synchroEnCours}>
            {synchroEnCours ? "Synchronisation..." : "Synchroniser mes courses"}
          </Button>
        ) : (
          <Button variant="secondary" onClick={connecter}>
            Connecter Strava
          </Button>
        )}
      </Card>

      <Button variant="secondary">Modifier mes objectifs et disponibilités</Button>
      <Button variant="ghost" className="text-danger" onClick={seDeconnecter}>
        Se déconnecter
      </Button>
    </div>
  );
}
