import { Request, Response } from "express";
import { pushToQueue } from "../config/sqs";
import redis from "../config/redis";
import { isBot } from "../utils/botDetector";
import db from "../config/db";

export const ingestEvent = async (req: Request, res: Response) => {
  res.status(202).json({ status: "accepted" });

  try {
    const {
      website_id,
      event_name,
      url,
      pathname,
      referrer,
      screen_width,
      meta,
      utm_source,
      utm_medium,
      utm_term,
      utm_campaign,
      utm_content,
    } = req.body;
    const websiteId = website_id; // Ensure consistent naming

    // Extract headers
    const userAgent = req.headers["user-agent"] as string | undefined;

    // Fallback to referer if origin is missing (common in older browsers or specific redirect flows)
    const rawOrigin = (req.headers.origin || req.headers.referer) as
      | string
      | undefined;

    // Provide a safe fallback for local development where x-forwarded-for might not exist
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

    // Fail fast if critical browser identifiers are missing (IP check removed to prevent local dev blocking)
    if (!userAgent || !rawOrigin) {
      // Use debug instead of warn so you don't flood production logs with bot noise
      console.debug("Missing critical headers: User-Agent or Origin/Referer.");
      return;
    }

    // Safely extract the exact domain from the raw origin/referer string
    let clientDomain = "";
    try {
      clientDomain = new URL(rawOrigin).origin; // Converts "https://abc.com/pricing" -> "https://abc.com"
    } catch (e) {
      console.debug(`Malformed origin/referer string: ${rawOrigin}`);
      return; // Drop request if it's not a valid URL
    }

    // Drop Bots immediately
    if (isBot(userAgent)) return;

    if (!websiteId || !clientDomain) return; // Malformed payload

    // Check Redis Cache for the allowed domain
    const cacheKey = `site_domain:${websiteId}`;
    let allowedDomain = await redis.get(cacheKey);

    // Cache Miss? Query NeonDB and update Cache
    if (!allowedDomain) {
      const { rows } = await db.query(
        'SELECT domain FROM projects WHERE "websiteId" = $1 LIMIT 1',
        [websiteId],
      );

      if (rows.length === 0) return;

      allowedDomain = rows[0].domain;

      // Cache it in Redis for 1 hour (3600 seconds) to prevent DB hammering
      await redis.set(cacheKey, allowedDomain!, "EX", 3600);
    }

    // Origin Security Check
    // Normalize allowed domain to include protocol if missing (for localhost testing)
    let normalizedAllowed = allowedDomain!;
    if (
      !normalizedAllowed.startsWith("http://") &&
      !normalizedAllowed.startsWith("https://")
    ) {
      const protocol =
        normalizedAllowed.includes("localhost") ||
        normalizedAllowed.includes("127.0.0.1")
          ? "http://"
          : "https://";
      normalizedAllowed = protocol + normalizedAllowed;
    }

    // We strip trailing slashes to ensure strict matching
    const cleanOrigin = clientDomain.replace(/\/$/, "");
    const cleanAllowed = normalizedAllowed.replace(/\/$/, "");

    if (cleanOrigin !== cleanAllowed) {
      console.warn(
        `Spoof attempt blocked: ${cleanOrigin} tried to spoof ${cleanAllowed}`,
      );
      return;
    }

    // Passed all checks! Prepare payload for SQS
    const queuePayload = {
      websiteId,
      event_name,
      url,
      pathname,
      referrer,
      screen_width,
      meta,
      utm_source,
      utm_medium,
      utm_term,
      utm_campaign,
      utm_content,
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
    };
    console.log(`Payload: ${JSON.stringify(queuePayload)}`);

    await pushToQueue(queuePayload);
  } catch (error) {
    console.error("Ingestion Error:", error);
  }
};
