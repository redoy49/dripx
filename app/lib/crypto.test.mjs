import assert from "node:assert/strict";
import {
  encryptCredentials,
  decryptCredentials,
  generateOAuthState,
  verifyOAuthState,
  sanitizeEmailAccount,
} from "./crypto.js";

console.log("=== RUNNING CRYPTOGRAPHIC & SECURITY UTILITY TESTS ===");

// 1. Encryption & Decryption round-trip with string and object
console.log("\n1. Testing AES-256-GCM Object Encryption & Decryption...");
const sampleCredentials = {
  refreshToken: "1//04example_refresh_token_xyz987",
  accessToken: "ya29.a0example_access_token_123",
  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
  smtpPassword: "SuperSecretPassword#123",
};

const encrypted = encryptCredentials(sampleCredentials);
assert.ok(encrypted.encryptedData, "Should have encryptedData hex");
assert.ok(encrypted.iv, "Should have IV hex");
assert.ok(encrypted.authTag, "Should have authTag hex");
assert.notEqual(encrypted.encryptedData, JSON.stringify(sampleCredentials));

const decrypted = decryptCredentials(encrypted);
assert.deepEqual(decrypted, sampleCredentials, "Decrypted object should match original payload exactly");
console.log("✓ AES-256-GCM encryption/decryption round-trip verified");

// 2. Tamper resistance
console.log("\n2. Testing Tamper Resistance (AEAD Auth Tag Verification)...");
const tampered = {
  ...encrypted,
  encryptedData: encrypted.encryptedData.slice(0, -2) + "ff",
};
assert.throws(() => {
  decryptCredentials(tampered);
}, /Unsupported state or unable to authenticate data|bad decrypt|authenticate/i);
console.log("✓ Tampered payload properly rejected by authentication tag");

// 3. OAuth State token generation and validation
console.log("\n3. Testing OAuth CSRF State Token Generation & Verification...");
const stateToken = await generateOAuthState({
  workspaceId: "650f9a2b7194c25d93000001",
  provider: "google",
  returnUrl: "/dashboard/settings",
});
assert.ok(typeof stateToken === "string" && stateToken.length > 20);

const verifiedPayload = await verifyOAuthState(stateToken);
assert.equal(verifiedPayload.workspaceId, "650f9a2b7194c25d93000001");
assert.equal(verifiedPayload.provider, "google");
assert.equal(verifiedPayload.returnUrl, "/dashboard/settings");
assert.ok(verifiedPayload.nonce);
console.log("✓ OAuth CSRF state token signed and verified with JWT claims");

// 4. Invalid State Token
console.log("\n4. Testing Invalid State Token Handling...");
const invalidVerified = await verifyOAuthState("malformed.jwt.token");
assert.equal(invalidVerified, null, "Malformed state should return null without crashing");
console.log("✓ Malformed state handled gracefully");

// 5. Account sanitization
console.log("\n5. Testing Account Credential Sanitization...");
const rawAccount = {
  _id: "650f9a2b7194c25d93000002",
  workspaceId: "650f9a2b7194c25d93000001",
  userId: "650f9a2b7194c25d93000003",
  email: "alex@company.com",
  name: "Alex Bennett",
  provider: "smtp",
  status: "connected",
  authType: "credentials",
  credentials: encrypted, // SENSITIVE
  smtpConfig: {
    host: "smtp.company.com",
    port: 587,
    secure: false,
    user: "alex@company.com",
    pass: "PLAINTEXT_SHOULD_NEVER_LEAK", // SENSITIVE
  },
  dailyLimit: 50,
  todaySentCount: 12,
};

const sanitized = sanitizeEmailAccount(rawAccount);
assert.equal(sanitized.email, "alex@company.com");
assert.equal(sanitized.id, "650f9a2b7194c25d93000002");
assert.equal(sanitized.credentials, undefined, "Encrypted credentials must be stripped");
assert.equal(sanitized.smtpConfig.pass, undefined, "SMTP password must be stripped");
assert.equal(sanitized.smtpConfig.host, "smtp.company.com");
assert.equal(sanitized.dailyLimit, 50);
console.log("✓ Credentials and passwords strictly stripped from sanitized account");

console.log("\nALL CRYPTOGRAPHIC TESTS PASSED (100% SUCCESS)!");
