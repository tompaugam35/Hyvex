"use client";

import { useState } from "react";

export function ChampNombre({
  label,
  value,
  onChange,
  unite,
  placeholder,
  decimales,
}: {
  label?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  unite?: string;
  placeholder?: string;
  decimales?: boolean;
}) {
  const [texte, setTexte] = useState(value === undefined ? "" : String(value));
  const motif = decimales ? /^\d*[.,]?\d*$/ : /^\d*$/;

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-semibold text-foreground-muted">{label}</label>}
      <div className="relative">
        <input
          type="text"
          inputMode={decimales ? "decimal" : "numeric"}
          value={texte}
          placeholder={placeholder}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const saisie = e.target.value;
            if (!motif.test(saisie)) return;
            setTexte(saisie);
            if (saisie.trim() === "") {
              onChange(undefined);
              return;
            }
            const nombre = parseFloat(saisie.replace(",", "."));
            onChange(Number.isNaN(nombre) ? undefined : nombre);
          }}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-foreground"
        />
        {unite && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-foreground-muted">
            {unite}
          </span>
        )}
      </div>
    </div>
  );
}
