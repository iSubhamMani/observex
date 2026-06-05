"use client";

export function StatTile({
  label,
  value,
  delta,
  active,
  onClick,
}: {
  label: string;
  value: string | number | React.ReactNode;
  delta?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-start gap-1 rounded-lg border px-5 py-4 text-left transition-colors ${
        active
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      {delta && <span className="text-xs text-muted-foreground">{delta}</span>}
    </button>
  );
}
