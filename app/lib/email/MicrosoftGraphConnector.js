import { EmailConnector } from "./EmailConnector.js";

/**
 * Microsoft 365 / Outlook Connector using Microsoft Graph REST API and Entra ID OAuth 2.0.
 * Operates purely via serverless-friendly HTTPS fetch calls with zero external SDKs.
 */
export class MicrosoftGraphConnector extends EmailConnector {
  constructor(accountConfig = {}, onTokenRefresh = null) {
    super();
    this.email = accountConfig.email;
    this.name = accountConfig.name || "";
    this.accessToken = accountConfig.accessToken;
    this.refreshToken = accountConfig.refreshToken;
    this.expiresAt = accountConfig.expiresAt ? new Date(accountConfig.expiresAt).getTime() : 0;
    this.clientId = accountConfig.clientId || process.env.MICROSOFT_CLIENT_ID;
    this.clientSecret = accountConfig.clientSecret || process.env.MICROSOFT_CLIENT_SECRET;
    this.onTokenRefresh = onTokenRefresh;
  }

  async #ensureValidToken() {
    // If token has at least 3 minutes of life remaining, use it
    if (this.accessToken && Date.now() < this.expiresAt - 3 * 60 * 1000) {
      return this.accessToken;
    }

    if (!this.refreshToken) {
      throw new Error("No Microsoft refresh token available. Reconnection required.");
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "refresh_token",
      refresh_token: this.refreshToken,
      scope: "https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.Read offline_access User.Read",
    });

    const res = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to refresh Microsoft token: ${res.status} ${errText}`);
    }

    const data = await res.json();
    this.accessToken = data.access_token;
    if (data.refresh_token) this.refreshToken = data.refresh_token;
    this.expiresAt = Date.now() + (data.expires_in || 3600) * 1000;

    if (this.onTokenRefresh) {
      this.onTokenRefresh({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresAt: new Date(this.expiresAt),
      });
    }

    return this.accessToken;
  }

  async sendEmail({ to, subject, body, html }) {
    try {
      const token = await this.#ensureValidToken();

      const recipients = (Array.isArray(to) ? to : [to]).map((addr) => ({
        emailAddress: { address: addr },
      }));

      const payload = {
        message: {
          subject,
          body: {
            contentType: html ? "HTML" : "Text",
            content: html || body,
          },
          toRecipients: recipients,
        },
        saveToSentItems: "true",
      };

      const res = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          success: false,
          error: `Microsoft Graph error ${res.status}: ${errorText}`,
          code: `GRAPH_${res.status}`,
        };
      }

      // Graph sendMail returns 202 Accepted on success
      return {
        success: true,
        providerMessageId: `ms_graph_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      };
    } catch (err) {
      console.error("[MicrosoftGraphConnector] Send failed:", err.message);
      return { success: false, error: err.message, code: "GRAPH_SEND_FAILED" };
    }
  }

  async verifyConnection() {
    try {
      const token = await this.#ensureValidToken();
      const res = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `Microsoft Graph auth failed: ${res.status} ${errText}` };
      }

      const user = await res.json();
      return {
        success: true,
        details: {
          displayName: user.displayName,
          userPrincipalName: user.userPrincipalName,
          mail: user.mail,
          status: "connected",
        },
      };
    } catch (err) {
      console.error("[MicrosoftGraphConnector] Verification failed:", err.message);
      return { success: false, error: err.message, code: "GRAPH_VERIFY_FAILED" };
    }
  }

  /**
   * Searches Outlook inbox for a verification token to verify inbound delivery.
   */
  async checkInboxForToken(token) {
    try {
      const accessToken = await this.#ensureValidToken();
      const encodedToken = encodeURIComponent(token);
      const res = await fetch(
        `https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?$filter=contains(subject,'${encodedToken}')&$top=5`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!res.ok) {
        return { success: false, found: false, error: `Graph inbox check failed: ${res.status}` };
      }

      const data = await res.json();
      const messages = data.value || [];
      if (messages.length === 0) {
        return { success: false, found: false, error: "Token not detected in Outlook inbox." };
      }

      return {
        success: true,
        found: true,
        messageId: messages[0].id,
        folder: "INBOX",
      };
    } catch (err) {
      console.error("[MicrosoftGraphConnector] Inbox token check failed:", err.message);
      return { success: false, found: false, error: err.message };
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
