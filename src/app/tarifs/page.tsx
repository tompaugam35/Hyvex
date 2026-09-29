import type { Metadata } from "next";
import Link from "next/link";
import { Revelation } from "@/components/site/Revelation";
import s from "./tarifs.module.css";

export const metadata: Metadata = {
  title: "Tarifs — Hyvex",
};

const starter = [
  "Tout Hyvex, sans aucune limite",
  "3 mois : le temps d'un vrai cycle de progression",
  "Assez de bilans pour que ton programme te connaisse par cœur",
  "Ton récap du mois, 3 fois, pour voir le chemin parcouru",
  "Le meilleur prix : 5 € d'économie (−11 %)",
];

const pro = [
  "Programme sur mesure : course, muscu et explosivité",
  "Bilan chaque semaine et programme adapté à tes ressentis",
  "Calendrier libre, exportable dans ton agenda",
  "Tes autres sports pris en compte",
  "Courses Strava importées automatiquement",
  "Calories et macros en une photo",
  "Objectifs nutritionnels personnalisés",
  "Suivi du poids et de la fatigue",
  "Historique de toutes tes séances",
  "Récap du mois à partager en story",
];

function Liste({ items }: { items: string[] }) {
  return (
    <ul className={s.liste}>
      {items.map((item) => (
        <li key={item}>
          <span className={s.coche}>✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function Tarifs() {
  return (
    <Revelation className={s.page}>
      <nav className={s.nav} data-revele>
        <Link className={s.logo} href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Accueil" />
        </Link>
        <Link href="/">Accueil</Link>
        <Link className={s.actif} href="/tarifs">
          Tarifs
        </Link>
        <Link href="/connexion">Connexion</Link>
        <Link className={s.bouton} href="/onboarding">
          Commencer
        </Link>
      </nav>

      <main className={s.scene}>
        <h1 className={s.geant} data-revele>
          Tarifs
        </h1>

        <div className={s.cartes}>
          <div className={`${s.carte} ${s.vedette}`} data-revele>
            <span className={s.badge}>★ Le plus utilisé</span>
            <p className={s.plan}>Starter pack</p>
            <p className={s.prix}>
              <span className={s.ancien}>45 €</span>40 €<small>/3 mois</small>
            </p>
            <p className={s.sousPrix}>
              Soit 13,33 €/mois · sans engagement <span className={s.gain}>−5 €</span>
            </p>
            <Liste items={starter} />
            <Link className={s.cta} href="/onboarding">
              Commencer
            </Link>
          </div>

          <div className={s.carte} data-revele>
            <p className={s.plan}>Pro</p>
            <p className={s.prix}>
              15 €<small>/mois</small>
            </p>
            <p className={s.sousPrix}>Sans engagement</p>
            <Liste items={pro} />
            <Link className={s.cta} href="/onboarding">
              Commencer
            </Link>
          </div>
        </div>
      </main>

      <p className={s.note} data-revele>
        Toutes les offres donnent accès à tout Hyvex. Aucun abonnement n&apos;est engageant : tu
        arrêtes quand tu veux. Paiement sécurisé.
      </p>
    </Revelation>
  );
}
