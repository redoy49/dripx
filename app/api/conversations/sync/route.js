import { requireAuth } from "@/app/lib/session";
import { syncAllConnectedEmailAccounts } from "@/app/lib/email";

// Per-workspace in-memory throttle and promise deduplication
const activeSyncPromises = new Map();
const lastSyncTimes = new Map();
const SYNC_COOLDOWN_MS = 6000; // 6 seconds cooldown between heavy Gmail syncs

export async function POST(_req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const workspaceKey = session.workspaceId?.toString() || "default";
    const now = Date.now();

    // 1. If a sync is already in flight for this workspace, join the same promise
    if (activeSyncPromises.has(workspaceKey)) {
      const existingResult = await activeSyncPromises.get(workspaceKey);
      return Response.json({
        success: true,
        deduped: true,
        ...existingResult,
      });
    }

    // 2. If synced very recently, skip external API calls to avoid hitting Gmail rate limits
    const lastSyncAt = lastSyncTimes.get(workspaceKey) || 0;
    if (now - lastSyncAt < SYNC_COOLDOWN_MS) {
      return Response.json({
        success: true,
        throttled: true,
        message: "Mailbox synced recently",
      });
    }

    // 3. Execute sync with promise lock
    const syncPromise = (async () => {
      try {
        const result = await syncAllConnectedEmailAccounts(session.workspaceId);
        lastSyncTimes.set(workspaceKey, Date.now());
        return result;
      } finally {
        activeSyncPromises.delete(workspaceKey);
      }
    })();

    activeSyncPromises.set(workspaceKey, syncPromise);
    const result = await syncPromise;

    return Response.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Conversations sync failed:", error);
    return Response.json({ message: "Failed to sync conversations" }, { status: 500 });
  }
}
