import crypto from "crypto";

// Generate a daily salt based on current date
const getDailySalt = () => {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const secret = process.env.HASH_SECRET || "default-secret";
  return crypto.createHash("sha256").update(`${today}:${secret}`).digest("hex");
};

// Generate unique visitor hash from tabSessionId, websiteId, user_agent, and daily salt
export const generateVisitorHash = (tabSessionId, websiteId, device) => {
  const salt = getDailySalt();
  const hashInput = `${tabSessionId}:${websiteId}:${device}:${salt}`;
  return crypto.createHash("sha256").update(hashInput).digest("hex");
};
