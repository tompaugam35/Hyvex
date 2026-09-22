import type { JournalEntree, Qualite } from "@/types";

const couleurParQualite: Record<Qualite, string> = {
  course: "bg-running",
  muscu: "bg-strength",
  explosivite: "bg-power",
};

const NB_JOURS = 30;

// Clé de jour en heure locale (et non UTC, sans quoi les séances du soir
// basculent sur le mauvais jour pour les fuseaux horaires en avance sur UTC).
function cleDate(date: Date) {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

export function GraphiqueMensuel({ entrees }: { entrees: JournalEntree[] }) {
  const aujourdHui = new Date();
  aujourdHui.setHours(0, 0, 0, 0);

  const jours = Array.from({ length: NB_JOURS }, (_, i) => {
    const date = new Date(aujourdHui);
    date.setDate(date.getDate() - (NB_JOURS - 1 - i));
    return date;
  });

  const entreesParJour = new Map<string, JournalEntree[]>();
  for (const entree of entrees) {
    const cle = cleDate(new Date(entree.date));
    const liste = entreesParJour.get(cle);
    if (liste) liste.push(entree);
    else entreesParJour.set(cle, [entree]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-28 items-end gap-[3px]">
        {jours.map((jour) => {
          const cle = cleDate(jour);
          const entreesJour = entreesParJour.get(cle) ?? [];
          return (
            <div key={cle} className="flex h-full flex-1 flex-col-reverse gap-[2px]">
              {entreesJour.map((entree) => (
                <div
                  key={entree.id}
                  className={`w-full rounded-[2px] ${couleurParQualite[entree.qualite]}`}
                  style={{ height: `${100 / entreesJour.length}%` }}
                  title={`${entree.titre} — ${jour.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}`}
                />
              ))}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-foreground-muted">
        <span>
          {jours[0].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </span>
        <span>Aujourd&apos;hui</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-running" /> Course
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-strength" /> Musculation
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-power" /> Explosivité
        </span>
      </div>
    </div>
  );
}
