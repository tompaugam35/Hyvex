"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

const TAILLE_MAX_PX = 800;
const QUALITE_JPEG = 0.7;

// Redimensionne/compresse la photo côté client avant envoi (payload plus léger
// pour l'IA et pour le stockage en base) et retourne le base64 brut (sans le
// préfixe data URL) attendu par l'API.
function redimensionner(fichier: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const lecteur = new FileReader();

    lecteur.onload = () => {
      image.onload = () => {
        const echelle = Math.min(1, TAILLE_MAX_PX / Math.max(image.width, image.height));
        const largeur = Math.round(image.width * echelle);
        const hauteur = Math.round(image.height * echelle);

        const canvas = document.createElement("canvas");
        canvas.width = largeur;
        canvas.height = hauteur;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Impossible de traiter l'image"));
          return;
        }
        ctx.drawImage(image, 0, 0, largeur, hauteur);

        const dataUrl = canvas.toDataURL("image/jpeg", QUALITE_JPEG);
        resolve({ base64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
      };
      image.onerror = () => reject(new Error("Photo invalide"));
      image.src = lecteur.result as string;
    };
    lecteur.onerror = () => reject(new Error("Lecture de la photo impossible"));
    lecteur.readAsDataURL(fichier);
  });
}

export function CapturePhoto({
  enCours,
  onPhoto,
}: {
  enCours: boolean;
  onPhoto: (imageBase64: string, mediaType: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [erreurLocale, setErreurLocale] = useState<string | null>(null);

  async function surSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;

    setErreurLocale(null);
    try {
      const { base64, mediaType } = await redimensionner(fichier);
      await onPhoto(base64, mediaType);
    } catch (err) {
      setErreurLocale(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={surSelection}
        className="hidden"
      />
      <Button data-pro onClick={() => inputRef.current?.click()} disabled={enCours} className="w-full">
        {enCours ? "Analyse de ton repas…" : "Prendre une photo de ton assiette"}
      </Button>
      {erreurLocale && <p className="text-xs text-danger">{erreurLocale}</p>}
    </div>
  );
}
