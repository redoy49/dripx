import { requireAuth } from "@/app/lib/session";
import { generateOAuthState } from "@/app/lib/crypto";

export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const clientId = process.env.MICROSOFT_CLIENT_ID;
    if (!clientId) {
      return Response.json(
        {
          message:
            "Microsoft OAuth is not configured. Please add MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET to .env.local.",
        },
        { status: 500 },
      );
    }

    const { origin } = new URL(req.url);
    const redirectUri = `${origin}/api/email-accounts/microsoft/callback`;

    const state = await generateOAuthState({
      workspaceId: session.workspaceId,
      provider: "microsoft",
    });

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      response_mode: "query",
      scope: "https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.Read offline_access User.Read",
      state,
      prompt: "select_account",
    });

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
    return Response.redirect(authUrl);
  } catch (error) {
    console.error("Microsoft OAuth start failed:", error);
    return Response.json({ message: "Failed to start Microsoft OAuth" }, { status: 500 });
  }
}
