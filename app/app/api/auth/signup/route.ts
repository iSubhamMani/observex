import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { generateOTP } from "@/lib/otp";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { fullname, email, password } = await req.json();

    // Validation
    if (!fullname || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await db
      .insert(usersTable)
      .values({
        email,
        fullname,
        password: hashedPassword,
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        isVerified: false,
      })
      .returning();

    // Push email to SQS for sending
    const messageBody = {
      from: "ObserveX <no-reply@updates.manisubham.xyz>",
      to: email,
      subject: "Verify your ObserveX account",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; max-width: 500px; margin: 0 auto; background-color: #181b19; color: #f5f5f5; padding: 40px; border-radius: 12px; border: 1px solid #2a2e2b;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 36px; margin-bottom: 12px;">◉</div>
            <h1 style="margin: 0; font-size: 24px; color: #c8b1e8; font-weight: 600; letter-spacing: 0.5px;">observex</h1>
          </div>
          
          <h2 style="font-size: 16px; font-weight: 500; text-align: center; color: #e8e8e8; margin: 20px 0 12px 0;">Welcome, ${fullname}</h2>
          <p style="text-align: center; color: #a0a0a0; font-size: 14px; margin: 0 0 24px 0;">Verify your email address to start monitoring your website traffic.</p>
          
          <div style="background: linear-gradient(135deg, rgba(200, 177, 232, 0.08), rgba(200, 177, 232, 0.04)); padding: 32px; text-align: center; border-radius: 12px; margin: 32px 0; border: 1px solid rgba(200, 177, 232, 0.15);">
            <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Verification Code</p>
            <h1 style="margin: 0; letter-spacing: 8px; color: #c8b1e8; font-size: 40px; font-family: 'Courier New', monospace; font-weight: 500;">${otp}</h1>
          </div>
          
          <p style="text-align: center; color: #707070; font-size: 13px; margin: 24px 0 0 0;">
            This code expires in <strong>10 minutes</strong>.<br/>
            <span style="font-size: 12px;">If you didn't request this, please disregard this email.</span>
          </p>
        </div>
      `,
    };

    const command = new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      MessageBody: JSON.stringify(messageBody),
    });

    await sqsClient.send(command);

    return NextResponse.json(
      {
        message: "User registered successfully. Please check your email.",
        email,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 },
    );
  }
}
