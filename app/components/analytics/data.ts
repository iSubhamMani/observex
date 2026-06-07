/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export async function seriesFor(id: string, start: Date, end: Date) {
  try {
    const response = await fetch(
      `/api/analytics/metrics-by-date?websiteId=${id}&start=${start.toString()}&end=${end.toString()}`,
    );
    if (!response.ok) throw new Error("Failed to fetch metrics");
    return await response.json();
  } catch (error) {
    console.error("Error fetching series data:", error);
    return [];
  }
}

export async function fetchCustomEvents(id: string, start: Date, end: Date) {
  const res = await fetch(
    `/api/analytics/custom-events?websiteId=${id}&start=${start.toString()}&end=${end.toString()}`,
  );
  if (!res.ok) throw new Error("Failed fetching custom event indexes");
  return res.json();
}

export async function fetchCustomEventMeta(
  id: string,
  start: Date,
  end: Date,
  eventName: string,
  metaKey: string,
) {
  const res = await fetch(
    `/api/analytics/custom-events/breakdown?websiteId=${id}&start=${start.toString()}&end=${end.toString()}&eventName=${eventName}&metaKey=${metaKey}`,
  );
  if (!res.ok) throw new Error("Failed fetching metadata properties");
  return res.json();
}

export async function fetchCustomEventKeys(
  id: string,
  start: Date,
  end: Date,
  eventName: string,
): Promise<string[]> {
  const res = await fetch(
    `/api/analytics/custom-events/keys?websiteId=${id}&start=${start.toString()}&end=${end.toString()}&eventName=${eventName}`,
  );
  if (!res.ok) throw new Error("Failed fetching dynamic metadata schema keys");
  return res.json();
}

// Add this helper module function inside your components/analytics/data.ts folder map
export async function utmStats(
  id: string,
  start: Date,
  end: Date,
  type: "source" | "medium" | "campaign" | "term" | "content" = "source",
) {
  try {
    const response = await fetch(
      `/api/analytics/utm?websiteId=${id}&start=${start.toString()}&end=${end.toString()}&type=${type}&limit=5`,
    );
    if (!response.ok) throw new Error("Failed to fetch custom UTM records");
    return await response.json();
  } catch (error) {
    console.error(`Error loading UTM ${type} tracking state:`, error);
    return []; // Graceful empty fallback list
  }
}

export async function topPages(id: string, start: Date, end: Date) {
  try {
    const response = await fetch(
      `/api/analytics/top-pages?websiteId=${id}&start=${start.toString()}&end=${end.toString()}&limit=5`,
    );
    if (!response.ok) throw new Error("Failed to fetch top pages");
    const data = await response.json();
    return data.map((p: any) => ({
      ...p,
      label: p.path,
    }));
  } catch (error) {
    console.error("Error fetching top pages:", error);
    return [];
  }
}

// ──► FIXED: Now accepts website 'id' and includes it in query params ◄──
export async function referrers(id: string, start: Date, end: Date) {
  try {
    const response = await fetch(
      `/api/analytics/top-referrers?websiteId=${id}&&start=${start.toString()}&end=${end.toString()}&limit=5`,
    );
    if (!response.ok) throw new Error("Failed to fetch referrers");
    return await response.json();
  } catch (error) {
    console.error("Error fetching referrers:", error);
    return [];
  }
}

// ──► FIXED: Now accepts website 'id' and includes it in query params ◄──
export async function countries(id: string, start: Date, end: Date) {
  try {
    const response = await fetch(
      `/api/analytics/countries?websiteId=${id}&start=${start.toString()}&end=${end.toString()}`,
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
    return [];
  }
}

// ──► FIXED: Now accepts website 'id' and includes it in query params ◄──
export async function browsers(id: string, start: Date, end: Date) {
  try {
    const response = await fetch(
      `/api/analytics/browsers?websiteId=${id}&start=${start.toString()}&end=${end.toString()}`,
    );
    if (!response.ok) throw new Error("Failed to fetch browsers");
    return await response.json();
  } catch (error) {
    console.error("Error fetching browsers:", error);
    return [];
  }
}

// ──► FIXED: Now accepts website 'id' and includes it in query params ◄──
export async function devices(id: string, start: Date, end: Date) {
  try {
    const response = await fetch(
      `/api/analytics/devices?websiteId=${id}&start=${start.toString()}&end=${end.toString()}`,
    );
    if (!response.ok) throw new Error("Failed to fetch devices");
    return await response.json();
  } catch (error) {
    console.error("Error fetching devices:", error);
    return [];
  }
}

export async function getTotalMetrics(
  websiteId: string,
  start: Date,
  end: Date,
) {
  try {
    const response = await fetch(
      `/api/analytics/total-metrics?websiteId=${websiteId}&start=${start.toString()}&end=${end.toString()}`,
    );
    if (!response.ok) throw new Error("Failed to fetch total metrics");
    return await response.json();
  } catch (error) {
    console.error("Error fetching total metrics:", error);
    return { unique_visitors: 0, total_pageviews: 0, bounce_rate: 0 };
  }
}
