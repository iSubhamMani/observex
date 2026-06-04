"use client";

type Row = { name: string; value: number; secondary?: number };

export function DataTable({
  title,
  primaryLabel,
  secondaryLabel,
  rows,
}: {
  title: string;
  primaryLabel: string;
  secondaryLabel?: string;
  rows: Row[];
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex gap-8 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>{primaryLabel}</span>
          {secondaryLabel && <span>{secondaryLabel}</span>}
        </div>
      </div>
      <ul>
        {rows.map((r) => (
          <li
            key={r.name}
            className="relative flex items-center justify-between px-4 py-2.5 text-sm"
          >
            <div
              className="absolute inset-y-1 left-1 rounded bg-primary/10"
              style={{ width: `calc(${(r.value / max) * 100}% - 8px)` }}
              aria-hidden
            />
            <span className="relative truncate font-mono">{r.name}</span>
            <span className="relative flex gap-8 tabular-nums text-muted-foreground">
              <span className="w-16 text-right text-foreground">
                {r.value.toLocaleString()}
              </span>
              {r.secondary != null && (
                <span className="w-16 text-right">
                  {r.secondary.toLocaleString()}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
