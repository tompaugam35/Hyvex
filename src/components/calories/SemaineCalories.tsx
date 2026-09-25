import { joursDeLaSemaineEnCours, estAujourdHui } from "@/lib/semaine";
import { cn } from "@/lib/utils";

function cleJour(date: Date) {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

// Taille normale et taille (un peu plus grande) du jour en cours, pour repérer
// immédiatement où on en est dans la semaine.
const TAILLE_NORMALE = 40;
const TAILLE_AUJOURDHUI = 52;
const EPAISSEUR_TRAIT = 3;

export function SemaineCalories({
  caloriesParJour,
  objectifCalories,
}: {
  caloriesParJour: Map<string, number>;
  objectifCalories?: number;
}) {
  const jours = joursDeLaSemaineEnCours();

  return (
    <div className="flex items-center justify-between gap-1">
      {jours.map(({ nom, date }) => {
        const calories = caloriesParJour.get(cleJour(date)) ?? 0;
        // Reste visible pour les jours passés : le pourcentage dépend uniquement des
        // calories réellement enregistrées ce jour-là, jamais réinitialisé.
        const pourcentage = objectifCalories ? Math.min(1, calories / objectifCalories) : 0;
        const aujourdhui = estAujourdHui(date);

        const taille = aujourdhui ? TAILLE_AUJOURDHUI : TAILLE_NORMALE;
        const rayon = taille / 2 - EPAISSEUR_TRAIT;
        const circonference = 2 * Math.PI * rayon;
        const decalage = circonference * (1 - pourcentage);

        return (
          <div key={nom} className="flex flex-1 justify-center">
            <div
              className="relative flex items-center justify-center"
              style={{ height: taille, width: taille }}
            >
              <svg
                viewBox={`0 0 ${taille} ${taille}`}
                className="absolute inset-0 h-full w-full -rotate-90"
              >
                <circle
                  cx={taille / 2}
                  cy={taille / 2}
                  r={rayon}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth={EPAISSEUR_TRAIT}
                />
                {pourcentage > 0 && (
                  <circle
                    cx={taille / 2}
                    cy={taille / 2}
                    r={rayon}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={EPAISSEUR_TRAIT}
                    strokeLinecap="round"
                    strokeDasharray={circonference}
                    strokeDashoffset={decalage}
                  />
                )}
              </svg>
              <span
                className={cn(
                  "font-semibold",
                  aujourdhui ? "text-base text-foreground" : "text-sm text-foreground-muted"
                )}
              >
                {date.getDate()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
