import { UAParser } from "ua-parser-js";

export function parseDevice(userAgentString) {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  return {
    browser: result.browser.name || "Unknown",
    device: result.device.type || "desktop",
  };
}
