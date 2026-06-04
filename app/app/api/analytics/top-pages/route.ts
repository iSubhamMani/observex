import { getTopPages } from "@/lib/tinybird";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const websiteId = request.nextUrl.searchParams.get("websiteId");
  const daysBack = request.nextUrl.searchParams.get("daysBack") || "7";
  const limit = request.nextUrl.searchParams.get("limit") || "10";

  if (!websiteId) {
    return NextResponse.json(
      { error: "websiteId is required" },
      { status: 400 },
    );
  }

  try {
    const data = await getTopPages(
      websiteId,
      parseInt(daysBack),
      parseInt(limit),
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching top pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch top pages" },
      { status: 500 },
    );
  }
}
