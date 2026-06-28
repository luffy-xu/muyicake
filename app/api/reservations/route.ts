import { NextResponse } from "next/server";
import { createReservation, listReservations } from "@/lib/reservations";
import { reservationCreateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

function isAdmin(request: Request) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return process.env.NODE_ENV !== "production";
  }
  return request.headers.get("x-admin-password") === configured;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = reservationCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid reservation payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ error: "Spam detected" }, { status: 400 });
  }

  const reservation = await createReservation(parsed.data);
  return NextResponse.json({ reservation }, { status: 201 });
}

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reservations = await listReservations();
  return NextResponse.json({ reservations });
}
