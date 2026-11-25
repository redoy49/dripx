import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireAiAgentAccess } from "@/app/lib/rbac";

export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireAiAgentAccess(session);
    if (!ok) return forbidden;

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const wsId = new ObjectId(session.workspaceId);

    const [campaignsCol, leadsCol, convosCol] = await Promise.all([
      dbConnect("campaigns"),
      dbConnect("leads"),
      dbConnect("conversations"),
    ]);

    const [campaigns, tags, convos] = await Promise.all([
      campaignsCol.find({ workspaceId: wsId }).sort({ createdAt: -1 }).limit(15).toArray(),
      leadsCol.distinct("tags", { workspaceId: wsId }),
      convosCol.find({ workspaceId: wsId, status: { $ne: "archived" } }).sort({ lastMessageAt: -1 }).limit(10).toArray(),
    ]);

    const items = [
      ...campaigns.map((c) => ({
        type: "campaign",
        id: c._id.toString(),
        label: c.name,
        meta: `Campaign · ${c.status}`,
      })),
      ...tags.filter(Boolean).map((t) => ({
        type: "tag",
        id: `tag:${t}`,
        label: t,
        meta: "Lead Tag",
      })),
      ...convos.map((cv) => ({
        type: "conversation",
        id: cv._id.toString(),
        label: cv.subject || `${cv.channel} conversation`,
        meta: `Inbox · ${cv.channel}`,
      })),
    ].filter((item) => !q || item.label.toLowerCase().includes(q) || item.meta.toLowerCase().includes(q));

    return Response.json({ items: items.slice(0, 12) });
  } catch (error) {
    console.error("[AgentContext] GET error:", error);
    return Response.json({ message: "Failed to load context" }, { status: 500 });
  }
}
