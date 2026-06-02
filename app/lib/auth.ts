import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createAuthToken(
  userId: number,
  email: string,
): Promise<string> {
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
  return token;
}

export async function verifyAuthToken(
  token: string,
): Promise<{ userId: number; email: string } | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: number; email: string };
  } catch {
    return null;
  }
}

export async function setAuthCookie(userId: number, email: string) {
  const token = await createAuthToken(userId, email);
  const cookieStore = await cookies();
  cookieStore.set("observex_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("observex_token");
}
