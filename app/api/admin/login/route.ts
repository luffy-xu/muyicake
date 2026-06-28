import { NextRequest, NextResponse } from "next/server";
import {
  adminSessionCookieName,
  adminSessionCookieOptions,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const password = String(formData?.get("password") ?? "");

  // TODO: Persist attempt counters in Redis/Postgres before launch if this admin
  // endpoint receives real public traffic beyond the current low-volume MVP.
  if (!verifyAdminPassword(password)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), {
      status: 303,
    });
  }

  const response = NextResponse.redirect(new URL("/admin/reservations", request.url), {
    status: 303,
  });
  response.cookies.set(
    adminSessionCookieName,
    createAdminSession(),
    adminSessionCookieOptions(request.nextUrl.protocol === "https:"),
  );
  return response;
}
