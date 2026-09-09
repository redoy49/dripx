import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireRole } from "@/app/lib/rbac";
import { serializeCampaign } from "@/app/api/campaigns/route";

const EDITABLE_FIELDS = ["name", "status", "channels", "dailyLimitsOverride"];

export async function GET(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const campaigns = await dbConnect("campaigns");
    const campaignLeads = await dbConnect("campaign_leads");

    const campaign = await campaigns.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });

    if (!campaign) return Response.json({ message: "Campaign not found" }, { status: 404 });

    return Response.json(await serializeCampaign(campaign, campaignLeads));
  } catch (error) {
    console.error("Fetching campaign failed:", error);

    return Response.json({ message: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const body = await req.json();

    const update = {};
    for (const key of EDITABLE_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    if (update.status && !["draft", "active", "paused", "completed"].includes(update.status)) {
      return Response.json({ message: "Invalid status" }, { status: 400 });
    }

    const campaigns = await dbConnect("campaigns");
    const campaignLeads = await dbConnect("campaign_leads");

    const result = await campaigns.findOneAndUpdate(
      { _id: new ObjectId(id), workspaceId: new ObjectId(session.workspaceId) },
      { $set: update },
      { returnDocument: "after" },
    );

    if (!result) return Response.json({ message: "Campaign not found" }, { status: 404 });

    return Response.json(await serializeCampaign(result, campaignLeads));
  } catch (error) {
    console.error("Updating campaign failed:", error);

    return Response.json({ message: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const { id } = await params;
    const campaignObjectId = new ObjectId(id);
    const workspaceObjectId = new ObjectId(session.workspaceId);

    const campaigns = await dbConnect("campaigns");
    const result = await campaigns.deleteOne({
      _id: campaignObjectId,
      workspaceId: workspaceObjectId,
    });

    if (result.deletedCount === 0) {
      return Response.json({ message: "Campaign not found" }, { status: 404 });
    }

    // Clean up everything owned by this campaign so deleting it doesn't leave orphans
    // that the scheduler or analytics would otherwise choke on.
    const [sequenceSteps, campaignLeads, jobs] = await Promise.all([
      dbConnect("sequence_steps"),
      dbConnect("campaign_leads"),
      dbConnect("jobs"),
    ]);
    await Promise.all([
      sequenceSteps.deleteMany({ campaignId: campaignObjectId }),
      campaignLeads.deleteMany({ campaignId: campaignObjectId }),
      jobs.deleteMany({ campaignId: campaignObjectId }),
    ]);

    return Response.json({ message: "Campaign deleted" });
  } catch (error) {
    console.error("Deleting campaign failed:", error);

    return Response.json({ message: "Failed to delete campaign" }, { status: 500 });
  }
}
