/**
 * Integration Test Suite for Gmail Inbound Reply Sync & OAuth invalid_grant Handling
 * Run: node --env-file=.env.local app/lib/gmail_sync.test.mjs
 */

import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { dbConnect } from "./mongoDb.js";
import { isInvalidGrantError } from "./email/GmailConnector.js";
import { syncAccountReplies, syncAllConnectedEmailAccounts } from "./email/emailSyncEngine.js";

async function runTests() {
  console.log("=== Running Gmail Inbound Reply Sync & invalid_grant Tests ===\n");

  const emailAccountsCol = await dbConnect("email_accounts");
  const conversationsCol = await dbConnect("conversations");
  const messagesCol = await dbConnect("messages");
  const campaignLeadsCol = await dbConnect("campaign_leads");
  const leadsCol = await dbConnect("leads");

  // --- TEST 1: Unit Test isInvalidGrantError Helper ---
  console.log("Test 1: Unit test isInvalidGrantError helper");
  {
    assert.equal(isInvalidGrantError(new Error("invalid_grant")), true);
    assert.equal(isInvalidGrantError({ message: "Invalid Grant" }), true);
    assert.equal(isInvalidGrantError({ response: { data: { error: "invalid_grant" } } }), true);
    assert.equal(isInvalidGrantError({ response: { data: { error_description: "Token has been expired or revoked." } } }), true);
    assert.equal(isInvalidGrantError({ message: "Token has been expired or revoked." }), true);
    assert.equal(isInvalidGrantError({ code: "invalid_grant" }), true);

    // Negative cases
    assert.equal(isInvalidGrantError(null), false);
    assert.equal(isInvalidGrantError(undefined), false);
    assert.equal(isInvalidGrantError(new Error("ETIMEDOUT: Connection timed out")), false);
    assert.equal(isInvalidGrantError(new Error("Rate limit exceeded")), false);

    // Google REST API object error responses (nested data.error object)
    const google404Response = {
      message: "Requested entity was not found.",
      response: {
        status: 404,
        data: {
          error: {
            code: 404,
            message: "Requested entity was not found.",
            status: "NOT_FOUND",
          },
        },
      },
    };
    assert.equal(
      isInvalidGrantError(google404Response),
      false,
      "Google REST API 404 object error must return false without throwing TypeError"
    );

    const google401Response = {
      message: "Request had invalid authentication credentials.",
      response: {
        status: 401,
        data: {
          error: {
            code: 401,
            message: "Request had invalid authentication credentials. Expected OAuth 2 access token (invalid_grant).",
            status: "UNAUTHENTICATED",
          },
        },
      },
    };
    assert.equal(
      isInvalidGrantError(google401Response),
      true,
      "Google REST API 401 object error containing invalid_grant must return true"
    );
    assert.equal(
      isInvalidGrantError({ response: { data: { error: { message: "invalid_grant" } } } }),
      true,
      "Nested error object with message 'invalid_grant' must return true"
    );

    console.log("  ✓ isInvalidGrantError correctly classifies OAuth expiration patterns and ignores transient errors");
  }

  // --- TEST 2: Setup Isolated Google Email Account for invalid_grant Test ---
  console.log("\nTest 2: Setup Isolated Google Email Account for invalid_grant Test");
  const testWorkspaceId = new ObjectId();
  const testAccountId = new ObjectId();
  const testAccountDoc = {
    _id: testAccountId,
    workspaceId: testWorkspaceId,
    email: "test.oauth.expired@dripx.dev",
    provider: "google",
    status: "connected",
    isTestAccount: true,
    createdAt: new Date(),
  };
  await emailAccountsCol.insertOne(testAccountDoc);
  console.log("  ✓ Created isolated test account:", testAccountDoc.email, "(ID:", testAccountId.toString(), ")");

  // --- TEST 3: Sync Execution & invalid_grant Handling ---
  console.log("\nTest 3: Execute syncAllConnectedEmailAccounts on account with expired tokens");
  const { GmailConnector } = await import("./email/GmailConnector.js");
  const originalFetchExpired = GmailConnector.prototype.fetchRecentMessages;
  GmailConnector.prototype.fetchRecentMessages = async function () {
    return {
      success: false,
      error: "invalid_grant: Token has been expired or revoked.",
      isInvalidGrant: true,
    };
  };

  let updatedAccount;
  try {
    const syncResult1 = await syncAllConnectedEmailAccounts(testWorkspaceId);
    console.log("  Sync 1 result:", JSON.stringify(syncResult1, null, 2));

    // The account was polled
    assert.equal(syncResult1.syncedAccounts, 1, "Must poll 1 connected account");
    const accountResult = syncResult1.results.find((r) => r.accountId === testAccountId.toString());
    assert.ok(accountResult, "Sync result must include the tested account");
    assert.equal(accountResult.needsReconnect, true, "needsReconnect flag must be true");

    // --- TEST 4: Verify MongoDB Status Transition to 'needs_reconnect' ---
    console.log("\nTest 4: Verify account document status transitioned to 'needs_reconnect'");
    updatedAccount = await emailAccountsCol.findOne({ _id: testAccountId });
    assert.equal(
      updatedAccount.status,
      "needs_reconnect",
      `Account status should be 'needs_reconnect', got '${updatedAccount.status}'`
    );
    assert.equal(
      updatedAccount.lastError,
      "Google OAuth session expired. Please reconnect in Settings > Email Accounts.",
      `lastError should indicate OAuth expiration, got '${updatedAccount.lastError}'`
    );
    assert.ok(updatedAccount.lastSyncError, "lastSyncError must be recorded");
    assert.ok(updatedAccount.lastSyncAttemptAt, "lastSyncAttemptAt must be recorded");
    assert.ok(updatedAccount.updatedAt, "updatedAt must be updated");
    console.log("  ✓ DB State Verified: status='needs_reconnect', lastError recorded, timestamp updated");

    // --- TEST 5: Verify Polling Loop Halt ---
    console.log("\nTest 5: Verify background sync runner skips accounts with 'needs_reconnect' status (polling halt)");
    const syncResult2 = await syncAllConnectedEmailAccounts(testWorkspaceId);
    console.log("  Sync 2 result (after transition):", JSON.stringify(syncResult2, null, 2));
    assert.equal(
      syncResult2.syncedAccounts,
      0,
      "syncAllConnectedEmailAccounts must return 0 accounts when status is 'needs_reconnect' (polling halted)"
    );
    assert.equal(syncResult2.totalNewReplies, 0);
    console.log("  ✓ Polling loop successfully halted: zero API calls made for expired account");

    // --- TEST 6: Direct syncAccountReplies Guard ---
    console.log("\nTest 6: Verify direct syncAccountReplies guard on 'needs_reconnect' account");
    const directResult = await syncAccountReplies(updatedAccount);
    assert.equal(directResult.count, 0);
    assert.equal(directResult.skipped, true, "syncAccountReplies must immediately skip when status !== 'connected'");
    console.log("  ✓ Direct invocation safely skipped with { count: 0, skipped: true }");
  } finally {
    GmailConnector.prototype.fetchRecentMessages = originalFetchExpired;
    await emailAccountsCol.deleteOne({ _id: testAccountId });
  }

  // --- TEST 7: Mock Successful Inbound Sync & Idempotency Pipeline ---
  console.log("\nTest 7: Verify inbound message ingestion pipeline with mock connector");
  {
    const mockLeadId = new ObjectId();
    const mockWorkspaceId = new ObjectId();
    const mockAccountId = new ObjectId();
    const mockEmail = "sarah.lead@innovate-tech.io";

    // Setup mock lead
    await leadsCol.insertOne({
      _id: mockLeadId,
      workspaceId: mockWorkspaceId,
      email: mockEmail,
      firstName: "Sarah",
      lastName: "Jenkins",
      company: "Innovate Tech",
      status: "lead",
      createdAt: new Date(),
    });

    const mockAccountDoc = {
      _id: mockAccountId,
      workspaceId: mockWorkspaceId,
      email: "outreach@dripx.dev",
      provider: "google",
      status: "connected",
      historyId: "1000",
      createdAt: new Date(),
    };
    await emailAccountsCol.insertOne(mockAccountDoc);

    // Create a mock incoming message
    const mockMsgId = "mock-gmail-msg-" + Date.now();
    const mockThreadId = "mock-thread-" + Date.now();
    const mockIncomingMessage = {
      id: mockMsgId,
      threadId: mockThreadId,
      from: "Sarah Jenkins <sarah.lead@innovate-tech.io>",
      fromEmail: mockEmail,
      to: "outreach@dripx.dev",
      toEmail: "outreach@dripx.dev",
      subject: "Re: Quick question about DripX",
      date: new Date(),
      text: "Thanks for reaching out! Let's schedule a call this Thursday at 3 PM.",
      rawText: "Thanks for reaching out! Let's schedule a call this Thursday at 3 PM.",
      snippet: "Thanks for reaching out! Let's schedule a call this Thursday at 3 PM.",
      labelIds: ["INBOX"],
    };

    // Temporarily mock GmailConnector.prototype.fetchRecentMessages
    const { GmailConnector } = await import("./email/GmailConnector.js");
    const originalFetch = GmailConnector.prototype.fetchRecentMessages;
    GmailConnector.prototype.fetchRecentMessages = async function () {
      return {
        success: true,
        messages: [mockIncomingMessage],
        newHistoryId: "1001",
      };
    };

    try {
      // Ingest via syncAccountReplies
      const ingestOutcome1 = await syncAccountReplies(mockAccountDoc);
      assert.equal(ingestOutcome1.count, 1, "Must ingest 1 message");

      // Verify conversation created
      const createdConvo = await conversationsCol.findOne({
        workspaceId: mockWorkspaceId,
        leadId: mockLeadId,
      });
      assert.ok(createdConvo, "Conversation must be created for lead");
      assert.equal(createdConvo.unreadCount, 1, "Unread count should be 1");

      // Verify message ingested
      const storedMsg = await messagesCol.findOne({ providerMessageId: mockMsgId });
      assert.ok(storedMsg, "Message must be stored in messages collection");
      assert.equal(storedMsg.direction, "inbound");
      assert.equal(storedMsg.conversationId.toString(), createdConvo._id.toString());

      // Test Idempotency (second run must not duplicate)
      const ingestOutcome2 = await syncAccountReplies(mockAccountDoc);
      assert.equal(ingestOutcome2.count, 0, "Second run must not duplicate existing message");
      const countTotal = await messagesCol.countDocuments({ providerMessageId: mockMsgId });
      assert.equal(countTotal, 1, "Exactly 1 copy of message must exist");

      // Clean up mock records
      await leadsCol.deleteOne({ _id: mockLeadId });
      await conversationsCol.deleteOne({ _id: createdConvo._id });
      await messagesCol.deleteOne({ providerMessageId: mockMsgId });
      await emailAccountsCol.deleteOne({ _id: mockAccountId });
    } finally {
      GmailConnector.prototype.fetchRecentMessages = originalFetch;
    }

    console.log("  ✓ Inbound reply pipeline and deduplication verified successfully");
  }

  console.log("\n=== ALL GMAIL SYNC & INVALID_GRANT TESTS PASSED SUCCESSFULLY! ===");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
