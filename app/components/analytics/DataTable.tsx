"use client";

import { RiLoader5Line } from "react-icons/ri";

type Row = {
  name: string;
  value: number;
  secondary?: number;
  icon?: React.ReactNode;
};
export function DataTable({
  title,
  primaryLabel,
  secondaryLabel,
  loading,
  rows,
}: {
  title: string;
  primaryLabel: string;
  loading: boolean;
  secondaryLabel?: string;
  rows: Row[];
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="rounded-lg border border-border bg-card/40">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="flex gap-8 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>{primaryLabel}</span>
          {secondaryLabel && <span>{secondaryLabel}</span>}
        </div>
      </div>
      {loading && (
        <div className="py-12">
          <RiLoader5Line className="animate-spin mx-auto text-2xl text-primary/70" />
        </div>
      )}
      <ul>
        {rows.length == 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            No data available for the selected range.
          </li>
        )}
        {rows.map((r) => (
          <li
            key={r.name}
            className="relative flex items-center justify-between px-4 py-2.5 text-sm"
          >
            <div
              className="absolute inset-y-1 left-1 rounded bg-primary/30"
              style={{ width: `calc(${(r.value / max) * 100}% - 8px)` }}
              aria-hidden
            />
            <div className="relative flex items-center gap-2 truncate font-mono z-10">
              {r.icon && (
                <span className="flex-shrink-0 text-muted-foreground/90 select-none">
                  {r.icon}
                </span>
              )}
              <span className="truncate">{r.name}</span>
            </div>
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
