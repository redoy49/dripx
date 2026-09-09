import { requireAuth } from "@/app/lib/session";
import { getHubspotIntegration } from "@/app/lib/integrations/hubspot";

export async function GET() {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const doc = await getHubspotIntegration(session.workspaceId);

  return Response.json({
    status: doc?.status || "disconnected",
    serverConfigured: !!(process.env.HUBSPOT_CLIENT_ID && process.env.HUBSPOT_CLIENT_SECRET),
  });
}
