import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

let client: postgres.Sql | undefined;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  client ??= postgres(process.env.DATABASE_URL, { prepare: false });
  return drizzle(client, { schema });
}
