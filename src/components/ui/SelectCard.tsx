import type { ReactNode } from "react";

export function SelectCard({
  selected,
  onClick,
  disabled,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        selected ? "border-accent bg-accent/10" : "border-border bg-surface"
      }`}
    >
      {children}
    </button>
  );
}
