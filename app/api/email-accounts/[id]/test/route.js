import { ObjectId } from "mongodb";
import crypto from "node:crypto";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { buildConnectorFromAccount } from "@/app/lib/email";
import { runDnsDiagnostics } from "@/app/lib/dnsDiagnostics";

export async function POST(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const emailAccounts = await dbConnect("email_accounts");
    const account = await emailAccounts.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });

    if (!account) {
      return Response.json({ message: "Email account not found" }, { status: 404 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const action = body.action || (body.sendTestTo ? "send_test" : "handshake");
    const connector = buildConnectorFromAccount(account);

    // 1. Core Handshake / Authentication Check
    const verifyResult = await connector.verifyConnection();

    // 2. Outbound Test Email (if requested)
    let sendResult = null;
    let sendLatencyMs = null;
    if ((action === "send_test" || action === "full_audit") && body.sendTestTo && verifyResult.success) {
      const targetEmail = body.sendTestTo.trim();
      const sendStart = Date.now();

      sendResult = await connector.sendEmail({
        to: targetEmail,
        subject: `DripX Outreach Test — ${account.email}`,
        body: `Hello!\n\nThis is a verified test email dispatched directly from your connected mailbox (${account.email}) via DripX.\n\nTimestamp: ${new Date().toUTCString()}\nProvider: ${account.provider.toUpperCase()}\nStatus: Operational & Ready for Campaigns.`,
      });

      sendLatencyMs = Date.now() - sendStart;
    }

    // 3. Inbound Loopback Verification (if requested)
    let inboundResult = null;
    if ((action === "inbound_test" || action === "full_audit") && verifyResult.success) {
      const loopbackToken = `DXP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const loopbackStart = Date.now();

      // Dispatch self-ping
      const selfPing = await connector.sendEmail({
        to: account.email,
        subject: `DripX Inbound Verification [${loopbackToken}]`,
        body: `Self-diagnostic verification ping sent by DripX to verify inbound inbox reception.\nToken: ${loopbackToken}\nSent: ${new Date().toISOString()}`,
      });

      if (selfPing.success) {
        // Allow brief moment for provider delivery
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const checkResult = await connector.checkInboxForToken(loopbackToken);
        const latency = Date.now() - loopbackStart;

        inboundResult = {
          success: checkResult.success,
          token: loopbackToken,
          messageId: selfPing.providerMessageId,
          folder: checkResult.folder || "INBOX",
          roundTripMs: latency,
          details: checkResult.details || (checkResult.found ? "Message verified in inbox." : "Message en route."),
        };
      } else {
        inboundResult = {
          success: false,
          error: selfPing.error || "Failed to dispatch self-test message",
        };
      }
    }

    // 4. DNS Diagnostics (if full audit or requested)
    let dnsResult = account.dnsHealth || null;
    if (action === "full_audit" || body.checkDns) {
      try {
        dnsResult = await runDnsDiagnostics({
          email: account.email,
          provider: account.provider,
        });
      } catch (err) {
        console.warn("DNS check error during test:", err.message);
      }
    }

    const isOverallSuccess =
      verifyResult.success &&
      (!sendResult || sendResult.success) &&
      (!inboundResult || inboundResult.success);

    const newStatus = isOverallSuccess ? "connected" : "needs_reconnect";

    // Persist verification audit timestamp and readiness status
    const updateDoc = {
      status: newStatus,
      lastError: isOverallSuccess ? null : (verifyResult.error || sendResult?.error || inboundResult?.error),
      lastTestedAt: new Date(),
      updatedAt: new Date(),
    };

    if (isOverallSuccess) {
      updateDoc.verifiedAt = new Date();
    }
    if (dnsResult) {
      updateDoc.dnsHealth = dnsResult;
    }

    await emailAccounts.updateOne({ _id: account._id }, { $set: updateDoc });

    return Response.json({
      success: isOverallSuccess,
      status: newStatus,
      action,
      handshake: verifyResult,
      outbound: sendResult
        ? {
            ...sendResult,
            latencyMs: sendLatencyMs,
            recipient: body.sendTestTo,
          }
        : null,
      inbound: inboundResult,
      dns: dnsResult,
      verifiedAt: updateDoc.verifiedAt || null,
    });
  } catch (error) {
    console.error("Testing email account failed:", error);
    return Response.json({ message: "Failed to test email account: " + error.message }, { status: 500 });
  }
}
