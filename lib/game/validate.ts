import { z } from "zod";
import { TOKENS, normalizeToken } from "@/lib/game/board";
import type { GameState } from "@/lib/game/engine";

// Structural validation for game state uploaded by clients. Keeps a malformed
// or hostile payload from being stored and later crashing other viewers.

const pos = z.number().int().min(0).max(39);
const deck = z.enum(["chance", "chest"]);
const playerId = z.number().int().min(0).max(5);
const dice = z.tuple([z.number().int().min(1).max(6), z.number().int().min(1).max(6)]);

const player = z.object({
  id: playerId,
  name: z.string().min(1).max(40),
  token: z.preprocess((v) => (typeof v === "string" ? normalizeToken(v) : v), z.enum(TOKENS)),
  cash: z.number().int().min(0).max(1_000_000),
  pos,
  inJail: z.boolean(),
  jailTurns: z.number().int().min(0).max(3),
  jailCards: z.array(deck).max(2),
  bankrupt: z.boolean(),
});

const deed = z.object({
  owner: playerId.nullable(),
  houses: z.number().int().min(0).max(5),
  mortgaged: z.boolean(),
});

const basePhase = z.discriminatedUnion("t", [
  z.object({ t: z.literal("roll") }),
  z.object({ t: z.literal("postRoll") }),
  z.object({ t: z.literal("buy"), pos }),
  z.object({ t: z.literal("card"), deck, card: z.number().int().min(0).max(15) }),
  z.object({ t: z.literal("over"), winner: playerId }),
]);

const auctionPhase = z.object({
  t: z.literal("auction"),
  pos,
  high: z.number().int().min(0),
  highBidder: playerId.nullable(),
  bidders: z.array(playerId).max(6),
  turn: z.number().int().min(0).max(5),
  queue: z.array(pos).max(28),
  resume: z.union([basePhase, z.object({ t: z.literal("debt"), resume: basePhase })]),
});

const debtPhase = z.object({ t: z.literal("debt"), resume: z.union([basePhase, auctionPhase]) });

const phase = z.union([basePhase, auctionPhase, debtPhase]);

const logEntry = z.object({
  k: z.string().max(32),
  p: playerId.optional(),
  o: playerId.optional(),
  s: pos.optional(),
  a: z.number().optional(),
  d: dice.optional(),
  deck: deck.optional(),
  c: z.number().int().min(0).max(15).optional(),
});

export const gameStateSchema = z
  .object({
    version: z.literal(1),
    players: z.array(player).min(2).max(6),
    current: playerId,
    deeds: z.record(z.string().regex(/^\d{1,2}$/), deed),
    phase,
    debts: z
      .array(z.object({ debtor: playerId, creditor: z.union([playerId, z.literal("bank")]), amount: z.number().int().min(0) }))
      .max(12),
    doublesCount: z.number().int().min(0).max(3),
    rollAgain: z.boolean(),
    lastDice: dice.nullable(),
    decks: z.object({
      chance: z.array(z.number().int().min(0).max(15)).max(16),
      chest: z.array(z.number().int().min(0).max(15)).max(16),
    }),
    log: z.array(logEntry).max(300),
    logSeq: z.number().int().min(0).optional(),
  })
  .refine((s) => s.current < s.players.length && s.players.every((p, i) => p.id === i), "Invalid players");

export function parseGameState(value: unknown): GameState | null {
  const result = gameStateSchema.safeParse(value);
  return result.success ? (result.data as GameState) : null;
}

export function normalizeRoomSlug(raw: string) {
  let slug = raw;
  try {
    slug = decodeURIComponent(raw);
  } catch {
    // keep raw value
  }
  slug = slug.trim().slice(0, 40);
  return slug && !/[/\\\u0000-\u001f]/.test(slug) ? slug : null;
}
