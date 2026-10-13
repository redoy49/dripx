import { ObjectId } from "mongodb";
import { google } from "googleapis";
import { dbConnect } from "@/app/lib/mongoDb";
import { verifyOAuthState, encryptCredentials } from "@/app/lib/crypto";
import { getGoogleMailboxRedirectUri } from "../auth/route";

export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const settingsRedirect = `${origin}/dashboard/settings?tab=Email%20Accounts`;

  if (error || !code || !state) {
    return Response.redirect(`${settingsRedirect}&error=${encodeURIComponent(error || "Authorization cancelled")}`);
  }

  try {
    const statePayload = await verifyOAuthState(state);
    if (!statePayload || statePayload.provider !== "google") {
      return Response.redirect(`${settingsRedirect}&error=${encodeURIComponent("Invalid or expired OAuth state")}`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = getGoogleMailboxRedirectUri(req);

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Retrieve user profile email address
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: "me" });
    const email = profile.data.emailAddress?.toLowerCase();

    if (!email) {
      return Response.redirect(`${settingsRedirect}&error=${encodeURIComponent("Could not retrieve email from Google")}`);
    }

    const encryptedCredentials = encryptCredentials({
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
    });

    const emailAccounts = await dbConnect("email_accounts");
    await emailAccounts.updateOne(
      {
        workspaceId: new ObjectId(statePayload.workspaceId),
        email,
      },
      {
        $set: {
          provider: "google",
          status: "connected",
          authType: "oauth2",
          credentials: encryptedCredentials,
          dailyLimit: 40,
          lastError: null,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          todaySentCount: 0,
        },
      },
      { upsert: true },
    );

    return Response.redirect(`${settingsRedirect}&connected=google&email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error("Google OAuth callback failed:", err);
    return Response.redirect(`${settingsRedirect}&error=${encodeURIComponent(err.message || "Failed to link Google account")}`);
  }
}
