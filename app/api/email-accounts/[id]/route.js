import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { sanitizeEmailAccount } from "@/app/lib/crypto";

export async function GET(req, { params }) {
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

    return Response.json(sanitizeEmailAccount(account));
  } catch (error) {
    console.error("Fetching email account failed:", error);
    return Response.json({ message: "Failed to fetch email account" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const body = await req.json();
    const update = {};

    if (body.name !== undefined) update.name = body.name.trim();
    if (body.dailyLimit !== undefined) update.dailyLimit = Math.max(1, Number(body.dailyLimit));

    update.updatedAt = new Date();

    const emailAccounts = await dbConnect("email_accounts");
    const updated = await emailAccounts.findOneAndUpdate(
      { _id: new ObjectId(id), workspaceId: new ObjectId(session.workspaceId) },
      { $set: update },
      { returnDocument: "after" },
    );

    if (!updated) {
      return Response.json({ message: "Email account not found" }, { status: 404 });
    }

    return Response.json(sanitizeEmailAccount(updated));
  } catch (error) {
    console.error("Updating email account failed:", error);
    return Response.json({ message: "Failed to update email account" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const emailAccounts = await dbConnect("email_accounts");

    const result = await emailAccounts.deleteOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });

    if (result.deletedCount === 0) {
      return Response.json({ message: "Email account not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Email account disconnected" });
  } catch (error) {
    console.error("Deleting email account failed:", error);
    return Response.json({ message: "Failed to delete email account" }, { status: 500 });
  }
}
