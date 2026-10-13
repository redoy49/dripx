import { EmailConnector } from "./EmailConnector.js";

/**
 * Resend API Connector for platform transactional messages (invites, alerts)
 * and optional platform-managed fallback sending.
 */
export class ResendConnector extends EmailConnector {
  constructor(apiKey = null) {
    super();
    this.apiKey = apiKey || process.env.RESEND_API_KEY;
  }

  async sendEmail({ to, subject, body, html, from, replyTo, headers }) {
    if (!this.apiKey) {
      console.warn(
        `[ResendConnector] RESEND_API_KEY not set — skipping real send. Would have emailed ${to}: "${subject}"`,
      );
      return { success: false, skipped: true };
    }

    try {
      const payload = {
        from: from || "DripX <onboarding@resend.dev>",
        to: Array.isArray(to) ? to : [to],
        subject,
        text: body,
      };

      if (html) payload.html = html;
      if (replyTo) payload.reply_to = replyTo;
      if (headers) payload.headers = headers;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("[ResendConnector] Send failed:", res.status, errorBody);
        return { success: false, error: `Resend API error ${res.status}: ${errorBody}` };
      }

      const data = await res.json();
      return { success: true, providerMessageId: data.id };
    } catch (error) {
      console.error("[ResendConnector] Send failed:", error);
      return { success: false, error: error.message };
    }
  }

  async verifyConnection() {
    if (!this.apiKey) {
      return { success: false, error: "RESEND_API_KEY is not configured" };
    }

    try {
      const res = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      if (!res.ok) {
        return { success: false, error: `Resend API authentication failed: status ${res.status}` };
      }
      return { success: true, details: { provider: "resend", status: "active" } };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  getCapabilities() {
    return {
      canSend: true,
      canSyncInbox: false,
      canTrackEvents: true,
      maxDailyVolume: 500,
    };
  }
}
