import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { dbConnect } from "./mongoDb.js";
import { syncAllConnectedEmailAccounts } from "./email/emailSyncEngine.js";

async function runTests() {
  console.log("=== Running Gmail Inbound Reply Sync Integration Tests ===\n");

  const emailAccountsCol = await dbConnect("email_accounts");
  const conversationsCol = await dbConnect("conversations");
  const messagesCol = await dbConnect("messages");
  const campaignLeadsCol = await dbConnect("campaign_leads");
  const leadsCol = await dbConnect("leads");

  // 1. Verify Connected Google Account Exists
  console.log("Test 1: Verify connected Google account in DB");
  const account = await emailAccountsCol.findOne({ status: "connected", provider: "google" });
  assert.ok(account, "Must have an active connected Google email account");
  console.log("  ✓ Found connected account:", account.email);

  // 2. Locate target lead for test
  console.log("\nTest 2: Verify target lead 'Tajin Somaiya'");
  const tajinLead = await leadsCol.findOne({ email: "ridoy.ecomweb@gmail.com" });
  assert.ok(tajinLead, "Target lead ridoy.ecomweb@gmail.com must exist");
  console.log("  ✓ Target lead verified:", tajinLead.firstName, tajinLead.lastName, tajinLead._id.toString());

  // 3. Execute Sync Engine
  console.log("\nTest 3: Execute syncAllConnectedEmailAccounts");
  const syncResult1 = await syncAllConnectedEmailAccounts(account.workspaceId);
  console.log("  Sync 1 result:", syncResult1);
  assert.equal(syncResult1.syncedAccounts, 1, "Must sync 1 account");

  // 4. Verify Ingested Message in DB
  console.log("\nTest 4: Verify ingested message in MongoDB");
  const ingestedMsg = await messagesCol.findOne({
    providerMessageId: "1a13343a2ba07fc7",
  });
  assert.ok(ingestedMsg, "Incoming message 1a13343a2ba07fc7 must exist in messages collection");
  assert.equal(ingestedMsg.direction, "inbound");
  assert.equal(ingestedMsg.channel, "email");
  assert.ok(ingestedMsg.body.includes("I would love to connect with you"), "Message body must contain lead reply text");
  console.log("  ✓ Ingested message verified in DB:", {
    id: ingestedMsg._id.toString(),
    conversationId: ingestedMsg.conversationId.toString(),
    direction: ingestedMsg.direction,
    snippet: ingestedMsg.body.slice(0, 50),
  });

  // 5. Verify Conversation Updated
  console.log("\nTest 5: Verify conversation updated with latest timestamp");
  const convo = await conversationsCol.findOne({ _id: ingestedMsg.conversationId });
  assert.ok(convo, "Conversation must exist");
  assert.ok(convo.lastMessageAt, "Conversation must have lastMessageAt");
  console.log("  ✓ Conversation verified:", {
    id: convo._id.toString(),
    subject: convo.subject,
    unreadCount: convo.unreadCount,
    lastMessageAt: convo.lastMessageAt,
  });

  // 6. Verify Campaign Lead marked as 'replied'
  console.log("\nTest 6: Verify Tajin's campaign_lead status updated to 'replied'");
  const campaignLead = await campaignLeadsCol.findOne({ leadId: tajinLead._id });
  assert.ok(campaignLead, "Campaign lead record must exist");
  assert.equal(campaignLead.status, "replied", `Status should be 'replied', got: ${campaignLead.status}`);
  console.log("  ✓ Campaign lead status:", campaignLead.status);

  // 7. Verify Idempotency on Second Sync Run
  console.log("\nTest 7: Idempotency check on subsequent sync run");
  const syncResult2 = await syncAllConnectedEmailAccounts(account.workspaceId);
  console.log("  Sync 2 result:", syncResult2);
  assert.equal(syncResult2.totalNewReplies, 0, "Second sync must NOT duplicate existing messages (totalNewReplies must be 0)");
  console.log("  ✓ Zero duplicates created on subsequent sync run.");

  // 8. Verify Updated Cursor
  console.log("\nTest 8: Verify historyId cursor stored on email_accounts");
  const updatedAccount = await emailAccountsCol.findOne({ _id: account._id });
  assert.ok(updatedAccount.historyId, "Account must now have historyId cursor set");
  assert.ok(updatedAccount.lastSyncAt, "Account must have lastSyncAt set");
  console.log("  ✓ Stored cursor historyId:", updatedAccount.historyId, "lastSyncAt:", updatedAccount.lastSyncAt);

  console.log("\n=== All 8 Gmail Reply Sync Tests Passed Successfully! ===");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
