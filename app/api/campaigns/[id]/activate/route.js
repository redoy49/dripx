import { requireAuth } from "@/app/lib/session";
import { requireRole } from "@/app/lib/rbac";
import { activateCampaignForWorkspace } from "@/app/lib/campaignActivation";

export async function POST(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const { id } = await params;
    const result = await activateCampaignForWorkspace(id, session.workspaceId);
    if (!result.ok) {
      return Response.json({ message: result.message }, { status: result.status });
    }

    return Response.json({
      campaign: result.campaign,
      queuedLeads: result.queuedLeads,
    });
  } catch (error) {
    console.error("Activating campaign failed:", error);
    return Response.json({ message: "Failed to activate campaign" }, { status: 500 });
  }
}
