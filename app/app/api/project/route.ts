import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { projectsTable, usersTable } from "@/db/schema";
import { verifyAuthToken } from "@/lib/auth";
import { eq, like, desc, ilike, or, and } from "drizzle-orm";

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(10, parseInt(searchParams.get("limit") || "10"));
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;
    const filters = [];

    if (search) {
      const searchPattern = `%${search}%`;
      filters.push(
        ilike(projectsTable.name, searchPattern),
        ilike(projectsTable.domain, searchPattern),
      );
    }

    // Build query conditions
    const projects = await db
      .select({
        id: projectsTable.websiteId,
        name: projectsTable.name,
        domain: projectsTable.domain,
        createdAt: projectsTable.createdAt,
      })
      .from(projectsTable)
      .where(and(eq(projectsTable.owner, payload.userId), or(...filters)))
      .orderBy(desc(projectsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.$count(
      projectsTable,
      eq(projectsTable.owner, payload.userId),
    );

    const hasMore = offset + limit < totalCount;

    return NextResponse.json(
      {
        projects,
        pagination: {
          page,
          limit,
          total: totalCount,
          hasMore,
        },
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
