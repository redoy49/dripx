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
    const lead = conversation.leadId ? await leads.findOne({ _id: conversation.leadId }) : null;

    let campaign = null;
    if (conversation.leadId) {
      const campaignLeads = await dbConnect("campaign_leads");
      const campaigns = await dbConnect("campaigns");
      const enrollment = await campaignLeads.findOne(
        { workspaceId: new ObjectId(session.workspaceId), leadId: conversation.leadId },
        { sort: { enrolledAt: -1, lastActionAt: -1 } },
      );

      if (enrollment) {
        const campaignDoc = await campaigns.findOne({ _id: enrollment.campaignId });
        if (campaignDoc) {
          campaign = {
            id: campaignDoc._id.toString(),
            name: campaignDoc.name,
            status: campaignDoc.status,
            enrollmentStatus: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
            lastActionAt: enrollment.lastActionAt,
          };
        }
      }
    }

    return Response.json({
      id: conversation._id.toString(),
      channel: conversation.channel,
      status: conversation.status,
      subject: conversation.subject || null,
      lastMessageAt: conversation.lastMessageAt || null,
      unreadCount: conversation.unreadCount || 0,
      senderEmailAccountId: conversation.senderEmailAccountId?.toString() || null,
      lead: lead
        ? {
            id: lead._id.toString(),
            firstName: lead.firstName || "",
            lastName: lead.lastName || "",
            company: lead.company || "",
            jobTitle: lead.jobTitle || "",
            headline: lead.headline || lead.jobTitle || "",
            email: lead.email || "",
            phone: lead.phone || "",
            linkedinUrl: lead.linkedinUrl || "",
            tags: lead.tags || [],
            customFields: lead.customFields || {},
            createdAt: lead.createdAt || null,
          }
        : null,
      campaign,
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

    // Handle sequence pause/resume actions if requested from the lead detail panel
    if (body.action === "pause_sequence" && result.leadId) {
      const campaignLeads = await dbConnect("campaign_leads");
      await campaignLeads.updateMany(
        { workspaceId: new ObjectId(session.workspaceId), leadId: result.leadId, status: "in_progress" },
        { $set: { status: "paused", pausedAt: new Date() } },
      );
    } else if (body.action === "resume_sequence" && result.leadId) {
      const campaignLeads = await dbConnect("campaign_leads");
      await campaignLeads.updateMany(
        { workspaceId: new ObjectId(session.workspaceId), leadId: result.leadId, status: "paused" },
        { $set: { status: "in_progress", resumedAt: new Date() } },
      );
    }

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
