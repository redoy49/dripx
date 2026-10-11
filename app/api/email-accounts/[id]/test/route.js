import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { buildConnectorFromAccount } from "@/app/lib/email";

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

    const connector = buildConnectorFromAccount(account);
    const verifyResult = await connector.verifyConnection();

    let sendResult = null;
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    // Optional user-triggered real email test
    if (body.sendTestTo && verifyResult.success) {
      sendResult = await connector.sendEmail({
        to: body.sendTestTo.trim(),
        subject: `DripX Test Message — ${account.email}`,
        body: `Congratulations! Your email account ${account.email} is connected to DripX and successfully sending outreach.`,
      });
    }

    const newStatus = verifyResult.success ? "connected" : "needs_reconnect";
    await emailAccounts.updateOne(
      { _id: account._id },
      {
        $set: {
          status: newStatus,
          lastError: verifyResult.success ? null : verifyResult.error,
          updatedAt: new Date(),
        },
      },
    );

    return Response.json({
      success: verifyResult.success,
      status: newStatus,
      verify: verifyResult,
      sendTest: sendResult,
    });
  } catch (error) {
    console.error("Testing email account failed:", error);
    return Response.json({ message: "Failed to test email account" }, { status: 500 });
  }
}
