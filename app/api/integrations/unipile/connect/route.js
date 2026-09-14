import crypto from "crypto";
import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { isUnipileConfigured, createHostedAuthLink, ensureWebhooksRegistered } from "@/app/lib/integrations/unipile";

// Starts the Unipile hosted-auth flow: redirects the browser to Unipile's own connect
// page (handles LinkedIn login + any 2FA/checkpoint entirely on their side), which then
// redirects back here and calls our webhook with the result.
export async function GET(req) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  if (!isUnipileConfigured()) {
    return Response.json(
      { message: "Unipile is not configured (missing UNIPILE_DSN / UNIPILE_API_KEY in .env.local)" },
      { status: 501 },
    );
  }

  const { origin } = new URL(req.url);
  const settingsUrl = `${origin}/dashboard/settings`;

  try {
    await ensureWebhooksRegistered(origin);

    // notify_url callbacks don't carry the shared-secret header, so prove this callback
    // matches a connection we just started via a one-time token round-tripped in `name`.
    const pendingToken = crypto.randomBytes(16).toString("hex");

    const integrations = await dbConnect("integrations");
    await integrations.updateOne(
      { workspaceId: new ObjectId(session.workspaceId), type: "unipile" },
      { $set: { workspaceId: new ObjectId(session.workspaceId), type: "unipile", status: "connecting", pendingToken } },
      { upsert: true },
    );

    const link = await createHostedAuthLink({
      successRedirectUrl: `${settingsUrl}?integration=unipile&status=pending`,
      failureRedirectUrl: `${settingsUrl}?integration=unipile&error=auth_failed`,
      notifyUrl: `${origin}/api/webhooks/unipile/account-status`,
      name: `${session.workspaceId}:${pendingToken}`,
    });

    return Response.redirect(link.url);
  } catch (error) {
    console.error("Unipile connect failed:", error);
    return Response.redirect(`${settingsUrl}?integration=unipile&error=unexpected`);
  }
}
