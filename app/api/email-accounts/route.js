import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { sanitizeEmailAccount } from "@/app/lib/crypto";

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const emailAccounts = await dbConnect("email_accounts");
    const accounts = await emailAccounts
      .find({
        workspaceId: new ObjectId(session.workspaceId),
        status: { $ne: "disconnected" },
      })
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({
      items: accounts.map(sanitizeEmailAccount),
    });
  } catch (error) {
    console.error("Fetching email accounts failed:", error);
    return Response.json({ message: "Failed to fetch email accounts" }, { status: 500 });
  }
}
