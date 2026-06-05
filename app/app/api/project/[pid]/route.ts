import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { projectsTable } from "@/db/schema";
import { verifyAuthToken } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get and verify auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("observex_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No token found" },
        { status: 401 },
      );
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }

    // Get pid from URL params

    const pid = request.nextUrl.pathname.split("/").pop();

    if (!pid) {
      return NextResponse.json(
        { error: "Project ID (pid) is required" },
        { status: 400 },
      );
    }

    // check if the project is owned by the user
    const data = await db
      .select({
        id: projectsTable.websiteId,
        name: projectsTable.name,
        domain: projectsTable.domain,
        createdAt: projectsTable.createdAt,
      })
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.owner, payload.userId),
          eq(projectsTable.websiteId, pid),
        ),
      )
      .limit(1);

    if (data.length === 0) {
      return NextResponse.json(
        { error: "Project not found or you don't have access to it" },
        { status: 404 },
      );
    }

    const project = data[0];

    return NextResponse.json(
      {
        project,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}
