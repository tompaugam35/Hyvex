import type { Metadata } from "next";
import Link from "next/link";
import { PageLegale, Section } from "@/components/site/PageLegale";
import { infosLegales as i } from "@/lib/infos-legales";

export const metadata: Metadata = {
  title: "Mentions légales — Hyvex",
};

export default function MentionsLegales() {
  return (
    <PageLegale titre="Mentions légales">
      <Section titre="Éditeur du site">
        <ul>
          <li>{i.editeur}</li>
          {i.statut && <li>{i.statut}</li>}
          {i.siret && <li>SIRET : {i.siret}</li>}
          {i.adresse && <li>Adresse : {i.adresse}</li>}
          <li>
            Email : <a href={`mailto:${i.email}`}>{i.email}</a>
          </li>
          {i.tva && <li>{i.tva}</li>}
        </ul>
        {!(i.statut && i.siret && i.adresse) && (
          <p>Les informations d&apos;immatriculation seront publiées ici très prochainement.</p>
        )}
        <p>Directeur de la publication : {i.directeurPublication}.</p>
      </Section>

      <Section titre="Hébergement">
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
          États-Unis (
          <a href="https://vercel.com" target="_blank" rel="noreferrer">vercel.com</a>).
        </p>
        <p>
          Les données des utilisateurs sont stockées par Supabase Inc. (
          <a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a>).
        </p>
      </Section>

      <Section titre="Propriété intellectuelle">
        <p>
          Le nom {i.nomService}, le logo, les textes, le design et le code du site sont protégés.
          Toute reproduction sans autorisation est interdite.
        </p>
      </Section>

      <Section titre="Données personnelles">
        <p>
          Voir la <Link href="/confidentialite">politique de confidentialité</Link> et les{" "}
          <Link href="/cgv">conditions générales de vente</Link>.
        </p>
      </Section>
    </PageLegale>
  );
}
