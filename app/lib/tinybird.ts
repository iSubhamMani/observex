/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from "react";

const TINYBIRD_API =
  process.env.NEXT_PUBLIC_TINYBIRD_API || "https://api.us-east-1.tinybird.co";
const TINYBIRD_TOKEN = process.env.TINYBIRD_READ_TOKEN;

export interface MetricsByDate {
  date: string;
  views: number;
  visitors: number;
  avgTime: number;
}

export interface TopPage {
  path: string;
  views: number;
  visitors: number;
}

export interface TopReferrer {
  name: string;
  visitors: number;
  views: number;
}

export interface CountryStat {
  country: string;
  visitors: number;
}

export interface BrowserStat {
  name: string;
  visitors: number;
}

export interface DeviceStat {
  name: string;
  visitors: number;
}

export interface TotalMetrics {
  unique_visitors: number;
  total_pageviews: number;
  bounce_rate: number;
  average_duration_seconds: number;
}

export interface AverageDurationByDate {
  date: string;
  average_duration_seconds: number;
}

async function queryTinybird<T>(
  pipe: string,
  params: Record<string, string | number | Date>,
): Promise<T[]> {
  if (!TINYBIRD_TOKEN) {
    throw new Error("TINYBIRD_READ_TOKEN not configured");
  }

  const queryParams = new URLSearchParams();
  queryParams.append("token", TINYBIRD_TOKEN);

  for (const [key, value] of Object.entries(params)) {
    if (value instanceof Date) {
      const cleanSQLDateTime = value
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);
      queryParams.append(key, cleanSQLDateTime);
    } else {
      queryParams.append(key, String(value));
    }
  }

  const url = `${TINYBIRD_API}/v0/pipes/${pipe}.json?${queryParams}`;

  const response = await fetch(url, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(`Tinybird API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

export const getMetricsByDate = cache(
  async (websiteId: string, daysBack: number): Promise<MetricsByDate[]> => {
    const now = new Date();
    const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const interval = daysBack <= 1 ? "hour" : "day";

    const results = await queryTinybird<any>("metrics_by_date", {
      websiteId,
      start,
      end: now,
      interval,
    });

    return results.map((r) => ({
      date: r.date,
      views: r.views,
      visitors: r.visitors,
      avgTime: r.avgTime, // Handled automatically
    }));
  },
);

export const getTopPages = cache(
  async (
    websiteId: string,
    daysBack: number,
    limit: number = 10,
  ): Promise<TopPage[]> => {
    const now = new Date();
    const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const results = await queryTinybird<any>("top_pages", {
      websiteId,
      start,
      end: now,
      limit,
    });

    return results.map((r) => ({
      path: r.path,
      views: r.views,
      visitors: r.visitors,
    }));
  },
);

export const getTopReferrers = cache(
  async (
    websiteId: string,
    daysBack: number,
    limit: number = 10,
  ): Promise<TopReferrer[]> => {
    const now = new Date();
    const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const results = await queryTinybird<any>("top_referrers", {
      websiteId,
      start,
      end: now,
      limit,
    });

    return results.map((r) => ({
      name: r.name,
      visitors: r.visitors,
      views: r.views,
    }));
  },
);

export const getCountryStats = cache(
  async (websiteId: string, daysBack: number): Promise<CountryStat[]> => {
    const now = new Date();
    const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const results = await queryTinybird<any>("stats_by_country", {
      websiteId,
      start,
      end: now,
    });

    return results.map((r) => ({
      country: r.country,
      visitors: r.visitors,
    }));
  },
);

export const getBrowserStats = cache(
  async (websiteId: string, daysBack: number): Promise<BrowserStat[]> => {
    const now = new Date();
    const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const results = await queryTinybird<any>("stats_by_browser", {
      websiteId,
      start,
      end: now,
    });

    return results.map((r) => ({
      name: r.name,
      visitors: r.visitors,
    }));
  },
);

export const getDeviceStats = cache(
  async (websiteId: string, daysBack: number): Promise<DeviceStat[]> => {
    const now = new Date();
    const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const results = await queryTinybird<any>("stats_by_device", {
      websiteId,
      start,
      end: now,
    });

    return results.map((r) => ({
      name: r.name,
      visitors: r.visitors,
    }));
  },
);

export const getTotalMetrics = cache(
  async (websiteId: string, daysBack: number): Promise<TotalMetrics> => {
    const now = new Date();
    const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const results = await queryTinybird<any>("total_metrics", {
      websiteId,
      start,
      end: now,
    });

    if (results.length === 0) {
      return {
        unique_visitors: 0,
        total_pageviews: 0,
        bounce_rate: 0,
        average_duration_seconds: 0,
      };
    }

    return {
      unique_visitors: results[0].unique_visitors,
      total_pageviews: results[0].total_pageviews,
      bounce_rate: results[0].bounce_rate,
      average_duration_seconds: results[0].average_duration_seconds || 0,
    };
  },
);
