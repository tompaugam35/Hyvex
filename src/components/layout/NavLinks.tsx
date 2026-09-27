"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navItems = [
  { href: "/dashboard", label: "Accueil", icon: "home" },
  { href: "/historique", label: "Historique", icon: "chart" },
  { href: "/calories", label: "Calories", icon: "flame" },
  { href: "/profil", label: "Profil", icon: "user" },
] as const;

function Icon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "var(--accent-foreground)" : "currentColor";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10v9a1 1 0 0 0 1 1H9.5a1 1 0 0 0 1-1v-4.5h3V19a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1v-9" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 20V10" />
          <path d="M12 20V4" />
          <path d="M20 20v-7" />
        </svg>
      );
    case "flame":
      return (
        <svg {...common}>
          <path d="M12 3c1 3-2 4-2 7a3 3 0 0 0 6 0c1.5 1.5 2 3.5 2 5a6 6 0 1 1-12 0c0-3 1.5-4.5 3-6.5C10 6.5 11 5 12 3Z" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </svg>
      );
    default:
      return null;
  }
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur supports-backdrop-blur:bg-surface/80 md:hidden">
      <ul className="flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    active ? "bg-accent" : "text-foreground-muted"
                  }`}
                >
                  <Icon name={item.icon} active={active} />
                </span>
                <span className={active ? "text-foreground" : "text-foreground-muted"}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:gap-1 md:border-r md:border-border md:p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg" />
        <span className="text-lg font-semibold">Hyvex</span>
      </div>
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
              active
                ? "bg-surface-muted text-foreground"
                : "text-foreground-muted hover:bg-surface-muted"
            }`}
          >
            <Icon name={item.icon} active={false} />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
