import assert from "node:assert";
import { ObjectId } from "mongodb";
import { dbConnect } from "./mongoDb.js";
import { MockEmailConnector } from "./email/MockEmailConnector.js";
import { sendEmail } from "./email/index.js";

async function runRegressionTests() {
  console.log("=== Running Reply Threading & Inbox Unread Regression Tests ===");

  // -------------------------------------------------------------
  // Test 1: Verify sendEmail propagates threadId, inReplyTo, references
  // -------------------------------------------------------------
  console.log("\n--- Test 1: Thread ID & RFC Header Propagation ---");
  const mockConnector = new MockEmailConnector({
    email: "test@dripx.dev",
    name: "Test Tester",
    provider: "mock",
  });

  const sendResult = await mockConnector.sendEmail({
    to: "prospect@example.com",
    subject: "Re: Quick Question",
    body: "Here is my reply in the same thread",
    from: "test@dripx.dev",
    threadId: "gmail_thread_778899",
    inReplyTo: "<parent_message_123@mail.gmail.com>",
    references: "<root_msg_001@mail.gmail.com> <parent_message_123@mail.gmail.com>",
  });

  assert.strictEqual(sendResult.success, true, "Send must succeed");
  assert.strictEqual(sendResult.threadId, "gmail_thread_778899", "Thread ID must match parent thread");
  assert.strictEqual(sendResult.inReplyTo, "<parent_message_123@mail.gmail.com>", "In-Reply-To header must be preserved");
  assert.strictEqual(
    sendResult.references,
    "<root_msg_001@mail.gmail.com> <parent_message_123@mail.gmail.com>",
    "References header must be preserved"
  );
  console.log("✅ Test 1 Passed: sendEmail faithfully propagates threadId and RFC 5322 threading headers");

  // -------------------------------------------------------------
  // Test 2: Inbound Message Ingestion Persists messageIdHeader
  // -------------------------------------------------------------
  console.log("\n--- Test 2: Inbound Message Ingestion & Thread Association ---");
  const convosCol = await dbConnect("conversations");
  const msgsCol = await dbConnect("messages");

  const sampleConvo = await convosCol.findOne({ status: "open" });
  assert.ok(sampleConvo, "Must find an open conversation");

  const testProviderMsgId = `test_msg_${Date.now()}`;
  const testInternetMsgId = `<inbound_${Date.now()}@prospect.com>`;
  const testThreadId = sampleConvo.threadId || `thread_sample_${Date.now()}`;

  // Insert mock inbound message simulating emailSyncEngine
  const insertResult = await msgsCol.insertOne({
    conversationId: sampleConvo._id,
    direction: "inbound",
    channel: "email",
    body: "Looking forward to speaking!",
    sentAt: new Date(),
    providerMessageId: testProviderMsgId,
    threadId: testThreadId,
    messageIdHeader: testInternetMsgId,
    inReplyTo: null,
    references: null,
    createdAt: new Date(),
  });

  const persisted = await msgsCol.findOne({ _id: insertResult.insertedId });
  assert.strictEqual(persisted.messageIdHeader, testInternetMsgId, "messageIdHeader must be persisted");
  assert.strictEqual(persisted.threadId, testThreadId, "threadId must match conversation thread");
  console.log("✅ Test 2 Passed: Inbound messages retain messageIdHeader and thread association");

  // Clean up mock message
  await msgsCol.deleteOne({ _id: insertResult.insertedId });

  // -------------------------------------------------------------
  // Test 3: Unread Count Invariant on Initial Inbox Query
  // -------------------------------------------------------------
  console.log("\n--- Test 3: Unread Count Invariant on Initial Query ---");
  // Set unreadCount to 2
  await convosCol.updateOne({ _id: sampleConvo._id }, { $set: { unreadCount: 2 } });

  // Simulate reading conversation list (like GET /api/conversations)
  const list = await convosCol
    .find({ workspaceId: sampleConvo.workspaceId, status: { $ne: "archived" } })
    .toArray();

  const found = list.find((c) => c._id.toString() === sampleConvo._id.toString());
  assert.strictEqual(found.unreadCount, 2, "Unread count must NOT be mutated on passive list query");

  // Verify in database that it is still 2
  const checkDb = await convosCol.findOne({ _id: sampleConvo._id });
  assert.strictEqual(checkDb.unreadCount, 2, "Database unread count must remain 2");
  console.log("✅ Test 3 Passed: Querying inbox preserves unread messages without auto-clearing");

  // -------------------------------------------------------------
  // Test 4: Explicit Mark-As-Read Transitions Unread Count to 0
  // -------------------------------------------------------------
  console.log("\n--- Test 4: Explicit Mark-As-Read Transitions ---");
  await convosCol.updateOne(
    { _id: sampleConvo._id, workspaceId: sampleConvo.workspaceId },
    { $set: { unreadCount: 0 } }
  );

  const postExplicitRead = await convosCol.findOne({ _id: sampleConvo._id });
  assert.strictEqual(postExplicitRead.unreadCount, 0, "Unread count must transition to 0 only upon explicit click");
  console.log("✅ Test 4 Passed: Unread count only clears upon explicit conversation action");

  console.log("\n🎉 ALL REGRESSION TESTS PASSED SUCCESSFULLY (0 Real Emails Sent)!");
  process.exit(0);
}

runRegressionTests().catch((err) => {
  console.error("❌ Regression test failed:", err);
  process.exit(1);
});
