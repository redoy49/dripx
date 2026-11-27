import { requireAuth } from "@/app/lib/session";
import { getConversationsList } from "@/app/lib/conversationsLoader";

export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const channel = searchParams.get("channel") || "all";

    const items = await getConversationsList({
      workspaceId: session.workspaceId,
      filter,
      channel,
    });

    return Response.json({ items });
  } catch (error) {
    console.error("Fetching conversations failed:", error);
    return Response.json({ message: "Failed to fetch conversations" }, { status: 500 });
  }
}
