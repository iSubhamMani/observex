import { getCustomEventsList } from "@/lib/tinybird";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const websiteId = request.nextUrl.searchParams.get("websiteId");
  const startDate =
    request.nextUrl.searchParams.get("start") ||
    new Date(Date.now() - 86400000 * 7).toISOString();
  const endDate =
    request.nextUrl.searchParams.get("end") || new Date().toISOString();

  if (!websiteId) {
    return NextResponse.json(
      { error: "websiteId is required" },
      { status: 400 },
    );
  }

  try {
    const data = await getCustomEventsList(
      websiteId,
      new Date(startDate),
      new Date(endDate),
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching custom events:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom events" },
      { status: 500 },
    );
  }
}
