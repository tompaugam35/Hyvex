"use client";

import { useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { Button } from "@/components/ui/Button";
import type { BilanMensuel } from "@/types";

const labelQualite = { course: "course", muscu: "muscu", explosivite: "explosivité" } as const;
const couleurQualite = { course: "#4da3ff", muscu: "#ff6b4a", explosivite: "#c6ff3d" } as const;

function formaterDistance(metres: number) {
  return `${(metres / 1000).toFixed(1).replace(".", ",")} km`;
}

function formaterDuree(secondes: number) {
  const heures = Math.floor(secondes / 3600);
  const minutes = Math.round((secondes % 3600) / 60);
  return `${heures}h${String(minutes).padStart(2, "0")}`;
}

function formaterAllure(secondesParKm: number) {
  const min = Math.floor(secondesParKm / 60);
  const sec = Math.round(secondesParKm % 60);
  return `${min}:${String(sec).padStart(2, "0")}/km`;
}

export function BilanMensuelModal({ bilan, onFermer }: { bilan: BilanMensuel; onFermer: () => void }) {
  const carteRef = useRef<HTMLDivElement>(null);
  const [partageEnCours, setPartageEnCours] = useState(false);

  const maxQualite = Math.max(1, ...Object.values(bilan.parQualite));

  async function partager() {
    if (!carteRef.current) return;
    setPartageEnCours(true);
    try {
      const blob = await toBlob(carteRef.current, { pixelRatio: 4 });
      if (!blob) return;
      const fichier = new File([blob], `hybrid-bilan-${bilan.mois}.png`, { type: "image/png" });

      if (navigator.canShare?.({ files: [fichier] })) {
        await navigator.share({ files: [fichier], title: `Bilan ${bilan.libelleMois}` });
        return;
      }

      const url = URL.createObjectURL(blob);
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = fichier.name;
      document.body.appendChild(lien);
      lien.click();
      document.body.removeChild(lien);
      URL.revokeObjectURL(url);
    } catch (erreur) {
      if (erreur instanceof Error && erreur.name === "AbortError") return;
    } finally {
      setPartageEnCours(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-t-3xl bg-background p-6 sm:rounded-3xl">
        <div className="flex justify-center">
          <div
            ref={carteRef}
            style={{
              width: 270,
              height: 480,
              borderRadius: 22,
              background: "#0b0c0e",
              position: "relative",
              overflow: "hidden",
              padding: "22px 18px",
              color: "#f4f5f3",
              fontFamily: "var(--font-sans)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -50,
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "rgba(77,163,255,0.14)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 60,
                left: -60,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "rgba(198,255,61,0.10)",
              }}
            />

            <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: "#c6ff3d" }} />
                <span style={{ fontSize: 11, letterSpacing: "0.06em", color: "#9a9ca3" }}>hybrid</span>
              </div>

              {bilan.meilleurMoisAnnee && (
                <div
                  style={{
                    marginTop: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "rgba(198,255,61,0.12)",
                    borderRadius: 20,
                    padding: "4px 9px",
                    width: "fit-content",
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 500, color: "#c6ff3d" }}>
                    meilleur mois de l&apos;année
                  </span>
                </div>
              )}

              <div style={{ marginTop: 12, fontSize: 22, fontWeight: 500, lineHeight: 1.1, textTransform: "capitalize" }}>
                {bilan.libelleMois.split(" ")[0]}
              </div>
              <div style={{ fontSize: 11, color: "#9a9ca3", marginTop: 2 }}>
                le bilan de {bilan.prenom}
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                  <span style={{ fontSize: 46, fontWeight: 500, lineHeight: 1 }}>{bilan.nbSeances}</span>
                  <span style={{ fontSize: 11, color: "#9a9ca3" }}>
                    séances
                    <br />
                    complétées
                  </span>
                </div>
                <div style={{ marginTop: 8, height: 5, borderRadius: 3, background: "#1e2126", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(100, bilan.tauxCompletion)}%`,
                      height: "100%",
                      background: "#c6ff3d",
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: "#9a9ca3", marginTop: 3 }}>
                  {bilan.tauxCompletion}% des séances prévues
                  {bilan.deltaVsMoisPrecedent !== 0 &&
                    ` · ${bilan.deltaVsMoisPrecedent > 0 ? "+" : ""}${bilan.deltaVsMoisPrecedent} vs le mois dernier`}
                </div>
              </div>

              <div style={{ marginTop: 13, display: "flex", flexDirection: "column", gap: 5 }}>
                {(Object.keys(bilan.parQualite) as (keyof typeof bilan.parQualite)[]).map((q) => (
                  <div key={q} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 10, color: "#9a9ca3", width: 58 }}>{labelQualite[q]}</span>
                    <div style={{ flex: 1, height: 7, borderRadius: 4, background: "#1e2126", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${(bilan.parQualite[q] / maxQualite) * 100}%`,
                          height: "100%",
                          background: couleurQualite[q],
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 500, width: 14, textAlign: "right" }}>
                      {bilan.parQualite[q]}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 13, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                <StatBlock label="distance" valeur={formaterDistance(bilan.distanceTotaleMetres)} />
                <StatBlock label="dénivelé +" valeur={`${Math.round(bilan.deniveleTotalMetres)} m`} />
                <StatBlock label="temps total" valeur={formaterDuree(bilan.dureeTotaleSecondes)} />
                <StatBlock
                  label="allure moy."
                  valeur={
                    bilan.allureMoyenneSecondesParKm ? formaterAllure(bilan.allureMoyenneSecondesParKm) : "—"
                  }
                />
              </div>

              {bilan.plusLongueSortieMetres !== null && (
                <div
                  style={{
                    marginTop: 7,
                    background: "#16181c",
                    borderRadius: 12,
                    padding: "9px 11px",
                  }}
                >
                  <div style={{ fontSize: 9, color: "#9a9ca3" }}>record du mois</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 1 }}>
                    sortie de {formaterDistance(bilan.plusLongueSortieMetres)}
                  </div>
                </div>
              )}

              <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {bilan.semainesTotal > 0 ? (
                  <span style={{ fontSize: 9, color: "#9a9ca3" }}>
                    {bilan.semainesReussies} semaine{bilan.semainesReussies > 1 ? "s" : ""} sur{" "}
                    {bilan.semainesTotal} réussie{bilan.semainesReussies > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span />
                )}
                <span style={{ fontSize: 10, fontWeight: 500 }}>hybrid.app</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={partager} disabled={partageEnCours} className="w-full">
            {partageEnCours ? "Préparation…" : "Partager en story"}
          </Button>
          <Button variant="ghost" onClick={onFermer} className="w-full">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div style={{ background: "#16181c", borderRadius: 12, padding: "9px 11px" }}>
      <div style={{ fontSize: 9, color: "#9a9ca3" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, marginTop: 1 }}>{valeur}</div>
    </div>
  );
}
