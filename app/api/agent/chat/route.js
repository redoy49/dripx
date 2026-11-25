import { ObjectId } from "mongodb";
import { createAgentUIStreamResponse } from "ai";
import { requireAuth } from "@/app/lib/session";
import { requireAiAgentAccess } from "@/app/lib/rbac";
import { formatAgentStreamError, resolveAgentModel } from "@/app/lib/ai/modelResolver";
import { createDripXAgent } from "@/app/lib/ai/createDripXAgent";
import { hydrateContextRefs, saveAgentThread } from "@/app/lib/ai/threadStore";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireAiAgentAccess(session);
    if (!ok) return forbidden;

    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (messages.length === 0) {
      return Response.json({ message: "Messages are required" }, { status: 400 });
    }

    const mode = ["plan", "build", "ask"].includes(body.mode) ? body.mode : "build";
    const reasoningEffort = ["low", "medium", "high"].includes(body.reasoningEffort)
      ? body.reasoningEffort
      : "high";

    const activeThreadId =
      body.threadId && ObjectId.isValid(body.threadId)
        ? body.threadId
        : new ObjectId().toString();

    const [resolvedModel, hydratedContext] = await Promise.all([
      resolveAgentModel({
        workspaceId: session.workspaceId,
        modelId: body.modelId,
        sourceProviderId: body.sourceProviderId,
        reasoningEffort,
      }),
      hydrateContextRefs(session.workspaceId, body.contextRefs),
    ]);

    const agent = createDripXAgent({
      resolvedModel,
      workspaceId: session.workspaceId,
      userId: session.userId,
      mode,
      hydratedContext,
    });

    return await createAgentUIStreamResponse({
      agent,
      uiMessages: messages,
      originalMessages: messages,
      sendReasoning: true,
      headers: {
        "X-Agent-Thread-Id": activeThreadId,
      },
      onError: (err) => {
        const msg = formatAgentStreamError(err);
        if (/tool|function.?call/i.test(msg) && mode !== "ask") {
          return `${msg} — Tip: Switch mode from Build to Ask for models without tool calling.`;
        }
        return msg;
      },
      onFinish: async ({ messages: finalMessages }) => {
        try {
          await saveAgentThread({
            threadId: activeThreadId,
            workspaceId: session.workspaceId,
            userId: session.userId,
            modelId: resolvedModel.modelMeta.id,
            mode,
            messages: finalMessages,
          });
        } catch (saveErr) {
          console.error("[AgentChat] Failed to persist thread:", saveErr);
        }
      },
    });
  } catch (error) {
    console.error("[AgentChat] Error:", error);
    const status = error.code === "MISSING_AI_CREDENTIALS" ? 400 : 500;
    return Response.json(
      {
        message: formatAgentStreamError(error),
        code: error.code || "AGENT_ERROR",
      },
      { status }
    );
  }
}
