import { requireAuth } from "@/app/lib/session";
import { getInboundToken } from "@/app/lib/integrations/inboundToken";

export async function GET(req) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const token = getInboundToken(session.workspaceId);
  const origin = new URL(req.url).origin;

  return Response.json({
    url: `${origin}/api/webhooks/inbound/${session.workspaceId}?token=${token}`,
  });
}
