import { requireAuth } from "@/app/lib/session";
import { getDashboardSummary } from "@/app/lib/dashboardSummary";

export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";

    const summary = await getDashboardSummary({
      userId: session.userId,
      workspaceId: session.workspaceId,
      range,
    });

    return Response.json(summary);
  } catch (error) {
    console.error("Dashboard summary execution failed:", error);
    return Response.json({ message: "Failed to generate dashboard summary" }, { status: 500 });
  }
}
