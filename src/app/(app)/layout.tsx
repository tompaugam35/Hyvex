import { BottomNav, Sidebar } from "@/components/layout/NavLinks";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full max-w-6xl mx-auto md:gap-6">
      <Sidebar />
      <main className="flex-1 px-4 pb-24 pt-6 md:px-0 md:pb-10">{children}</main>
      <BottomNav />
    </div>
  );
}
