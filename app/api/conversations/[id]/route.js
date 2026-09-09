import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

export async function GET(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const conversations = await dbConnect("conversations");
    const conversation = await conversations.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });
    if (!conversation) return Response.json({ message: "Conversation not found" }, { status: 404 });

    const leads = await dbConnect("leads");
    const lead = await leads.findOne({ _id: conversation.leadId });

    return Response.json({
      id: conversation._id.toString(),
      channel: conversation.channel,
      status: conversation.status,
      unreadCount: conversation.unreadCount || 0,
      lead: lead
        ? {
            id: lead._id.toString(),
            firstName: lead.firstName,
            lastName: lead.lastName,
            company: lead.company,
            jobTitle: lead.jobTitle,
            email: lead.email,
            linkedinUrl: lead.linkedinUrl,
          }
        : null,
    });
  } catch (error) {
    console.error("Fetching conversation failed:", error);

    return Response.json({ message: "Failed to fetch conversation" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const body = await req.json();
    const update = {};

    if (body.status && ["open", "archived", "important"].includes(body.status)) {
      update.status = body.status;
    }
    if (body.markRead) update.unreadCount = 0;

    const conversations = await dbConnect("conversations");
    const result = await conversations.findOneAndUpdate(
      { _id: new ObjectId(id), workspaceId: new ObjectId(session.workspaceId) },
      { $set: update },
      { returnDocument: "after" },
    );

    if (!result) return Response.json({ message: "Conversation not found" }, { status: 404 });

    return Response.json({
      id: result._id.toString(),
      status: result.status,
      unreadCount: result.unreadCount || 0,
    });
  } catch (error) {
    console.error("Updating conversation failed:", error);

    return Response.json({ message: "Failed to update conversation" }, { status: 500 });
  }
}
