import Image from "next/image";
import Link from "next/link";
import { Revelation } from "@/components/site/Revelation";
import s from "./accueil.module.css";

const ecrans = [
  { src: "/accueil/calendrier.png", alt: "Calendrier de la semaine dans Hyvex", titre: "Ton calendrier", texte: "Tu places tes séances quand tu veux." },
  { src: "/accueil/calories.png", alt: "Tracker de calories dans Hyvex", titre: "Tes calories", texte: "Une photo de ton assiette suffit." },
  { src: "/accueil/bilan-mensuel.png", alt: "Récap mensuel dans Hyvex", titre: "Ton récap du mois", texte: "À partager en story." },
];

const etapes = [
  { titre: "Réponds au questionnaire", texte: "Ton niveau, tes objectifs, tes disponibilités et ton matériel." },
  { titre: "Reçois ton programme", texte: "Course, muscu et explosivité équilibrées pour ta semaine." },
  { titre: "Progresse chaque semaine", texte: "Tu fais ton bilan, ton coach ajuste charges, volumes et allures." },
];

const questions = [
  { q: "Je débute ou je n'ai pas de salle ?", r: "Alors c'est fait pour toi. On part de là où tu en es, avec ce que tu as sous la main, même si c'est juste ton poids du corps." },
  { q: "Combien de temps ça me prend ?", r: "C'est toi qui décides : 1 à 14 séances de 30 à 90 min, quand ça t'arrange, dans ton agenda en un clic. Ton planning bouge ? Tu modifies." },
  { q: "Comment le programme s'adapte ?", r: "Chaque semaine, tu racontes comment ça s'est passé. Ton coach ajuste charges, volumes et allures, et allège si tu as raté une séance." },
  { q: "Autres sports et Strava ?", r: "Foot le mardi, padel le week-end ? On le prend en compte pour que tu ne sois jamais cramé. Et tes courses Strava arrivent toutes seules." },
  { q: "Et l'alimentation ?", r: "Pas besoin de tout peser : prends ton assiette en photo et tu vois tout de suite où tu en es de tes calories et macros." },
  { q: "Sur quels appareils ?", r: "Sur ton téléphone comme sur ton ordi. Tu peux même l'ajouter à ton écran d'accueil comme une vraie app, sans rien télécharger." },
];

function BoutonQuestionnaire() {
  return (
    <Link className={s.cta} href="/onboarding">
      Commencer le questionnaire <span className={s.fleche}>→</span>
    </Link>
  );
}

export default function Accueil() {
  return (
    <Revelation className={s.page}>
      <header className={s.hero}>
        <div className={s.photo} aria-hidden="true" />
        <div className={s.voile} aria-hidden="true" />

        <div className={s.barre} data-revele>
          <Link className={s.marque} href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" />
            hyvex
          </Link>
          <nav className={s.nav}>
            <Link className={s.lien} href="/connexion">
              Connexion
            </Link>
            <Link className={s.pill} href="/tarifs">
              Tarifs
            </Link>
          </nav>
        </div>

        <div className={s.titreBloc}>
          <h1 className={s.titre} data-revele>
            Deviens
            <br />
            hybride.
          </h1>
          <p className={s.sousTitre} data-revele>
            Course, musculation, explosivité. Un seul programme, créé pour toi et ajusté chaque
            semaine par ton coach.
          </p>
        </div>

        <div className={s.ctaZone} data-revele>
          <BoutonQuestionnaire />
          <p className={s.mention}>2 minutes · sans engagement</p>
        </div>
      </header>

      <section className={s.section}>
        <p className={s.num} data-revele>.01</p>
        <h2 className={s.h2} data-revele>Tout ton entraînement, au même endroit.</h2>
        <p className={s.intro} data-revele>
          Ton calendrier, tes calories et ton récap du mois. Ton coach adapte le reste.
        </p>
        <div className={s.ecrans}>
          {ecrans.map((e) => (
            <div key={e.src} className={s.ecran} data-revele>
              <Image className={s.capture} src={e.src} alt={e.alt} width={1125} height={2436} sizes="(min-width: 900px) 280px, 240px" />
              <p className={s.legende}>
                <b>{e.titre}</b>
                {e.texte}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <p className={s.num} data-revele>.02</p>
        <h2 className={s.h2} data-revele>Comment ça marche</h2>
        <div className={s.etapes}>
          {etapes.map((e, i) => (
            <div key={e.titre} className={s.etape} data-revele>
              <div className={s.numero}>{i + 1}</div>
              <div>
                <h3>{e.titre}</h3>
                <p>{e.texte}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <p className={s.num} data-revele>.03</p>
        <h2 className={s.h2} data-revele>Questions fréquentes</h2>
        <div className={s.faq}>
          {questions.map((q, i) => (
            <details key={q.q} open={i === 0} data-revele>
              <summary>{q.q}</summary>
              <p>{q.r}</p>
            </details>
          ))}
        </div>
      </section>

      <div className={s.final}>
        <div className={s.photo} aria-hidden="true" />
        <p className={s.num} data-revele>Prêt ?</p>
        <h2 className={s.h2} data-revele>Ta première semaine t&apos;attend.</h2>
        <div data-revele>
          <BoutonQuestionnaire />
        </div>
      </div>

      <footer className={s.pied}>
        <span data-revele>© 2026 Hyvex</span>
        <span data-revele>
          <Link href="/tarifs">Tarifs</Link> · <Link href="/connexion">Connexion</Link> ·{" "}
          <Link href="/cgv">CGV</Link> · <Link href="/confidentialite">Confidentialité</Link> ·{" "}
          <Link href="/mentions-legales">Mentions légales</Link>
        </span>
      </footer>
    </Revelation>
  );
}
