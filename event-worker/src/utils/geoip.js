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
  if (!ipAddress) {
    return { country: "Unknown", region: "Unknown", city: "Unknown" };
  }

  // 1. Extract clean IP if comma-separated (x-forwarded-for chains)
  let cleanIp = ipAddress.split(",")[0].trim();

  // 2. Remove IPv6 mapping prefix if present (::ffff:123.45.67.89 -> 123.45.67.89)
  if (cleanIp.startsWith("::ffff:")) {
    cleanIp = cleanIp.substring(7);
  }

  // 3. Instantly handle local & private Docker development addresses so lookup doesn't fail
  if (
    cleanIp === "::1" ||
    cleanIp === "127.0.0.1" ||
    cleanIp.startsWith("192.168.") ||
    cleanIp.startsWith("10.") ||
    cleanIp.startsWith("172.") // Captures Docker internal networks
  ) {
    return {
      country: "Local",
      region: "Development",
      city: "Localhost",
    };
  }

  // 4. Fallback safely if the database reader didn't load properly
  if (!cityReader) {
    return { country: "Unknown", region: "Unknown", city: "Unknown" };
  }

  try {
    const response = cityReader.city(cleanIp);
    return {
      country: response.country?.isoCode || "Unknown",
      region: response.subdivisions?.[0]?.name || "Unknown",
      city: response.city?.name || "Unknown",
    };
  } catch (error) {
    return { country: "Unknown", region: "Unknown", city: "Unknown" };
  }
}
