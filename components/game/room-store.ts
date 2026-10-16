// Per-room game store: localStorage first (instant, offline-safe), then synced
// to the server (/api/game/[slug]) with optimistic revisions.

import { useSyncExternalStore } from "react";
import type { GameState } from "@/lib/game/engine";
import type { SavedRoom } from "@/lib/game/rooms";

export type SyncStatus = "idle" | "saving" | "synced" | "offline" | "conflict";

export type RoomEntry = {
  state: GameState | null;
  revision: number | null;
  dirty: boolean;
  status: SyncStatus;
  remote: SavedRoom | null;
};

const STORAGE_PREFIX = "muyi-wildlife-game:";
const PUSH_DELAY_MS = 800;

const entries = new Map<string, RoomEntry>();
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const inflight = new Set<string>();

function apiUrl(room: string) {
  return `/api/game/${encodeURIComponent(room)}`;
}

function load(room: string): RoomEntry {
  const entry: RoomEntry = { state: null, revision: null, dirty: false, status: "idle", remote: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + room);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.version === 1) {
      // Saved before server sync existed.
      entry.state = parsed as GameState;
      entry.dirty = true;
    } else if (parsed?.state?.version === 1) {
      entry.state = parsed.state as GameState;
      entry.revision = typeof parsed.revision === "number" ? parsed.revision : null;
      entry.dirty = parsed.dirty === true;
    }
  } catch {
    // Storage unavailable or corrupt: start empty.
  }
  return entry;
}

export function getEntry(room: string): RoomEntry {
  let entry = entries.get(room);
  if (!entry) {
    entry = load(room);
    entries.set(room, entry);
  }
  return entry;
}

function update(room: string, patch: Partial<RoomEntry>) {
  const next = { ...getEntry(room), ...patch };
  entries.set(room, next);
  try {
    if (next.state) {
      window.localStorage.setItem(
        STORAGE_PREFIX + room,
        JSON.stringify({ state: next.state, revision: next.revision, dirty: next.dirty }),
      );
    } else {
      window.localStorage.removeItem(STORAGE_PREFIX + room);
    }
  } catch {
    // Private mode / quota: keep going in memory.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRoom(room: string): RoomEntry | undefined {
  return useSyncExternalStore(
    subscribe,
    () => getEntry(room),
    () => undefined,
  );
}

function schedulePush(room: string) {
  clearTimeout(timers.get(room));
  timers.set(
    room,
    setTimeout(() => void pushRoom(room), PUSH_DELAY_MS),
  );
}

export function setRoomState(room: string, state: GameState) {
  const entry = getEntry(room);
  update(room, { state, dirty: true, status: entry.status === "conflict" ? "conflict" : entry.status });
  if (getEntry(room).status !== "conflict") schedulePush(room);
}

export async function pushRoom(room: string, force = false) {
  clearTimeout(timers.get(room));
  const entry = getEntry(room);
  if (!entry.state) return;
  if (inflight.has(room)) {
    schedulePush(room);
    return;
  }
  inflight.add(room);
  const sent = entry.state;
  update(room, { status: "saving" });
  try {
    const res = await fetch(apiUrl(room), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: sent, baseRevision: entry.revision, force }),
    });
    if (res.status === 409) {
      const data = (await res.json()) as { room: SavedRoom | null };
      update(room, { status: "conflict", remote: data.room });
      return;
    }
    if (!res.ok) throw new Error(`save failed: ${res.status}`);
    const data = (await res.json()) as { room: { revision: number } };
    const stillSame = getEntry(room).state === sent;
    update(room, { revision: data.room.revision, dirty: !stillSame, status: "synced", remote: null });
    if (!stillSame) schedulePush(room);
  } catch {
    update(room, { status: "offline" });
  } finally {
    inflight.delete(room);
  }
}

export async function pullRoom(room: string) {
  const local = getEntry(room);
  let remote: SavedRoom | null;
  try {
    const res = await fetch(apiUrl(room), { cache: "no-store" });
    if (!res.ok) throw new Error(`load failed: ${res.status}`);
    remote = ((await res.json()) as { room: SavedRoom | null }).room;
  } catch {
    update(room, { status: "offline" });
    return;
  }

  if (!remote) {
    if (local.state) await pushRoom(room);
    else update(room, { status: "idle", revision: null });
    return;
  }
  if (!local.state || (!local.dirty && local.revision !== remote.revision)) {
    update(room, { state: remote.state, revision: remote.revision, dirty: false, status: "synced", remote: null });
    return;
  }
  if (local.revision === remote.revision) {
    if (local.dirty) await pushRoom(room);
    else update(room, { status: "synced" });
    return;
  }
  update(room, { status: "conflict", remote });
}

export async function resolveConflict(room: string, keep: "cloud" | "local") {
  const { remote } = getEntry(room);
  if (keep === "cloud") {
    update(room, {
      state: remote?.state ?? null,
      revision: remote?.revision ?? null,
      dirty: false,
      status: remote ? "synced" : "idle",
      remote: null,
    });
    return;
  }
  await pushRoom(room, true);
}

export async function resetRoom(room: string) {
  clearTimeout(timers.get(room));
  update(room, { state: null, revision: null, dirty: false, status: "saving", remote: null });
  try {
    const res = await fetch(apiUrl(room), { method: "DELETE" });
    if (!res.ok) throw new Error(`reset failed: ${res.status}`);
    update(room, { status: "idle" });
  } catch {
    update(room, { status: "offline" });
  }
}
