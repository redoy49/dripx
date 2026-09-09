import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { serializeLead } from "@/app/api/leads/route";

const EDITABLE_FIELDS = [
  "firstName",
  "lastName",
  "headline",
  "company",
  "jobTitle",
  "linkedinUrl",
  "email",
  "customFields",
  "tags",
  "source",
];

export async function GET(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const leads = await dbConnect("leads");
    const lead = await leads.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });

    if (!lead) return Response.json({ message: "Lead not found" }, { status: 404 });

    const campaignLeads = await dbConnect("campaign_leads");
    const enrollments = await campaignLeads.find({ leadId: lead._id }).toArray();

    return Response.json({ ...serializeLead(lead), campaignCount: enrollments.length });
  } catch (error) {
    console.error("Fetching lead failed:", error);

    return Response.json({ message: "Failed to fetch lead" }, { status: 500 });
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

    const leads = await dbConnect("leads");
    const result = await leads.findOneAndUpdate(
      { _id: new ObjectId(id), workspaceId: new ObjectId(session.workspaceId) },
      { $set: update },
      { returnDocument: "after" },
    );

    if (!result) return Response.json({ message: "Lead not found" }, { status: 404 });

    return Response.json(serializeLead(result));
  } catch (error) {
    console.error("Updating lead failed:", error);

    return Response.json({ message: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const leads = await dbConnect("leads");
    const result = await leads.deleteOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });

    if (result.deletedCount === 0) {
      return Response.json({ message: "Lead not found" }, { status: 404 });
    }

    return Response.json({ message: "Lead deleted" });
  } catch (error) {
    console.error("Deleting lead failed:", error);

    return Response.json({ message: "Failed to delete lead" }, { status: 500 });
  }
}
