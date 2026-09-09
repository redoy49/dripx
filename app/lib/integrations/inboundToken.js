import crypto from "crypto";

// Deterministic per-workspace inbound-webhook token, derived from JWT_SECRET so no extra
// storage/rotation is needed — regenerating it just means resigning with a new JWT_SECRET.
export function getInboundToken(workspaceId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in .env.local");

  return crypto.createHmac("sha256", secret).update(workspaceId.toString()).digest("hex").slice(0, 32);
}
