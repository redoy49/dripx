import { requireAuth } from "@/app/lib/session";
import { syncAllConnectedEmailAccounts } from "@/app/lib/email";

export async function POST(_req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const result = await syncAllConnectedEmailAccounts(session.workspaceId);

    return Response.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Conversations sync failed:", error);
    return Response.json({ message: "Failed to sync conversations" }, { status: 500 });
  }
}
