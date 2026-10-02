import type { Metadata } from "next";
import Link from "next/link";
import { PageLegale, Section } from "@/components/site/PageLegale";
import { infosLegales as i } from "@/lib/infos-legales";

export const metadata: Metadata = {
  title: "Conditions générales de vente — Hyvex",
};

export default function Cgv() {
  return (
    <PageLegale
      titre="Conditions générales de vente"
      intro={
        <>
          Ces conditions encadrent l&apos;utilisation de {i.nomService} et la souscription à ses
          abonnements. En créant un compte ou en t&apos;abonnant, tu les acceptes. Les informations
          sur l&apos;éditeur figurent dans les <Link href="/mentions-legales">mentions légales</Link>.
        </>
      }
    >
      <Section titre="1. Le service">
        <p>
          {i.nomService} est une application web d&apos;entraînement pour athlètes hybrides. À partir
          des informations que tu renseignes (niveau, objectifs, disponibilités, matériel, ressentis),
          elle te propose chaque semaine un programme de course, de musculation et
          d&apos;explosivité, un suivi de tes séances, un suivi nutritionnel et un récapitulatif
          mensuel.
        </p>
        <p>
          <strong>Les programmes, bilans et estimations nutritionnelles sont générés
          automatiquement par une intelligence artificielle</strong> (modèles Claude
          d&apos;Anthropic). Le « coach » de l&apos;application désigne ce système automatisé, et
          non une personne.
        </p>
        <p>
          La connexion à Strava est facultative : elle permet d&apos;importer automatiquement tes
          courses.
        </p>
      </Section>

      <Section titre="2. Santé et sécurité">
        <p>
          {i.nomService} ne fournit pas d&apos;avis médical et ne remplace ni un médecin, ni un
          kinésithérapeute, ni un diététicien, ni un coach diplômé.{" "}
          <strong>Avant de commencer ou d&apos;intensifier une activité physique, consulte un
          médecin</strong>, en particulier en cas de problème de santé, de blessure, de grossesse
          ou de reprise après une longue pause.
        </p>
        <ul>
          <li>Adapte toujours les séances à ton état du jour et arrête en cas de douleur, de malaise ou de gêne inhabituelle.</li>
          <li>Les charges, allures et volumes proposés sont des suggestions : c&apos;est à toi de juger s&apos;ils te conviennent.</li>
          <li>Les calories et macronutriments calculés à partir d&apos;une photo sont des estimations, qui peuvent être imprécises.</li>
        </ul>
        <p>Tu pratiques les activités proposées sous ta propre responsabilité.</p>
      </Section>

      <Section titre="3. Ton compte">
        <ul>
          <li>Le service est réservé aux personnes de 16 ans et plus. Les mineurs doivent avoir l&apos;accord de leur représentant légal pour s&apos;abonner.</li>
          <li>Tu t&apos;engages à fournir des informations exactes, notamment sur ta santé et ton niveau, car elles servent à adapter ton programme.</li>
          <li>Ton mot de passe est personnel : tu es responsable de ce qui est fait depuis ton compte.</li>
        </ul>
      </Section>

      <Section titre="4. Offres et prix">
        <p>Toutes les offres donnent accès à l&apos;ensemble des fonctionnalités de {i.nomService} :</p>
        <ul>
          <li><strong>Starter pack</strong> : 40 € tous les 3 mois.</li>
          <li><strong>Pro</strong> : 15 € par mois.</li>
        </ul>
        <p>
          Les prix sont indiqués en euros, toutes taxes comprises{i.tva ? ` (${i.tva})` : ""}. Sans abonnement actif,
          l&apos;application reste accessible mais tes données sont masquées et les fonctionnalités
          principales sont bloquées.
        </p>
        <p>
          {i.nomService} peut faire évoluer ses prix. Tout changement de prix d&apos;un abonnement en
          cours te sera annoncé par email au moins 30 jours avant de s&apos;appliquer, et tu pourras
          résilier avant cette date.
        </p>
      </Section>

      <Section titre="5. Paiement">
        <p>
          Le paiement se fait par carte bancaire via Stripe, prestataire de paiement sécurisé.{" "}
          {i.nomService} n&apos;a jamais accès à tes numéros de carte. L&apos;abonnement est payé
          d&apos;avance, au début de chaque période (tous les 3 mois pour le Starter pack, tous les
          mois pour le Pro). Une facture t&apos;est envoyée par email à chaque paiement.
        </p>
        <p>
          En cas d&apos;échec de paiement, Stripe fait plusieurs nouvelles tentatives. Si le
          paiement reste impayé, l&apos;accès complet est suspendu jusqu&apos;à régularisation.
        </p>
      </Section>

      <Section titre="6. Durée, renouvellement et résiliation">
        <ul>
          <li>L&apos;abonnement se renouvelle automatiquement à la fin de chaque période, pour une période identique, tant que tu ne le résilies pas.</li>
          <li><strong>Il est sans engagement</strong> : tu peux le résilier à tout moment depuis l&apos;application (Profil, puis Abonnement, puis « Gérer mon abonnement »), ou en écrivant à {i.email}.</li>
          <li>La résiliation prend effet à la fin de la période déjà payée : tu gardes l&apos;accès complet jusqu&apos;à cette date, et aucun nouveau paiement n&apos;est prélevé.</li>
          <li>La période en cours n&apos;est pas remboursée au prorata, sauf obligation légale ou geste commercial.</li>
        </ul>
      </Section>

      <Section titre="7. Droit de rétractation">
        <p>
          En tant que consommateur, tu disposes en principe d&apos;un délai de 14 jours pour te
          rétracter d&apos;un contrat conclu à distance. Comme {i.nomService} te donne accès
          immédiatement à l&apos;ensemble du service après le paiement,{" "}
          <strong>tu demandes expressément le début immédiat du service et tu reconnais perdre ton
          droit de rétractation</strong> (article L221-28 du Code de la consommation) en cochant la
          case prévue avant le paiement.
        </p>
      </Section>

      <Section titre="8. Utilisation du service">
        <p>Tu t&apos;engages à ne pas :</p>
        <ul>
          <li>tenter de contourner les protections du service, notamment l&apos;accès réservé aux abonnés ;</li>
          <li>revendre, partager ou exploiter commercialement ton accès ou les contenus générés ;</li>
          <li>perturber le fonctionnement de l&apos;application ou l&apos;utiliser de façon abusive.</li>
        </ul>
        <p>
          En cas de manquement grave, {i.nomService} peut suspendre ou supprimer le compte concerné,
          après t&apos;avoir prévenu par email lorsque c&apos;est possible.
        </p>
      </Section>

      <Section titre="9. Responsabilité">
        <p>
          {i.nomService} s&apos;efforce de fournir un service fiable et disponible, sans pouvoir
          garantir une disponibilité permanente ni l&apos;absence d&apos;erreur. Le service est
          soumis à une obligation de moyens : aucun résultat sportif, physique ou de perte de poids
          n&apos;est garanti. {i.nomService} ne peut être tenu responsable d&apos;une blessure ou
          d&apos;un dommage résultant d&apos;une pratique ne respectant pas l&apos;article 2.
        </p>
      </Section>

      <Section titre="10. Propriété intellectuelle">
        <p>
          L&apos;application, son nom, son logo, ses textes et son design appartiennent à leur
          éditeur. Les programmes générés pour toi sont destinés à ton usage personnel.
        </p>
      </Section>

      <Section titre="11. Données personnelles">
        <p>
          Le traitement de tes données, y compris les données de santé, est détaillé dans la{" "}
          <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </Section>

      <Section titre="12. Modification des conditions">
        <p>
          Ces conditions peuvent évoluer. En cas de changement important, tu seras prévenu par
          email ou dans l&apos;application avant son entrée en vigueur.
        </p>
      </Section>

      <Section titre="13. Réclamations, médiation et droit applicable">
        <p>
          Pour toute question ou réclamation, écris à{" "}
          <a href={`mailto:${i.email}`}>{i.email}</a>. Si aucune solution amiable n&apos;est
          trouvée, tu peux recourir gratuitement à un médiateur de la consommation
          {i.mediateur
            ? ` : ${i.mediateur.nom} (${i.mediateur.site}).`
            : ", dont les coordonnées seront indiquées ici prochainement."}
        </p>
        <p>
          Ces conditions sont soumises au droit français. En cas de litige, les tribunaux
          compétents sont ceux prévus par la loi, notamment celui de ton domicile.
        </p>
      </Section>
    </PageLegale>
  );
}
