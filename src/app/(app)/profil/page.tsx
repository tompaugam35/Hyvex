"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ModifierProfilPanel } from "@/components/profil/ModifierProfilPanel";
import { useProgramme } from "@/lib/use-programme";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { qualiteLabelLong } from "@/lib/quiz-options";

const niveauLabel = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export default function ProfilPage() {
  const { profil, mettreAJourProfil } = useProgramme();
  const router = useRouter();
  const [modificationOuverte, setModificationOuverte] = useState(false);

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
          <span className="text-sm text-foreground-muted">Progression</span>
          <span className="text-sm">
            {profil.qualitesPrioritaires.length === 3
              ? "Les trois qualités"
              : profil.qualitesPrioritaires.map((q) => qualiteLabelLong[q]).join(" + ")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">Pondération</span>
          <span className="text-sm">
            {profil.objectifs.course}% course · {profil.objectifs.muscu}% muscu ·{" "}
            {profil.objectifs.explosivite}% explosivité
          </span>
        </div>
        {profil.autresSports.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-muted">Autres sports</span>
            <span className="text-sm">
              {profil.autresSports.map((s) => `${s.nom} (${s.frequenceParSemaine}x)`).join(", ")}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground-muted">Disponibilité</span>
          <span className="text-sm">{profil.seancesParSemaine} séances / semaine</span>
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

      <Button variant="secondary" onClick={() => setModificationOuverte(true)}>
        Modifier mes objectifs et disponibilités
      </Button>
      <Button variant="ghost" className="text-danger" onClick={seDeconnecter}>
        Se déconnecter
      </Button>

      {modificationOuverte && (
        <ModifierProfilPanel
          profil={profil}
          onFermer={() => setModificationOuverte(false)}
          onEnregistrer={async (input) => {
            await mettreAJourProfil(input);
            setModificationOuverte(false);
          }}
        />
      )}
    </div>
  );
}
