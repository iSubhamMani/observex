import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { projectsTable } from "@/db/schema";
import { verifyAuthToken } from "@/lib/auth";

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
    const { name, domain } = body;

    // Validate required fields
    if (!name || !domain) {
      return NextResponse.json(
        { error: "Missing required fields: name and domain" },
        { status: 400 },
      );
    }

    const websiteId = randomUUID();

    // Create project
    const newProject = await db
      .insert(projectsTable)
      .values({
        websiteId,
        name: name.trim(),
        domain: domain.trim(),
        owner: payload.userId,
      })
      .returning();

    return NextResponse.json(
      { project: newProject[0], message: "Project created successfully" },
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
