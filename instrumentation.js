/**
 * Next.js Instrumentation hook.
 * Runs once when the Next.js server starts up.
 * In Node.js runtime, starts the background scheduler runner to periodically
 * process due sequence jobs without needing an external cron trigger during development.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { startSchedulerWorker } = await import("./app/lib/schedulerWorker.js");
      startSchedulerWorker(30000);
    } catch (err) {
      console.error("[Instrumentation] Failed to start scheduler worker:", err);
    }
  }
}
