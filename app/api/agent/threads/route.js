import { requireAuth } from "@/app/lib/session";
import { requireAiAgentAccess } from "@/app/lib/rbac";
import { listAgentThreads } from "@/app/lib/ai/threadStore";
import { getWorkspaceAiKeys } from "@/app/lib/ai/modelResolver";

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const access = await requireAiAgentAccess(session);
    if (!access.ok) {
      return Response.json({
        hasAccess: false,
        role: access.role,
        threads: [],
        configuredProviders: [],
      });
    }

    const [threads, workspaceKeys] = await Promise.all([
      listAgentThreads(session.workspaceId, session.userId),
      getWorkspaceAiKeys(session.workspaceId),
    ]);

    const hasGateway = Boolean(
      workspaceKeys.gateway || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
    );

    return Response.json({
      hasAccess: true,
      role: access.role,
      threads,
      hasGateway,
      configuredProviders: Object.keys(workspaceKeys),
    });
  } catch (error) {
    console.error("[AgentThreads] GET error:", error);
    return Response.json({ message: "Failed to load agent threads" }, { status: 500 });
  }
}
