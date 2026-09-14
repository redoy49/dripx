import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { unipileWebhookSecret } from "@/app/lib/integrations/unipile";

// Two distinct Unipile callbacks land here: (1) the hosted-auth notify_url, firing once
// when a connect/reconnect finishes — verified via the one-time token in `name`, since
// it carries no shared-secret header; (2) the persistent account_status subscription,
// firing for ongoing health changes — verified via the x-unipile-secret header.
export async function POST(req) {
  try {
    const body = await req.json();
    const integrations = await dbConnect("integrations");

    if (body.name && body.name.includes(":")) {
      const [workspaceId, token] = body.name.split(":");
      const doc = await integrations.findOne({ workspaceId: new ObjectId(workspaceId), type: "unipile" });

      if (!doc || doc.pendingToken !== token) {
        return Response.json({ message: "Unrecognized or expired connection attempt" }, { status: 401 });
      }

      const connected = body.status === "CREATION_SUCCESS" || body.status === "RECONNECTED";
      await integrations.updateOne(
        { _id: doc._id },
        {
          $set: {
            status: connected ? "connected" : "error",
            accountId: connected ? body.account_id : doc.accountId,
            lastError: connected ? null : `Unipile reported status: ${body.status}`,
            connectedAt: connected ? new Date() : doc.connectedAt,
          },
          $unset: { pendingToken: "" },
        },
      );

      return Response.json({ ok: true });
    }

    // Ongoing status update for an already-connected account — requires the shared secret.
    const secret = req.headers.get("x-unipile-secret");
    if (secret !== unipileWebhookSecret()) {
      return Response.json({ message: "Invalid signature" }, { status: 401 });
    }

    const doc = await integrations.findOne({ type: "unipile", accountId: body.account_id });
    if (!doc) return Response.json({ ok: true }); // Unknown account, nothing to update.

    const OK_STATUSES = new Set(["OK", "SYNC_SUCCESS"]);
    const status = OK_STATUSES.has(body.status) ? "connected" : body.status === "DELETED" ? "disconnected" : "error";

    await integrations.updateOne(
      { _id: doc._id },
      { $set: { status, lastError: status === "error" ? `Unipile reported status: ${body.status}` : null } },
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Unipile account-status webhook failed:", error);
    return Response.json({ message: "Webhook processing failed" }, { status: 500 });
  }
}
