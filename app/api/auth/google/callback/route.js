import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { google } from "googleapis";
import { dbConnect } from "@/app/lib/mongoDb";
import { signToken, verifyToken } from "@/app/lib/auth";
import { setSessionCookie } from "@/app/lib/session";
import { DEFAULT_DAILY_LIMITS } from "@/app/lib/limits";
import { GOOGLE_OAUTH_COOKIE, getRedirectUri } from "../route";

export const dynamic = "force-dynamic";

function getSafeRedirectUrl(redirectTo, base) {
  if (!redirectTo || typeof redirectTo !== "string") {
    return new URL("/dashboard", base);
  }
  if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return new URL(redirectTo, base);
  }
  return new URL("/dashboard", base);
}

export async function GET(req) {
  const reqUrl = new URL(req.url);

  try {
    const errorParam = reqUrl.searchParams.get("error");
    if (errorParam) {
      console.warn("Google OAuth error received:", errorParam);
      return Response.redirect(
        new URL(`/login?error=${encodeURIComponent(errorParam)}`, req.url),
        302
      );
    }

    const code = reqUrl.searchParams.get("code");
    const state = reqUrl.searchParams.get("state");

    if (!code || !state) {
      return Response.redirect(
        new URL("/login?error=missing_credentials", req.url),
        302
      );
    }

    // 1. Verify anti-CSRF state token
    const cookieStore = await cookies();
    const cookieState = cookieStore.get(GOOGLE_OAUTH_COOKIE)?.value;
    cookieStore.delete(GOOGLE_OAUTH_COOKIE);

    if (!cookieState) {
      return Response.redirect(
        new URL("/login?error=invalid_state", req.url),
        302
      );
    }

    const [statePayload, cookiePayload] = await Promise.all([
      verifyToken(state),
      verifyToken(cookieState),
    ]);

    if (
      !statePayload ||
      !cookiePayload ||
      statePayload.type !== "google_oauth_state" ||
      cookiePayload.type !== "google_oauth_state" ||
      statePayload.nonce !== cookiePayload.nonce
    ) {
      return Response.redirect(
        new URL("/login?error=state_mismatch", req.url),
        302
      );
    }

    // 2. Exchange authorization code for Google tokens
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = getRedirectUri(req);

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    let profile = null;
    if (tokens.id_token) {
      try {
        const ticket = await oauth2Client.verifyIdToken({
          idToken: tokens.id_token,
          audience: clientId,
        });
        profile = ticket.getPayload();
      } catch (err) {
        console.warn("ID Token verification failed, falling back to userinfo:", err.message);
      }
    }

    if (!profile) {
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      profile = {
        sub: data.id,
        email: data.email,
        email_verified: data.verified_email,
        name: data.name,
        picture: data.picture,
      };
    }

    const email = (profile?.email || "").trim().toLowerCase();
    const name = (profile?.name || "").trim() || email.split("@")[0] || "User";
    const googleId = profile?.sub;
    const avatarUrl = profile?.picture || null;

    if (!email) {
      return Response.redirect(
        new URL("/login?error=no_email_returned", req.url),
        302
      );
    }

    // 3. Database lookup and provisioning
    const users = await dbConnect("users");
    const workspaces = await dbConnect("workspaces");
    const teamMembers = await dbConnect("team_members");
    const dailyLimits = await dbConnect("daily_limits");

    let user = await users.findOne({
      $or: [{ email }, { googleId }],
    });

    let userId = null;
    let workspaceId = null;

    if (user) {
      // Existing User: Update profile info & log in
      userId = user._id;

      const updates = { lastLoginAt: new Date() };
      if (!user.googleId && googleId) updates.googleId = googleId;
      if (!user.avatarUrl && avatarUrl) updates.avatarUrl = avatarUrl;
      if (!user.authProvider) updates.authProvider = "google";

      await users.updateOne({ _id: userId }, { $set: updates });

      // Find active workspace membership
      const membership = await teamMembers.findOne({
        userId,
        status: "active",
      });

      if (membership) {
        workspaceId = membership.workspaceId;
      } else {
        // Fallback: Provision workspace if user had no active membership
        const workspaceResult = await workspaces.insertOne({
          name: `${user.name || name}'s Workspace`,
          ownerUserId: userId,
          plan: "trial",
          createdAt: new Date(),
          warmupStartedAt: new Date(),
        });
        workspaceId = workspaceResult.insertedId;

        await teamMembers.insertOne({
          workspaceId,
          userId,
          role: "owner",
          status: "active",
          invitedEmail: email,
          invitedByUserId: userId,
          invitedAt: new Date(),
          joinedAt: new Date(),
        });

        await dailyLimits.insertOne({
          workspaceId,
          ...DEFAULT_DAILY_LIMITS,
          updatedAt: new Date(),
        });
      }
    } else {
      // New User Registration with Google
      const insertUserResult = await users.insertOne({
        name,
        email,
        googleId,
        avatarUrl,
        authProvider: "google",
        passwordHash: null,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
      userId = insertUserResult.insertedId;

      // Handle invite token if present in verified state
      let invitePayload = null;
      if (statePayload.invite) {
        const payload = await verifyToken(statePayload.invite);
        if (payload?.invitedEmail === email && payload?.workspaceId) {
          invitePayload = payload;
        }
      }

      if (invitePayload) {
        workspaceId = new ObjectId(invitePayload.workspaceId);

        const invitedRow = await teamMembers.findOne({
          workspaceId,
          invitedEmail: email,
          status: "invited",
        });

        if (invitedRow) {
          await teamMembers.updateOne(
            { _id: invitedRow._id },
            { $set: { userId, status: "active", joinedAt: new Date() } }
          );
        } else {
          await teamMembers.insertOne({
            workspaceId,
            userId,
            role: invitePayload.role || "member",
            status: "active",
            invitedEmail: email,
            invitedByUserId: null,
            invitedAt: new Date(),
            joinedAt: new Date(),
          });
        }
      } else {
        // Default new workspace for self-registered user
        const workspaceResult = await workspaces.insertOne({
          name: `${name}'s Workspace`,
          ownerUserId: userId,
          plan: "trial",
          createdAt: new Date(),
          warmupStartedAt: new Date(),
        });
        workspaceId = workspaceResult.insertedId;

        await teamMembers.insertOne({
          workspaceId,
          userId,
          role: "owner",
          status: "active",
          invitedEmail: email,
          invitedByUserId: userId,
          invitedAt: new Date(),
          joinedAt: new Date(),
        });

        await dailyLimits.insertOne({
          workspaceId,
          ...DEFAULT_DAILY_LIMITS,
          updatedAt: new Date(),
        });
      }
    }

    // 4. Sign standard DripX session JWT and set cookie
    const sessionToken = await signToken({
      userId: userId.toString(),
      workspaceId: workspaceId.toString(),
    });

    await setSessionCookie(sessionToken);

    // 5. Safe redirect to destination
    const destination = getSafeRedirectUrl(statePayload.redirectTo, req.url);
    return Response.redirect(destination, 302);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return Response.redirect(
      new URL("/login?error=oauth_exchange_failed", req.url),
      302
    );
  }
}
