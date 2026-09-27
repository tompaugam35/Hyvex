// Galerie d'avatars proposée au choix sur la page profil.
export interface OptionAvatar {
  id: string;
  url: string | null;
  couleur: string;
}

export const AVATARS: OptionAvatar[] = [
  { id: "sphere-1", url: "/avatars/sphere-1.png", couleur: "#5a5a5a" },
  { id: "sphere-2", url: "/avatars/sphere-2.png", couleur: "#5f5f5f" },
  { id: "sphere-3", url: "/avatars/sphere-3.png", couleur: "#4e4e4e" },
  { id: "sphere-4", url: "/avatars/sphere-4.png", couleur: "#3e5264" },
  { id: "sphere-5", url: "/avatars/sphere-5.png", couleur: "#04417a" },
  { id: "sphere-6", url: "/avatars/sphere-6.png", couleur: "#052288" },
  { id: "sphere-7", url: "/avatars/sphere-7.png", couleur: "#3d556c" },
  { id: "sphere-8", url: "/avatars/sphere-8.png", couleur: "#394a5a" },
  { id: "sphere-9", url: "/avatars/sphere-9.png", couleur: "#1d3559" },
  { id: "sphere-10", url: "/avatars/sphere-10.png", couleur: "#006075" },
];
