import { ObjectId } from "mongodb";
import { tool } from "ai";
import { z } from "zod";
import { dbConnect } from "@/app/lib/mongoDb";
import { activateCampaignForWorkspace } from "@/app/lib/campaignActivation";
import { sendConversationReply } from "@/app/lib/inboxReply";
import { serializeCampaign } from "@/app/api/campaigns/route";

/**
 * Tier 3 Guarded Tools: Every tool here is marked `'user-approval'` on ToolLoopAgent
 * so live dispatches, activations, pauses, and deletes require explicit confirmation.
 */
export function createGuardedTools(workspaceId, userId) {
  const wsId = new ObjectId(workspaceId);

  return {
    activateCampaign: tool({
      description: "Activate a campaign and schedule outreach jobs for all enrolled leads. Requires user approval.",
      inputSchema: z.object({
        campaignId: z.string(),
        summary: z.string().describe("Human-readable summary of what will be activated"),
      }),
      execute: async ({ campaignId }) => {
        if (!ObjectId.isValid(campaignId)) return { error: "Invalid campaignId" };
        const res = await activateCampaignForWorkspace(campaignId, workspaceId);
        if (!res.ok) return { error: res.message };
        return { activated: true, queuedLeads: res.queuedLeads, campaign: res.campaign };
      },
    }),

    updateCampaignStatus: tool({
      description: "Pause a running campaign or revert it to draft. Requires user approval.",
      inputSchema: z.object({
        campaignId: z.string(),
        status: z.enum(["paused", "draft"]),
        reason: z.string().optional(),
      }),
      execute: async ({ campaignId, status }) => {
        if (!ObjectId.isValid(campaignId)) return { error: "Invalid campaignId" };
        const campaigns = await dbConnect("campaigns");
        const campaignLeads = await dbConnect("campaign_leads");
        const updated = await campaigns.findOneAndUpdate(
          { _id: new ObjectId(campaignId), workspaceId: wsId },
          { $set: { status } },
          { returnDocument: "after" }
        );
        if (!updated) return { error: "Campaign not found" };
        return serializeCampaign(updated, campaignLeads);
      },
    }),

    sendInboxReply: tool({
      description: "Send a live Email or LinkedIn reply to a prospect in the Unified Inbox. Requires user approval.",
      inputSchema: z.object({
        conversationId: z.string(),
        body: z.string().min(1),
      }),
      execute: async ({ conversationId, body }) => {
        if (!ObjectId.isValid(conversationId)) return { error: "Invalid conversationId" };
        const res = await sendConversationReply({
          conversationId,
          workspaceId,
          userId,
          text: body,
        });
        if (!res.ok) return { error: res.message };
        return { sent: true, message: res.data };
      },
    }),

    deleteCampaign: tool({
      description: "Permanently delete a campaign and its steps, enrollments, and queued jobs. Requires user approval.",
      inputSchema: z.object({
        campaignId: z.string(),
        campaignName: z.string(),
      }),
      execute: async ({ campaignId }) => {
        if (!ObjectId.isValid(campaignId)) return { error: "Invalid campaignId" };
        const cId = new ObjectId(campaignId);
        const campaigns = await dbConnect("campaigns");
        const res = await campaigns.deleteOne({ _id: cId, workspaceId: wsId });
        if (!res.deletedCount) return { error: "Campaign not found" };

        const [steps, cl, jobs] = await Promise.all([
          dbConnect("sequence_steps"),
          dbConnect("campaign_leads"),
          dbConnect("jobs"),
        ]);
        await Promise.all([
          steps.deleteMany({ campaignId: cId }),
          cl.deleteMany({ campaignId: cId }),
          jobs.deleteMany({ campaignId: cId }),
        ]);
        return { deleted: true, campaignId };
      },
    }),
  };
}
