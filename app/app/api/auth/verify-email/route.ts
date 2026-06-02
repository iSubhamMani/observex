import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { setAuthCookie } from "@/lib/auth";
import { isOTPValid } from "@/lib/otp";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }

    // Find user
    const userResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult[0];

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 },
      );
    }

    // Verify OTP
    if (!isOTPValid(user.otp, user.otpExpiry, otp)) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Update user - mark as verified and clear OTP
    await db
      .update(usersTable)
      .set({ isVerified: true, otp: null, otpExpiry: null })
      .where(eq(usersTable.id, user.id));

    // Set auth cookies
    await setAuthCookie(user.id, user.email);

    return NextResponse.json(
      { message: "Email verified successfully", userId: user.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 },
    );
  }
}
