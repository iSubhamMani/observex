import fetch from "cross-fetch";
import { parseDevice } from "../utils/deviceParser.js";
import { initGeoIp, lookupGeo } from "../utils/geoip.js";
import { generateVisitorHash } from "../utils/generateVisitorHash.js";

await initGeoIp();

export const processBatch = async (event) => {
  if (!event.Records || event.Records.length === 0) {
    return { statusCode: 200, body: "No records to process" };
  }

  const enrichedEvents = [];

  console.log(
    `Processing batch of ${event.Records.length} messages from SQS...`,
  );

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);

      const { browser, device } = parseDevice(body.user_agent || ""); // Destructure to trigger parsing and error handling

      const geo = lookupGeo(body.ip_address);

      const tabSessionId = body.tabSessionId || null;

      // Generate unique visitor hash
      let visitorId = null;

      if (tabSessionId) {
        visitorId = generateVisitorHash(
          tabSessionId || "",
          body.websiteId,
          device,
        );
      }

      enrichedEvents.push({
        timestamp: body.timestamp,
        visitorId,
        websiteId: body.websiteId,
        event_name: body.event_name,
        url: body.url,
        pathname: body.pathname,
        referrer: body.referrer,
        screen_width: Number(body.screen_width) || 0,
        browser,
        device,
        country: geo.country,
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        utm_term: body.utm_term || null,
        utm_content: body.utm_content || null,
        // Convert metadata object smoothly back into stringified JSON for Tinybird JSON columns
        meta: body.meta ? JSON.stringify(body.meta) : "{}",
      });
    } catch (parseError) {
      console.error(
        "Skipping malformed SQS record parsing failure:",
        parseError,
      );
    }
  }

  if (enrichedEvents.length === 0) {
    return { statusCode: 200, body: "Zero valid events parsed" };
  }

  const ndjsonPayload = enrichedEvents.map((e) => JSON.stringify(e)).join("\n");

  const response = await fetch(process.env.TINYBIRD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
      "Content-Type": "application/x-ndjson",
    },
    body: ndjsonPayload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Tinybird ingestion failure response packet:", errorText);

    throw new Error(`Tinybird Streaming Rejected: ${response.statusText}`);
  }

  console.log(
    `Successfully streamed ${enrichedEvents.length} events directly to Tinybird.`,
  );
  return {
    statusCode: 200,
    body: `Processed ${enrichedEvents.length} records successfully.`,
  };
};
