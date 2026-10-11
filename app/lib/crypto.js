import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM

function getEncryptionKey() {
  const customSecret = process.env.ENCRYPTION_SECRET;
  if (customSecret) {
    if (customSecret.length === 64) {
      return Buffer.from(customSecret, "hex");
    }
    return crypto.scryptSync(customSecret, "dripx-custom-salt", 32);
  }

  const jwtSecret = process.env.JWT_SECRET || "dripx-default-dev-fallback-key";
  return crypto.scryptSync(jwtSecret, "dripx-credential-salt", 32);
}

/**
 * Encrypts an arbitrary object or string using AES-256-GCM.
 * Returns { encryptedData, iv, authTag } as hex strings.
 */
export function encryptCredentials(data) {
  if (data === null || data === undefined) return null;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const textToEncrypt = typeof data === "string" ? data : JSON.stringify(data);
  let encrypted = cipher.update(textToEncrypt, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    authTag,
  };
}

/**
 * Decrypts an AES-256-GCM encrypted payload and parses JSON if applicable.
 */
export function decryptCredentials(encryptedPackage) {
  if (!encryptedPackage || !encryptedPackage.encryptedData || !encryptedPackage.iv || !encryptedPackage.authTag) {
    return null;
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedPackage.iv, "hex");
  const authTag = Buffer.from(encryptedPackage.authTag, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedPackage.encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET || "dripx-default-dev-fallback-key";
  return new TextEncoder().encode(secret);
}

/**
 * Generates an expiring, signed OAuth state token containing workspaceId and provider
 * to protect against CSRF attacks during OAuth callback flows.
 */
export async function generateOAuthState({ workspaceId, provider, returnUrl = null }) {
  const nonce = crypto.randomBytes(16).toString("hex");

  return new SignJWT({ workspaceId, provider, nonce, returnUrl })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getJwtSecretKey());
}

/**
 * Verifies and decodes an OAuth state token. Returns payload or null if expired/tampered.
 */
export async function verifyOAuthState(stateToken) {
  if (!stateToken) return null;

  try {
    const { payload } = await jwtVerify(stateToken, getJwtSecretKey());
    return payload;
  } catch {
    return null;
  }
}

/**
 * Strips all sensitive credential artifacts before sending an email account
 * document to the client or console logs.
 */
export function sanitizeEmailAccount(account) {
  if (!account) return null;

  return {
    id: account._id?.toString() || account.id,
    workspaceId: account.workspaceId?.toString(),
    userId: account.userId?.toString(),
    email: account.email,
    name: account.name || "",
    provider: account.provider,
    status: account.status || "connected",
    authType: account.authType,
    smtpConfig: account.smtpConfig
      ? {
          host: account.smtpConfig.host,
          port: account.smtpConfig.port,
          secure: account.smtpConfig.secure,
          user: account.smtpConfig.user,
        }
      : null,
    imapConfig: account.imapConfig
      ? {
          host: account.imapConfig.host,
          port: account.imapConfig.port,
          secure: account.imapConfig.secure,
          user: account.imapConfig.user,
        }
      : null,
    dailyLimit: account.dailyLimit ?? 40,
    todaySentCount: account.todaySentCount ?? 0,
    lastSentAt: account.lastSentAt || null,
    lastError: account.lastError || null,
    rampUp: account.rampUp
      ? {
          enabled: account.rampUp.enabled !== false,
          startingLimit: account.rampUp.startingLimit ?? 10,
          dailyIncrement: account.rampUp.dailyIncrement ?? 3,
          targetLimit: account.rampUp.targetLimit ?? account.dailyLimit ?? 40,
          startedAt: account.rampUp.startedAt || account.createdAt,
          customDkimSelector: account.rampUp.customDkimSelector || null,
        }
      : {
          enabled: true,
          startingLimit: 10,
          dailyIncrement: 3,
          targetLimit: account.dailyLimit ?? 40,
          startedAt: account.createdAt,
          customDkimSelector: null,
        },
    dnsHealth: account.dnsHealth
      ? {
          score: account.dnsHealth.score,
          rating: account.dnsHealth.rating,
          evaluatedAt: account.dnsHealth.evaluatedAt,
        }
      : null,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}
