import { MockLinkedInConnector } from "./MockLinkedInConnector.js";
import { UnipileConnector } from "./UnipileConnector.js";

let cachedConnector = null;
let cachedProvider = null;

// Factory / swap point: reads LINKEDIN_PROVIDER from env (defaults to the safe mock).
// Re-reads the env var each call (cheap) so switching providers doesn't need a server
// restart to take effect in dev.
export function getLinkedInConnector() {
  const provider = process.env.LINKEDIN_PROVIDER || "mock";

  if (cachedConnector && cachedProvider === provider) return cachedConnector;

  switch (provider) {
    case "unipile":
      cachedConnector = new UnipileConnector();
      break;
    case "mock":
    default:
      cachedConnector = new MockLinkedInConnector();
      break;
  }

  cachedProvider = provider;
  return cachedConnector;
}
