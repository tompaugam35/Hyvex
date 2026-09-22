export function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-foreground-muted">{label}</span>
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-lg"
        >
          −
        </button>
        <span className="text-lg font-semibold">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}
