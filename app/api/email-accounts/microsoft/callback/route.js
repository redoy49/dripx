import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { verifyOAuthState, encryptCredentials } from "@/app/lib/crypto";

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
    if (!statePayload || statePayload.provider !== "microsoft") {
      return Response.redirect(`${settingsRedirect}&error=${encodeURIComponent("Invalid or expired OAuth state")}`);
    }

    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const redirectUri = `${origin}/api/email-accounts/microsoft/callback`;

    const tokenParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return Response.redirect(`${settingsRedirect}&error=${encodeURIComponent(`Token exchange failed: ${errText}`)}`);
    }

    const tokenData = await tokenRes.json();

    // Fetch user profile from Microsoft Graph
    const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return Response.redirect(`${settingsRedirect}&error=${encodeURIComponent("Failed to fetch Microsoft profile")}`);
    }

    const userProfile = await userRes.json();
    const email = (userProfile.mail || userProfile.userPrincipalName)?.toLowerCase();

    if (!email) {
      return Response.redirect(`${settingsRedirect}&error=${encodeURIComponent("Could not identify Microsoft email address")}`);
    }

    const encryptedCredentials = encryptCredentials({
      refreshToken: tokenData.refresh_token,
      accessToken: tokenData.access_token,
      expiresAt: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString(),
    });

    const emailAccounts = await dbConnect("email_accounts");
    await emailAccounts.updateOne(
      {
        workspaceId: new ObjectId(statePayload.workspaceId),
        email,
      },
      {
        $set: {
          name: userProfile.displayName || "",
          provider: "microsoft",
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

    return Response.redirect(`${settingsRedirect}&connected=microsoft&email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error("Microsoft OAuth callback failed:", err);
    return Response.redirect(`${settingsRedirect}&error=${encodeURIComponent(err.message || "Failed to link Microsoft account")}`);
  }
}
