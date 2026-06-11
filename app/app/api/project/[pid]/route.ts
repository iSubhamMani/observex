import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { projectsTable } from "@/db/schema";
import { verifyAuthToken } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pid: string }> },
) {
  const { pid } = await params;

  if (!pid) {
    return NextResponse.json(
      { error: "project identification parameter id is required" },
      { status: 400 },
    );
  }
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pid: string }> },
) {
  const { pid } = await params;

  if (!pid) {
    return NextResponse.json(
      { error: "project identification parameter id is required" },
      { status: 400 },
    );
  }

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

    // update project with new data from request body
    const { name, domain } = await request.json();

    if (!name || !domain) {
      return NextResponse.json(
        { error: "Name and domain are required" },
        { status: 400 },
      );
    }

    await db
      .update(projectsTable)
      .set({ name, domain, updatedAt: new Date() })
      .where(
        and(
          eq(projectsTable.owner, payload.userId),
          eq(projectsTable.websiteId, pid),
        ),
      );

    return NextResponse.json(
      {
        message: "Project updated successfully",
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

// Instantiate the localized client layer matching your infrastructure region
const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pid: string }> },
) {
  const { pid } = await params;

  if (!pid) {
    return NextResponse.json(
      { error: "project identification parameter id is required" },
      { status: 400 },
    );
  }

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

    await db
      .delete(projectsTable)
      .where(
        and(
          eq(projectsTable.owner, payload.userId),
          eq(projectsTable.websiteId, pid),
        ),
      );

    console.log(
      `Successfully purged metadata configuration mappings for project: ${pid}`,
    );

    // 2. Prepare payload command parameters to trigger your background worker
    const lambdaPayload = { websiteId: pid };

    const command = new InvokeCommand({
      FunctionName: process.env.AWS_LAMBDA_DELETE_FUNCTION!,
      InvocationType: "Event",
      Payload: Buffer.from(JSON.stringify(lambdaPayload)),
    });

    await lambdaClient.send(command);
    console.log(
      `Asynchronous lifecycle cleanup trigger successfully forwarded to AWS Lambda instance.`,
    );

    return NextResponse.json({
      success: true,
      message:
        "Project metadata dropped successfully. Associated tracking table cleanup scheduled.",
    });
  } catch (error) {
    console.error(
      "Fatal exception encountered during operational DELETE pipeline router path pass:",
      error,
    );
    return NextResponse.json(
      {
        error: "Failed to cleanly tear down analytics tracking assets",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
