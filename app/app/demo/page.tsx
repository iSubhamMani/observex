/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { FiCalendar, FiChevronDown, FiChevronLeft } from "react-icons/fi";
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
import { TbBounceLeft, TbClock, TbEye, TbUsers } from "react-icons/tb";
import Link from "next/link";

import {
  demoSeries,
  demoTotals,
  demoTopPages,
  demoReferrers,
  demoCountries,
  demoBrowsers,
  demoDevices,
  demoProject,
  demoUtmCampaigns,
} from "@/lib/demoData";
import DeltaIndicator from "@/components/DeltaIndicator";
import { UtmTabContent } from "@/components/analytics/UtmTabContent";
import { CustomEventsPanel } from "@/components/analytics/CustomEventPanel";
import { SiteHeader } from "@/components/SiteHeader";

// ─── static demo UTM shape – mirrors what UtmTabContent expects ───────────────
const DEMO_UTM = demoUtmCampaigns.map((c) => ({
  name: c.name,
  visitors: c.visitors,
  views: c.views,
}));

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
  )
    return <FiMonitor className="size-4" />;
  if (
    name.includes("mobile") ||
    name.includes("phone") ||
    name.includes("iphone") ||
    name.includes("android")
  )
    return <FiSmartphone className="size-4" />;
  if (name.includes("tablet") || name.includes("ipad"))
    return <FiTablet className="size-4" />;
  if (name.includes("tv")) return <FiTv className="size-4" />;
  return <FiCpu className="size-4" />;
}

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return "0s";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function AnalyticsCard() {
  // ─── Range picker (purely cosmetic in demo mode – no re-fetch needed) ──────
  const [rangeParam, setRangeParam] = useState("last_7_days");
  const [customStart, setCustomStart] = useState<string | null>(null);
  const [customEnd, setCustomEnd] = useState<string | null>(null);

  // ─── Metric toggle ────────────────────────────────────────────────────────
  const [metric, setMetric] = useState<
    "views" | "visitors" | "avgTime" | "bounce"
  >("views");

  // ─── UTM tab toggle ───────────────────────────────────────────────────────
  const [activeUtmTab, setActiveUtmTab] = useState<
    "campaign" | "source" | "medium" | "content" | "term"
  >("campaign");

  // ─── Wire up demo data directly ──────────────────────────────────────────
  const series = demoSeries;
  const topPagesData = demoTopPages;
  const referrersData = demoReferrers;
  const countriesData = demoCountries;
  const browsersData = demoBrowsers;
  const devicesData = demoDevices;
  const totalMetrics = demoTotals;

  const totalViews = series.reduce((s, d) => s + d.views, 0);
  const totalVisitors = totalMetrics.unique_visitors;
  const avgTimeLabel = formatDuration(totalMetrics.average_duration_seconds);
  const bounce = `${totalMetrics.bounce_rate}%`;

  const minDateLimit = "2026-01-01"; // sensible demo floor

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Project Info Card */}
        <Link href={"/"} className="flex items-center gap-1 mb-4 group w-max">
          <FiChevronLeft className="group-hover:-translate-x-0.5 transition" />
          <span>Back</span>
        </Link>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <FiGlobe className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {demoProject.name}
                </h1>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {demoProject.domain}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">ID:</span>
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    {demoProject.id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Analytics Section */}
        <div className="mt-8">
          {/* ── Header row ───────────────────────────────────────────────────── */}
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
                  setRangeParam(r);
                  setCustomStart(s ?? null);
                  setCustomEnd(e ?? null);
                }}
              />
            </div>
          </div>

          {/* ── Stat tiles ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile
              label="Visitors"
              icon={<TbUsers className="size-5" />}
              value={<div>{totalVisitors.toLocaleString()}</div>}
              delta={
                <div className="text-xs sm:text-sm">
                  <DeltaIndicator value={totalMetrics.unique_visitors_delta} />
                </div>
              }
              active={metric === "visitors"}
              onClick={() => setMetric("visitors")}
            />
            <StatTile
              label="Pageviews"
              icon={<TbEye className="size-5" />}
              value={<div>{totalViews.toLocaleString()}</div>}
              delta={
                <div className="text-xs sm:text-sm">
                  <DeltaIndicator value={totalMetrics.total_pageviews_delta} />
                </div>
              }
              active={metric === "views"}
              onClick={() => setMetric("views")}
            />
            <StatTile
              label="Avg. time on site"
              icon={<TbClock className="size-5" />}
              value={<div>{avgTimeLabel}</div>}
              delta={
                <div className="text-xs sm:text-sm">
                  <DeltaIndicator value={totalMetrics.average_duration_delta} />
                </div>
              }
              active={metric === "avgTime"}
              onClick={() => setMetric("avgTime")}
            />
            <StatTile
              label="Bounce rate"
              icon={<TbBounceLeft className="size-5" />}
              value={<div>{bounce}</div>}
              delta={
                <div className="text-xs sm:text-sm">
                  <DeltaIndicator
                    inverseColors
                    value={totalMetrics.bounce_rate_delta}
                  />
                </div>
              }
              active={metric === "bounce"}
              onClick={() => setMetric("bounce")}
            />
          </div>

          {/* ── Chart panel ──────────────────────────────────────────────────── */}
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
            <div className="animate-fade-in">
              {series.length > 0 && <AreaChart data={series} metric={metric} />}
            </div>
          </div>

          {/* ── Data table grid ──────────────────────────────────────────────── */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2 animate-fade-in">
            <DataTable
              title="Top pages"
              primaryLabel="Views"
              loading={false}
              secondaryLabel="Visitors"
              rows={topPagesData.map((p) => ({
                name: p.path,
                value: p.views,
                secondary: p.visitors,
              }))}
            />
            <DataTable
              title="Top referrers"
              primaryLabel="Visitors"
              secondaryLabel="Views"
              loading={false}
              rows={referrersData.map((r) => ({
                name: r.name,
                value: r.visitors,
                secondary: r.views,
              }))}
            />
            <DataTable
              title="Countries"
              primaryLabel="Visitors"
              loading={false}
              rows={countriesData.map((c) => ({
                name: c.name,
                value: c.visitors,
                icon: (
                  <span className="text-sm leading-none antialiased">
                    {getFlagEmoji(c.code)}
                  </span>
                ),
              }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <DataTable
                title="Browsers"
                loading={false}
                primaryLabel="Visitors"
                rows={browsersData.map((b) => ({
                  name: b.name,
                  value: b.visitors,
                  icon: getBrowserIcon(b.name),
                }))}
              />
              <DataTable
                title="Devices"
                primaryLabel="Visitors"
                loading={false}
                rows={devicesData.map((d) => ({
                  name:
                    d.name.slice(0, 1).toUpperCase() +
                    d.name.slice(1).toLowerCase(),
                  value: d.visitors,
                  icon: getDeviceIcon(d.name),
                }))}
              />
            </div>
          </div>

          {/* ── Custom events ────────────────────────────────────────────────── */}
          {/*
        CustomEventsPanel originally fetches by pid + date range.
        In demo mode we pass a static sentinel pid; the panel should be updated
        separately to accept optional demoEvents prop, or you can swap the inner
        fetch with demoCustomEvents directly.
      */}
          <CustomEventsPanel
            pid="demo"
            start={new Date("2026-06-05")}
            end={new Date("2026-06-11")}
          />

          {/* ── UTM panel ────────────────────────────────────────────────────── */}
          <UtmTabContent
            data={DEMO_UTM}
            loading={false}
            activeTab={activeUtmTab}
            onTabChange={setActiveUtmTab}
          />
        </div>
      </main>
    </div>
  );
}

// ─── Range picker (identical to original – no changes needed) ─────────────────
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
                    className="w-full appearance-none bg-muted/20 border border-border text-xs rounded-md px-2.5 py-2 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 outline-none transition-all text-foreground scheme-dark"
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
                    className="w-full appearance-none bg-muted/20 border border-border text-xs rounded-md px-2.5 py-2 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 outline-none transition-all text-foreground scheme-dark"
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
