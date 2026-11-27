import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { getWorkspaceLeads, serializeLead } from "@/app/lib/leadsLoader";

export { serializeLead };

// List leads for the current workspace, with optional search/tag/source/campaign/status filters + pagination.
export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const tag = searchParams.get("tag");
    const source = searchParams.get("source");
    const campaignId = searchParams.get("campaignId");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

    const data = await getWorkspaceLeads({
      workspaceId: session.workspaceId,
      search,
      tag,
      source,
      campaignId,
      status,
      page,
      limit,
    });

    return Response.json(data);
  } catch (error) {
    console.error("Fetching leads failed:", error);
    return Response.json({ message: "Failed to fetch leads" }, { status: 500 });
  }
}

// Create a single lead manually.
export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const body = await req.json();

    if (!body.firstName && !body.linkedinUrl && !body.email) {
      return Response.json(
        { message: "At least a name, LinkedIn URL or email is required" },
        { status: 400 },
      );
    }

    const leads = await dbConnect("leads");
    const doc = {
      workspaceId: new ObjectId(session.workspaceId),
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      headline: body.headline || "",
      company: body.company || "",
      jobTitle: body.jobTitle || "",
      linkedinUrl: body.linkedinUrl || "",
      email: body.email || "",
      customFields: body.customFields || {},
      tags: Array.isArray(body.tags) ? body.tags : [],
      source: body.source || "manual",
      createdAt: new Date(),
    };
    const result = await leads.insertOne(doc);

    return Response.json(serializeLead({ ...doc, _id: result.insertedId }), {
      status: 201,
    });
  } catch (error) {
    console.error("Creating lead failed:", error);
    return Response.json({ message: "Failed to create lead" }, { status: 500 });
  }
}
