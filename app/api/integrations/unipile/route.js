import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { isUnipileConfigured, deleteAccount } from "@/app/lib/integrations/unipile";

async function getIntegration(workspaceId) {
  const integrations = await dbConnect("integrations");
  return integrations.findOne({ workspaceId: new ObjectId(workspaceId), type: "unipile" });
}

export async function GET() {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const doc = await getIntegration(session.workspaceId);

  return Response.json({
    status: doc?.status || "disconnected",
    lastError: doc?.lastError || null,
    serverConfigured: isUnipileConfigured(),
  });
}

export async function DELETE() {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const doc = await getIntegration(session.workspaceId);
  const integrations = await dbConnect("integrations");

  if (doc?.accountId) {
    try {
      await deleteAccount(doc.accountId);
    } catch (error) {
      // Keep going even if Unipile's side already forgot this account — we still want
      // our own record cleared so the UI reflects "disconnected" either way.
      console.error("Unipile deleteAccount failed:", error);
    }
  }

  await integrations.updateOne(
    { workspaceId: new ObjectId(session.workspaceId), type: "unipile" },
    { $set: { status: "disconnected", accountId: null } },
  );

  return Response.json({ status: "disconnected" });
}
