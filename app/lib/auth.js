import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SALT_ROUNDS = 10;

function getSecretKey() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing in .env.local");
  }

  return new TextEncoder().encode(secret);
}

// Hash a plain-text password for storage
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare a plain-text password against a stored hash
export async function verifyPassword(password, passwordHash) {
  if (!passwordHash) return false;

  return bcrypt.compare(password, passwordHash);
}

// Sign a session JWT. Payload is kept small: userId + workspaceId only.
export async function signToken(payload, expiresIn = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

// Verify + decode a session JWT. Returns null instead of throwing on invalid/expired tokens.
export async function verifyToken(token) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    return payload;
  } catch {
    return null;
  }
}
