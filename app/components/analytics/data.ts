/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// Fallback mock data for when Tinybird API is unavailable
const FALLBACK_SERIES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    date: d.toISOString().slice(0, 10),
    views: Math.floor(200 + Math.random() * 900),
    visitors: Math.floor(100 + Math.random() * 600),
  };
});

const FALLBACK_PAGES = [
  { path: "/", label: "Homepage", views: 1200, visitors: 800 },
  { path: "/pricing", label: "/pricing", views: 600, visitors: 400 },
  { path: "/about", label: "/about", views: 400, visitors: 267 },
  { path: "/blog/launch", label: "/blog/launch", views: 300, visitors: 200 },
  { path: "/docs", label: "/docs", views: 240, visitors: 160 },
];

const FALLBACK_REFERRERS = [
  { name: "google.com", visitors: 1240, views: 1830 },
  { name: "Direct / None", visitors: 980, views: 1410 },
  { name: "twitter.com", visitors: 412, views: 590 },
  { name: "github.com", visitors: 308, views: 420 },
  { name: "news.ycombinator.com", visitors: 211, views: 305 },
];

const FALLBACK_COUNTRIES = [
  { name: "United States", code: "US", visitors: 1820 },
  { name: "United Kingdom", code: "GB", visitors: 612 },
  { name: "Germany", code: "DE", visitors: 510 },
  { name: "France", code: "FR", visitors: 388 },
  { name: "Canada", code: "CA", visitors: 301 },
  { name: "Australia", code: "AU", visitors: 244 },
];

const FALLBACK_BROWSERS = [
  { name: "Chrome", visitors: 2840 },
  { name: "Safari", visitors: 1120 },
  { name: "Firefox", visitors: 410 },
  { name: "Edge", visitors: 220 },
  { name: "Other", visitors: 90 },
];

const FALLBACK_DEVICES = [
  { name: "Desktop", visitors: 3010 },
  { name: "Mobile", visitors: 1580 },
  { name: "Tablet", visitors: 220 },
];

export async function seriesFor(id: string, days = 7) {
  try {
    const response = await fetch(
      `/api/analytics/metrics-by-date?websiteId=${id}&daysBack=${days}`,
    );
    if (!response.ok) throw new Error("Failed to fetch metrics");
    return await response.json();
  } catch (error) {
    console.error("Error fetching series data:", error);
    return FALLBACK_SERIES;
  }
}

// Add this helper module function inside your components/analytics/data.ts folder map
export async function utmStats(
  id: string,
  days = 7,
  type: "source" | "medium" | "campaign" | "term" | "content" = "source",
) {
  try {
    const response = await fetch(
      `/api/analytics/utm?websiteId=${id}&daysBack=${days}&type=${type}&limit=5`,
    );
    if (!response.ok) throw new Error("Failed to fetch custom UTM records");
    return await response.json();
  } catch (error) {
    console.error(`Error loading UTM ${type} tracking state:`, error);
    return []; // Graceful empty fallback list
  }
}

export async function topPages(id: string) {
  try {
    const response = await fetch(
      `/api/analytics/top-pages?websiteId=${id}&daysBack=7&limit=5`,
    );
    if (!response.ok) throw new Error("Failed to fetch top pages");
    const data = await response.json();
    return data.map((p: any) => ({
      ...p,
      label: p.path,
    }));
  } catch (error) {
    console.error("Error fetching top pages:", error);
    return FALLBACK_PAGES;
  }
}

// ──► FIXED: Now accepts website 'id' and includes it in query params ◄──
export async function referrers(id: string) {
  try {
    const response = await fetch(
      `/api/analytics/top-referrers?websiteId=${id}&daysBack=7&limit=5`,
    );
    if (!response.ok) throw new Error("Failed to fetch referrers");
    return await response.json();
  } catch (error) {
    console.error("Error fetching referrers:", error);
    return FALLBACK_REFERRERS;
  }
}

// ──► FIXED: Now accepts website 'id' and includes it in query params ◄──
export async function countries(id: string) {
  try {
    const response = await fetch(
      `/api/analytics/countries?websiteId=${id}&daysBack=7`,
    );
    if (!response.ok) throw new Error("Failed to fetch countries");
    const data = await response.json();
    return data.map((c: any) => ({
      ...c,
      code: c.country.substring(0, 2).toUpperCase(),
      name: c.country,
    }));
  } catch (error) {
    console.error("Error fetching countries:", error);
    return FALLBACK_COUNTRIES;
  }
}

// ──► FIXED: Now accepts website 'id' and includes it in query params ◄──
export async function browsers(id: string) {
  try {
    const response = await fetch(
      `/api/analytics/browsers?websiteId=${id}&daysBack=7`,
    );
    if (!response.ok) throw new Error("Failed to fetch browsers");
    return await response.json();
  } catch (error) {
    console.error("Error fetching browsers:", error);
    return FALLBACK_BROWSERS;
  }
}

// ──► FIXED: Now accepts website 'id' and includes it in query params ◄──
export async function devices(id: string) {
  try {
    const response = await fetch(
      `/api/analytics/devices?websiteId=${id}&daysBack=7`,
    );
    if (!response.ok) throw new Error("Failed to fetch devices");
    return await response.json();
  } catch (error) {
    console.error("Error fetching devices:", error);
    return FALLBACK_DEVICES;
  }
}

export async function getTotalMetrics(websiteId: string, daysBack: number = 7) {
  try {
    const response = await fetch(
      `/api/analytics/total-metrics?websiteId=${websiteId}&daysBack=${daysBack}`,
    );
    if (!response.ok) throw new Error("Failed to fetch total metrics");
    return await response.json();
  } catch (error) {
    console.error("Error fetching total metrics:", error);
    return { unique_visitors: 0, total_pageviews: 0, bounce_rate: 0 };
  }
}
