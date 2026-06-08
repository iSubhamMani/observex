import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { projectsTable, sharedProjectsTable } from "@/db/schema";
import { verifyAuthToken } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { pid } = body;

    // Validate required fields
    if (!pid) {
      return NextResponse.json(
        { error: "Missing required fields: pid" },
        { status: 400 },
      );
    }

    // verify that the project exists and belongs to the user
    const project = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.owner, payload.userId),
          eq(projectsTable.websiteId, pid),
        ),
      )
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { error: "Project not found or you don't have access to it" },
        { status: 404 },
      );
    }

    // check if already exists, if  yes return that
    const existingShare = await db
      .select()
      .from(sharedProjectsTable)
      .where(eq(sharedProjectsTable.projectId, pid))
      .limit(1);

    if (existingShare.length > 0) {
      return NextResponse.json(
        {
          publicLink:
            process.env.NEXT_PUBLIC_BASE_URL +
            `/share/${existingShare[0].shareToken}`,
          message: "Project share link already exists",
        },
        { status: 200 },
      );
    }

    // Create share token
    const shareToken = randomUUID();

    await db
      .insert(sharedProjectsTable)
      .values({
        shareToken,
        projectId: pid,
      })
      .returning();

    return NextResponse.json(
      {
        publicLink: process.env.NEXT_PUBLIC_BASE_URL + `/share/${shareToken}`,
        message: "Project share link created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
