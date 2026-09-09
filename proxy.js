import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "dripx_session";

function getSecretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

async function isAuthenticated(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) return false;

  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const authed = await isAuthenticated(request);

  if (pathname.startsWith("/dashboard") && !authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/register") && authed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
