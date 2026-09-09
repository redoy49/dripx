import crypto from "crypto";
import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireRole } from "@/app/lib/rbac";

const WEBHOOK_EVENTS = ["connection.requested", "lead.replied", "lead.sequence_completed"];

function serialize(w) {
  return {
    id: w._id.toString(),
    url: w.url,
    events: w.events,
    status: w.status,
    secret: w.secret,
    createdAt: w.createdAt,
  };
}

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const webhooks = await dbConnect("webhooks");
    const items = await webhooks
      .find({ workspaceId: new ObjectId(session.workspaceId) })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({ items: items.map(serialize), availableEvents: WEBHOOK_EVENTS });
  } catch (error) {
    console.error("Fetching webhooks failed:", error);

    return Response.json({ message: "Failed to fetch webhooks" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const body = await req.json();
    const url = (body.url || "").trim();
    const events = Array.isArray(body.events)
      ? body.events.filter((e) => WEBHOOK_EVENTS.includes(e))
      : [];

    if (!url || !/^https?:\/\//.test(url)) {
      return Response.json({ message: "A valid webhook URL is required" }, { status: 400 });
    }
    if (events.length === 0) {
      return Response.json({ message: "Select at least one event" }, { status: 400 });
    }

    const webhooks = await dbConnect("webhooks");
    const doc = {
      workspaceId: new ObjectId(session.workspaceId),
      url,
      events,
      secret: crypto.randomBytes(24).toString("hex"),
      status: "active",
      createdAt: new Date(),
    };
    const result = await webhooks.insertOne(doc);

    return Response.json(serialize({ ...doc, _id: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error("Creating webhook failed:", error);

    return Response.json({ message: "Failed to create webhook" }, { status: 500 });
  }
}
