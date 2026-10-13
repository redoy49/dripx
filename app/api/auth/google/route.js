import { cookies } from "next/headers";
import crypto from "node:crypto";
import { google } from "googleapis";
import { signToken } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export const GOOGLE_OAUTH_COOKIE = "google_oauth_state";

export function getRedirectUri(req) {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host");
  const protocol =
    req.headers.get("x-forwarded-proto") ||
    (host && (host.includes("localhost") || host.includes("127.0.0.1"))
      ? "http"
      : "https");
  const baseUrl = host
    ? `${protocol}://${host}`
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `${baseUrl.replace(/\/$/, "")}/api/auth/google/callback`;
}

export async function GET(req) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing in .env.local");
      const referer = req.headers.get("referer") || "";
      const fallback = referer.includes("/register") ? "/register" : "/login";
      return Response.redirect(
        new URL(`${fallback}?error=google_not_configured`, req.url),
        302
      );
    }

    const { searchParams } = new URL(req.url);
    const invite = searchParams.get("invite") || null;
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";

    const nonce = crypto.randomBytes(24).toString("hex");

    const stateToken = await signToken(
      {
        type: "google_oauth_state",
        nonce,
        invite,
        redirectTo,
      },
      "10m"
    );

    const cookieStore = await cookies();
    cookieStore.set(GOOGLE_OAUTH_COOKIE, stateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    });

    const redirectUri = getRedirectUri(req);
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "online",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
      ],
      state: stateToken,
      prompt: "select_account",
    });

    return Response.redirect(authUrl, 302);
  } catch (error) {
    console.error("Failed to initiate Google OAuth:", error);
    return Response.json(
      { message: "Could not initiate Google authentication" },
      { status: 500 }
    );
  }
}
