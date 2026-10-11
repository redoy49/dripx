/**
 * Base abstract class for all DripX Email Connectors.
 * Defines the standard contract for email sending, connection verification,
 * and capability discovery across Gmail, Microsoft Graph, SMTP, and Resend.
 */
export class EmailConnector {
  /**
   * Dispatches an email to the recipient.
   * @param {Object} options
   * @param {string} options.to - Recipient email address
   * @param {string} options.subject - Email subject line
   * @param {string} options.body - Plain-text message body
   * @param {string} [options.html] - Optional HTML message body
   * @param {string} [options.from] - Sender address (e.g. "Name <email@domain.com>")
   * @param {string} [options.replyTo] - Optional Reply-To address
   * @param {string} [options.inReplyTo] - Optional Message-ID being replied to
   * @param {string} [options.references] - Optional References header
   * @param {Object} [options.headers] - Custom MIME headers
   * @returns {Promise<{ success: boolean, providerMessageId?: string, error?: string, code?: string, skipped?: boolean }>}
   */
  async sendEmail(_options) {
    throw new Error("sendEmail() must be implemented by the subclass");
  }

  /**
   * Verifies the connection, credentials, and permissions without sending a real email.
   * @returns {Promise<{ success: boolean, error?: string, details?: any }>}
   */
  async verifyConnection() {
    throw new Error("verifyConnection() must be implemented by the subclass");
  }

  /**
   * Returns provider capabilities (inbox sync, event webhooks, etc.)
   */
  getCapabilities() {
    return {
      canSend: true,
      canSyncInbox: false,
      canTrackEvents: false,
      maxDailyVolume: 50,
    };
  }
}
