import Link from "next/link";
import { infosLegales } from "@/lib/infos-legales";
import s from "./legal.module.css";

export function PageLegale({
  titre,
  intro,
  children,
}: {
  titre: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={s.page}>
      <header className={s.barre}>
        <Link className={s.marque} href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" />
          hyvex
        </Link>
        <Link className={s.retour} href="/">
          ← Retour à l&apos;accueil
        </Link>
      </header>

      <main className={s.contenu}>
        <h1 className={s.titre}>{titre}</h1>
        <p className={s.maj}>Dernière mise à jour : {infosLegales.miseAJour}</p>
        {intro && <p className={s.intro}>{intro}</p>}
        {children}
      </main>

      <footer className={s.pied}>
        <Link href="/cgv">CGV</Link>
        <Link href="/confidentialite">Confidentialité</Link>
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/tarifs">Tarifs</Link>
      </footer>
    </div>
  );
}

export function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className={s.section}>
      <h2>{titre}</h2>
      {children}
    </section>
  );
}
