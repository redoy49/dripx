import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { encryptCredentials, sanitizeEmailAccount } from "@/app/lib/crypto";
import { SmtpConnector } from "@/app/lib/email/SmtpConnector";

export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const {
      email,
      name = "",
      host,
      port = 587,
      secure = false,
      user,
      pass,
      dailyLimit = 40,
    } = body;

    if (!email || !host || !pass) {
      return Response.json(
        { message: "Email address, SMTP host, and password are required" },
        { status: 400 },
      );
    }

    // Step 1: Pre-flight handshake verification before persisting
    const smtpTester = new SmtpConnector({
      host,
      port: Number(port),
      secure: secure === true || Number(port) === 465,
      user: user || email,
      pass,
      fromEmail: email,
      fromName: name,
    });

    const verifyResult = await smtpTester.verifyConnection();
    if (!verifyResult.success) {
      return Response.json(
        {
          message: `Could not verify SMTP credentials: ${verifyResult.error}`,
          code: verifyResult.code,
        },
        { status: 400 },
      );
    }

    // Step 2: Encrypt credentials at rest
    const encryptedCredentials = encryptCredentials({
      smtpPassword: pass,
    });

    const emailAccounts = await dbConnect("email_accounts");
    const accountDoc = {
      workspaceId: new ObjectId(session.workspaceId),
      userId: new ObjectId(session.userId),
      email: email.trim().toLowerCase(),
      name: name.trim(),
      provider: "smtp",
      status: "connected",
      authType: "credentials",
      credentials: encryptedCredentials,
      smtpConfig: {
        host: host.trim(),
        port: Number(port),
        secure: secure === true || Number(port) === 465,
        user: (user || email).trim(),
      },
      dailyLimit: Number(dailyLimit) || 40,
      todaySentCount: 0,
      lastError: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await emailAccounts.insertOne(accountDoc);

    return Response.json(
      sanitizeEmailAccount({ ...accountDoc, _id: result.insertedId }),
      { status: 201 },
    );
  } catch (error) {
    console.error("Connecting SMTP account failed:", error);
    return Response.json({ message: "Failed to connect SMTP account" }, { status: 500 });
  }
}
