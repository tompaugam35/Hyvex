"use client";

import { createContext, useContext } from "react";

interface Acces {
  verrouille: boolean;
  ouvrirPaywall: () => void;
}

export const AccesContexte = createContext<Acces>({ verrouille: false, ouvrirPaywall: () => {} });

export function useAcces() {
  return useContext(AccesContexte);
}
