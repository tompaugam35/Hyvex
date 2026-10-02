import type { Metadata } from "next";
import Link from "next/link";
import { PageLegale, Section } from "@/components/site/PageLegale";
import { infosLegales as i } from "@/lib/infos-legales";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Hyvex",
};

export default function Confidentialite() {
  return (
    <PageLegale
      titre="Politique de confidentialité"
      intro={
        <>
          Cette page explique quelles données {i.nomService} collecte, pourquoi, avec qui elles
          sont partagées et comment exercer tes droits, conformément au Règlement général sur la
          protection des données (RGPD) et à la loi Informatique et Libertés.
        </>
      }
    >
      <Section titre="1. Responsable du traitement">
        <p>
          Le responsable du traitement est {i.editeur}
          {i.statut ? `, ${i.statut}` : ""}
          {i.adresse ? `, ${i.adresse}` : ""}. Pour toute question sur tes données :{" "}
          <a href={`mailto:${i.email}`}>{i.email}</a>.
        </p>
      </Section>

      <Section titre="2. Les données que nous collectons">
        <ul>
          <li><strong>Compte</strong> : adresse email et mot de passe (stocké chiffré, nous ne le connaissons pas).</li>
          <li><strong>Profil sportif</strong> : prénom, niveau, taille, poids, objectif de poids, qualités prioritaires, performances (temps de course, charges), autres sports pratiqués, disponibilités, matériel, objectifs.</li>
          <li><strong>Entraînement</strong> : programme, séances réalisées, ressentis (RPE), fatigue, difficulté des exercices, notes, distances, durées, dénivelés.</li>
          <li><strong>Nutrition</strong> : photos de repas que tu prends, aliments saisis, calories et macronutriments estimés, objectifs nutritionnels.</li>
          <li><strong>Suivi</strong> : historique du poids et de la fatigue.</li>
          <li><strong>Strava</strong> (seulement si tu le connectes) : jetons de connexion, identifiant Strava, et pour chaque course importée sa date, sa distance et sa durée.</li>
          <li><strong>Abonnement</strong> : offre, statut, dates et identifiants client Stripe. Les données de carte bancaire sont traitées uniquement par Stripe : nous n&apos;y avons jamais accès.</li>
        </ul>
      </Section>

      <Section titre="3. Données de santé">
        <p>
          Ton poids, ta fatigue, tes ressentis d&apos;effort et tes photos de repas peuvent être
          considérés comme des <strong>données de santé</strong>. Nous les traitons uniquement pour
          personnaliser ton programme et ton suivi, et seulement avec ton{" "}
          <strong>consentement explicite</strong>, donné en cochant la case prévue à la création de
          ton compte.
        </p>
        <p>
          Tu peux retirer ce consentement à tout moment en demandant la suppression de ton compte.
          Sans ces données, le service ne peut pas fonctionner.
        </p>
      </Section>

      <Section titre="4. Pourquoi nous utilisons tes données">
        <ul>
          <li><strong>Fournir le service</strong> (créer ton compte, générer et adapter ton programme, analyser tes repas, afficher ton suivi) : exécution du contrat, et consentement explicite pour les données de santé.</li>
          <li><strong>Gérer ton abonnement et la facturation</strong> : exécution du contrat et obligations comptables.</li>
          <li><strong>Importer tes courses Strava</strong> : ton consentement, donné en connectant Strava. Tu peux le retirer en te déconnectant de Strava.</li>
          <li><strong>Sécuriser le service et prévenir les abus</strong> : notre intérêt légitime.</li>
        </ul>
        <p>
          Nous ne vendons jamais tes données, ne faisons pas de publicité et n&apos;utilisons aucun
          outil de suivi publicitaire.
        </p>
      </Section>

      <Section titre="5. Intelligence artificielle">
        <p>
          Pour générer ton programme, adapter tes semaines et estimer tes repas, les informations
          nécessaires (profil sportif, séances et ressentis, photos ou descriptions de repas) sont
          envoyées à <strong>Anthropic</strong>, qui fournit les modèles d&apos;IA Claude, via son
          service professionnel (API). Selon ses conditions commerciales, Anthropic n&apos;utilise
          pas ces données pour entraîner ses modèles. Ton email et ton mot de passe ne lui sont
          jamais transmis.
        </p>
      </Section>

      <Section titre="6. Avec qui tes données sont partagées">
        <p>Uniquement avec les prestataires nécessaires au fonctionnement du service :</p>
        <ul>
          <li><strong>Supabase</strong> : base de données et authentification.</li>
          <li><strong>Vercel</strong> : hébergement du site.</li>
          <li><strong>Anthropic</strong> : intelligence artificielle (voir ci-dessus).</li>
          <li><strong>Stripe</strong> : paiement et facturation.</li>
          <li><strong>Strava</strong> : seulement si tu connectes ton compte Strava.</li>
        </ul>
        <p>
          Certains de ces prestataires sont situés hors de l&apos;Union européenne, notamment aux
          États-Unis. Ces transferts sont encadrés par les garanties prévues par le RGPD : clauses
          contractuelles types de la Commission européenne ou certification au Data Privacy
          Framework.
        </p>
      </Section>

      <Section titre="7. Durée de conservation">
        <ul>
          <li>Tes données de compte, d&apos;entraînement et de nutrition sont conservées tant que ton compte existe.</li>
          <li>Si tu demandes la suppression de ton compte, elles sont effacées sous 30 jours.</li>
          <li>Un compte inactif depuis 3 ans est supprimé, après un email de prévenance.</li>
          <li>Les factures et données de paiement sont conservées 10 ans, conformément aux obligations comptables.</li>
        </ul>
      </Section>

      <Section titre="8. Cookies">
        <p>
          {i.nomService} n&apos;utilise que les cookies et le stockage local strictement nécessaires
          au fonctionnement du service, comme ta session de connexion. Aucun cookie publicitaire ni
          de mesure d&apos;audience n&apos;est déposé : ton consentement n&apos;est donc pas requis
          pour ces cookies.
        </p>
      </Section>

      <Section titre="9. Sécurité">
        <p>
          Tes données sont protégées par des connexions chiffrées (HTTPS), des règles d&apos;accès
          qui empêchent chaque utilisateur de voir les données des autres, et des clés d&apos;accès
          gardées secrètes côté serveur.
        </p>
      </Section>

      <Section titre="10. Tes droits">
        <p>Tu disposes des droits suivants sur tes données :</p>
        <ul>
          <li>accès et copie de tes données (y compris dans un format réutilisable : portabilité) ;</li>
          <li>rectification (directement dans l&apos;application, via « Modifier mes infos ») ;</li>
          <li>effacement de ton compte et de tes données ;</li>
          <li>limitation et opposition au traitement ;</li>
          <li>retrait de ton consentement à tout moment ;</li>
          <li>définir des directives sur le sort de tes données après ton décès.</li>
        </ul>
        <p>
          Pour les exercer, écris à <a href={`mailto:${i.email}`}>{i.email}</a>. Nous répondons
          sous un mois. Si tu estimes que tes
          droits ne sont pas respectés, tu peux déposer une réclamation auprès de la CNIL (
          <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">cnil.fr</a>).
        </p>
      </Section>

      <Section titre="11. Mineurs">
        <p>
          Le service est réservé aux personnes de 16 ans et plus, conformément aux{" "}
          <Link href="/cgv">conditions générales</Link>.
        </p>
      </Section>

      <Section titre="12. Modifications">
        <p>
          Cette politique peut évoluer. En cas de changement important, tu seras prévenu par email
          ou dans l&apos;application.
        </p>
      </Section>
    </PageLegale>
  );
}
