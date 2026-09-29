"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ModifierProfilPanel } from "@/components/profil/ModifierProfilPanel";
import { SelecteurAvatar } from "@/components/profil/SelecteurAvatar";
import { GraphiqueEvolution } from "@/components/profil/GraphiqueEvolution";
import { ModifierPoidsModal } from "@/components/profil/ModifierPoidsModal";
import { DetailJourModal } from "@/components/profil/DetailJourModal";
import { AbonnementModal } from "@/components/profil/AbonnementModal";
import { useAcces } from "@/components/paywall/AccesContexte";
import { useProgramme } from "@/lib/use-programme";
import { useStrava } from "@/lib/use-strava";
import { usePoidsFatigue } from "@/lib/use-poids-fatigue";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { qualiteLabelLong } from "@/lib/quiz-options";
import { AVATARS } from "@/lib/avatars";
import { cn } from "@/lib/utils";
import type { PointEvolution } from "@/types";

const niveauLabel = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

const iconCommune = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconNiveau() {
  return (
    <svg {...iconCommune}>
      <path d="M5 19V13" />
      <path d="M12 19V9" />
      <path d="M19 19V5" />
    </svg>
  );
}

function IconCalendrier() {
  return (
    <svg {...iconCommune}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3M16 3v3" />
    </svg>
  );
}

