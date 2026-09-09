import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireRole } from "@/app/lib/rbac";
import { getWorkspaceLimits, DEFAULT_DAILY_LIMITS } from "@/app/lib/limits";

const EDITABLE_FIELDS = Object.keys(DEFAULT_DAILY_LIMITS);

function serialize(doc) {
  const out = {};
  for (const key of EDITABLE_FIELDS) out[key] = doc[key];
  return out;
}

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const doc = await getWorkspaceLimits(session.workspaceId);

    return Response.json(serialize(doc));
  } catch (error) {
    console.error("Fetching limits failed:", error);

    return Response.json({ message: "Failed to fetch limits" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const body = await req.json();
    const update = {};
    for (const key of EDITABLE_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    update.updatedAt = new Date();

    await getWorkspaceLimits(session.workspaceId); // ensures a doc exists to update

    const dailyLimits = await dbConnect("daily_limits");
    const result = await dailyLimits.findOneAndUpdate(
      { workspaceId: new ObjectId(session.workspaceId) },
      { $set: update },
      { returnDocument: "after" },
    );

    return Response.json(serialize(result));
  } catch (error) {
    console.error("Updating limits failed:", error);

    return Response.json({ message: "Failed to update limits" }, { status: 500 });
  }
}
