import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { computeRampUpStatus, evaluateMailboxHealth, shouldResetDailyCount } from "@/app/lib/rampUpEngine";

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const emailAccounts = await dbConnect("email_accounts");
    const accounts = await emailAccounts
      .find({
        workspaceId: new ObjectId(session.workspaceId),
        status: { $ne: "disconnected" },
      })
      .toArray();

    if (accounts.length === 0) {
      return Response.json({
        totalAccounts: 0,
        averageHealthScore: 100,
        averageDnsScore: 100,
        totalDailyCapacity: 0,
        todayTotalSent: 0,
        warmingUpCount: 0,
        graduatedCount: 0,
        needsAttentionCount: 0,
      });
    }

    let totalHealthScore = 0;
    let totalDnsScore = 0;
    let totalCapacity = 0;
    let totalSentToday = 0;
    let warmingUpCount = 0;
    let graduatedCount = 0;
    let needsAttentionCount = 0;

    for (const acc of accounts) {
      const rampUp = computeRampUpStatus(acc);
      totalCapacity += rampUp.currentEffectiveLimit;

      const isNewDay = shouldResetDailyCount(acc.lastSentAt);
      const effectiveSent = isNewDay ? 0 : (acc.todaySentCount || 0);
      totalSentToday += effectiveSent;

      if (rampUp.isWarmingUp) {
        warmingUpCount++;
      } else {
        graduatedCount++;
      }

      const dnsScore = acc.dnsHealth?.score ?? 100;
      totalDnsScore += dnsScore;

      const health = evaluateMailboxHealth({
        status: acc.status,
        dnsScore,
        recentErrorCount: acc.lastError ? 1 : 0,
        rampUp: acc.rampUp,
      });
      totalHealthScore += health.score;

      if (health.rating === "warning" || health.rating === "critical" || acc.status === "needs_reconnect") {
        needsAttentionCount++;
      }
    }

    const averageHealthScore = Math.round(totalHealthScore / accounts.length);
    const averageDnsScore = Math.round(totalDnsScore / accounts.length);

    return Response.json({
      totalAccounts: accounts.length,
      averageHealthScore,
      averageDnsScore,
      totalDailyCapacity: totalCapacity,
      todayTotalSent: totalSentToday,
      warmingUpCount,
      graduatedCount,
      needsAttentionCount,
    });
  } catch (error) {
    console.error("Fetching email health summary failed:", error);
    return Response.json({ message: "Failed to fetch health summary" }, { status: 500 });
  }
}
