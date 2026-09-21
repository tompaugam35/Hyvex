import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground hover:opacity-90",
  secondary: "bg-surface-muted text-foreground hover:bg-border",
  ghost: "bg-transparent text-foreground hover:bg-surface-muted",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
