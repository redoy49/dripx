import { Suspense } from "react";
import AgentLoading from "./loading";
import AgentWorkspaceClient from "./AgentWorkspaceClient";

export const metadata = {
  title: "AI Agent — DripX",
  description: "Multi-model AI Agent command center for DripX campaigns, leads, and inbox.",
};

/**
 * Server Component Shell for AI Agent Workspace.
 * Streams instant skeleton layout with zero CLS.
 */
export default function AgentPage() {
  return (
    <Suspense fallback={<AgentLoading />}>
      <AgentWorkspaceClient />
    </Suspense>
  );
}
