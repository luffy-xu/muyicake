// Presentation-only animation state for the board game: dice tumbling,
// step-by-step token walking, and transient effects (toasts, cell flashes,
// floating cash changes) derived from new log entries.

import { useEffect, useRef, useState } from "react";
import { BOARD_SIZE, JAIL_POS } from "@/lib/game/board";
import type { GameState, LogEntry, LogKey } from "@/lib/game/engine";

const STEP_MS = 160;
const FAST_STEP_MS = 70;
const ROLL_MS = 700;

// ---------- dice ----------

export function useDiceRoll<T>(onDone: (result: T) => void) {
  const [faces, setFaces] = useState<T | null>(null);
  const timers = useRef<{ tick?: ReturnType<typeof setInterval>; done?: ReturnType<typeof setTimeout> }>({});

  useEffect(() => {
    const current = timers.current;
    return () => {
      clearInterval(current.tick);
      clearTimeout(current.done);
    };
  }, []);

  // `shuffle` produces a random-looking result for the tumbling animation.
  const roll = (result: T, shuffle: () => T) => {
    if (faces) return;
    setFaces(shuffle());
    timers.current.tick = setInterval(() => setFaces(shuffle()), 80);
    timers.current.done = setTimeout(() => {
      clearInterval(timers.current.tick);
      setFaces(null);
      onDone(result);
    }, ROLL_MS);
  };

  return { rollingFaces: faces, roll };
}

// ---------- token walking ----------

function stepToward(from: number, to: number) {
  const forward = (to - from + BOARD_SIZE) % BOARD_SIZE;
  if (forward === 0) return from;
  // Short backward moves ("go back 3 spaces") walk backwards.
  if (forward >= BOARD_SIZE - 4) return (from + BOARD_SIZE - 1) % BOARD_SIZE;
  return (from + 1) % BOARD_SIZE;
}

function shouldTeleport(from: number, to: number, inJail: boolean) {
  const forward = (to - from + BOARD_SIZE) % BOARD_SIZE;
  return (inJail && to === JAIL_POS && forward !== 0) || (forward > 40 && forward < BOARD_SIZE - 4);
}

export function useTokenWalk(game: GameState | null | undefined) {
  const [shown, setShown] = useState<number[] | null>(null);
  const shownRef = useRef<number[] | null>(null);
  const positions = game ? game.players.map((p) => p.pos) : null;
  const key = positions?.join(",") ?? "";
  const jailKey = game ? game.players.map((p) => (p.inJail ? 1 : 0)).join("") : "";

  useEffect(() => {
    if (!key) {
      shownRef.current = null;
      return;
    }
    const target = key.split(",").map(Number);
    const jailed = jailKey.split("").map((c) => c === "1");
    let current = shownRef.current;
    if (!current || current.length !== target.length) {
      // First paint or a brand-new game: no walking.
      shownRef.current = target;
      const sync = setTimeout(() => setShown(target), 0);
      return () => clearTimeout(sync);
    }
    current = current.map((from, i) => (shouldTeleport(from, target[i], jailed[i]) ? target[i] : from));
    const longest = Math.max(...current.map((from, i) => (target[i] - from + BOARD_SIZE) % BOARD_SIZE));
    const delay = longest > 12 ? FAST_STEP_MS : STEP_MS;

    const tick = () => {
      const next = (shownRef.current ?? current!).map((from, i) =>
        shouldTeleport(from, target[i], jailed[i]) ? target[i] : stepToward(from, target[i]),
      );
      shownRef.current = next;
      setShown(next);
      if (next.some((p, i) => p !== target[i])) timer = setTimeout(tick, delay);
    };
    shownRef.current = current;
    let timer = setTimeout(tick, 60);
    return () => clearTimeout(timer);
  }, [key, jailKey]);

  const display = shown && positions && shown.length === positions.length ? shown : positions;
  const walking = !!display && !!positions && display.join(",") !== key;
  return { display, walking };
}

// ---------- transient effects ----------

export type CellFx = "own" | "build" | "rent";
export type Toast = { id: number; entry: LogEntry };
export type CashFx = { id: number; player: number; delta: number };

const TOAST_KEYS: ReadonlySet<LogKey> = new Set<LogKey>([
  "passGo",
  "bought",
  "auctionWon",
  "rentPaid",
  "taxPaid",
  "toJail",
  "threeDoubles",
  "jailDoubles",
  "built",
  "trade",
  "bankrupt",
  "collected",
  "paid",
  "interestPaid",
  "unmortgaged",
  "triples",
  "turbo",
  "busTicket",
  "busExpire",
  "busUsed",
  "depotBuilt",
]);

let fxId = 0;

export function useGameFx(game: GameState | null | undefined, paused: boolean) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cells, setCells] = useState<Record<number, CellFx>>({});
  const [cash, setCash] = useState<CashFx[]>([]);
  const seen = useRef<{ seq: number; cash: number[] } | null>(null);

  const seq = game ? (game.logSeq ?? game.log.length) : -1;

  useEffect(() => {
    if (!game) {
      seen.current = null;
      return;
    }
    const nowCash = game.players.map((p) => p.cash);
    if (!seen.current || seq < seen.current.seq || nowCash.length !== seen.current.cash.length) {
      // Initial load, reload or new game: show the board as-is.
      seen.current = { seq, cash: nowCash };
      return;
    }
    if (paused || seq === seen.current.seq) return;

    const fresh = game.log.slice(-Math.min(seq - seen.current.seq, game.log.length));
    const prevCash = seen.current.cash;
    seen.current = { seq, cash: nowCash };

    const newToasts = fresh.filter((e) => TOAST_KEYS.has(e.k)).slice(-3).map((entry) => ({ id: ++fxId, entry }));
    const newCells: Record<number, CellFx> = {};
    for (const e of fresh) {
      if (e.s === undefined) continue;
      if (e.k === "bought" || e.k === "auctionWon") newCells[e.s] = "own";
      else if (e.k === "built") newCells[e.s] = "build";
      else if (e.k === "rentPaid") newCells[e.s] = "rent";
    }
    const newCash = nowCash.flatMap((value, player) =>
      value !== prevCash[player] ? [{ id: ++fxId, player, delta: value - prevCash[player] }] : [],
    );

    const show = setTimeout(() => {
      if (newToasts.length) setToasts((prev) => [...prev, ...newToasts].slice(-4));
      if (Object.keys(newCells).length) setCells((prev) => ({ ...prev, ...newCells }));
      if (newCash.length) setCash((prev) => [...prev, ...newCash]);
    }, 0);
    const toastIds = new Set(newToasts.map((t) => t.id));
    const cashIds = new Set(newCash.map((c) => c.id));
    const clearToasts = setTimeout(() => setToasts((prev) => prev.filter((t) => !toastIds.has(t.id))), 2600);
    const clearCash = setTimeout(() => setCash((prev) => prev.filter((c) => !cashIds.has(c.id))), 1600);
    const clearCells = setTimeout(
      () =>
        setCells((prev) => {
          const next = { ...prev };
          for (const pos of Object.keys(newCells)) delete next[Number(pos)];
          return next;
        }),
      1300,
    );
    // Timers are intentionally not cancelled: the refs above already advanced,
    // so cancelling would drop these effects instead of replaying them.
    void [show, clearToasts, clearCash, clearCells];
  }, [game, seq, paused]);

  return { toasts, cells, cash };
}
