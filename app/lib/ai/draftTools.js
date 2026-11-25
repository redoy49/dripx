import { ObjectId } from "mongodb";
import { tool } from "ai";
import { z } from "zod";
import { dbConnect } from "@/app/lib/mongoDb";
import { STEP_TYPES, BRANCH_END } from "@/app/lib/sequenceEngine";
import { enrollLeads } from "@/app/lib/campaignEnrollment";
import { serializeCampaign } from "@/app/api/campaigns/route";
import { validateSequence } from "@/app/(dashboard)/dashboard/new-campaign/flow/validation";

const stepInputSchema = z.object({
  type: z.enum([
    "email",
    "email_followup",
    "delay",
    "connection_request",
    "message",
    "inmail",
    "profile_visit",
    "like_post",
    "follow_up",
  ]),
  subject: z.string().optional().describe("Required for initial email or inmail steps"),
  template: z.string().optional().describe("Message body supporting {{firstName}}, {{company}} variables"),
  amount: z.number().optional().describe("Delay duration number when type is delay"),
  unit: z.enum(["minutes", "hours", "days"]).optional().describe("Delay unit when type is delay"),
});

export function createDraftTools(workspaceId, userId) {
  const wsId = new ObjectId(workspaceId);

  return {
    createCampaignDraft: tool({
      description: "Create a new outreach campaign in 'draft' status.",
      inputSchema: z.object({
        name: z.string().min(2).max(120),
        channels: z.array(z.enum(["email", "linkedin"])).min(1).default(["email"]),
      }),
      execute: async ({ name, channels }) => {
        const campaigns = await dbConnect("campaigns");
        const doc = {
          workspaceId: wsId,
          name: name.trim(),
          status: "draft",
          channels,
          createdByUserId: new ObjectId(userId),
          createdAt: new Date(),
          dailyLimitsOverride: null,
          stats: {},
        };
        const result = await campaigns.insertOne(doc);
        const campaignLeads = await dbConnect("campaign_leads");
        const serialized = await serializeCampaign({ ...doc, _id: result.insertedId }, campaignLeads);
        return { ...serialized, builderUrl: `/dashboard/new-campaign?id=${serialized.id}` };
      },
    }),

    buildSequenceDraft: tool({
      description: "Save a visual sequence of steps onto a 'draft' campaign so it appears in the React Flow Sequence Builder.",
      inputSchema: z.object({
        campaignId: z.string(),
        steps: z.array(stepInputSchema).min(1).max(15),
      }),
      execute: async ({ campaignId, steps }) => {
        if (!ObjectId.isValid(campaignId)) return { error: "Invalid campaignId" };
        const campaigns = await dbConnect("campaigns");
        const campaign = await campaigns.findOne({ _id: new ObjectId(campaignId), workspaceId: wsId });
        if (!campaign) return { error: "Campaign not found" };
        if (campaign.status !== "draft") {
          return { error: "Campaign must be in draft status before modifying sequence steps." };
        }

        const ids = steps.map(() => new ObjectId());
        const docs = steps.map((s, idx) => ({
          _id: ids[idx],
          campaignId: campaign._id,
          order: idx + 1,
          type: s.type,
          config:
            s.type === "delay"
              ? { amount: Math.max(1, s.amount || 1), unit: s.unit || "days" }
              : { ...(s.subject ? { subject: s.subject } : {}), ...(s.template ? { template: s.template } : {}) },
          branches: null,
          next: idx < steps.length - 1 ? ids[idx + 1] : BRANCH_END,
          position: { x: 380, y: 80 + idx * 170 },
        }));

        const channels = Array.from(new Set(docs.map((d) => STEP_TYPES[d.type]?.channel).filter(Boolean)));
        if (channels.length > 0) await campaigns.updateOne({ _id: campaign._id }, { $set: { channels } });

        const sequenceSteps = await dbConnect("sequence_steps");
        await sequenceSteps.deleteMany({ campaignId: campaign._id });
        await sequenceSteps.insertMany(docs);

        const validation = validateSequence(docs.map((d) => ({ ...d, id: d._id.toString() })));
        return {
          savedSteps: docs.length,
          builderUrl: `/dashboard/new-campaign?id=${campaign._id.toString()}`,
          validation: { isValid: validation.isValid, errors: validation.allErrors, warnings: validation.allWarnings },
        };
      },
    }),

    enrollLeadsToDraft: tool({
      description: "Enroll leads into a 'draft' campaign either by specific lead IDs or by a workspace lead tag.",
      inputSchema: z.object({
        campaignId: z.string(),
        leadIds: z.array(z.string()).optional(),
        tag: z.string().optional(),
      }),
      execute: async ({ campaignId, leadIds = [], tag }) => {
        if (!ObjectId.isValid(campaignId)) return { error: "Invalid campaignId" };
        const campaigns = await dbConnect("campaigns");
        const campaign = await campaigns.findOne({ _id: new ObjectId(campaignId), workspaceId: wsId });
        if (!campaign) return { error: "Campaign not found" };
        if (campaign.status !== "draft") return { error: "Only draft campaigns can be enrolled via this tool." };

        const leadsCol = await dbConnect("leads");
        let targetIds = leadIds.filter((id) => ObjectId.isValid(id));
        if (tag) {
          const tagged = await leadsCol.find({ workspaceId: wsId, tags: tag }).project({ _id: 1 }).limit(500).toArray();
          targetIds = [...new Set([...targetIds, ...tagged.map((l) => l._id.toString())])];
        }
        if (targetIds.length === 0) return { enrolled: 0, skipped: 0, message: "No matching leads found." };

        return { ...(await enrollLeads(campaignId, targetIds)), campaignId };
      },
    }),

    tagLeads: tool({
      description: "Add tags to a list of lead IDs in the workspace.",
      inputSchema: z.object({
        leadIds: z.array(z.string()).min(1).max(100),
        tags: z.array(z.string().min(1)).min(1).max(10),
      }),
      execute: async ({ leadIds, tags }) => {
        const validIds = leadIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
        if (!validIds.length) return { updated: 0 };
        const leadsCol = await dbConnect("leads");
        const res = await leadsCol.updateMany(
          { _id: { $in: validIds }, workspaceId: wsId },
          { $addToSet: { tags: { $each: tags } } }
        );
        return { updated: res.modifiedCount, tags };
      },
    }),
  };
}
