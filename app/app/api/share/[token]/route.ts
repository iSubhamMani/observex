import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projectsTable, sharedProjectsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json(
      { error: "Share token parameter is required" },
      { status: 400 },
    );
  }

  const shareToken = token;

  try {
    // fetch the project associated with the share token
    const projectMetadata = await db
      .select({
        pid: sharedProjectsTable.projectId,
        createdAt: sharedProjectsTable.createdAt,
        updatedAt: sharedProjectsTable.updatedAt,
      })
      .from(sharedProjectsTable)
      .where(eq(sharedProjectsTable.shareToken, shareToken))
      .limit(1);

    if (projectMetadata.length === 0) {
      return NextResponse.json(
        { error: "Invalid share token or project not found" },
        { status: 404 },
      );
    }

    const data = await db
      .select({
        id: projectsTable.websiteId,
        name: projectsTable.name,
        domain: projectsTable.domain,
        createdAt: projectsTable.createdAt,
      })
      .from(projectsTable)
      .where(and(eq(projectsTable.websiteId, projectMetadata[0].pid)))
      .limit(1);

    if (data.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
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
