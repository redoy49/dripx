import assert from "node:assert/strict";
import { MockEmailConnector } from "./email/MockEmailConnector.js";
import { ResendConnector } from "./email/ResendConnector.js";
import { SmtpConnector } from "./email/SmtpConnector.js";
import { buildConnectorFromAccount } from "./email/index.js";
import { encryptCredentials } from "./crypto.js";

console.log("=== RUNNING EMAIL CONNECTOR ADAPTER TESTS ===");

// 1. MockEmailConnector
console.log("\n1. Testing MockEmailConnector Send & Verification...");
const mockConn = new MockEmailConnector({
  email: "sarah@outreach.dev",
  name: "Sarah Jenkins",
});
const sendRes = await mockConn.sendEmail({
  to: "prospect@example.com",
  subject: "Quick question regarding revenue",
  body: "Hi Alex, wanted to connect.",
});
assert.equal(sendRes.success, true);
assert.ok(sendRes.providerMessageId.includes("mock_email_"));

const verifyRes = await mockConn.verifyConnection();
assert.equal(verifyRes.success, true);
assert.equal(verifyRes.details.email, "sarah@outreach.dev");

const caps = mockConn.getCapabilities();
assert.equal(caps.canSend, true);
console.log("✓ MockEmailConnector send, verify, and capabilities verified cleanly");

// 2. ResendConnector without API Key (Safe dev fallback)
console.log("\n2. Testing ResendConnector Unconfigured State...");
const resendConn = new ResendConnector("dummy_non_existent_key_for_test");
const resendVerify = await resendConn.verifyConnection();
assert.equal(resendVerify.success, false, "Invalid key should fail verification");

const unconfiguredResend = new ResendConnector(null);
const unconfSend = await unconfiguredResend.sendEmail({
  to: "test@example.com",
  subject: "Hello",
  body: "World",
});
assert.equal(unconfSend.success, false);
assert.equal(unconfSend.skipped, true);
console.log("✓ ResendConnector handles unconfigured/invalid keys safely");

// 3. SmtpConnector with invalid credentials (test timeout & error handling)
console.log("\n3. Testing SmtpConnector Handshake Failure Handling...");
const smtpConn = new SmtpConnector({
  host: "127.0.0.1",
  port: 25251, // nothing listening
  user: "alex@fake.com",
  pass: "wrongpass",
});
const smtpVerify = await smtpConn.verifyConnection();
assert.equal(smtpVerify.success, false, "Unreachable SMTP host must return success: false");
assert.ok(smtpVerify.error, "Error message must be populated");
console.log("✓ SmtpConnector verification fails gracefully without crashing node process");

// 4. Factory Account Instantiation
console.log("\n4. Testing Factory buildConnectorFromAccount()...");
const encryptedCreds = encryptCredentials({
  smtpPassword: "TestPassword123!",
});
const fakeDbAccount = {
  _id: "650f9a2b7194c25d93000004",
  email: "sales@mycompany.com",
  name: "Sales Team",
  provider: "smtp",
  credentials: encryptedCreds,
  smtpConfig: {
    host: "smtp.mailgun.org",
    port: 587,
    secure: false,
    user: "sales@mycompany.com",
  },
};
const instantiated = buildConnectorFromAccount(fakeDbAccount);
assert.ok(instantiated instanceof SmtpConnector);
assert.equal(instantiated.config.host, "smtp.mailgun.org");
assert.equal(instantiated.config.user, "sales@mycompany.com");
assert.equal(instantiated.config.pass, "TestPassword123!");
console.log("✓ Account correctly decrypted and mapped to SmtpConnector instance");

console.log("\nALL EMAIL CONNECTOR TESTS PASSED (100% SUCCESS)!");
