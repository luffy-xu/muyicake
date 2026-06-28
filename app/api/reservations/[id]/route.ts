import { NextResponse } from "next/server";
import { getReservation, updateReservation } from "@/lib/reservations";
import { reservationUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

function isAdmin(request: Request) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return process.env.NODE_ENV !== "production";
  }
  return request.headers.get("x-admin-password") === configured;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const reservation = await getReservation(id);

  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  return NextResponse.json({ reservation });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reservationUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const reservation = await updateReservation(id, parsed.data);

  if (!reservation) {
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  }

  return NextResponse.json({ reservation });
}
