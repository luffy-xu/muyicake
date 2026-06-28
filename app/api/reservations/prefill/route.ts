import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { customers as customersTable, reservations as reservationsTable } from "@/db/schema";
import { getDb } from "@/lib/db";
import { normalizeWhatsApp } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export type PrefillResponse = {
  prefill: { customerName: string; deliveryAddress: string | null } | null;
};

export async function GET(request: NextRequest) {
  const whatsapp = request.nextUrl.searchParams.get("whatsapp") ?? "";
  const key = normalizeWhatsApp(whatsapp);
  if (key.length < 7) {
    return NextResponse.json<PrefillResponse>({ prefill: null });
  }

  const db = getDb();

  if (db) {
    const [customer] = await db
      .select({ latestReservationId: customersTable.latestReservationId })
      .from(customersTable)
      .where(eq(customersTable.whatsappKey, key))
      .limit(1);

    if (customer?.latestReservationId) {
      const [row] = await db
        .select({
          customerName: reservationsTable.customerName,
          deliveryAddress: reservationsTable.deliveryAddress,
        })
        .from(reservationsTable)
        .where(eq(reservationsTable.id, customer.latestReservationId))
        .limit(1);

      if (row) {
        return NextResponse.json<PrefillResponse>({ prefill: { customerName: row.customerName, deliveryAddress: row.deliveryAddress } });
      }
    }
    return NextResponse.json<PrefillResponse>({ prefill: null });
  }

  // Local JSON store fallback
  const { listReservations } = await import("@/lib/reservations");
  const all = await listReservations();
  const match = all.find((r) => normalizeWhatsApp(r.whatsapp) === key && r.status !== "cancelled");
  if (match) {
    return NextResponse.json<PrefillResponse>({
      prefill: { customerName: match.customerName, deliveryAddress: match.deliveryAddress ?? null },
    });
  }
  return NextResponse.json<PrefillResponse>({ prefill: null });
}
