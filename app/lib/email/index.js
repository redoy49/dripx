import { ObjectId } from "mongodb";
import { dbConnect } from "../mongoDb.js";
import { decryptCredentials, encryptCredentials } from "../crypto.js";
import { MockEmailConnector } from "./MockEmailConnector.js";
import { ResendConnector } from "./ResendConnector.js";
import { SmtpConnector } from "./SmtpConnector.js";
import { GmailConnector } from "./GmailConnector.js";
import { MicrosoftGraphConnector } from "./MicrosoftGraphConnector.js";

export { EmailConnector } from "./EmailConnector.js";
export { MockEmailConnector } from "./MockEmailConnector.js";
export { ResendConnector } from "./ResendConnector.js";
export { SmtpConnector } from "./SmtpConnector.js";
export { GmailConnector } from "./GmailConnector.js";
export { MicrosoftGraphConnector } from "./MicrosoftGraphConnector.js";

/**
 * Resolves and instantiates the appropriate EmailConnector for a given account ID,
 * workspace, or sending purpose.
 */
export async function getEmailConnector({
  accountId = null,
  workspaceId = null,
  purpose = "campaign",
} = {}) {
  // 1. Transactional platform emails (invites, alerts) prioritize Resend or Mock
  if (purpose === "transactional") {
    if (process.env.RESEND_API_KEY) return new ResendConnector();
    return new MockEmailConnector({
      email: "system@dripx.dev",
      name: "DripX Platform",
      provider: "mock",
    });
  }

  // 2. If a specific accountId is provided, resolve from DB
  if (accountId) {
    const emailAccounts = await dbConnect("email_accounts");
    const query = { _id: new ObjectId(accountId) };
    if (workspaceId) query.workspaceId = new ObjectId(workspaceId);

    const account = await emailAccounts.findOne(query);
    if (account && account.status !== "disconnected") {
      return buildConnectorFromAccount(account);
    }
  }

  // 3. If workspaceId is provided, look for the workspace's default/first active account
  if (workspaceId) {
    const emailAccounts = await dbConnect("email_accounts");
    const account = await emailAccounts.findOne({
      workspaceId: new ObjectId(workspaceId),
      status: "connected",
    });
    if (account) {
      return buildConnectorFromAccount(account);
    }
  }

  // 4. Fallback in dev/demo or unconfigured workspace
  if (process.env.RESEND_API_KEY) {
    return new ResendConnector();
  }

  return new MockEmailConnector();
}

/**
 * Internal helper to instantiate the right connector from a DB document.
 */
export function buildConnectorFromAccount(account) {
  const decrypted = decryptCredentials(account.credentials) || {};

  const handleTokenRefresh = async (newTokens) => {
    try {
      const emailAccounts = await dbConnect("email_accounts");
      const updatedCreds = {
        ...decrypted,
        ...newTokens,
      };
      const encrypted = encryptCredentials(updatedCreds);
      await emailAccounts.updateOne(
        { _id: account._id },
        {
          $set: {
            credentials: encrypted,
            status: "connected",
            lastError: null,
            updatedAt: new Date(),
          },
        },
      );
    } catch (err) {
      console.error("[EmailConnector] Failed to persist refreshed token:", err);
    }
  };

  switch (account.provider) {
    case "google":
      return new GmailConnector(
        {
          email: account.email,
          name: account.name,
          refreshToken: decrypted.refreshToken,
          accessToken: decrypted.accessToken,
        },
        handleTokenRefresh,
      );

    case "microsoft":
      return new MicrosoftGraphConnector(
        {
          email: account.email,
          name: account.name,
          refreshToken: decrypted.refreshToken,
          accessToken: decrypted.accessToken,
          expiresAt: decrypted.expiresAt,
        },
        handleTokenRefresh,
      );

    case "smtp":
      return new SmtpConnector({
        host: account.smtpConfig?.host,
        port: account.smtpConfig?.port,
        secure: account.smtpConfig?.secure,
        user: account.smtpConfig?.user || account.email,
        pass: decrypted.smtpPassword,
        fromEmail: account.email,
        fromName: account.name,
      });

    case "resend":
      return new ResendConnector(decrypted.apiKey || process.env.RESEND_API_KEY);

    default:
      return new MockEmailConnector(account);
  }
}

/**
 * Backward-compatible drop-in sendEmail wrapper preserving the existing signature
 * for legacy call sites throughout DripX.
 */
export async function sendEmail({
  to,
  subject,
  body,
  html,
  from,
  replyTo,
  accountId = null,
  workspaceId = null,
  purpose = "transactional",
}) {
  const connector = await getEmailConnector({ accountId, workspaceId, purpose });
  return connector.sendEmail({ to, subject, body, html, from, replyTo });
}
