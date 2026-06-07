import { getCustomEventMetaBreakdown } from "@/lib/tinybird";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const websiteId = request.nextUrl.searchParams.get("websiteId");
  const startDate =
    request.nextUrl.searchParams.get("start") ||
    new Date(Date.now() - 86400000 * 7).toISOString();
  const endDate =
    request.nextUrl.searchParams.get("end") || new Date().toISOString();

  const eventName = request.nextUrl.searchParams.get("eventName") || "";
  const metaKey = request.nextUrl.searchParams.get("metaKey") || "";

  if (!websiteId) {
    return NextResponse.json(
      { error: "websiteId is required" },
      { status: 400 },
    );
  }

  try {
    const data = await getCustomEventMetaBreakdown(
      websiteId,
      new Date(startDate),
      new Date(endDate),
      eventName,
      metaKey,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching meta breakdown:", error);
    return NextResponse.json(
      { error: "Failed to fetch meta breakdown" },
      { status: 500 },
    );
  }
}
