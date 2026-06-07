/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from "react";

const TINYBIRD_API =
  process.env.NEXT_PUBLIC_TINYBIRD_API || "https://api.us-east-1.tinybird.co";
const TINYBIRD_TOKEN = process.env.TINYBIRD_READ_TOKEN;

export function formatTBDate(date: Date) {
  return date.toISOString().replace("T", " ").substring(0, 19);
}

export interface MetricsByDate {
  date: string;
  views: number;
  visitors: number;
  avgTime: number;
}

export interface UtmStat {
  name: string;
  views: number;
  visitors: number;
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
  unique_visitors_delta: number;
  total_pageviews_delta: number;
  bounce_rate_delta: number;
  average_duration_delta: number;
}

export interface AverageDurationByDate {
  date: string;
  average_duration_seconds: number;
}

export interface CustomEventItem {
  eventName: string;
  total_events: number;
  unique_visitors: number;
}

export interface CustomEventMetaBreakdown {
  property_value: string;
  total_actions: number;
  unique_visitors: number;
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

export const getCustomEventsList = cache(
  async (
    websiteId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CustomEventItem[]> => {
    return await queryTinybird<CustomEventItem>("custom_events_list", {
      websiteId,
      start: formatTBDate(startDate),
      end: formatTBDate(endDate),
    });
  },
);

export const getCustomEventKeys = cache(
  async (
    websiteId: string,
    startDate: Date,
    endDate: Date,
    eventName: string,
  ): Promise<string[]> => {
    const results = await queryTinybird<{ key_name: string }>(
      "custom_event_keys",
      {
        websiteId,
        start: formatTBDate(startDate),
        end: formatTBDate(endDate),
        event_name: eventName,
      },
    );

    return results.map((r) => r.key_name);
  },
);

export const getCustomEventMetaBreakdown = cache(
  async (
    websiteId: string,
    startDate: Date,
    endDate: Date,
    eventName: string,
    metaKey: string,
  ): Promise<CustomEventMetaBreakdown[]> => {
    return await queryTinybird<CustomEventMetaBreakdown>(
      "custom_event_meta_breakdown",
      {
        websiteId,
        start: formatTBDate(startDate),
        end: formatTBDate(endDate),
        event_name: eventName,
        meta_key: metaKey,
      },
    );
  },
);

export const getMetricsByDate = cache(
  async (
    websiteId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MetricsByDate[]> => {
    const diffInHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    // If the range is exactly 24 hours (or less), group by 'hour'. Otherwise, group by 'day'.
    const interval = diffInHours <= 24 ? "hour" : "day";

    const results = await queryTinybird<any>("metrics_by_date", {
      websiteId,
      start: formatTBDate(startDate),
      end: formatTBDate(endDate),
      interval,
    });

    return results.map((r) => ({
      date: r.date,
      views: r.views,
      visitors: r.visitors,
      avgTime: r.avgTime,
      bounce_rate: r.bounce_rate || 0,
    }));
  },
);

export const getUtmStats = cache(
  async (
    websiteId: string,
    startDate: Date,
    endDate: Date,
    type: "source" | "medium" | "campaign" | "term" | "content",
    limit: number = 5,
  ): Promise<UtmStat[]> => {
    const results = await queryTinybird<any>("stats_by_utm", {
      websiteId,
      start: formatTBDate(startDate),
      end: formatTBDate(endDate),
      type,
      limit,
    });

    return results.map((r) => ({
      name: r.name,
      views: r.views,
      visitors: r.visitors,
    }));
  },
);

export const getTopPages = cache(
  async (
    websiteId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 10,
  ): Promise<TopPage[]> => {
    const results = await queryTinybird<any>("top_pages", {
      websiteId,
      start: formatTBDate(startDate),
      end: formatTBDate(endDate),
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
    startDate: Date,
    endDate: Date,
    limit: number = 10,
  ): Promise<TopReferrer[]> => {
    const results = await queryTinybird<any>("top_referrers", {
      websiteId,
      start: formatTBDate(startDate),
      end: formatTBDate(endDate),
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
  async (
    websiteId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CountryStat[]> => {
    const results = await queryTinybird<any>("stats_by_country", {
      websiteId,
      start: formatTBDate(startDate),
      end: formatTBDate(endDate),
    });

    return results.map((r) => ({
      country: r.country,
      visitors: r.visitors,
    }));
  },
);

export const getBrowserStats = cache(
  async (
    websiteId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BrowserStat[]> => {
    const results = await queryTinybird<any>("stats_by_browser", {
      websiteId,
      start: formatTBDate(startDate),
      end: formatTBDate(endDate),
    });

    return results.map((r) => ({
      name: r.name,
      visitors: r.visitors,
    }));
  },
);

export const getDeviceStats = cache(
  async (
    websiteId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DeviceStat[]> => {
    const results = await queryTinybird<any>("stats_by_device", {
      websiteId,
      start: formatTBDate(startDate),
      end: formatTBDate(endDate),
    });

    return results.map((r) => ({
      name: r.name,
      visitors: r.visitors,
    }));
  },
);

export const getTotalMetrics = cache(
  async (
    websiteId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TotalMetrics> => {
    const results = await queryTinybird<any>("total_metrics", {
      websiteId,
      start: formatTBDate(startDate),
      end: formatTBDate(endDate),
    });

    if (results.length === 0) {
      return {
        unique_visitors: 0,
        total_pageviews: 0,
        bounce_rate: 0,
        average_duration_seconds: 0,
        unique_visitors_delta: 0,
        total_pageviews_delta: 0,
        bounce_rate_delta: 0,
        average_duration_delta: 0,
      };
    }

    return {
      unique_visitors: results[0].unique_visitors,
      total_pageviews: results[0].total_pageviews,
      bounce_rate: results[0].bounce_rate,
      average_duration_seconds: results[0].average_duration_seconds || 0,
      unique_visitors_delta: results[0].unique_visitors_delta || 0,
      total_pageviews_delta: results[0].total_pageviews_delta || 0,
      bounce_rate_delta: results[0].bounce_rate_delta || 0,
      average_duration_delta: results[0].average_duration_delta || 0,
    };
  },
);
