import { MockLinkedInConnector } from "@/app/lib/connectors/MockLinkedInConnector";

let cachedConnector = null;

// Factory / swap point: reads LINKEDIN_PROVIDER from env (defaults to the safe mock).
// To go live with a real provider, add a new class implementing LinkedInConnector and
// return it here — no other file in the app needs to change.
export function getLinkedInConnector() {
  if (cachedConnector) return cachedConnector;

  const provider = process.env.LINKEDIN_PROVIDER || "mock";

  switch (provider) {
    case "mock":
    default:
      cachedConnector = new MockLinkedInConnector();
      break;
  }

  return cachedConnector;
}
