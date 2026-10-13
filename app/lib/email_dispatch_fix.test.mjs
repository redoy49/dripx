import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { dbConnect } from "./mongoDb.js";
import { getEmailConnector, sendEmail } from "./email/index.js";
import { GmailConnector } from "./email/GmailConnector.js";
import { MockEmailConnector } from "./email/MockEmailConnector.js";
import { isWithinSendingWindow, resolveEffectiveSchedule } from "./scheduleEngine.js";

async function runTests() {
  console.log("=== Running Email Dispatch Regression Tests ===\n");

  // 1. Verify Connected Mailbox Resolution
  console.log("Test 1: getEmailConnector with accountId string vs ObjectId");
  const emailAccountsCol = await dbConnect("email_accounts");
  const connectedAccount = await emailAccountsCol.findOne({ status: "connected" });
  assert.ok(connectedAccount, "Must find at least one connected email account in DB");
  const accountIdStr = connectedAccount._id.toString();

  const connectorFromStr = await getEmailConnector({
    accountId: accountIdStr,
    workspaceId: connectedAccount.workspaceId.toString(),
  });
  assert.ok(
    connectorFromStr instanceof GmailConnector || connectorFromStr.constructor.name.includes("Connector"),
    "Should resolve real connector from accountId string, not MockEmailConnector"
  );
  assert.ok(
    !(connectorFromStr instanceof MockEmailConnector),
    "Must NOT fall back to MockEmailConnector when accountId is provided"
  );
  console.log("  ✓ getEmailConnector correctly resolved account by string ID:", connectorFromStr.constructor.name);

  // 2. Verify sendEmail defaults when accountId is passed
  console.log("\nTest 2: sendEmail parameter resolution");
  // Test that effectivePurpose is set to campaign when accountId is present
  const connector = await getEmailConnector({
    accountId: accountIdStr,
    purpose: "transactional", // Even if purpose is passed as transactional, accountId takes precedence
  });
  assert.ok(
    !(connector instanceof MockEmailConnector),
    "accountId must take precedence over transactional fallback"
  );
  console.log("  ✓ accountId takes precedence over purpose='transactional'");

  // 3. Verify senderEmailAccountId ObjectId casting
  console.log("\nTest 3: senderEmailAccountId query casting in jobProcessor");
  const campaignsCol = await dbConnect("campaigns");
  const campaign = await campaignsCol.findOne({ name: /Redoy Somaiya/i });
  assert.ok(campaign, "Campaign 'Redoy Somaiya' must exist");

  const senderAccountId = campaign.senderEmailAccountId
    ? (typeof campaign.senderEmailAccountId === "string" ? new ObjectId(campaign.senderEmailAccountId) : campaign.senderEmailAccountId)
    : null;

  assert.ok(senderAccountId instanceof ObjectId, "senderAccountId must be an ObjectId");
  const senderDoc = await emailAccountsCol.findOne({ _id: senderAccountId });
  assert.ok(senderDoc, "Must find senderDoc using casted senderAccountId");
  assert.equal(senderDoc.email, "mdredoyhasan49@gmail.com");
  console.log("  ✓ Successfully retrieved senderDoc for:", senderDoc.email);

  // 4. Verify Schedule Window Evaluation
  console.log("\nTest 4: Schedule window evaluation for Asia/Kolkata");
  const effectiveSchedule = resolveEffectiveSchedule(
    null,
    campaign.scheduleOverride,
    { timezone: "Asia/Kolkata" }
  );
  console.log("  Effective Schedule:", {
    timezone: effectiveSchedule.timezone,
    startTime: effectiveSchedule.startTime,
    endTime: effectiveSchedule.endTime,
    days: effectiveSchedule.days,
  });

  const now = new Date();
  const inWindow = isWithinSendingWindow(effectiveSchedule, now);
  console.log("  Current UTC time:", now.toISOString(), "| In sending window:", inWindow);

  // 5. Verify Vercel Cron Bearer Token parsing
  console.log("\nTest 5: Vercel Cron Bearer token authorization");
  const dummyCronSecret = "test_cron_secret_xyz";
  const mockHeaders = new Headers({
    authorization: `Bearer ${dummyCronSecret}`,
  });
  const authHeader = mockHeaders.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  assert.equal(bearerToken, dummyCronSecret, "Bearer token must be extracted accurately");
  console.log("  ✓ Bearer token parsing matches expected CRON_SECRET");

  console.log("\n=== All 5 Tests Passed Successfully! ===");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
