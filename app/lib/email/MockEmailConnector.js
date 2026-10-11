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

  async sendEmail({ to, subject, body, from }) {
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

  getCapabilities() {
    return {
      canSend: true,
      canSyncInbox: true,
      canTrackEvents: true,
      maxDailyVolume: 1000,
    };
  }
}
