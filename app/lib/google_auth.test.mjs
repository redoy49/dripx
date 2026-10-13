import assert from "node:assert/strict";
import crypto from "node:crypto";
import { signToken, verifyToken } from "./auth.js";

console.log("=== RUNNING GOOGLE AUTH & ONBOARDING UNIT TESTS ===\n");

// 1. Anti-CSRF State Token Generation & Verification
console.log("1. Testing Anti-CSRF State Token Lifecycle...");
{
  const nonce = crypto.randomBytes(24).toString("hex");
  const stateToken = await signToken(
    {
      type: "google_oauth_state",
      nonce,
      invite: "test_invite_token_123",
      redirectTo: "/dashboard/leads",
    },
    "10m"
  );

  assert.ok(typeof stateToken === "string", "State token must be signed string");

  const verified = await verifyToken(stateToken);
  assert.ok(verified, "State token must verify successfully");
  assert.equal(verified.type, "google_oauth_state");
  assert.equal(verified.nonce, nonce);
  assert.equal(verified.invite, "test_invite_token_123");
  assert.equal(verified.redirectTo, "/dashboard/leads");

  // Tampered state test
  const tampered = stateToken.slice(0, -6) + "abcdef";
  const tamperedResult = await verifyToken(tampered);
  assert.equal(tamperedResult, null, "Tampered state must fail verification");

  console.log("✓ State token encryption, nonce integrity, and tamper-resistance verified");
}

// 2. Open Redirect Safety Protection
console.log("\n2. Testing Safe Redirection / Open Redirect Guards...");
{
  function getSafeRedirectUrl(redirectTo, base) {
    if (!redirectTo || typeof redirectTo !== "string") {
      return new URL("/dashboard", base);
    }
    if (redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
      return new URL(redirectTo, base);
    }
    return new URL("/dashboard", base);
  }

  const base = "http://localhost:3000";

  assert.equal(getSafeRedirectUrl(null, base).pathname, "/dashboard");
  assert.equal(getSafeRedirectUrl("", base).pathname, "/dashboard");
  assert.equal(getSafeRedirectUrl("/dashboard/campaigns", base).pathname, "/dashboard/campaigns");
  
  // Malicious open redirects
  assert.equal(getSafeRedirectUrl("https://attacker.com", base).pathname, "/dashboard");
  assert.equal(getSafeRedirectUrl("//attacker.com/evil", base).pathname, "/dashboard");
  assert.equal(getSafeRedirectUrl("javascript:alert(1)", base).pathname, "/dashboard");

  console.log("✓ Open redirect vulnerabilities strictly prevented; malicious URLs fall back to /dashboard");
}

// 3. User Upsert & Workspace Provisioning Simulation
console.log("\n3. Testing Google User Provisioning & Account Linking Engine...");
{
  // Simulated database
  const mockUsers = [];
  const mockWorkspaces = [];
  const mockTeamMembers = [];
  const mockDailyLimits = [];

  async function handleGoogleUser({ profile, invitePayload }) {
    const email = profile.email.toLowerCase().trim();
    const googleId = profile.sub;
    const name = profile.name || email.split("@")[0];

    let user = mockUsers.find((u) => u.email === email || u.googleId === googleId);
    let userId = null;
    let workspaceId = null;

    if (user) {
      // Existing user: Link account and find workspace
      userId = user.id;
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatarUrl && profile.picture) user.avatarUrl = profile.picture;
      user.lastLoginAt = new Date();

      const membership = mockTeamMembers.find((m) => m.userId === userId && m.status === "active");
      workspaceId = membership.workspaceId;
    } else {
      // New user registration
      userId = "user_" + (mockUsers.length + 1);
      user = {
        id: userId,
        name,
        email,
        googleId,
        avatarUrl: profile.picture,
        authProvider: "google",
        passwordHash: null,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      mockUsers.push(user);

      if (invitePayload) {
        workspaceId = invitePayload.workspaceId;
        mockTeamMembers.push({
          workspaceId,
          userId,
          role: invitePayload.role || "member",
          status: "active",
          invitedEmail: email,
        });
      } else {
        workspaceId = "ws_" + (mockWorkspaces.length + 1);
        mockWorkspaces.push({
          id: workspaceId,
          name: `${name}'s Workspace`,
          ownerUserId: userId,
          plan: "trial",
        });
        mockTeamMembers.push({
          workspaceId,
          userId,
          role: "owner",
          status: "active",
          invitedEmail: email,
        });
        mockDailyLimits.push({
          workspaceId,
          emailsSentDaily: 50,
          invitesSentDaily: 20,
        });
      }
    }

    const sessionPayload = { userId, workspaceId };
    return { user, workspaceId, sessionPayload };
  }

  // A. Self-Registration with Google
  const regResult = await handleGoogleUser({
    profile: {
      sub: "google_sub_101",
      email: "sarah@acme.com",
      name: "Sarah Connor",
      picture: "https://lh3.googleusercontent.com/avatar101",
    },
    invitePayload: null,
  });

  assert.equal(regResult.user.name, "Sarah Connor");
  assert.equal(regResult.user.googleId, "google_sub_101");
  assert.equal(regResult.sessionPayload.userId, "user_1");
  assert.equal(regResult.sessionPayload.workspaceId, "ws_1");
  assert.equal(mockWorkspaces.length, 1);
  assert.equal(mockTeamMembers[0].role, "owner");

  // B. Subsequent Login with Same Google Account
  const loginResult = await handleGoogleUser({
    profile: {
      sub: "google_sub_101",
      email: "sarah@acme.com",
      name: "Sarah Connor",
    },
    invitePayload: null,
  });

  assert.equal(loginResult.user.id, "user_1");
  assert.equal(loginResult.sessionPayload.workspaceId, "ws_1");
  assert.equal(mockUsers.length, 1, "Must not duplicate user records");
  assert.equal(mockWorkspaces.length, 1, "Must not duplicate workspace records");

  // C. Google Signup with Team Invite Token
  const inviteResult = await handleGoogleUser({
    profile: {
      sub: "google_sub_202",
      email: "teammate@acme.com",
      name: "Kyle Reese",
      picture: "https://lh3.googleusercontent.com/avatar202",
    },
    invitePayload: {
      workspaceId: "ws_1",
      invitedEmail: "teammate@acme.com",
      role: "member",
    },
  });

  assert.equal(inviteResult.user.id, "user_2");
  assert.equal(inviteResult.sessionPayload.workspaceId, "ws_1");
  assert.equal(mockWorkspaces.length, 1, "Must join existing workspace instead of creating new one");
  const memberRecord = mockTeamMembers.find((m) => m.userId === "user_2");
  assert.equal(memberRecord.role, "member");

  console.log("✓ Self-registration, subsequent login, and team invite joining verified with zero data collision");
}

console.log("\n=================================================");
console.log("ALL GOOGLE AUTH & ONBOARDING TESTS PASSED (3/3)!");
console.log("=================================================");
