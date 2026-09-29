"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { creerClientNavigateur } from "@/lib/supabase/client";
import { JOURS_SEMAINE } from "@/lib/semaine";
import type { ProgrammeSemaine } from "@/types";
import s from "./paywall.module.css";

type Offre = "starter" | "pro";

const nomOffre: Record<Offre, string> = { starter: "le Starter pack", pro: "Pro" };

const listeStarter = [
  "Ton programme course, muscu et explosivité",
  "Un bilan chaque semaine et un programme qui s'adapte à toi",
  "Calories et macros en une photo de ton assiette",
  "Tes courses Strava importées automatiquement",
  "Ton récap du mois à partager en story",
  "3 mois : le temps d'un vrai cycle de progression",
  "Le meilleur prix : 5 € d'économie",
];

const listePro = [
  "Tout Hyvex, sans aucune limite",
  "Programme adapté chaque semaine à tes ressentis",
  "Calories et macros en une photo",
  "Strava, récap du mois, suivi du poids et de la fatigue",
  "Tu arrêtes quand tu veux, en un clic",
];

function Cadenas({ taille }: { taille: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function Liste({ items, discrete }: { items: string[]; discrete?: boolean }) {
  return (
    <ul className={`${s.liste} ${discrete ? s.discrete : ""}`}>
      {items.map((item) => (
        <li key={item}>
          <span className={s.coche}>✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function Paywall({
  prenom,
  programme,
  ouvert,
  onOuvrir,
  onFermer,
}: {
  prenom: string;
  programme: ProgrammeSemaine;
  ouvert: boolean;
  onOuvrir: () => void;
  onFermer: () => void;
}) {
  const router = useRouter();
  const [offre, setOffre] = useState<Offre>("starter");
  const [redirection, setRedirection] = useState(false);
  const [erreur, setErreur] = useState(false);

  const nbSeances = programme.seances.length;
  const premiere = [...programme.seances].sort(
    (a, b) =>
      (a.jour ? JOURS_SEMAINE.indexOf(a.jour as (typeof JOURS_SEMAINE)[number]) : 99) -
      (b.jour ? JOURS_SEMAINE.indexOf(b.jour as (typeof JOURS_SEMAINE)[number]) : 99)
  )[0];

  async function payer() {
    setRedirection(true);
    setErreur(false);
    try {
      const reponse = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offre }),
      });
      const { url } = (await reponse.json()) as { url?: string };
      if (!reponse.ok || !url) throw new Error();
      window.location.href = url;
    } catch {
      setRedirection(false);
      setErreur(true);
    }
  }

  async function seDeconnecter() {
    await creerClientNavigateur().auth.signOut();
    router.push("/");
  }

  return (
    <>
      <div className={`${s.languette} ${ouvert ? s.cachee : ""}`}>
        <button type="button" onClick={onOuvrir}>
          <span className={s.cadenasRond}>
            <Cadenas taille={16} />
          </span>
          <span>
            <b>Débloque ton programme</b>
            <span className={s.petit}>Tout Hyvex dès 13,33 €/mois</span>
          </span>
          <span className={s.chevron} aria-hidden="true">
            ⌃
          </span>
        </button>
      </div>

      <div className={`${s.voile} ${ouvert ? s.voileVisible : ""}`} onClick={onFermer} />

      <div
        className={`${s.feuille} ${ouvert ? s.feuilleOuverte : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Débloquer Hyvex"
        aria-hidden={!ouvert}
      >
        <button type="button" className={s.fermer} onClick={onFermer} aria-label="Fermer">
          ✕
        </button>
        <div className={s.poignee} />
        <div className={s.cascade}>
          <div className={s.entete}>
            <span className={s.etiquette}>
              <Cadenas taille={12} />
              Semaine {programme.numeroSemaine} · prête
            </span>
            <h2 className={s.titre}>Ton programme est prêt, {prenom}</h2>
            <p className={s.sous}>
              <b>
                {nbSeances} séance{nbSeances > 1 ? "s" : ""}
              </b>{" "}
              conçue{nbSeances > 1 ? "s" : ""} pour toi cette semaine
              {premiere ? <>, à commencer par « {premiere.titre} »</> : null}.
            </p>
          </div>

          <div className={s.offres} role="radiogroup" aria-label="Formule">
            <label
              className={`${s.offre} ${s.vedette} ${offre === "starter" ? s.offreChoisie : s.offreEstompee}`}
            >
              <input type="radio" name="offre" checked={offre === "starter"} onChange={() => setOffre("starter")} />
              <div className={s.ligne}>
                <span className={s.rond} />
                <span className={s.nom}>Starter pack</span>
                <span className={s.badge}>★ Le plus utilisé</span>
              </div>
              <p className={s.prix}>
                <span className={s.ancien}>45 €</span>40 €<small>/3 mois</small>
              </p>
              <p className={s.sousPrix}>
                Soit 13,33 €/mois · sans engagement <span className={s.gain}>−5 €</span>
              </p>
              <Liste items={listeStarter} />
            </label>

            <label
              className={`${s.offre} ${s.pro} ${offre === "pro" ? s.offreChoisie : s.offreEstompee}`}
            >
              <input type="radio" name="offre" checked={offre === "pro"} onChange={() => setOffre("pro")} />
              <div className={s.ligne}>
                <span className={s.rond} />
                <span className={s.nom}>Pro</span>
                <p className={s.prix}>
                  15 €<small>/mois</small>
                </p>
              </div>
              <p className={s.sousPrix}>Payé chaque mois · sans engagement</p>
              <Liste items={listePro} discrete />
            </label>
          </div>
        </div>

        <div className={s.bas}>
          <button type="button" className={s.cta} onClick={payer} disabled={redirection}>
            <span>{redirection ? "Ouverture du paiement…" : `Débloquer avec ${nomOffre[offre]}`}</span>
            <span className={s.fleche}>→</span>
          </button>
          {erreur ? (
            <p className={s.bientot}>Le paiement n&apos;a pas pu s&apos;ouvrir. Réessaie dans un instant.</p>
          ) : (
            <p className={s.mention}>
              Annulable à tout moment · paiement sécurisé · <Link href="/tarifs">voir les offres</Link>
            </p>
          )}
          <button type="button" className={s.deconnexion} onClick={seDeconnecter}>
            Se déconnecter
          </button>
        </div>
      </div>
    </>
  );
}
