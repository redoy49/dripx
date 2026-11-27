import { Suspense } from "react";
import AgentLoading from "./loading";
import AgentWorkspaceClient from "./AgentWorkspaceClient";
import { getLayoutAuthData } from "@/app/lib/serverSession";
import { requireAiAgentAccess } from "@/app/lib/rbac";
import { listAgentThreads } from "@/app/lib/ai/threadStore";
import { getWorkspaceAvailableModels } from "@/app/lib/ai/modelResolver";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI Agent — DripX",
  description: "Multi-model AI Agent command center for DripX campaigns, leads, and inbox.",
};

async function AgentStream() {
  const auth = await getLayoutAuthData();
  let initialAgentData = null;

  if (auth?.session) {
    try {
      const access = await requireAiAgentAccess(auth.session);
      if (!access.ok) {
        initialAgentData = {
          hasAccess: false,
          role: access.role,
          threads: [],
          availableModels: [],
        };
      } else {
        const [threads, availableModels] = await Promise.all([
          listAgentThreads(auth.session.workspaceId, auth.session.userId),
          getWorkspaceAvailableModels(auth.session.workspaceId),
        ]);
        initialAgentData = {
          hasAccess: true,
          role: access.role,
          threads,
          availableModels,
        };
      }
    } catch (err) {
      if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
      console.error("Server agent stream failed, falling back to client fetch:", err);
    }
  }

  return <AgentWorkspaceClient initialAgentData={initialAgentData} />;
}

export default function AgentPage() {
  return (
    <Suspense fallback={<AgentLoading />}>
      <AgentStream />
    </Suspense>
  );
}
