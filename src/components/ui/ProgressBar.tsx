export function ProgressBar({
  value,
  colorClassName = "bg-accent",
}: {
  value: number;
  colorClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClassName}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
