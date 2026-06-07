/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { FiCalendar, FiChevronDown, FiShare2 } from "react-icons/fi";
import { BiLineChart } from "react-icons/bi";

import {
  FaChrome,
  FaFirefox,
  FaSafari,
  FaEdge,
  FaOpera,
  FaInternetExplorer,
} from "react-icons/fa";
import {
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiTv,
  FiCpu,
  FiGlobe,
} from "react-icons/fi";

import { AreaChart } from "@/components/analytics/AreaChart";
import { StatTile } from "@/components/analytics/StatTile";
import { DataTable } from "@/components/analytics/DataTable";
import { UtmTabContent } from "./analytics/UtmTabContent";
import {
  browsers,
  countries,
  devices,
  referrers,
  seriesFor,
  topPages,
  getTotalMetrics,
  utmStats,
} from "@/components/analytics/data";
import { RiLoader5Line } from "react-icons/ri";
import { CustomEventsPanel } from "./analytics/CustomEventPanel";
import { TbBounceLeft, TbClock, TbEye, TbUsers } from "react-icons/tb";
import DeltaIndicator from "./DeltaIndicator";

const RANGES = [
  { id: "last_24_hours", label: "Last 24 hours", days: 1 },
  { id: "last_7_days", label: "Last 7 days", days: 7 },
  { id: "last_30_days", label: "Last 30 days", days: 30 },
  { id: "last_90_days", label: "Last 90 days", days: 90 },
  { id: "custom", label: "Custom range", days: undefined },
] as const;

function getFlagEmoji(countryCode: string): string {
  if (
    !countryCode ||
    countryCode.length !== 2 ||
    countryCode.toLowerCase() === "local"
  )
    return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
}

function getBrowserIcon(browserName: string) {
  const name = browserName?.toLowerCase() || "";
  if (name.includes("chrome")) return <FaChrome className="size-4" />;
  if (name.includes("firefox")) return <FaFirefox className="size-4" />;
  if (name.includes("safari")) return <FaSafari className="size-4" />;
  if (name.includes("edge")) return <FaEdge className="size-4" />;
  if (name.includes("opera")) return <FaOpera className="size-4" />;
  if (name.includes("ie") || name.includes("internet explorer"))
    return <FaInternetExplorer className="size-4" />;
  return <FiGlobe className="size-3.5 text-muted-foreground/70" />;
}

function getDeviceIcon(deviceName: string) {
  const name = deviceName?.toLowerCase() || "";
  if (
    name.includes("desktop") ||
    name.includes("windows") ||
    name.includes("mac") ||
    name.includes("linux")
  ) {
    return <FiMonitor className="size-4" />;
  }
  if (
    name.includes("mobile") ||
    name.includes("phone") ||
    name.includes("iphone") ||
    name.includes("android")
  ) {
    return <FiSmartphone className="size-4" />;
  }
  if (name.includes("tablet") || name.includes("ipad")) {
    return <FiTablet className="size-4" />;
  }
  if (name.includes("tv")) {
    return <FiTv className="size-4" />;
  }
  return <FiCpu className="size-4" />;
}

