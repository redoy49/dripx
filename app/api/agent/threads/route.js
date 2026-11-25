import { requireAuth } from "@/app/lib/session";
import { requireAiAgentAccess } from "@/app/lib/rbac";
import { listAgentThreads } from "@/app/lib/ai/threadStore";
import { getWorkspaceAvailableModels, getWorkspaceProviderConfigs } from "@/app/lib/ai/modelResolver";

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
        availableModels: [],
      });
    }

    const [threads, availableModels, configs] = await Promise.all([
      listAgentThreads(session.workspaceId, session.userId),
      getWorkspaceAvailableModels(session.workspaceId),
      getWorkspaceProviderConfigs(session.workspaceId),
    ]);

    return Response.json({
      hasAccess: true,
      role: access.role,
      threads,
      availableModels,
      connectedProviderCount: Object.keys(configs).length,
    });
  } catch (error) {
    console.error("[AgentThreads] GET error:", error);
    return Response.json({ message: "Failed to load agent threads" }, { status: 500 });
  }
}
