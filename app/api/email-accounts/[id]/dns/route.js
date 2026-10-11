import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { runDnsDiagnostics, extractDomainFromEmail } from "@/app/lib/dnsDiagnostics";

// Resolves live DNS deliverability records (SPF, DKIM, DMARC, MX) for an email account
export async function GET(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const customSelector = searchParams.get("selector");

    const emailAccounts = await dbConnect("email_accounts");
    const account = await emailAccounts.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });

    if (!account) {
      return Response.json({ message: "Email account not found" }, { status: 404 });
    }

    const domain = extractDomainFromEmail(account.email);
    const selectorToUse = customSelector || account.rampUp?.customDkimSelector || null;

    const diagnostics = await runDnsDiagnostics({
      email: account.email,
      domain,
      provider: account.provider,
      selector: selectorToUse,
    });

    // Cache latest DNS health summary on account
    await emailAccounts.updateOne(
      { _id: account._id },
      {
        $set: {
          dnsHealth: {
            score: diagnostics.score,
            rating: diagnostics.rating,
            evaluatedAt: diagnostics.evaluatedAt,
          },
          updatedAt: new Date(),
        },
      },
    );

    return Response.json({
      accountId: account._id.toString(),
      email: account.email,
      provider: account.provider,
      ...diagnostics,
    });
  } catch (error) {
    console.error("DNS diagnostics failed:", error);
    return Response.json({ message: "Failed to evaluate DNS records" }, { status: 500 });
  }
}

// Forces a fresh DNS diagnostic re-check and updates the account document
export async function POST(req, { params }) {
  return GET(req, { params });
}
