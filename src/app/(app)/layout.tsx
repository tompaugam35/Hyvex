"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav, Sidebar } from "@/components/layout/NavLinks";
import { useProgramme } from "@/lib/use-programme";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { charge, profil, programme } = useProgramme();
  const router = useRouter();

  useEffect(() => {
    if (charge && (!profil || !programme)) {
      router.replace("/onboarding");
    }
  }, [charge, profil, programme, router]);

  if (!charge || !profil || !programme) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full max-w-6xl mx-auto md:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-0 md:pb-10">{children}</main>
      <BottomNav />
    </div>
  );
}
