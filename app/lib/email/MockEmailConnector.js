import { EmailConnector } from "./EmailConnector.js";

/**
 * Safe development & testing connector.
 * Never touches real external servers, simulates network latency, and returns
 * deterministic mock identifiers for campaign pipelines and unit tests.
 */
export class MockEmailConnector extends EmailConnector {
  constructor(account = null) {
    super();
    this.account = account || {
      email: "mock-sender@dripx.dev",
      name: "Mock Outreach Sender",
      provider: "mock",
    };
  }

  async sendEmail({ to, subject, body, from, threadId, inReplyTo, references }) {
    // Simulated network latency
    await new Promise((resolve) => setTimeout(resolve, 80));

    const senderEmail = from || `${this.account.name || "DripX"} <${this.account.email}>`;
    const messageId = `mock_email_${Date.now()}_${Math.random().toString(36).slice(2, 9)}@dripx.dev`;

    console.log(
      `[MockEmailConnector] Sent email from ${senderEmail} to ${to}: "${subject}" (Body len: ${body?.length || 0})`,
    );

    return {
      success: true,
      providerMessageId: messageId,
      threadId: threadId || `mock_thread_${Date.now()}`,
      inReplyTo: inReplyTo || null,
      references: references || null,
      deliveredAt: new Date(),
    };
  }

  async verifyConnection() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      success: true,
      details: {
        provider: "mock",
        email: this.account.email,
        status: "verified",
      },
    };
  }

  async checkInboxForToken(_token) {
    await new Promise((resolve) => setTimeout(resolve, 30));
    return {
      success: true,
      found: true,
      messageId: `mock_verify_msg_${Date.now()}`,
      folder: "INBOX",
    };
  }

  getCapabilities() {
    return {
      canSend: true,
      canSyncInbox: true,
      canTrackEvents: true,
      maxDailyVolume: 1000,
    };
  }
}
