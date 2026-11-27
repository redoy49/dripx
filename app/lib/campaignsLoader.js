import { cache } from "react";
import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";

function toIso(val) {
  if (!val) return null;
  return val instanceof Date ? val.toISOString() : String(val);
}

/**
 * Loads all workspace campaigns and aggregates lead status breakdowns
 * in ONE MongoDB `$group` query instead of N*5 countDocuments calls.
 */
export const getWorkspaceCampaigns = cache(async (workspaceId) => {
  const wsObjId = new ObjectId(workspaceId);
  const [campaignsCol, campaignLeadsCol] = await Promise.all([
    dbConnect("campaigns"),
    dbConnect("campaign_leads"),
  ]);

  const docs = await campaignsCol
    .find({ workspaceId: wsObjId })
    .sort({ createdAt: -1 })
    .toArray();

  if (docs.length === 0) return [];

  const campaignIds = docs.map((d) => d._id);
  const statusRows = await campaignLeadsCol
    .aggregate([
      { $match: { campaignId: { $in: campaignIds } } },
      {
        $group: {
          _id: { campaignId: "$campaignId", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const statsByCampaign = new Map();
  for (const row of statusRows) {
    const cid = row._id.campaignId.toString();
    if (!statsByCampaign.has(cid)) {
      statsByCampaign.set(cid, {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        replied: 0,
      });
    }
    const entry = statsByCampaign.get(cid);
    const st = row._id.status;
    entry.total += row.count;
    if (st === "pending") entry.pending += row.count;
    else if (st === "in_progress") entry.inProgress += row.count;
    else if (st === "completed") entry.completed += row.count;
    else if (st === "replied") entry.replied += row.count;
  }

  return docs.map((c) => {
    const breakdown = statsByCampaign.get(c._id.toString()) || {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      replied: 0,
    };

    return {
      id: c._id.toString(),
      name: c.name,
      status: c.status,
      channels: c.channels || [],
      senderEmailAccountId: c.senderEmailAccountId ? c.senderEmailAccountId.toString() : null,
      createdAt: toIso(c.createdAt),
      stats: c.stats || {},
      dailyLimitsOverride: c.dailyLimitsOverride || null,
      scheduleOverride: c.scheduleOverride || null,
      leadCount: breakdown.total,
      repliedCount: breakdown.replied,
      statusBreakdown: {
        pending: breakdown.pending,
        inProgress: breakdown.inProgress,
        completed: breakdown.completed,
        replied: breakdown.replied,
      },
    };
  });
});
