import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createReservation, listReservations } from "@/lib/reservations";
import { sendNewReservationNotification } from "@/lib/notifications";
import { reservationCreateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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
  await sendNewReservationNotification(reservation);
  return NextResponse.json({ reservation }, { status: 201 });
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reservations = await listReservations();
  return NextResponse.json({ reservations });
}
