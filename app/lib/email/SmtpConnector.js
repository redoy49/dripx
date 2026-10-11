import nodemailer from "nodemailer";
import { EmailConnector } from "./EmailConnector.js";

/**
 * Custom SMTP Connector powered by Nodemailer.
 * Enables users to connect Google Workspace App Passwords, Microsoft 365,
 * Amazon SES, Zoho, or private domain SMTP servers for direct cold outreach.
 */
export class SmtpConnector extends EmailConnector {
  constructor(config = {}) {
    super();
    this.config = config;
    this.defaultFrom = config.fromEmail
      ? `${config.fromName || ""} <${config.fromEmail}>`.trim()
      : config.user;

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: Number(config.port) || 587,
      secure: config.secure === true || Number(config.port) === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 10000, // 10 second timeout
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  async sendEmail({ to, subject, body, html, from, replyTo, inReplyTo, references, headers }) {
    try {
      const mailOptions = {
        from: from || this.defaultFrom,
        to,
        subject,
        text: body,
        html: html || undefined,
        replyTo: replyTo || undefined,
        inReplyTo: inReplyTo || undefined,
        references: references || undefined,
        headers: headers || undefined,
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        providerMessageId: info.messageId,
        response: info.response,
      };
    } catch (err) {
      console.error("[SmtpConnector] Send failed:", err.message);
      return {
        success: false,
        error: err.message,
        code: err.code || "SMTP_ERROR",
        responseCode: err.responseCode,
      };
    }
  }

  /**
   * Verifies SMTP connection without sending any real emails.
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return {
        success: true,
        details: {
          host: this.config.host,
          port: this.config.port,
          user: this.config.user,
          status: "connected",
        },
      };
    } catch (err) {
      console.error("[SmtpConnector] Verification failed:", err.message);
      return {
        success: false,
        error: err.message,
        code: err.code || "VERIFY_FAILED",
      };
    }
  }

  getCapabilities() {
    return {
      canSend: true,
      canSyncInbox: false,
      canTrackEvents: false,
      maxDailyVolume: 50,
    };
  }
}
