// Galerie d'avatars proposée au choix sur la page profil.
export interface OptionAvatar {
  id: string;
  url: string | null;
  couleur: string;
}

export const AVATARS: OptionAvatar[] = [
  { id: "particle-1", url: "/avatars/particle-1.svg", couleur: "#000000" },
  { id: "particle-2", url: "/avatars/particle-2.svg", couleur: "#000000" },
  { id: "particle-3", url: "/avatars/particle-3.svg", couleur: "#000000" },
  { id: "particle-4", url: "/avatars/particle-4.svg", couleur: "#000000" },
  { id: "particle-5", url: "/avatars/particle-5.svg", couleur: "#000000" },
  { id: "particle-6", url: "/avatars/particle-6.svg", couleur: "#000000" },
  { id: "particle-7", url: "/avatars/particle-7.svg", couleur: "#000000" },
  { id: "particle-8", url: "/avatars/particle-8.svg", couleur: "#000000" },
  { id: "particle-9", url: "/avatars/particle-9.svg", couleur: "#000000" },
  { id: "particle-10", url: "/avatars/particle-10.svg", couleur: "#000000" },
];
