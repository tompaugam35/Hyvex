import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-between px-6 py-12">
      <div />
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-xl font-bold text-accent-foreground">
          H
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Deviens athlète hybride</h1>
          <p className="text-foreground-muted">
            Course, musculation, explosivité : un seul programme, généré et adapté chaque
            semaine par ton coach IA.
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
