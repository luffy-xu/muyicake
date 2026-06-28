import { desc, eq } from "drizzle-orm";
import { reservations as reservationsTable } from "@/db/schema";
import { canUseLocalReservationStore, getDb } from "@/lib/db";
import { createReservationId } from "@/lib/reservation-id";
import type {
  Reservation,
  ReservationCreateInput,
  ReservationUpdateInput,
} from "@/lib/validations";

async function storeFile() {
  const path = await import("node:path");
  return (
    process.env.RESERVATION_STORE_FILE ||
    path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "reservations.json")
  );
}

async function readLocalReservations(): Promise<Reservation[]> {
  assertLocalReservationStoreAllowed();
  const fs = await import("node:fs/promises");
  try {
    const raw = await fs.readFile(await storeFile(), "utf8");
    return JSON.parse(raw) as Reservation[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeLocalReservations(reservations: Reservation[]) {
  assertLocalReservationStoreAllowed();
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const file = await storeFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(reservations, null, 2));
}

function assertLocalReservationStoreAllowed() {
  if (!canUseLocalReservationStore()) {
    throw new Error(
      "Local JSON reservation store is disabled in production. Set DATABASE_URL to use PostgreSQL.",
    );
  }
}

function cleanOptional(value: string | undefined) {
  return value === "" ? undefined : value;
}

function cleanReservation(input: ReservationCreateInput): Omit<Reservation, "id" | "status" | "adminNote" | "createdAt" | "updatedAt"> {
  return {
    ...input,
    selectedCollectionId: cleanOptional(input.selectedCollectionId),
    selectedStyleId: cleanOptional(input.selectedStyleId),
    selectedStyleName: cleanOptional(input.selectedStyleName),
    selectedSizeOptionId: cleanOptional(input.selectedSizeOptionId),
    selectedSizeLabel: cleanOptional(input.selectedSizeLabel),
    selectedPrice: input.selectedPrice,
    deliveryAddress: input.deliveryAddress,
    confirmedDeliverySlot: cleanOptional(input.confirmedDeliverySlot),
    cakeMessage: cleanOptional(input.cakeMessage),
    recipientName: cleanOptional(input.recipientName),
    age: cleanOptional(input.age),
    flavourPreference: cleanOptional(input.flavourPreference),
    preferredColor: cleanOptional(input.preferredColor),
    stylePreference: cleanOptional(input.stylePreference),
    budgetRange: cleanOptional(input.budgetRange),
    photoService: cleanOptional(input.photoService),
    referenceImageUrl: cleanOptional(input.referenceImageUrl),
    allergyNote: cleanOptional(input.allergyNote),
    notes: cleanOptional(input.notes),
    utmSource: cleanOptional(input.utmSource),
    utmMedium: cleanOptional(input.utmMedium),
    utmCampaign: cleanOptional(input.utmCampaign),
    referrer: cleanOptional(input.referrer),
    landingPath: cleanOptional(input.landingPath),
  };
}

function toApiReservation(row: Record<string, unknown>): Reservation {
  return {
    ...(row as Reservation),
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : String(row.updatedAt),
  };
}

export async function createReservation(input: ReservationCreateInput) {
  const now = new Date();
  const reservation: Reservation = {
    ...cleanReservation(input),
    id: createReservationId(now),
    status: "new",
    adminNote: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const db = getDb();
  if (db) {
    const [created] = await db
      .insert(reservationsTable)
      .values({
        ...reservation,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    const apiReservation = toApiReservation(created);
    const { syncCustomerPersona } = await import("@/lib/customers");
    await syncCustomerPersona(apiReservation.whatsapp);
    return apiReservation;
  }

  const reservations = await readLocalReservations();
  reservations.unshift(reservation);
  await writeLocalReservations(reservations);
  const { syncCustomerPersona } = await import("@/lib/customers");
  await syncCustomerPersona(reservation.whatsapp);
  return reservation;
}

export async function listReservations() {
  const db = getDb();
  if (db) {
    const rows = await db
      .select()
      .from(reservationsTable)
      .orderBy(desc(reservationsTable.createdAt));
    return rows.map(toApiReservation);
  }

  return readLocalReservations();
}

export async function getReservation(id: string) {
  const db = getDb();
  if (db) {
    const [row] = await db
      .select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, id))
      .limit(1);
    return row ? toApiReservation(row) : null;
  }

  const reservations = await readLocalReservations();
  return reservations.find((reservation) => reservation.id === id) ?? null;
}

export async function updateReservation(id: string, input: ReservationUpdateInput) {
  const now = new Date();
  const update = {
    ...input,
    confirmedDeliverySlot: input.confirmedDeliverySlot || undefined,
    adminNote: input.adminNote || undefined,
    updatedAt: now.toISOString(),
  };

  const db = getDb();
  if (db) {
    const [row] = await db
      .update(reservationsTable)
      .set({
        ...update,
        updatedAt: now,
      })
      .where(eq(reservationsTable.id, id))
      .returning();
    if (!row) {
      return null;
    }
    const apiReservation = toApiReservation(row);
    const { syncCustomerPersona } = await import("@/lib/customers");
    await syncCustomerPersona(apiReservation.whatsapp);
    return apiReservation;
  }

  const reservations = await readLocalReservations();
  const index = reservations.findIndex((reservation) => reservation.id === id);
  if (index === -1) {
    return null;
  }

  reservations[index] = {
    ...reservations[index],
    ...update,
  };
  await writeLocalReservations(reservations);
  const { syncCustomerPersona } = await import("@/lib/customers");
  await syncCustomerPersona(reservations[index].whatsapp);
  return reservations[index];
}
