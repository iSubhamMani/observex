import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { generateOTP } from "@/lib/otp";
import { eq } from "drizzle-orm";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import redis from "@/lib/redis";

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 },
      );
    }

    const user = existingUser[0];

    if (user.isVerified) {
      return NextResponse.json(
        {
          error: "Email is already verified",
        },
        { status: 400 },
      );
    }

    // check otp count in redis for rate limiting (max 5 OTPs per hour)
    const redisKey = `otp_count:${email}`;
    const currentCount = await redis.get(redisKey);

    if (currentCount && parseInt(currentCount) >= 5) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again later." },
        { status: 429 },
      );
    }

    // if otp count exists in redis, increment it. otherwise set it to 1
    if (currentCount) {
      await redis.incr(redisKey);
    } else {
      await redis.set(redisKey, "1", "EX", 60 * 60); // expire after 1 hour
    }

    // Generate OTP
    const otp = generateOTP();

    // update otp and expiry in db
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await db
      .update(usersTable)
      .set({ otp, otpExpiry })
      .where(eq(usersTable.id, user.id));

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
          
          <h2 style="font-size: 16px; font-weight: 500; text-align: center; color: #e8e8e8; margin: 20px 0 12px 0;">Welcome, ${user.fullname}</h2>
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
        message: "OTP sent successfully",
        email,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: "An error occurred while sending OTP" },
      { status: 500 },
    );
  }
}
