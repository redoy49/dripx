import { google } from "googleapis";
import { requireAuth } from "@/app/lib/session";
import { generateOAuthState } from "@/app/lib/crypto";

export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return Response.json(
        {
          message:
            "Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local.",
        },
        { status: 500 },
      );
    }

    const { origin } = new URL(req.url);
    const redirectUri = `${origin}/api/email-accounts/google/callback`;

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const state = await generateOAuthState({
      workspaceId: session.workspaceId,
      provider: "google",
    });

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // Ensures refresh token is returned
      scope: [
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      state,
    });

    return Response.redirect(authUrl);
  } catch (error) {
    console.error("Google OAuth start failed:", error);
    return Response.json({ message: "Failed to start Google OAuth" }, { status: 500 });
  }
}
