import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { getInboundToken } from "@/app/lib/integrations/inboundToken";
import { enrollLeads } from "@/app/lib/campaignEnrollment";

/**
 * Inbound webhook receiver for Zapier-style "create a lead in DripX" triggers.
 * Auth: ?token=<per-workspace token> (see /api/integrations/inbound-token), not a user
 * session — this is meant to be called by external automation tools, not the browser.
 */
export async function POST(req, { params }) {
  try {
    const { workspaceId } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || req.headers.get("x-dripx-token");

    let expectedToken;
    try {
      expectedToken = getInboundToken(workspaceId);
    } catch {
      return Response.json({ message: "Server misconfigured" }, { status: 500 });
    }

    if (!token || token !== expectedToken) {
      return Response.json({ message: "Invalid or missing token" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.firstName && !body.linkedinUrl && !body.email) {
      return Response.json(
        { message: "At least a name, LinkedIn URL or email is required" },
        { status: 400 },
      );
    }

    const leads = await dbConnect("leads");
    const doc = {
      workspaceId: new ObjectId(workspaceId),
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      headline: body.headline || "",
      company: body.company || "",
      jobTitle: body.jobTitle || "",
      linkedinUrl: body.linkedinUrl || "",
      email: body.email || "",
      customFields: body.customFields || {},
      tags: Array.isArray(body.tags) ? body.tags : [],
      source: "inbound_webhook",
      createdAt: new Date(),
    };
    const result = await leads.insertOne(doc);

    let enrollment = null;
    if (body.campaignId) {
      enrollment = await enrollLeads(body.campaignId, [result.insertedId.toString()]);
    }

    return Response.json(
      { message: "Lead created", leadId: result.insertedId.toString(), enrollment },
      { status: 201 },
    );
  } catch (error) {
    console.error("Inbound webhook failed:", error);

    return Response.json({ message: "Failed to process webhook" }, { status: 500 });
  }
}
