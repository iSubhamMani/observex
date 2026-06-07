import { getTopReferrers } from "@/lib/tinybird";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const websiteId = request.nextUrl.searchParams.get("websiteId");
  const startDate =
    request.nextUrl.searchParams.get("start") ||
    new Date(Date.now() - 86400000 * 7).toISOString();
  const endDate =
    request.nextUrl.searchParams.get("end") || new Date().toISOString();

  const limit = request.nextUrl.searchParams.get("limit") || "10";

  if (!websiteId) {
    return NextResponse.json(
      { error: "websiteId is required" },
      { status: 400 },
    );
  }

  try {
    const data = await getTopReferrers(
      websiteId,
      new Date(startDate),
      new Date(endDate),
      parseInt(limit),
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching top referrers:", error);
    return NextResponse.json(
      { error: "Failed to fetch top referrers" },
      { status: 500 },
    );
  }
}
