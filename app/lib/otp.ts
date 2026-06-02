export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isOTPValid(
  storedOTP: string | null | undefined,
  otpExpiry: Date | null | undefined,
  providedOTP: string,
): boolean {
  if (!storedOTP) return false;
  if (!otpExpiry) return false;

  const now = new Date();
  if (now > otpExpiry) return false;
  return storedOTP === providedOTP;
}
