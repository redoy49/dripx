import { google } from "googleapis";
import { EmailConnector } from "./EmailConnector.js";

/**
 * Encodes a string into Base64URL format required by Gmail API.
 */
function toBase64Url(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Builds an RFC 2822 compliant MIME message.
 */
function buildRawMimeMessage({ from, to, subject, body, inReplyTo, references, headers }) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: 8bit",
  ];

  if (inReplyTo) lines.push(`In-Reply-To: ${inReplyTo}`);
  if (references) lines.push(`References: ${references}`);

  if (headers && typeof headers === "object") {
    for (const [k, v] of Object.entries(headers)) {
      lines.push(`${k}: ${v}`);
    }
  }

  lines.push("", body);
  return lines.join("\r\n");
}

/**
 * Google Workspace / Gmail API Connector using OAuth 2.0.
 */
export class GmailConnector extends EmailConnector {
  constructor(accountConfig = {}, onTokenRefresh = null) {
    super();
    this.email = accountConfig.email;
    this.name = accountConfig.name || "";
    this.onTokenRefresh = onTokenRefresh;

    const clientId = accountConfig.clientId || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = accountConfig.clientSecret || process.env.GOOGLE_CLIENT_SECRET;

    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    this.oauth2Client.setCredentials({
      refresh_token: accountConfig.refreshToken,
      access_token: accountConfig.accessToken,
    });

    if (this.onTokenRefresh) {
      this.oauth2Client.on("tokens", (tokens) => {
        this.onTokenRefresh(tokens);
      });
    }

    this.gmail = google.gmail({ version: "v1", auth: this.oauth2Client });
  }

  async sendEmail({ to, subject, body, from, inReplyTo, references, headers }) {
    try {
      const senderFrom = from || (this.name ? `"${this.name}" <${this.email}>` : this.email);
      const rawMime = buildRawMimeMessage({
        from: senderFrom,
        to,
        subject,
        body,
        inReplyTo,
        references,
        headers,
      });

      const res = await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: toBase64Url(rawMime),
        },
      });

      return {
        success: true,
        providerMessageId: res.data.id,
        threadId: res.data.threadId,
      };
    } catch (err) {
      console.error("[GmailConnector] Send failed:", err.message);
      return {
        success: false,
        error: err.message,
        code: err.code || "GMAIL_SEND_ERROR",
      };
    }
  }

  /**
   * Verifies the OAuth connection and profile permissions without sending emails.
   */
  async verifyConnection() {
    try {
      const profile = await this.gmail.users.getProfile({ userId: "me" });
      return {
        success: true,
        details: {
          emailAddress: profile.data.emailAddress,
          messagesTotal: profile.data.messagesTotal,
          status: "connected",
        },
      };
    } catch (err) {
      console.error("[GmailConnector] Verification failed:", err.message);
      return {
        success: false,
        error: err.message,
        code: err.code || "GMAIL_AUTH_FAILED",
      };
    }
  }

  /**
   * Searches the mailbox for a test verification token to confirm inbound delivery.
   */
  async checkInboxForToken(token) {
    try {
      const res = await this.gmail.users.messages.list({
        userId: "me",
        q: `subject:"${token}"`,
        maxResults: 5,
      });

      const messages = res.data.messages || [];
      if (messages.length === 0) {
        return { success: false, found: false, error: "Verification token not yet detected in inbox." };
      }

      const detail = await this.gmail.users.messages.get({
        userId: "me",
        id: messages[0].id,
      });

      const labelIds = detail.data.labelIds || [];
      const isInInbox = labelIds.includes("INBOX");
      const isInSpam = labelIds.includes("SPAM");

      return {
        success: true,
        found: true,
        messageId: messages[0].id,
        folder: isInSpam ? "SPAM" : isInInbox ? "INBOX" : "ALL_MAIL",
        labelIds,
      };
    } catch (err) {
      console.error("[GmailConnector] Inbox token check failed:", err.message);
      return {
        success: false,
        found: false,
        error: err.message,
      };
    }
  }

  getCapabilities() {
    return {
      canSend: true,
      canSyncInbox: true,
      canTrackEvents: false,
      maxDailyVolume: 50,
    };
  }
}
