// Page temporaire de prévisualisation - à supprimer après validation.
export default function PreviewChargementPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background">
      <p className="text-xs text-foreground-muted">
        Sur le fond réel de l&apos;appli (presque noir)
      </p>
      <div className="flex items-end gap-10">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-foreground-muted">64px</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/scratch-preview/loading-cutout.webp" alt="" className="h-16 w-16" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-foreground-muted">112px</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/scratch-preview/loading-cutout.webp" alt="" className="h-28 w-28" />
        </div>
      </div>

      <p className="mt-6 text-xs text-foreground-muted">
        Sur un fond de couleur (pour bien voir qu&apos;il n&apos;y a plus de carré)
      </p>
      <div className="flex items-center justify-center rounded-2xl bg-[#14508a] p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/scratch-preview/loading-cutout.webp" alt="" className="h-28 w-28" />
      </div>
    </div>
  );
}
