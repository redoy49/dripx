import { runDueJobs } from "@/app/lib/jobProcessor";
import { retryPendingDeliveries } from "@/app/lib/webhooks";

/**
 * The entire "cloud execution" queue system: a MongoDB-backed `jobs` collection polled
 * by this route instead of a Redis/worker-process queue, matching the existing serverless
 * Next.js + Mongo setup with zero new infra.
 *
 * Point an external scheduler at this route once per minute in production:
 *   - Vercel Cron (vercel.json): { "crons": [{ "path": "/api/cron/run-scheduler", "schedule": "* * * * *" }] }
 *     (Vercel Cron calls with a GET by default and its own auth — see below)
 *   - Or any external pinger (cron-job.org, GitHub Actions schedule, etc.) sending:
 *       POST /api/cron/run-scheduler
 *       Header: x-cron-secret: <CRON_SECRET from .env.local>
 */
async function handleRequest(req) {
  const { searchParams } = new URL(req.url);
  const secret = req.headers.get("x-cron-secret") || searchParams.get("secret");

  if (!process.env.CRON_SECRET) {
    return Response.json({ message: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const jobSummary = await runDueJobs();
  const webhookSummary = await retryPendingDeliveries();

  return Response.json({ jobs: jobSummary, webhookRetries: webhookSummary });
}

export async function POST(req) {
  return handleRequest(req);
}

// Also accept GET (with ?secret=<CRON_SECRET>) since most external cron pingers default to
// GET and some can't set custom headers.
export async function GET(req) {
  return handleRequest(req);
}
