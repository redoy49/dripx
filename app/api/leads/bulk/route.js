import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { enrollLeads } from "@/app/lib/campaignEnrollment";

// Handles atomic bulk operations for leads in the current workspace:
// - 'enroll': Bulk enroll selected leads into a campaign (auto-starts jobs if active)
// - 'add_tags': Add tags to selected leads
// - 'remove_tags': Remove tags from selected leads
// - 'delete': Bulk delete leads and safely cancel queued jobs
export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const workspaceObjectId = new ObjectId(session.workspaceId);
    const body = await req.json();

    const { operation, leadIds } = body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return Response.json({ message: "leadIds array is required" }, { status: 400 });
    }

    const validOperations = ["enroll", "add_tags", "remove_tags", "delete"];
    if (!validOperations.includes(operation)) {
      return Response.json(
        { message: `Invalid operation. Must be one of: ${validOperations.join(", ")}` },
        { status: 400 },
      );
    }

    const leadObjectIds = leadIds.map((id) => new ObjectId(id));
    const leadsCol = await dbConnect("leads");

    // Ensure all target leads belong to user's workspace
    const ownedLeads = await leadsCol
      .find({ _id: { $in: leadObjectIds }, workspaceId: workspaceObjectId })
      .project({ _id: 1 })
      .toArray();

    const verifiedLeadIds = ownedLeads.map((l) => l._id);
    if (verifiedLeadIds.length === 0) {
      return Response.json({ message: "No matching leads found in workspace" }, { status: 404 });
    }

    // --- OPERATION: ENROLL ---
    if (operation === "enroll") {
      if (!body.campaignId) {
        return Response.json({ message: "campaignId is required for enroll operation" }, { status: 400 });
      }

      const campaignsCol = await dbConnect("campaigns");
      const campaign = await campaignsCol.findOne({
        _id: new ObjectId(body.campaignId),
        workspaceId: workspaceObjectId,
      });

      if (!campaign) {
        return Response.json({ message: "Campaign not found in workspace" }, { status: 404 });
      }

      const enrollResult = await enrollLeads(
        body.campaignId,
        verifiedLeadIds.map((id) => id.toString()),
      );

      return Response.json({
        ok: true,
        operation: "enroll",
        campaignId: body.campaignId,
        campaignName: campaign.name,
        ...enrollResult,
      });
    }

    // --- OPERATION: ADD TAGS ---
    if (operation === "add_tags") {
      const tags = (Array.isArray(body.tags) ? body.tags : [body.tag]).filter(Boolean);
      if (tags.length === 0) {
        return Response.json({ message: "At least one tag is required" }, { status: 400 });
      }

      const updateResult = await leadsCol.updateMany(
        { _id: { $in: verifiedLeadIds }, workspaceId: workspaceObjectId },
        { $addToSet: { tags: { $each: tags } } },
      );

      return Response.json({
        ok: true,
        operation: "add_tags",
        modifiedCount: updateResult.modifiedCount,
        tags,
      });
    }

    // --- OPERATION: REMOVE TAGS ---
    if (operation === "remove_tags") {
      const tags = (Array.isArray(body.tags) ? body.tags : [body.tag]).filter(Boolean);
      if (tags.length === 0) {
        return Response.json({ message: "At least one tag is required" }, { status: 400 });
      }

      const updateResult = await leadsCol.updateMany(
        { _id: { $in: verifiedLeadIds }, workspaceId: workspaceObjectId },
        { $pull: { tags: { $in: tags } } },
      );

      return Response.json({
        ok: true,
        operation: "remove_tags",
        modifiedCount: updateResult.modifiedCount,
        tags,
      });
    }

    // --- OPERATION: DELETE ---
    if (operation === "delete") {
      const campaignLeadsCol = await dbConnect("campaign_leads");
      const jobsCol = await dbConnect("jobs");

      const [deletedLeads, deletedEnrollments, deletedJobs] = await Promise.all([
        leadsCol.deleteMany({ _id: { $in: verifiedLeadIds }, workspaceId: workspaceObjectId }),
        campaignLeadsCol.deleteMany({ leadId: { $in: verifiedLeadIds } }),
        jobsCol.deleteMany({
          workspaceId: workspaceObjectId,
          leadId: { $in: verifiedLeadIds },
          status: "queued",
        }),
      ]);

      return Response.json({
        ok: true,
        operation: "delete",
        deletedCount: deletedLeads.deletedCount,
        enrollmentsRemoved: deletedEnrollments.deletedCount,
        queuedJobsCancelled: deletedJobs.deletedCount,
      });
    }

    return Response.json({ message: "Unhandled operation" }, { status: 400 });
  } catch (error) {
    console.error("Bulk lead operation failed:", error);
    return Response.json({ message: "Failed to perform bulk operation" }, { status: 500 });
  }
}
