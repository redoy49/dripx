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
 * Decodes Base64URL string into UTF-8.
 */
function decodeBase64Url(data) {
  if (!data) return "";
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Splits text into new reply content and historical quoted email thread.
 */
export function splitQuotedReply(text) {
  if (!text || typeof text !== "string") {
    return { mainText: "", quotedText: "" };
  }

  const quoteHeaderRegex = /(?:\r?\n)(?:On\s+[\s\S]+?\s+wrote:|-----Original Message-----|_{20,}|From:\s+.+?\r?\n(?:Sent|Date):|(?=>\s*[\w\s]))/i;

  const match = text.search(quoteHeaderRegex);
  if (match !== -1) {
    const mainText = text.slice(0, match).trim();
    let quotedText = text.slice(match).trim();
    // Strip leading '>' blockquote markers from each line
    quotedText = quotedText
      .split("\n")
      .map((line) => line.replace(/^\s*>+\s?/, ""))
      .join("\n")
      .trim();

    if (mainText) {
      return { mainText, quotedText };
    }
  }

  return { mainText: text.trim(), quotedText: "" };
}

/**
 * Strips quoted history from an email body, returning only the actual new response.
 */
export function stripQuotedReply(text) {
  return splitQuotedReply(text).mainText;
}

/**
 * Parses MIME body payload recursively for text and HTML.
 */
function extractBodyFromPayload(payload) {
  let text = "";
  let html = "";

  function traverse(part) {
    if (!part) return;
    if (part.mimeType === "text/plain" && part.body?.data) {
      text = decodeBase64Url(part.body.data);
    } else if (part.mimeType === "text/html" && part.body?.data) {
      html = decodeBase64Url(part.body.data);
    }
    if (part.parts && Array.isArray(part.parts)) {
      for (const p of part.parts) traverse(p);
    }
  }

  traverse(payload);
  const rawText = text.trim() || payload?.snippet || "";
  const { mainText, quotedText } = splitQuotedReply(rawText);

  return {
    text: mainText || rawText,
    rawText,
    quotedText,
    html: html.trim() || null,
  };
}

/**
 * Extracts raw email address from header strings like "Name <user@example.com>"
 */
function extractEmailAddress(str) {
  if (!str) return "";
  const match = str.match(/<([^>]+)>/);
  if (match) return match[1].trim().toLowerCase();
  return str.trim().toLowerCase();
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

  /**
   * Fetches full details of a specific message by ID and parses headers and body.
   */
  async fetchMessage(messageId) {
    try {
      const res = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const data = res.data;
      const headers = {};
      if (data.payload?.headers) {
        for (const h of data.payload.headers) {
          headers[h.name.toLowerCase()] = h.value;
        }
      }

      const body = extractBodyFromPayload(data.payload);

      return {
        id: data.id,
        threadId: data.threadId,
        snippet: data.snippet || "",
        labelIds: data.labelIds || [],
        from: headers["from"] || "",
        fromEmail: extractEmailAddress(headers["from"]),
        to: headers["to"] || "",
        toEmail: extractEmailAddress(headers["to"]),
        subject: headers["subject"] || "",
        date: headers["date"] ? new Date(headers["date"]) : new Date(Number(data.internalDate)),
        messageIdHeader: headers["message-id"] || null,
        inReplyTo: headers["in-reply-to"] || null,
        references: headers["references"] || null,
        text: body.text,
        rawText: body.rawText,
        quotedText: body.quotedText,
        html: body.html,
      };
    } catch (err) {
      console.error(`[GmailConnector] Failed to fetch message ${messageId}:`, err.message);
      return null;
    }
  }

  /**
   * Fetches recent messages incrementally using historyId or query fallback.
   */
  async fetchRecentMessages({ historyId = null, maxResults = 25 } = {}) {
    try {
      const messageIdsToFetch = new Set();
      let newHistoryId = historyId;

      // 1. If historyId provided, try history.list
      if (historyId) {
        try {
          const historyRes = await this.gmail.users.history.list({
            userId: "me",
            startHistoryId: historyId,
            historyTypes: ["messageAdded"],
            maxResults,
          });

          if (historyRes.data.history) {
            for (const record of historyRes.data.history) {
              if (record.messagesAdded) {
                for (const item of record.messagesAdded) {
                  if (item.message?.id) messageIdsToFetch.add(item.message.id);
                }
              }
            }
          }
          newHistoryId = historyRes.data.historyId || historyId;
        } catch (historyErr) {
          // If historyId is expired or invalid (HTTP 404 or 400), fall back to messages.list
          console.warn("[GmailConnector] history.list expired or failed, falling back to messages.list:", historyErr.message);
          historyId = null;
        }
      }

      // 2. If no historyId or fallback triggered
      if (!historyId) {
        const listRes = await this.gmail.users.messages.list({
          userId: "me",
          q: "label:INBOX newer_than:7d",
          maxResults,
        });

        if (listRes.data.messages) {
          for (const m of listRes.data.messages) {
            if (m.id) messageIdsToFetch.add(m.id);
          }
        }

        // Get latest profile historyId for future incremental syncs
        try {
          const profile = await this.gmail.users.getProfile({ userId: "me" });
          if (profile.data.historyId) {
            newHistoryId = profile.data.historyId;
          }
        } catch (profileErr) {
          console.warn("[GmailConnector] Failed to get profile historyId:", profileErr.message);
        }
      }

      // 3. Fetch details for each message
      const messages = [];
      for (const id of messageIdsToFetch) {
        const msg = await this.fetchMessage(id);
        if (!msg) continue;

        // Skip outbound messages sent by self
        const isSelf = msg.labelIds.includes("SENT") || (this.email && msg.fromEmail === this.email.toLowerCase());
        if (isSelf) continue;

        messages.push(msg);
      }

      return {
        success: true,
        messages,
        newHistoryId,
      };
    } catch (err) {
      console.error("[GmailConnector] fetchRecentMessages error:", err.message);
      return {
        success: false,
        error: err.message,
        messages: [],
        newHistoryId: historyId,
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
