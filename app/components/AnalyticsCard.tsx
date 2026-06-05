/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { FiChevronDown, FiShare2 } from "react-icons/fi";
import { BiLineChart } from "react-icons/bi";

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
  const days = RANGES.find((r) => r.id === range)?.days ?? 7;

  const [metric, setMetric] = useState<
    "views" | "visitors" | "avgTime" | "bounce"
  >("views");
  const [activeUtmTab, setActiveUtmTab] = useState<
    "campaign" | "source" | "medium" | "content" | "term"
  >("campaign");

  // ──► QUERY 1: UNIFIED DASHBOARD BUNDLE (Parallel execution managed by TanStack) ◄──
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["analytics", pid, days],
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
        seriesFor(pid, days),
        topPages(pid),
        referrers(pid),
        countries(pid),
        browsers(pid),
        devices(pid),
        getTotalMetrics(pid, days),
      ]);

      // Map matching timeline parameters natively in memory
      const enrichedSeries = series.map((d: any) => ({
        ...d,
        bounce_rate: totals.bounce_rate || 0,
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
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep cache in memory for 5 minutes
  });

  // ──► QUERY 2: DECOUPLED INDEPENDENT UTM PANEL QUERY ◄──
  const { data: utmData = [], isLoading: isUtmLoading } = useQuery({
    queryKey: ["analytics", "utm", pid, days, activeUtmTab],
    queryFn: () => utmStats(pid, days, activeUtmTab),
    staleTime: 30000,
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

  return (
    <div className="mt-8">
      {/* ──► BULLETPROOF INTERIOR TRANSITIONS: CSS Animation Config Injection ◄── */}
      <style>{`
        @keyframes smoothFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: smoothFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

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
          value={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-5 text-primary/70" />
            ) : (
              <div className="animate-fade-in">
                {totalVisitors.toLocaleString()}
              </div>
            )
          }
          delta="+12.4% vs prev."
          active={metric === "visitors"}
          onClick={() => setMetric("visitors")}
        />
        <StatTile
          label="Pageviews"
          value={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-5 text-primary/70" />
            ) : (
              <div className="animate-fade-in">
                {totalViews.toLocaleString()}
              </div>
            )
          }
          delta="+8.2% vs prev."
          active={metric === "views"}
          onClick={() => setMetric("views")}
        />
        <StatTile
          label="Avg. time on site"
          value={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-5 text-primary/70" />
            ) : (
              <div className="animate-fade-in">{avgTimeLabel}</div>
            )
          }
          delta="—"
          active={metric === "avgTime"}
          onClick={() => setMetric("avgTime")}
        />
        <StatTile
          label="Bounce rate"
          value={
            isAnalyticsLoading ? (
              <RiLoader5Line className="animate-spin size-5 text-primary/70" />
            ) : (
              <div className="animate-fade-in">{bounce}</div>
            )
          }
          delta="−1.1%"
          active={metric === "bounce"}
          onClick={() => setMetric("bounce")}
        />
      </div>

      {/* Chart Panel Section */}
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
          rows={countriesData.map(
            (c: { code: any; country: string; name: any; visitors: any }) => ({
              name: `${c.code || c.country.substring(0, 2).toUpperCase()} · ${c.name || c.country}`,
              value: c.visitors,
            }),
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <DataTable
            title="Browsers"
            loading={isAnalyticsLoading}
            primaryLabel="Visitors"
            rows={browsersData.map((b: { name: any; visitors: any }) => ({
              name: b.name,
              value: b.visitors,
            }))}
          />
          <DataTable
            title="Devices"
            primaryLabel="Visitors"
            loading={isAnalyticsLoading}
            rows={devicesData.map((d: { name: any; visitors: any }) => ({
              name: d.name,
              value: d.visitors,
            }))}
          />
        </div>
      </div>

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
