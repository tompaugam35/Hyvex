import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="cascade mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-6 py-12">
      <div className="cascade-skip fond-site-clair" aria-hidden="true" />
      <div />
      <div className="flex flex-col items-center gap-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" width={56} height={56} className="h-14 w-14 rounded-2xl" />
        <div className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-6">
          <h1 className="text-xl font-semibold">Deviens athlète hybride</h1>
          <p className="text-sm text-foreground-muted">
            Course, musculation, explosivité : un seul programme, généré et adapté chaque
            semaine par ton coach.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Link href="/onboarding">
          <Button className="w-full">Commencer</Button>
        </Link>
        <Link href="/connexion">
          <Button variant="ghost" className="w-full">
            J&apos;ai déjà un compte
          </Button>
        </Link>
      </div>
    </div>
  );
}
