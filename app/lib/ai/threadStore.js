import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { sanitizeUIMessages } from "./sanitizeMessages.js";

export { sanitizeUIMessages };

/**
 * Extracts a concise title from the first user UIMessage.
 */
function deriveThreadTitle(messages = []) {
  const firstUser = messages.find((m) => m.role === "user");
  const textPart = firstUser?.parts?.find((p) => p.type === "text")?.text || "";
  const cleaned = textPart.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 64) : "New Agent Session";
}

export async function saveAgentThread({
  threadId,
  workspaceId,
  userId,
  modelId,
  mode,
  messages,
}) {
  const col = await dbConnect("agent_threads");
  const wsId = new ObjectId(workspaceId);
  const uId = new ObjectId(userId);
  const now = new Date();
  const cleanMessages = sanitizeUIMessages(messages);
  const title = deriveThreadTitle(cleanMessages);

  if (threadId && ObjectId.isValid(threadId)) {
    const existing = await col.findOneAndUpdate(
      { _id: new ObjectId(threadId), workspaceId: wsId, userId: uId },
      {
        $set: { messages: cleanMessages, modelId, mode, title, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, returnDocument: "after" }
    );
    if (existing) return existing._id.toString();
  }

  const inserted = await col.insertOne({
    workspaceId: wsId,
    userId: uId,
    title,
    modelId,
    mode,
    messages: cleanMessages,
    createdAt: now,
    updatedAt: now,
  });
  return inserted.insertedId.toString();
}

export async function listAgentThreads(workspaceId, userId) {
  const col = await dbConnect("agent_threads");
  const docs = await col
    .find({ workspaceId: new ObjectId(workspaceId), userId: new ObjectId(userId) })
    .project({ title: 1, modelId: 1, mode: 1, updatedAt: 1, createdAt: 1 })
    .sort({ updatedAt: -1 })
    .limit(40)
    .toArray();

  return docs.map((d) => ({
    id: d._id.toString(),
    title: d.title || "Agent Session",
    modelId: d.modelId,
    mode: d.mode,
    updatedAt: d.updatedAt,
  }));
}

/**
 * Resolves @mentioned context refs from the prompt composer into verified workspace summaries.
 */
export async function hydrateContextRefs(workspaceId, contextRefs = []) {
  if (!Array.isArray(contextRefs) || contextRefs.length === 0) return "";
  const wsId = new ObjectId(workspaceId);
  const lines = [];

  for (const ref of contextRefs.slice(0, 6)) {
    if (ref.type === "campaign" && ObjectId.isValid(ref.id)) {
      const campaigns = await dbConnect("campaigns");
      const camp = await campaigns.findOne({ _id: new ObjectId(ref.id), workspaceId: wsId });
      if (camp) {
        lines.push(`- Campaign "${camp.name}" (ID: ${camp._id.toString()}, status: ${camp.status}, channels: ${(camp.channels || []).join(",")})`);
      }
    } else if (ref.type === "tag" && ref.label) {
      const leads = await dbConnect("leads");
      const count = await leads.countDocuments({ workspaceId: wsId, tags: ref.label });
      lines.push(`- Lead Tag "${ref.label}" (${count} leads in workspace)`);
    } else if (ref.type === "conversation" && ObjectId.isValid(ref.id)) {
      const convos = await dbConnect("conversations");
      const convo = await convos.findOne({ _id: new ObjectId(ref.id), workspaceId: wsId });
      if (convo) {
        lines.push(`- Inbox Thread ID: ${convo._id.toString()} (channel: ${convo.channel}, subject: ${convo.subject || "N/A"})`);
      }
    } else if (ref.type === "file" && ref.content) {
      lines.push(`- Attached Snippet (${ref.label || "note"}):\n${String(ref.content).slice(0, 2000)}`);
    }
  }

  return lines.join("\n");
}
