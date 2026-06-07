/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUtmStats } from "@/lib/tinybird";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const websiteId = request.nextUrl.searchParams.get("websiteId");
  const startDate =
    request.nextUrl.searchParams.get("start") ||
    new Date(Date.now() - 86400000 * 7).toISOString();
  const endDate =
    request.nextUrl.searchParams.get("end") || new Date().toISOString();

  const type = request.nextUrl.searchParams.get("type") || "source";
  const limit = request.nextUrl.searchParams.get("limit") || "5";

  if (!websiteId) {
    return NextResponse.json(
      { error: "websiteId is required" },
      { status: 400 },
    );
  }

  try {
    const data = await getUtmStats(
      websiteId,
      new Date(startDate),
      new Date(endDate),
      type as any,
      parseInt(limit),
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching UTM analytics metrics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
