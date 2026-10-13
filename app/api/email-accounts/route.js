import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { sanitizeEmailAccount } from "@/app/lib/crypto";
import { computeRampUpStatus, shouldResetDailyCount, evaluateMailboxHealth } from "@/app/lib/rampUpEngine";

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
      .sort({ createdAt: -1 })
      .toArray();

    const items = accounts.map((acc) => {
      const sanitized = sanitizeEmailAccount(acc);
      const rampUpStatus = computeRampUpStatus(sanitized);

      // Check if UTC day rolled over
      const isNewDay = shouldResetDailyCount(sanitized.lastSentAt);
      const effectiveTodaySentCount = isNewDay ? 0 : sanitized.todaySentCount;

      const health = evaluateMailboxHealth({
        status: sanitized.status,
        dnsScore: sanitized.dnsHealth?.score ?? 100,
        recentErrorCount: sanitized.lastError ? 1 : 0,
        rampUp: sanitized.rampUp,
      });

      return {
        ...sanitized,
        todaySentCount: effectiveTodaySentCount,
        rampUpStatus,
        health,
      };
    });

    return Response.json({ items });
  } catch (error) {
    console.error("Fetching email accounts failed:", error);
    return Response.json({ message: "Failed to fetch email accounts" }, { status: 500 });
  }
}