interface AnalyticsCardProps {
  pid: string;
  projectCreatedAt: string;
}

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return "0s";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function AnalyticsCard({
  pid,
  projectCreatedAt,
}: AnalyticsCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rangeParam = searchParams.get("range") ?? "last_7_days";
  const customStart = searchParams.get("start");
  const customEnd = searchParams.get("end");

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();

    if (rangeParam === "custom" && customStart && customEnd) {
      // Set to strict start and end of day boundaries
      const start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
      const endBoundary = new Date(customEnd);
      endBoundary.setHours(23, 59, 59, 999);
      return { startDate: start, endDate: endBoundary };
    }

    const days = RANGES.find((r) => r.id === rangeParam)?.days ?? 7;
    const start = new Date();
    start.setDate(end.getDate() - days);
    return { startDate: start, endDate: end };
  }, [rangeParam, customStart, customEnd]);

  const [metric, setMetric] = useState<
    "views" | "visitors" | "avgTime" | "bounce"
  >("views");
  const [activeUtmTab, setActiveUtmTab] = useState<
    "campaign" | "source" | "medium" | "content" | "term"
  >("campaign");

  // ──► QUERY 1: UNIFIED DASHBOARD BUNDLE (Parallel execution managed by TanStack) ◄──
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: [
      "analytics",
      pid,
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: async () => {
      const [
        series,
        topPagesData,
        referrersData,
        countriesData,
        browsersData,
        devicesData,
        totals,
      ] = await Promise.all([
        seriesFor(pid, startDate, endDate),
        topPages(pid, startDate, endDate),
        referrers(pid, startDate, endDate),
        countries(pid, startDate, endDate),
        browsers(pid, startDate, endDate),
        devices(pid, startDate, endDate),
        getTotalMetrics(pid, startDate, endDate),
      ]);

      // Map matching timeline parameters natively in memory
      const enrichedSeries = series.map((d: any) => ({
        ...d,
        bounce_rate: d.bounce_rate || 0,
      }));

      return {
        enrichedSeries,
        topPagesData,
        referrersData,
        countriesData,
        browsersData,
        devicesData,
        totals,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // ──► QUERY 2: DECOUPLED INDEPENDENT UTM PANEL QUERY ◄──
  const { data: utmData = [], isLoading: isUtmLoading } = useQuery({
    queryKey: [
      "analytics",
      "utm",
      pid,
      startDate.toISOString(),
      endDate.toISOString(),
      activeUtmTab,
    ],
    queryFn: () => utmStats(pid, startDate, endDate, activeUtmTab),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Fallback states structured seamlessly during loading sequences
  const series = analytics?.enrichedSeries ?? [];
  const topPagesData = analytics?.topPagesData ?? [];
  const referrersData = analytics?.referrersData ?? [];
  const countriesData = analytics?.countriesData ?? [];
  const browsersData = analytics?.browsersData ?? [];
  const devicesData = analytics?.devicesData ?? [];
  const totalMetrics = analytics?.totals ?? {
    unique_visitors: 0,
    total_pageviews: 0,
    bounce_rate: 0,
    average_duration_seconds: 0,
  };

  const totalViews = series.reduce((s: number, d: any) => s + d.views, 0);
  const totalVisitors = totalMetrics.unique_visitors || 0;

  const avgTimeLabel = isAnalyticsLoading
    ? "—"
    : formatDuration(totalMetrics.average_duration_seconds);
  const bounce = `${totalMetrics.bounce_rate || 0}%`;

  const minDateLimit = new Date(projectCreatedAt).toISOString().split("T")[0];

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
            value={rangeParam}
            customStart={customStart}
            customEnd={customEnd}
            minDate={minDateLimit}
            onChange={(r, s, e) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("range", r);
              if (r === "custom" && s && e) {
                params.set("start", s);
                params.set("end", e);
              } else {
                params.delete("start");
                params.delete("end");
              }
              router.replace(`/project/${pid}?${params.toString()}`);
            }}
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
          icon={<TbUsers className="size-5" />}
          value={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-5" />
            ) : (
              <div className="animate-fade-in">
                {totalVisitors.toLocaleString()}
              </div>
            )
          }
          delta={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-4 text-muted-foreground/50" />
            ) : (
              <div className="animate-fade-in text-xs sm:text-sm">
                <DeltaIndicator value={totalMetrics.unique_visitors_delta} />
              </div>
            )
          }
          active={metric === "visitors"}
          onClick={() => setMetric("visitors")}
        />
        <StatTile
          label="Pageviews"
          icon={<TbEye className="size-5" />}
          value={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-5 text-primary/70" />
            ) : (
              <div className="animate-fade-in">
                {totalViews.toLocaleString()}
              </div>
            )
          }
          delta={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-4 text-muted-foreground/50" />
            ) : (
              <div className="animate-fade-in text-xs sm:text-sm">
                <DeltaIndicator value={totalMetrics.total_pageviews_delta} />
              </div>
            )
          }
          active={metric === "views"}
          onClick={() => setMetric("views")}
        />
        <StatTile
          label="Avg. time on site"
          icon={<TbClock className="size-5" />}
          value={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-5 text-primary/70" />
            ) : (
              <div className="animate-fade-in">{avgTimeLabel}</div>
            )
          }
          delta={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-4 text-muted-foreground/50" />
            ) : (
              <div className="animate-fade-in text-xs sm:text-sm">
                <DeltaIndicator value={totalMetrics.average_duration_delta} />
              </div>
            )
          }
          active={metric === "avgTime"}
          onClick={() => setMetric("avgTime")}
        />
        <StatTile
          label="Bounce rate"
          icon={<TbBounceLeft className="size-5" />}
          value={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-5 text-primary/70" />
            ) : (
              <div className="animate-fade-in">{bounce}</div>
            )
          }
          delta={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-4 text-muted-foreground/50" />
            ) : (
              <div className="animate-fade-in text-xs sm:text-sm">
                <DeltaIndicator
                  inverseColors
                  value={totalMetrics.bounce_rate_delta}
                />
              </div>
            )
          }
          active={metric === "bounce"}
          onClick={() => setMetric("bounce")}
        />
      </div>

      {/* Chart Panel Section */}
      <div className="mt-4 rounded-lg border border-border bg-card/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {metric === "views" ? (
              <TbEye className="inline-block mb-1 mr-1.5 size-5" />
            ) : metric === "visitors" ? (
              <TbUsers className="inline-block mb-1 mr-1.5 size-5" />
            ) : metric === "avgTime" ? (
              <TbClock className="inline-block mb-1 mr-1.5 size-5" />
            ) : (
              <TbBounceLeft className="inline-block mb-1 mr-1.5 size-5" />
            )}
            <span>
              {metric === "views"
                ? "Pageviews"
                : metric === "visitors"
                  ? "Visitors"
                  : metric === "avgTime"
                    ? "Avg. Time on Site"
                    : "Bounce Rate"}
            </span>
          </h3>
        </div>
        {isAnalyticsLoading ? (
          <div className="h-64 flex items-center gap-2 justify-center text-muted-foreground">
            <RiLoader5Line className="animate-spin size-5 text-primary/70" />{" "}
            <span>Loading chart...</span>
          </div>
        ) : (
          <div className="animate-fade-in">
            {series.length > 0 && <AreaChart data={series} metric={metric} />}
          </div>
        )}
        {!isAnalyticsLoading && series.length === 0 && (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No data available for the selected range.
          </div>
        )}
      </div>

      {/* Data Visualisation Grid Tables */}
      <div
        className={`mt-6 grid gap-4 lg:grid-cols-2 ${!isAnalyticsLoading ? "animate-fade-in" : ""}`}
      >
        <DataTable
          title="Top pages"
          primaryLabel="Views"
          loading={isAnalyticsLoading}
          secondaryLabel="Visitors"
          rows={topPagesData.map(
            (p: { path: any; label: any; views: any; visitors: any }) => ({
              name: p.path || p.label,
              value: p.views,
              secondary: p.visitors,
            }),
          )}
        />
        <DataTable
          title="Top referrers"
          primaryLabel="Visitors"
          secondaryLabel="Views"
          loading={isAnalyticsLoading}
          rows={referrersData.map(
            (r: { name: any; visitors: any; views: any }) => ({
              name: r.name,
              value: r.visitors,
              secondary: r.views,
            }),
          )}
        />
        <DataTable
          title="Countries"
          primaryLabel="Visitors"
          loading={isAnalyticsLoading}
          rows={countriesData.map((c: any) => {
            const countryCode = c.code || "";
            return {
              name: c.name || c.country,
              value: c.visitors,
              icon: (
                <span className="text-sm leading-none antialiased">
                  {getFlagEmoji(countryCode)}
                </span>
              ),
            };
          })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {/* ──► DYNAMICALLY MAPPED BROWSERS WITH BRAND GLYPHS ◄── */}
          <DataTable
            title="Browsers"
            loading={isAnalyticsLoading}
            primaryLabel="Visitors"
            rows={browsersData.map((b: any) => ({
              name: b.name,
              value: b.visitors,
              icon: getBrowserIcon(b.name),
            }))}
          />
          {/* ──► DYNAMICALLY MAPPED DEVICES WITH HARDWARE GLYPHS ◄── */}
          <DataTable
            title="Devices"
            primaryLabel="Visitors"
            loading={isAnalyticsLoading}
            rows={devicesData.map((d: any) => ({
              name:
                d.name.slice(0, 1).toUpperCase() +
                d.name.slice(1).toLowerCase(), // Capitalize first letter
              value: d.visitors,
              icon: getDeviceIcon(d.name),
            }))}
          />
        </div>
      </div>

      <CustomEventsPanel pid={pid} start={startDate} end={endDate} />

      {/* Dynamic Minimalist UTM Header Row Integrated Panel */}
      <UtmTabContent
        data={utmData}
        loading={isUtmLoading}
        activeTab={activeUtmTab}
        onTabChange={setActiveUtmTab}
      />

      <p className="mt-8 text-center text-xs text-muted-foreground">
        ObservEx · Privacy-first, cookie-free analytics · Now with real-time
        data
      </p>
    </div>
  );
}

