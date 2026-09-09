import { requireAuth } from "@/app/lib/session";

// Redirects to HubSpot's OAuth authorize screen. Inert (returns a clear JSON error instead
// of a broken redirect) until HUBSPOT_CLIENT_ID / HUBSPOT_REDIRECT_URI are set.
export async function GET(req) {
  const { unauthorized } = await requireAuth();
  if (unauthorized) return unauthorized;

  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return Response.json(
      { message: "HubSpot integration is not configured (missing HUBSPOT_CLIENT_ID / HUBSPOT_REDIRECT_URI)" },
      { status: 501 },
    );
  }

  const scopes = ["crm.objects.contacts.write", "crm.objects.contacts.read"].join(" ");
  const authorizeUrl = new URL("https://app.hubspot.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", scopes);

  return Response.redirect(authorizeUrl.toString());
}
