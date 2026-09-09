import dns from "node:dns";
import { MongoClient } from "mongodb";

// `mongodb+srv://` URIs need DNS SRV/TXT record lookups, which some ISP/router DNS
// resolvers silently fail on (a very common cause of "queryTxt ETIMEOUT ...mongodb.net")
// even though normal DNS works fine. Point Node's own resolver at public DNS servers that
// reliably support these record types, independent of the OS network configuration.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (error) {
  console.warn("Could not override DNS servers:", error.message);
}

const uri = process.env.MONGO_URI;

// Stop app if Mongo URI is missing
if (!uri) {
  throw new Error("MONGO_URI is missing in .env.local");
}

// Fail fast instead of hanging for a minute+ if DNS/network to Atlas is slow.
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
});

// Cache the single connect() promise so repeated dbConnect() calls (including several
// within the same request, e.g. register touching users/workspaces/team_members/daily_limits)
// reuse one connection instead of re-resolving DNS + reconnecting every time. Stored on
// `global` so it also survives Next.js dev-mode hot-reloads instead of leaking a new
// connection on every file edit.
let productionClientPromise = null;

function connectAndCache(cacheKey) {
  const promise = client.connect().catch((error) => {
    // Don't cache a failed connection attempt — clear it so the next call retries
    // instead of being permanently stuck on one transient DNS/network hiccup.
    if (cacheKey === "production") productionClientPromise = null;
    else global._dripxMongoClientPromise = null;
    throw error;
  });

  if (cacheKey === "production") productionClientPromise = promise;
  else global._dripxMongoClientPromise = promise;

  return promise;
}

function getClientPromise() {
  if (process.env.NODE_ENV === "production") {
    if (!productionClientPromise) return connectAndCache("production");
    return productionClientPromise;
  }

  if (!global._dripxMongoClientPromise) return connectAndCache("dev");
  return global._dripxMongoClientPromise;
}

// Connect to database and get collection
export async function dbConnect(collectionName) {
  try {
    const connectedClient = await getClientPromise();

    const db = connectedClient.db(process.env.DB_NAME);

    return db.collection(collectionName);
  } catch (error) {
    console.error("Database connection failed:", error);

    throw new Error("Failed to connect database");
  }
}
