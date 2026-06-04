export function HeroChartCard() {
  const rows = [
    { p: "/", people: "54.2k", views: "99.5k" },
    { p: "/observex-analytics", people: "31.8k", views: "44.7k", active: true },
    { p: "/about/contact-us", people: "28.5k", views: "37.4k" },
    { p: "/pricing", people: "1.98k", views: "3.84k" },
    { p: "/best-analytics-ever", people: "874", views: "997" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span>Top pages</span>
        <span className="flex gap-10">
          <span>People</span>
          <span>Views</span>
        </span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {rows.map((r) => (
          <li
            key={r.p}
            className={`flex items-center justify-between rounded-md px-3 py-2${
              r.active
                ? "bg-primary/15 ring-1 ring-primary/40"
                : "hover:bg-muted/40"
            }`}
          >
            <span className="truncate">{r.p}</span>
            <span className="flex gap-10 tabular-nums text-muted-foreground">
              <span className="w-12 text-right">{r.people}</span>
              <span className="w-12 text-right">{r.views}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
