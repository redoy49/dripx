import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

// List leads for the current workspace, with optional search/tag/source filters + pagination.
export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const tag = searchParams.get("tag");
    const source = searchParams.get("source");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

    const query = { workspaceId: new ObjectId(session.workspaceId) };

    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { firstName: re },
        { lastName: re },
        { company: re },
        { jobTitle: re },
        { email: re },
      ];
    }
    if (tag) query.tags = tag;
    if (source) query.source = source;

    const leads = await dbConnect("leads");
    const total = await leads.countDocuments(query);
    const items = await leads
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return Response.json({
      items: items.map(serializeLead),
      total,
      page,
      limit,
    });
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

export function serializeLead(lead) {
  return {
    id: lead._id.toString(),
    firstName: lead.firstName || "",
    lastName: lead.lastName || "",
    headline: lead.headline || "",
    company: lead.company || "",
    jobTitle: lead.jobTitle || "",
    linkedinUrl: lead.linkedinUrl || "",
    email: lead.email || "",
    customFields: lead.customFields || {},
    tags: lead.tags || [],
    source: lead.source || "manual",
    createdAt: lead.createdAt,
  };
}
