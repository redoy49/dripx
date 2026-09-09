import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";

// Enrolls a set of leads into a campaign as campaign_leads rows, skipping leads already
// enrolled in that campaign. currentStepId starts null — set once the campaign is activated
// and the first job for each lead is created (see campaigns/[id]/activate).
export async function enrollLeads(campaignId, leadIds) {
  if (!leadIds.length) return { enrolled: 0, skipped: 0 };

  const campaignLeads = await dbConnect("campaign_leads");
  const campaignObjectId = new ObjectId(campaignId);
  const leadObjectIds = leadIds.map((id) => new ObjectId(id));

  const existing = await campaignLeads
    .find({ campaignId: campaignObjectId, leadId: { $in: leadObjectIds } })
    .project({ leadId: 1 })
    .toArray();
  const existingSet = new Set(existing.map((e) => e.leadId.toString()));

  const toInsert = leadObjectIds
    .filter((id) => !existingSet.has(id.toString()))
    .map((leadId) => ({
      campaignId: campaignObjectId,
      leadId,
      currentStepId: null,
      status: "pending",
      enrolledAt: new Date(),
      lastActionAt: null,
    }));

  if (toInsert.length > 0) {
    await campaignLeads.insertMany(toInsert);
  }

  return { enrolled: toInsert.length, skipped: leadObjectIds.length - toInsert.length };
}
