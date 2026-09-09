import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

export async function GET(req) {
  const { session, unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const settingsUrl = `${origin}/dashboard/settings`;

  if (!code) {
    return Response.redirect(`${settingsUrl}?integration=hubspot&error=missing_code`);
  }

  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return Response.redirect(`${settingsUrl}?integration=hubspot&error=not_configured`);
  }

  try {
    const tokenRes = await fetch("https://api.hubapi.com/oauth/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenRes.ok) {
      return Response.redirect(`${settingsUrl}?integration=hubspot&error=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();
    const integrations = await dbConnect("integrations");
    await integrations.updateOne(
      { workspaceId: new ObjectId(session.workspaceId), type: "hubspot" },
      {
        $set: {
          workspaceId: new ObjectId(session.workspaceId),
          type: "hubspot",
          status: "connected",
          credentials: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
          },
          connectedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return Response.redirect(`${settingsUrl}?integration=hubspot&status=connected`);
  } catch (error) {
    console.error("HubSpot OAuth callback failed:", error);
    return Response.redirect(`${settingsUrl}?integration=hubspot&error=unexpected`);
  }
}
