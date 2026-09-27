import type { Seance } from "@/types";
import { joursDeLaSemaineEnCours } from "./semaine";

const intensiteLabel: Record<string, string> = {
  faible: "faible",
  moderee: "modérée",
  elevee: "élevée",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Format iCalendar "YYYYMMDD" (date seule, pour les événements sur la journée entière).
function formaterDate(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

// Format iCalendar "YYYYMMDDTHHMMSS" en heure locale flottante (sans "Z"), pour que
// chaque agenda l'interprète dans son propre fuseau plutôt qu'en UTC.
function formaterDateHeure(date: Date) {
  return `${formaterDate(date)}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function formaterHorodatageUTC(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(
    date.getUTCHours()
  )}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

// Échappe les caractères spéciaux du format iCalendar (RFC 5545).
function echapper(texte: string) {
  return texte.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

function ajouterJours(date: Date, jours: number) {
  const copie = new Date(date);
  copie.setDate(copie.getDate() + jours);
  return copie;
}

// Génère un fichier .ics (une entrée VEVENT par séance placée sur un jour) que
// l'app Calendrier (iOS) ou Google Agenda (Android) sait importer directement.
export function genererIcsSemaine(seances: Seance[]): string {
  const dateParJour = new Map<string, Date>(
    joursDeLaSemaineEnCours().map((j) => [j.nom, j.date])
  );
  const horodatage = formaterHorodatageUTC(new Date());

  const evenements = seances
    .filter((s) => s.jour !== null)
    .map((seance) => {
      const jourDate = dateParJour.get(seance.jour as string);
      if (!jourDate) return null;

      const description = [
        `${seance.dureeEstimeeMinutes} min`,
        seance.intensite && `intensité ${intensiteLabel[seance.intensite]}`,
      ]
        .filter(Boolean)
        .join(" · ");

      const lignes = ["BEGIN:VEVENT", `UID:${seance.id}@hyvex-app`, `DTSTAMP:${horodatage}`];

      if (seance.heure) {
        const [h, m] = seance.heure.split(":").map(Number);
        const debut = new Date(jourDate);
        debut.setHours(h, m, 0, 0);
        const fin = new Date(debut.getTime() + seance.dureeEstimeeMinutes * 60000);
        lignes.push(`DTSTART:${formaterDateHeure(debut)}`, `DTEND:${formaterDateHeure(fin)}`);
      } else {
        lignes.push(
          `DTSTART;VALUE=DATE:${formaterDate(jourDate)}`,
          `DTEND;VALUE=DATE:${formaterDate(ajouterJours(jourDate, 1))}`
        );
      }

      lignes.push(
        `SUMMARY:${echapper(seance.titre)}`,
        `DESCRIPTION:${echapper(description)}`,
        "END:VEVENT"
      );

      return lignes.join("\r\n");
    })
    .filter((e): e is string => e !== null);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hyvex//FR",
    "CALSCALE:GREGORIAN",
    ...evenements,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function telechargerIcs(contenu: string, nomFichier: string) {
  const blob = new Blob([contenu], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}
