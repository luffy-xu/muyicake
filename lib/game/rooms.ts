import { eq, sql } from "drizzle-orm";
import { gameRooms } from "@/db/schema";
import { canUseLocalReservationStore, getDb } from "@/lib/db";
import type { GameState } from "@/lib/game/engine";

export type SavedRoom = { state: GameState; revision: number; updatedAt: string };

export type SaveResult = { ok: true; room: SavedRoom } | { ok: false; current: SavedRoom | null };

// ---------- local JSON fallback (development / e2e without DATABASE_URL) ----------

async function storeFile() {
  const path = await import("node:path");
  return process.env.GAME_STORE_FILE || path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "game-rooms.json");
}

async function readLocal(): Promise<Record<string, SavedRoom>> {
  if (!canUseLocalReservationStore()) throw new Error("Local game store is disabled in production.");
  const fs = await import("node:fs/promises");
  try {
    return JSON.parse(await fs.readFile(await storeFile(), "utf8")) as Record<string, SavedRoom>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

async function writeLocal(rooms: Record<string, SavedRoom>) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const file = await storeFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(rooms));
}

// ---------- public API ----------

export async function getRoom(slug: string): Promise<SavedRoom | null> {
  const db = getDb();
  if (!db) return (await readLocal())[slug] ?? null;
  const [row] = await db.select().from(gameRooms).where(eq(gameRooms.slug, slug));
  return row ? { state: row.state as GameState, revision: row.revision, updatedAt: row.updatedAt.toISOString() } : null;
}

/**
 * Saves a room. `baseRevision` is the revision the client last synced with
 * (null when it never synced). A mismatch is a conflict unless `force` is set.
 */
export async function saveRoom(slug: string, state: GameState, baseRevision: number | null, force: boolean): Promise<SaveResult> {
  const db = getDb();
  if (!db) {
    const rooms = await readLocal();
    const current = rooms[slug] ?? null;
    if (!force && (current?.revision ?? null) !== baseRevision) return { ok: false, current };
    const room = { state, revision: (current?.revision ?? 0) + 1, updatedAt: new Date().toISOString() };
    rooms[slug] = room;
    await writeLocal(rooms);
    return { ok: true, room };
  }

  const now = new Date();
  if (baseRevision === null || force) {
    const insert = db.insert(gameRooms).values({ slug, state, revision: 1, updatedAt: now });
    const [row] = await (force
      ? insert.onConflictDoUpdate({
          target: gameRooms.slug,
          set: { state, revision: sql`${gameRooms.revision} + 1`, updatedAt: now },
        })
      : insert.onConflictDoNothing({ target: gameRooms.slug })
    ).returning();
    if (row) return { ok: true, room: { state, revision: row.revision, updatedAt: row.updatedAt.toISOString() } };
    return { ok: false, current: await getRoom(slug) };
  }

  const [row] = await db
    .update(gameRooms)
    .set({ state, revision: sql`${gameRooms.revision} + 1`, updatedAt: now })
    .where(sql`${gameRooms.slug} = ${slug} and ${gameRooms.revision} = ${baseRevision}`)
    .returning();
  if (row) return { ok: true, room: { state, revision: row.revision, updatedAt: row.updatedAt.toISOString() } };
  return { ok: false, current: await getRoom(slug) };
}

export async function deleteRoom(slug: string) {
  const db = getDb();
  if (!db) {
    const rooms = await readLocal();
    delete rooms[slug];
    await writeLocal(rooms);
    return;
  }
  await db.delete(gameRooms).where(eq(gameRooms.slug, slug));
}
