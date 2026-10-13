import { ResendConnector } from "./ResendConnector.js";

const defaultResend = new ResendConnector();

/**
 * Backward-compatible Resend wrapper.
 * Delegates to ResendConnector while preserving all legacy imports and signatures.
 */
export async function sendEmail({ to, subject, body, from, html, replyTo, headers }) {
  return defaultResend.sendEmail({ to, subject, body, from, html, replyTo, headers });
}
