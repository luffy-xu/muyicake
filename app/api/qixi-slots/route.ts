import { and, count, eq, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { reservations } from "@/db/schema";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const QIXI_TOTAL = 77;

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ total: QIXI_TOTAL, used: 0, remaining: QIXI_TOTAL });
  }

  const [row] = await db
    .select({ used: count() })
    .from(reservations)
    .where(
      and(
        eq(reservations.reservationCategory, "qixi"),
        ne(reservations.status, "cancelled"),
      ),
    );

  const used = row?.used ?? 0;
  const remaining = Math.max(0, QIXI_TOTAL - used);

  return NextResponse.json({ total: QIXI_TOTAL, used, remaining });
}
