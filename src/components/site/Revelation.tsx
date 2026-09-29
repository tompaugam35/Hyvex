"use client";

import { useEffect, useRef } from "react";

// Fait apparaître en cascade les éléments marqués `data-revele` quand ils entrent
// à l'écran, et les recache quand ils ressortent par le bas (en remontant).
export function Revelation({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = ref.current?.querySelectorAll<HTMLElement>("[data-revele]");
    if (!elements) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((el) => el.setAttribute("data-visible", ""));
      return;
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        entrees
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              a.boundingClientRect.left - b.boundingClientRect.left
          )
          .forEach((e, i) => {
            (e.target as HTMLElement).style.transitionDelay = `${i * 80}ms`;
            e.target.setAttribute("data-visible", "");
          });
        entrees
          .filter((e) => !e.isIntersecting && e.boundingClientRect.top > 0)
          .forEach((e) => {
            (e.target as HTMLElement).style.transitionDelay = "0ms";
            e.target.removeAttribute("data-visible");
          });
      },
      { threshold: 0.12 }
    );
    elements.forEach((el) => observateur.observe(el));
    return () => observateur.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
