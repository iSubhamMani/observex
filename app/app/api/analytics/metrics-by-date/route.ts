import { getMetricsByDate } from "@/lib/tinybird";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const websiteId = request.nextUrl.searchParams.get("websiteId");
  const daysBack = request.nextUrl.searchParams.get("daysBack") || "7";

  if (!websiteId) {
    return NextResponse.json(
      { error: "websiteId is required" },
      { status: 400 },
    );
  }

  try {
    const data = await getMetricsByDate(websiteId, parseInt(daysBack));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 },
    );
  }
}
