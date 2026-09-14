import { dbConnect } from "@/app/lib/mongoDb";
import { unipileWebhookSecret, slugFromLinkedinUrl } from "@/app/lib/integrations/unipile";
import { dispatchWebhookEvent } from "@/app/lib/webhooks";

// LinkedIn invitation-accepted notifications. Per Unipile's docs, not real-time — can
// arrive up to ~8h after the lead actually accepts.

async function findLead(workspaceId, body) {
  const leads = await dbConnect("leads");

  if (body.user_provider_id) {
    const byProviderId = await leads.findOne({ workspaceId, "unipile.providerId": body.user_provider_id });
    if (byProviderId) return byProviderId;
  }

  const slug = slugFromLinkedinUrl(body.user_profile_url) || (body.user_public_identifier || "").toLowerCase() || null;
  if (!slug) return null;

  const candidates = await leads.find({ workspaceId, linkedinUrl: { $exists: true, $ne: "" } }).toArray();
  const match = candidates.find((l) => slugFromLinkedinUrl(l.linkedinUrl) === slug);

  if (match && body.user_provider_id) {
    await leads.updateOne({ _id: match._id }, { $set: { "unipile.providerId": body.user_provider_id } });
  }

  return match || null;
}

export async function POST(req) {
  try {
    const secret = req.headers.get("x-unipile-secret");
    if (secret !== unipileWebhookSecret()) {
      return Response.json({ message: "Invalid signature" }, { status: 401 });
    }

    const body = await req.json();
    if (body.event && body.event !== "new_relation") {
      return Response.json({ ok: true });
    }

    const integrations = await dbConnect("integrations");
    const integration = await integrations.findOne({ type: "unipile", accountId: body.account_id });
    if (!integration) return Response.json({ ok: true });

    const lead = await findLead(integration.workspaceId, body);
    if (!lead) {
      console.warn(`Unipile new_relation from an unrecognized profile (account ${body.account_id})`);
      return Response.json({ ok: true });
    }

    const leads = await dbConnect("leads");
    await leads.updateOne({ _id: lead._id }, { $set: { "unipile.connectedAt": new Date() } });

    await dispatchWebhookEvent(integration.workspaceId, "connection.accepted", {
      leadId: lead._id.toString(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Unipile users webhook failed:", error);
    return Response.json({ message: "Webhook processing failed" }, { status: 500 });
  }
}
