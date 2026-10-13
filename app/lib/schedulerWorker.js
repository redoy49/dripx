import { runDueJobs } from "./jobProcessor.js";
import { syncAllConnectedEmailAccounts } from "./email/emailSyncEngine.js";

/**
 * Background Scheduler Worker for DripX.
 * Periodically polls and runs due sequence jobs while the server is active.
 * Uses a global singleton interval so it never spawns duplicate workers across HMR reloads.
 */
export function startSchedulerWorker(intervalMs = 30000) {
  if (typeof globalThis === "undefined") return;

  if (globalThis.__dripxSchedulerWorkerStarted) {
    return;
  }

  globalThis.__dripxSchedulerWorkerStarted = true;
  console.log(`[SchedulerWorker] Starting background scheduler runner (interval: ${intervalMs}ms)...`);

  let isRunning = false;

  const tick = async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      const summary = await runDueJobs(25, null, false, "auto_worker");
      if (summary.processed > 0) {
        console.log(
          `[SchedulerWorker] Processed ${summary.processed} jobs: ${summary.succeeded} succeeded, ${summary.failed} failed, ${summary.rateLimited} rate-limited, ${summary.outsideWorkingHours || 0} outside hours.`,
        );
      }

      const syncResult = await syncAllConnectedEmailAccounts();
      if (syncResult?.totalNewReplies > 0) {
        console.log(
          `[SchedulerWorker] Ingested ${syncResult.totalNewReplies} new incoming email replies.`,
        );
      }
    } catch (err) {
      // Don't crash worker on transient DB timeouts
      console.error("[SchedulerWorker] Tick error:", err.message || err);
    } finally {
      isRunning = false;
    }
  };

  // Run initial tick shortly after startup
  setTimeout(tick, 5000);

  // Recurring tick
  globalThis.__dripxSchedulerInterval = setInterval(tick, intervalMs);
}
