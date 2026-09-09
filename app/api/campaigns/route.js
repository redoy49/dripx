import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

export async function serializeCampaign(campaign, campaignLeadsCollection) {
  const [leadCount, pendingCount, inProgressCount, completedCount, repliedCount] = await Promise.all([
    campaignLeadsCollection.countDocuments({ campaignId: campaign._id }),
    campaignLeadsCollection.countDocuments({ campaignId: campaign._id, status: "pending" }),
    campaignLeadsCollection.countDocuments({ campaignId: campaign._id, status: "in_progress" }),
    campaignLeadsCollection.countDocuments({ campaignId: campaign._id, status: "completed" }),
    campaignLeadsCollection.countDocuments({ campaignId: campaign._id, status: "replied" }),
  ]);

  return {
    id: campaign._id.toString(),
    name: campaign.name,
    status: campaign.status,
    channels: campaign.channels || [],
    createdAt: campaign.createdAt,
    stats: campaign.stats || {},
    dailyLimitsOverride: campaign.dailyLimitsOverride || null,
    leadCount,
    repliedCount,
    statusBreakdown: {
      pending: pendingCount,
      inProgress: inProgressCount,
      completed: completedCount,
      replied: repliedCount,
    },
  };
}

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const campaigns = await dbConnect("campaigns");
    const campaignLeads = await dbConnect("campaign_leads");

    const docs = await campaigns
      .find({ workspaceId: new ObjectId(session.workspaceId) })
      .sort({ createdAt: -1 })
      .toArray();

    const items = await Promise.all(docs.map((doc) => serializeCampaign(doc, campaignLeads)));

    return Response.json({ items });
  } catch (error) {
    console.error("Fetching campaigns failed:", error);

    return Response.json({ message: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const name = (body.name || "").trim();

    if (!name) {
      return Response.json({ message: "Campaign name is required" }, { status: 400 });
    }

    const campaigns = await dbConnect("campaigns");
    const doc = {
      workspaceId: new ObjectId(session.workspaceId),
      name,
      status: "draft",
      channels: Array.isArray(body.channels) && body.channels.length ? body.channels : ["linkedin"],
      createdByUserId: new ObjectId(session.userId),
      createdAt: new Date(),
      dailyLimitsOverride: null,
      stats: {},
    };
    const result = await campaigns.insertOne(doc);

    const campaignLeads = await dbConnect("campaign_leads");
    const serialized = await serializeCampaign({ ...doc, _id: result.insertedId }, campaignLeads);

    return Response.json(serialized, { status: 201 });
  } catch (error) {
    console.error("Creating campaign failed:", error);

    return Response.json({ message: "Failed to create campaign" }, { status: 500 });
  }
}
