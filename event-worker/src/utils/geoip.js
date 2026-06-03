import { Reader } from "@maxmind/geoip2-node";
import path from "path";
import { fileURLToPath } from "url";

// ES Modules fix for __dirname in Node.js runtime environments
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cityReader = null;

/**
 * Initializes the MaxMind database reader into memory.
 * This should be called once globally before processing loops begin.
 */
export async function initGeoIp() {
  if (cityReader) return; // Already initialized

  try {
    // Adjust the path to where you saved your downloaded GeoLite2-City.mmdb file
    const dbPath = path.resolve(__dirname, "./db/GeoLite2-City.mmdb");
    cityReader = await Reader.open(dbPath);
    console.log(
      "✅ GeoLite2 Database loaded successfully into Lambda memory context.",
    );
  } catch (error) {
    console.error("❌ Failed to initialize GeoIP Database Reader:", error);
    // Do not crash the entire app; lookups will gracefully degrade to 'Unknown'
    cityReader = null;
  }
}

/**
 * Parses an IP address and extracts structured geographical properties.
 * @param {string} ipAddress - Raw IP string from the event payload
 * @returns { { country: string, region: string, city: string } }
 */
export function lookupGeo(ipAddress) {
  // 1. Instantly handle local development addresses so loops don't break
  if (
    !ipAddress ||
    ipAddress === "::1" ||
    ipAddress === "127.0.0.1" ||
    ipAddress.startsWith("192.168.")
  ) {
    return {
      country: "Local",
      region: "Development",
      city: "Localhost",
    };
  }

  // 2. Extract clean IP if it contains a port or is comma-separated (x-forwarded-for chains)
  let cleanIp = ipAddress.split(",")[0].trim();

  // 3. Fallback safely if the database reader didn't load properly
  if (!cityReader) {
    return { country: "Unknown", region: "Unknown", city: "Unknown" };
  }

  try {
    // Sync lookup from memory buffer
    const response = cityReader.city(cleanIp);

    return {
      country: response.country?.isoCode || "Unknown", // e.g., 'US', 'IN', 'GB'
      region: response.subdivisions?.[0]?.name || "Unknown", // e.g., 'California', 'West Bengal'
      city: response.city?.name || "Unknown", // e.g., 'San Francisco', 'Kolkata'
    };
  } catch (error) {
    // MaxMind throws an error if the IP format is valid but simply not found in their database
    return {
      country: "Unknown",
      region: "Unknown",
      city: "Unknown",
    };
  }
}
