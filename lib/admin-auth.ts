import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const adminSessionCookieName = "muyi_admin_session";

const sessionMaxAgeSeconds = 60 * 60 * 8;

type AdminSessionPayload = {
  role: "admin";
  exp: number;
};

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD is required in production.");
  }
  return password ?? "dev-admin";
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production.");
  }
  return secret ?? "dev-admin-session-secret-change-me";
}

function base64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function unbase64Url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function timingSafeEqualString(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function verifyAdminPassword(password: string) {
  return timingSafeEqualString(password, getAdminPassword());
}

export function createAdminSession() {
  const payload: AdminSessionPayload = {
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds,
  };
  const encoded = base64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function verifyAdminSession(value?: string) {
  if (!value) {
    return false;
  }

  const [encoded, signature] = value.split(".");
  if (!encoded || !signature || !timingSafeEqualString(signature, sign(encoded))) {
    return false;
  }

  try {
    const payload = JSON.parse(unbase64Url(encoded)) as Partial<AdminSessionPayload>;
    return payload.role === "admin" && typeof payload.exp === "number" && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(adminSessionCookieName)?.value);
}

export function isAdminRequest(request: NextRequest) {
  return verifyAdminSession(request.cookies.get(adminSessionCookieName)?.value);
}

export function adminSessionCookieOptions(secure = process.env.NODE_ENV === "production") {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  };
}
