"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { AreaChart } from "@/components/analytics/AreaChart";
import { StatTile } from "@/components/analytics/StatTile";
import { DataTable } from "@/components/analytics/DataTable";
import {
  browsers,
  countries,
  devices,
  referrers,
  seriesFor,
  topPages,
  getTotalMetrics,
  // ◄ REMOVED: averageDurationSeries import
} from "@/components/analytics/data";
import { useSearchParams, useRouter } from "next/navigation";
import { FiChevronDown, FiShare2 } from "react-icons/fi";
import { BiLineChart } from "react-icons/bi";

const RANGES = [
  { id: "last_24_hours", label: "Last 24 hours", days: 1 },
  { id: "last_7_days", label: "Last 7 days", days: 7 },
  { id: "last_30_days", label: "Last 30 days", days: 30 },
  { id: "last_90_days", label: "Last 90 days", days: 90 },
] as const;

interface AnalyticsCardProps {
  pid: string;
}

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return "0s";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function AnalyticsCard({ pid }: AnalyticsCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = searchParams.get("range") ?? "last_7_days";

  const [metric, setMetric] = useState<
    "views" | "visitors" | "avgTime" | "bounce"
  >("views");

  const [loading, setLoading] = useState(true);

  // Data states for real analytics
  const [series, setSeries] = useState<any[]>([]);
  const [topPagesData, setTopPagesData] = useState<any[]>([]);
  const [referrersData, setReferrersData] = useState<any[]>([]);
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [browsersData, setBrowsersData] = useState<any[]>([]);
  const [devicesData, setDevicesData] = useState<any[]>([]);
  const [totalMetrics, setTotalMetrics] = useState<any>({
    unique_visitors: 0,
    total_pageviews: 0,
    bounce_rate: 0,
    average_duration_seconds: 0,
  });

  // ◄ REMOVED: globalAvgDuration state variable

  const days = RANGES.find((r) => r.id === range)?.days ?? 7;

  // Fetch all analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [
          seriesData,
          topPagesRes,
          referrersRes,
          countriesRes,
          browsersRes,
          devicesRes,
          metricsRes,
        ] = await Promise.all([
          seriesFor(pid, days),
          topPages(pid),
          referrers(pid),
          countries(pid),
          browsers(pid),
          devices(pid),
          getTotalMetrics(pid, days),
        ]);

        const enrichedSeries = seriesData.map((d: any) => ({
          ...d,
          bounce_rate: metricsRes.bounce_rate || 0,
        }));

        setSeries(enrichedSeries);
        setTopPagesData(topPagesRes);
        setReferrersData(referrersRes);
        setCountriesData(countriesRes);
        setBrowsersData(browsersRes);
        setDevicesData(devicesRes);
        setTotalMetrics(metricsRes);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [pid, days]);

  const totalViews = series.reduce((s: number, d: any) => s + d.views, 0);
  const totalVisitors = totalMetrics.unique_visitors || 0;

  const avgTimeLabel = loading
    ? "—"
    : formatDuration(totalMetrics.average_duration_seconds);
  const bounce = `${totalMetrics.bounce_rate || 0}%`;

  return (
    <div className="mt-8">
      {/* Header with range picker */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <p className="text-base md:text-xl font-semibold flex items-center gap-2">
          <span>Analytics</span>
          <BiLineChart className="size-5" />
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <RangePicker
            value={range}
            onChange={(v) => router.push(`/project/${pid}?range=${v}`)}
          />
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent">
            <FiShare2 className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          label="Visitors"
          value={loading ? "—" : totalVisitors.toLocaleString()}
          delta="+12.4% vs prev."
          active={metric === "visitors"}
          onClick={() => setMetric("visitors")}
        />
        <StatTile
          label="Pageviews"
          value={loading ? "—" : totalViews.toLocaleString()}
          delta="+8.2% vs prev."
          active={metric === "views"}
          onClick={() => setMetric("views")}
        />
        <StatTile
          label="Avg. time on site"
          value={avgTimeLabel}
          delta="—"
          active={metric === "avgTime"}
          onClick={() => setMetric("avgTime")}
        />
        <StatTile
          label="Bounce rate"
          value={loading ? "—" : bounce}
          delta="−1.1%"
          active={metric === "bounce"}
          onClick={() => setMetric("bounce")}
        />
      </div>

      {/* Chart */}
      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {metric === "views"
              ? "Pageviews"
              : metric === "visitors"
                ? "Visitors"
                : metric === "avgTime"
                  ? "Avg. Time on Site"
                  : "Bounce Rate"}
          </h3>
        </div>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading chart...
          </div>
        ) : (
          <AreaChart data={series} metric={metric} />
        )}
      </div>

      {/* Tables */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <DataTable
          title="Top pages"
          primaryLabel="Views"
          secondaryLabel="Visitors"
          rows={topPagesData.map((p) => ({
            name: p.path || p.label,
            value: p.views,
            secondary: p.visitors,
          }))}
        />
        <DataTable
          title="Top referrers"
          primaryLabel="Visitors"
          secondaryLabel="Views"
          rows={referrersData.map((r) => ({
            name: r.name,
            value: r.visitors,
            secondary: r.views,
          }))}
        />
        <DataTable
          title="Countries"
          primaryLabel="Visitors"
          rows={countriesData.map((c) => ({
            name: `${c.code || c.country.substring(0, 2).toUpperCase()} · ${
              c.name || c.country
            }`,
            value: c.visitors,
          }))}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <DataTable
            title="Browsers"
            primaryLabel="Visitors"
            rows={browsersData.map((b) => ({
              name: b.name,
              value: b.visitors,
            }))}
          />
          <DataTable
            title="Devices"
            primaryLabel="Visitors"
            rows={devicesData.map((d) => ({
              name: d.name,
              value: d.visitors,
            }))}
          />
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        ObservEx · Privacy-first, cookie-free analytics · Now with real-time
        data
      </p>
    </div>
  );
}

function RangePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = RANGES.find((r) => r.id === value)!;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
      >
        {current.label} <FiChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-44 rounded-md border border-border bg-popover p-1 shadow-lg">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onChange(r.id);
                setOpen(false);
              }}
              className={`block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-accent ${
                r.id === value ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
