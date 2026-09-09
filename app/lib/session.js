import { cookies } from "next/headers";
import { verifyToken } from "@/app/lib/auth";

export const SESSION_COOKIE = "dripx_session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// Reads and verifies the session cookie from the current request.
// Returns { userId, workspaceId } or null if not authenticated.
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const payload = await verifyToken(token);

  if (!payload?.userId || !payload?.workspaceId) return null;

  return { userId: payload.userId, workspaceId: payload.workspaceId };
}

// For use inside API routes: returns the session or a 401 Response to return immediately.
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      unauthorized: Response.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, unauthorized: null };
}

// Attaches the session cookie to the response for the current request (Route Handlers only).
export async function setSessionCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
