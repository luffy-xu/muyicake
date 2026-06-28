import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

let client: postgres.Sql | undefined;

export function canUseLocalReservationStore() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_RUNTIME === "nodejs" && process.env.ALLOW_JSON_RESERVATION_STORE === "true" ||
    process.env.ALLOW_JSON_RESERVATION_STORE === "true"
  );
}

export function getDb() {
  if (!process.env.DATABASE_URL) {
    if (canUseLocalReservationStore()) {
      return null;
    }

    throw new Error(
      "DATABASE_URL is required in production. Configure a PostgreSQL database before handling reservations.",
    );
  }

  client ??= postgres(process.env.DATABASE_URL, { prepare: false });
  return drizzle(client, { schema });
}
