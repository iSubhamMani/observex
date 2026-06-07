"use client";

export function StatTile({
  label,
  value,
  delta,
  active,
  icon,
  onClick,
}: {
  label: string;
  value: string | number | React.ReactNode;
  delta?: string | number | React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-start gap-1 rounded-lg border px-5 py-4 text-left transition-colors ${
        active
          ? "border-primary bg-primary/10"
          : "border-border bg-card/40 hover:border-primary/40"
      }`}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center text-2xl font-semibold tabular-nums">
        {icon && <span className="mr-1.5">{icon}</span>}
        {value}
      </div>
      {delta}
    </button>
  );
}