function RangePicker({
  value,
  customStart,
  customEnd,
  minDate,
  onChange,
}: {
  value: string;
  customStart?: string | null;
  customEnd?: string | null;
  minDate: string;
  onChange: (v: string, s?: string, e?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [sDate, setSDate] = useState(customStart || "");
  const [eDate, setEDate] = useState(customEnd || "");

  // Determine button label
  let currentLabel =
    RANGES.find((r) => r.id === value)?.label || "Select range";
  if (value === "custom" && customStart && customEnd) {
    const sStr = new Date(customStart).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const eStr = new Date(customEnd).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    currentLabel = `${sStr} - ${eStr}`;
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card/50 px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <FiCalendar className="text-muted-foreground" />
        {currentLabel}
        <FiChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 flex w-80 flex-col gap-4 rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-xl animate-fade-in origin-top-right">
            {/* Standard Presets */}
            <div className="flex flex-col gap-1 border-b border-border/60 pb-4">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onChange(r.id);
                    setOpen(false);
                  }}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    r.id === value && value !== "custom"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Custom Range Configuration */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase px-1">
                Custom Range
              </span>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[10px] text-muted-foreground ml-1 uppercase">
                    Start
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    max={eDate || today}
                    value={sDate}
                    onChange={(e) => setSDate(e.target.value)}
                    className="w-full appearance-none bg-muted/20 border border-border text-xs rounded-md px-2.5 py-2 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 outline-none transition-all text-foreground [color-scheme:dark]"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[10px] text-muted-foreground ml-1 uppercase">
                    End
                  </label>
                  <input
                    type="date"
                    min={sDate || minDate}
                    max={today}
                    value={eDate}
                    onChange={(e) => setEDate(e.target.value)}
                    className="w-full appearance-none bg-muted/20 border border-border text-xs rounded-md px-2.5 py-2 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 outline-none transition-all text-foreground [color-scheme:dark]"
                  />
                </div>
              </div>
              <button
                disabled={!sDate || !eDate}
                onClick={() => {
                  onChange("custom", sDate, eDate);
                  setOpen(false);
                }}
                className="mt-1 w-full rounded-md bg-primary py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Custom Range
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
