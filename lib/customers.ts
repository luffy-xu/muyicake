import { desc, eq, sql } from "drizzle-orm";
import { customers as customersTable } from "@/db/schema";
import { getDb } from "@/lib/db";
import { normalizeWhatsApp } from "@/lib/whatsapp";
import { listReservations } from "@/lib/reservations";
import type { Reservation } from "@/lib/validations";

export type CustomerPersona = {
  whatsappKey: string;
  whatsappDisplay: string;
  name: string;
  firstReservationId: string | null;
  latestReservationId: string | null;
  reservationCount: number;
  completedReservationCount: number;
  cancelledReservationCount: number;
  totalQuotedBasePrice: number;
  preferredDeliveryArea: string | null;
  preferredProductCategory: string | null;
  lastStatus: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  updatedAt: string;
  reservations: Reservation[];
};

function toIso(value: unknown) {
  return value instanceof Date ? value.toISOString() : String(value);
}

function mostFrequent(values: Array<string | undefined>) {
  const counts = new Map<string, number>();
  values.filter(Boolean).forEach((value) => {
    counts.set(value!, (counts.get(value!) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function buildPersonaFromReservations(
  whatsappKey: string,
  reservations: Reservation[],
): CustomerPersona | null {
  const history = reservations
    .filter((reservation) => normalizeWhatsApp(reservation.whatsapp) === whatsappKey)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  if (!history.length) {
    return null;
  }

  const latest = history[0];
  const earliest = history[history.length - 1];

  return {
    whatsappKey,
    whatsappDisplay: latest.whatsapp,
    name: latest.customerName,
    firstReservationId: earliest.id,
    latestReservationId: latest.id,
    reservationCount: history.length,
    completedReservationCount: history.filter(
      (reservation) => reservation.status === "completed",
    ).length,
    cancelledReservationCount: history.filter(
      (reservation) => reservation.status === "cancelled",
    ).length,
    totalQuotedBasePrice: history.reduce(
      (total, reservation) => total + reservation.basePrice,
      0,
    ),
    preferredDeliveryArea: mostFrequent(
      history.map((reservation) => reservation.deliveryArea),
    ),
    preferredProductCategory: mostFrequent(
      history.map((reservation) => reservation.reservationCategory),
    ),
    lastStatus: latest.status,
    firstSeenAt: earliest.createdAt,
    lastSeenAt: latest.createdAt,
    updatedAt: new Date().toISOString(),
    reservations: history,
  };
}

function toPersona(row: Record<string, unknown>, reservations: Reservation[]) {
  return {
    whatsappKey: String(row.whatsappKey),
    whatsappDisplay: String(row.whatsappDisplay),
    name: String(row.name),
    firstReservationId: row.firstReservationId
      ? String(row.firstReservationId)
      : null,
    latestReservationId: row.latestReservationId
      ? String(row.latestReservationId)
      : null,
    reservationCount: Number(row.reservationCount ?? 0),
    completedReservationCount: Number(row.completedReservationCount ?? 0),
    cancelledReservationCount: Number(row.cancelledReservationCount ?? 0),
    totalQuotedBasePrice: Number(row.totalQuotedBasePrice ?? 0),
    preferredDeliveryArea: row.preferredDeliveryArea
      ? String(row.preferredDeliveryArea)
      : null,
    preferredProductCategory: row.preferredProductCategory
      ? String(row.preferredProductCategory)
      : null,
    lastStatus: row.lastStatus ? String(row.lastStatus) : null,
    firstSeenAt: toIso(row.firstSeenAt),
    lastSeenAt: toIso(row.lastSeenAt),
    updatedAt: toIso(row.updatedAt),
    reservations,
  } satisfies CustomerPersona;
}

export async function syncCustomerPersona(whatsapp: string) {
  const whatsappKey = normalizeWhatsApp(whatsapp);
  const persona = buildPersonaFromReservations(
    whatsappKey,
    await listReservations(),
  );

  if (!persona) {
    return null;
  }

  const db = getDb();
  if (!db) {
    return persona;
  }

  const firstSeenAt = new Date(persona.firstSeenAt);
  const lastSeenAt = new Date(persona.lastSeenAt);
  const updatedAt = new Date();

  await db
    .insert(customersTable)
    .values({
      whatsappKey: persona.whatsappKey,
      whatsappDisplay: persona.whatsappDisplay,
      name: persona.name,
      firstReservationId: persona.firstReservationId,
      latestReservationId: persona.latestReservationId,
      reservationCount: persona.reservationCount,
      completedReservationCount: persona.completedReservationCount,
      cancelledReservationCount: persona.cancelledReservationCount,
      totalQuotedBasePrice: persona.totalQuotedBasePrice,
      preferredDeliveryArea: persona.preferredDeliveryArea,
      preferredProductCategory: persona.preferredProductCategory,
      lastStatus: persona.lastStatus,
      firstSeenAt,
      lastSeenAt,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: customersTable.whatsappKey,
      set: {
        whatsappDisplay: sql`excluded.whatsapp_display`,
        name: sql`excluded.name`,
        firstReservationId: sql`excluded.first_reservation_id`,
        latestReservationId: sql`excluded.latest_reservation_id`,
        reservationCount: sql`excluded.reservation_count`,
        completedReservationCount: sql`excluded.completed_reservation_count`,
        cancelledReservationCount: sql`excluded.cancelled_reservation_count`,
        totalQuotedBasePrice: sql`excluded.total_quoted_base_price`,
        preferredDeliveryArea: sql`excluded.preferred_delivery_area`,
        preferredProductCategory: sql`excluded.preferred_product_category`,
        lastStatus: sql`excluded.last_status`,
        firstSeenAt: sql`excluded.first_seen_at`,
        lastSeenAt: sql`excluded.last_seen_at`,
        updatedAt,
      },
    });

  return persona;
}

export async function listCustomerPersonas() {
  const reservations = await listReservations();
  const db = getDb();

  if (db) {
    const rows = await db
      .select()
      .from(customersTable)
      .orderBy(desc(customersTable.lastSeenAt));

    if (rows.length) {
      return rows.map((row) =>
        toPersona(
          row,
          reservations.filter(
            (reservation) =>
              normalizeWhatsApp(reservation.whatsapp) === row.whatsappKey,
          ),
        ),
      );
    }
  }

  const keys = [
    ...new Set(
      reservations.map((reservation) => normalizeWhatsApp(reservation.whatsapp)),
    ),
  ];
  return keys
    .map((key) => buildPersonaFromReservations(key, reservations))
    .filter((persona): persona is CustomerPersona => Boolean(persona))
    .sort(
      (a, b) =>
        new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime(),
    );
}

export async function getCustomerPersona(whatsapp: string) {
  const whatsappKey = normalizeWhatsApp(whatsapp);
  const reservations = await listReservations();
  const db = getDb();

  if (db) {
    const [row] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.whatsappKey, whatsappKey))
      .limit(1);

    if (row) {
      return toPersona(
        row,
        reservations.filter(
          (reservation) =>
            normalizeWhatsApp(reservation.whatsapp) === row.whatsappKey,
        ),
      );
    }
  }

  return buildPersonaFromReservations(whatsappKey, reservations);
}
