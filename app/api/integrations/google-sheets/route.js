import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireRole } from "@/app/lib/rbac";

export async function GET() {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const integrations = await dbConnect("integrations");
  const doc = await integrations.findOne({
    workspaceId: new ObjectId(session.workspaceId),
    type: "google_sheets",
  });

  return Response.json({
    spreadsheetId: doc?.config?.spreadsheetId || "",
    status: doc?.config?.spreadsheetId ? "connected" : "disconnected",
    serverConfigured: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  });
}

export async function PATCH(req) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
  if (!ok) return forbidden;

  const { spreadsheetId } = await req.json();

  const integrations = await dbConnect("integrations");
  await integrations.updateOne(
    { workspaceId: new ObjectId(session.workspaceId), type: "google_sheets" },
    {
      $set: {
        workspaceId: new ObjectId(session.workspaceId),
        type: "google_sheets",
        status: spreadsheetId ? "connected" : "disconnected",
        config: { spreadsheetId: spreadsheetId || "" },
        connectedAt: new Date(),
      },
    },
    { upsert: true },
  );

  return Response.json({ message: "Saved" });
}