function IconHorloge() {
  return (
    <svg {...iconCommune}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function StatTuile({
  icone,
  valeur,
  label,
}: {
  icone: React.ReactNode;
  valeur: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-2 py-5 text-center">
      <span className="text-foreground-muted">{icone}</span>
      <p className="donnee text-lg font-semibold">{valeur}</p>
      <p className="text-[11px] text-foreground-muted">{label}</p>
    </div>
  );
}

function IconActivite() {
  return (
    <svg {...iconCommune}>
      <path d="M3 12h4l2 6 4-14 2 8h6" />
    </svg>
  );
}

function IconAbonnement() {
  return (
    <svg {...iconCommune}>
      <path d="M12 3.5 14.3 9l6 .6-4.5 4 1.3 5.9L12 16.8 6.9 19.5l1.3-5.9-4.5-4 6-.6Z" />
    </svg>
  );
}

function IconModifier() {
  return (
    <svg {...iconCommune}>
      <path d="M4 20h4l11-11a1.5 1.5 0 0 0 0-2.1l-1.9-1.9a1.5 1.5 0 0 0-2.1 0L4 16v4Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </svg>
  );
}

function TuileAction({
  icone,
  label,
  onClick,
  disabled,
  actif,
}: {
  icone: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  actif?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-border bg-surface px-2 py-5 text-center disabled:opacity-50"
    >
      {actif !== undefined && (
        <span
          className={cn(
            "absolute right-3 top-3 h-2 w-2 rounded-full",
            actif ? "bg-accent" : "bg-border"
          )}
        />
      )}
      <span className="text-foreground-muted">{icone}</span>
      <span className="text-xs font-medium leading-tight">{label}</span>
    </button>
  );
}

const messageRetourStrava = {
  connecte: "Strava connecté ✅",
  refuse: "Connexion Strava annulée.",
  erreur: "Échec de la connexion à Strava, réessaie.",
} as const;

export default function ProfilPage() {
  const { profil, mettreAJourProfil, definirPhotoProfil, definirPoidsAujourdhui } = useProgramme();
  const router = useRouter();
  const { verrouille, ouvrirPaywall } = useAcces();
  const [modificationOuverte, setModificationOuverte] = useState(false);
  const [avatarOuvert, setAvatarOuvert] = useState(false);
  const [poidsOuvert, setPoidsOuvert] = useState(false);
  const [abonnementOuvert, setAbonnementOuvert] = useState(false);
  const [jourSelectionne, setJourSelectionne] = useState<PointEvolution | null>(null);
  const { points: pointsEvolution, fatigueMoyenne, rafraichir: rafraichirEvolution } = usePoidsFatigue();
  const {
    connecte: stravaConnecte,
    charge: stravaCharge,
    synchroEnCours,
    dernierResultat,
    connecter,
    synchroniser,
  } = useStrava();
  const [retourStrava, setRetourStrava] = useState<keyof typeof messageRetourStrava | null>(null);

  useEffect(() => {
    // Le callback OAuth redirige ici avec ?strava=... : on affiche le résultat une
    // fois puis on nettoie l'URL pour ne pas le réafficher à un futur rechargement.
    const params = new URLSearchParams(window.location.search);
    const statut = params.get("strava");
    if (statut && statut in messageRetourStrava) {
      // Lecture ponctuelle de l'URL au montage, pas de rendu en cascade synchrone.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRetourStrava(statut as keyof typeof messageRetourStrava);
      router.replace("/profil");
    }
  }, [router]);

  if (!profil) return null;

  async function seDeconnecter() {
    const supabase = creerClientNavigateur();
    await supabase.auth.signOut();
    router.push("/");
  }

  const avatarIndex = AVATARS.findIndex((a) => a.id === profil.photoUrl);
  const avatarActuel = avatarIndex === -1 ? undefined : AVATARS[avatarIndex];
  const activites = [
    ...profil.qualitesPrioritaires.map((q) => qualiteLabelLong[q]),
    ...profil.autresSports.map((s) => s.nom),
  ].join(" · ");

  const messageStrava = retourStrava
    ? messageRetourStrava[retourStrava]
    : dernierResultat
      ? dernierResultat.nbImportees === 0
        ? "Aucune nouvelle course sur Strava."
        : `${dernierResultat.nbImportees} course${dernierResultat.nbImportees > 1 ? "s" : ""} importée${dernierResultat.nbImportees > 1 ? "s" : ""}${
            dernierResultat.nbAssociees > 0
              ? `, ${dernierResultat.nbAssociees} associée${dernierResultat.nbAssociees > 1 ? "s" : ""} à ta séance du jour`
              : ""
          }.`
      : null;

  return (
    <div className="cascade mx-auto flex h-full w-full max-w-xl flex-col gap-4">
      <div className="flex items-center gap-5">
        <button
          onClick={() => setAvatarOuvert(true)}
          aria-label="Changer ma photo de profil"
          className={cn(
            "flex h-24 w-24 shrink-0 items-center justify-center text-2xl font-semibold",
            avatarActuel?.url ? "" : "overflow-hidden rounded-full bg-surface-muted"
          )}
          style={{ background: avatarActuel && !avatarActuel.url ? avatarActuel.couleur : undefined }}
        >
          {avatarActuel?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarActuel.url}
              alt=""
              className="avatar-orb h-full w-full object-cover"
              style={{
                animationDuration: `${70 + avatarIndex * 6}s`,
                animationDirection: avatarIndex % 2 === 0 ? "normal" : "reverse",
              }}
            />
          ) : (
            !avatarActuel && profil.prenom[0]
          )}
        </button>
        <div className="min-w-0">
          <p className="truncate text-3xl font-bold tracking-tight">{profil.prenom}</p>
          <p className="donnee mt-1 truncate text-sm text-foreground-muted">
            {activites || "Aucune activité"}
          </p>
        </div>
      </div>

      <Card className="grid grid-cols-3 divide-x divide-border p-0">
        <StatTuile icone={<IconNiveau />} valeur={niveauLabel[profil.niveau]} label="Niveau" />
        <StatTuile
          icone={<IconCalendrier />}
          valeur={`${profil.seancesParSemaine}`}
          label="Séances / sem"
        />
        <StatTuile
          icone={<IconHorloge />}
          valeur={`${profil.dureeSeanceMinutes} min`}
          label="Par séance"
        />
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="shrink-0 text-sm text-foreground-muted">Progression</span>
          <span className="donnee text-right text-sm">
            {profil.qualitesPrioritaires.length === 3
              ? "Les trois qualités"
              : profil.qualitesPrioritaires.map((q) => qualiteLabelLong[q]).join(" + ")}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="shrink-0 text-sm text-foreground-muted">Pondération</span>
          <span className="donnee text-right text-sm">
            {profil.objectifs.course}% course · {profil.objectifs.muscu}% muscu ·{" "}
            {profil.objectifs.explosivite}% explosivité
          </span>
        </div>
        {profil.autresSports.length > 0 && (
          <div className="flex items-start justify-between gap-3">
            <span className="shrink-0 text-sm text-foreground-muted">Autres sports</span>
            <span className="donnee text-right text-sm">
              {profil.autresSports.map((s) => `${s.nom} (${s.frequenceParSemaine}x)`).join(", ")}
            </span>
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <span className="shrink-0 text-sm text-foreground-muted">Matériel</span>
          <span className="donnee text-right text-sm">{profil.materiel.join(", ")}</span>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2" data-pro>
          <GraphiqueEvolution points={pointsEvolution} onSelectionner={setJourSelectionne} />
        </div>
        <button data-pro onClick={() => setPoidsOuvert(true)} className="text-left">
          <Card className="flex h-full flex-col justify-center gap-3 p-3">
            <div>
              <p className="text-xs text-foreground-muted">Poids</p>
              <p className="donnee text-lg font-semibold">
                {profil.poidsKg !== undefined ? `${profil.poidsKg} kg` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-foreground-muted">Fatigue moy.</p>
              <p className="donnee text-lg font-semibold">
                {fatigueMoyenne !== null ? `${fatigueMoyenne.toFixed(1)}/10` : "—"}
              </p>
            </div>
          </Card>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <TuileAction
          icone={<IconActivite />}
          label={stravaConnecte ? (synchroEnCours ? "Synchro…" : "Synchroniser Strava") : "Connecter Strava"}
          onClick={stravaConnecte ? synchroniser : connecter}
          disabled={!stravaCharge || synchroEnCours}
          actif={stravaConnecte}
        />
        <TuileAction
          icone={<IconAbonnement />}
          label="Abonnement"
          onClick={() => (verrouille ? ouvrirPaywall() : setAbonnementOuvert(true))}
        />
        <TuileAction
          icone={<IconModifier />}
          label="Modifier mes infos"
          onClick={() => setModificationOuverte(true)}
        />
      </div>

      {messageStrava && (
        <p className="text-center text-xs text-foreground-muted">{messageStrava}</p>
      )}

      <button
        onClick={seDeconnecter}
        className="mt-auto self-center px-3 py-1.5 text-xs text-foreground-muted"
      >
        Se déconnecter
      </button>

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

      {avatarOuvert && (
        <SelecteurAvatar
          valeur={profil.photoUrl}
          onChoisir={definirPhotoProfil}
          onFermer={() => setAvatarOuvert(false)}
        />
      )}

      {poidsOuvert && (
        <ModifierPoidsModal
          poidsActuel={profil.poidsKg}
          onEnregistrer={async (poids) => {
            await definirPoidsAujourdhui(poids);
            await rafraichirEvolution();
          }}
          onFermer={() => setPoidsOuvert(false)}
        />
      )}

      {jourSelectionne && (
        <DetailJourModal point={jourSelectionne} onFermer={() => setJourSelectionne(null)} />
      )}

      {abonnementOuvert && <AbonnementModal onFermer={() => setAbonnementOuvert(false)} />}
    </div>
  );
}
