import { z } from "zod";
import { BOARD_SIZE, SKYSCRAPER_LEVEL, TOKENS } from "@/lib/game/board";
import type { GameState } from "@/lib/game/engine";

// Structural validation for game state uploaded by clients. Keeps a malformed
// or hostile payload from being stored and later crashing other viewers.

const pos = z.number().int().min(0).max(BOARD_SIZE - 1);
const speed = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal("turbo"), z.literal("bus")]);
const busTicket = z.union([z.literal(0), z.literal(1)]);
const deck = z.enum(["chance", "chest"]);
const playerId = z.number().int().min(0).max(5);
const dice = z.tuple([z.number().int().min(1).max(6), z.number().int().min(1).max(6)]);

const player = z.object({
  id: playerId,
  name: z.string().min(1).max(40),
  token: z.enum(TOKENS),
  cash: z.number().int().min(0).max(1_000_000),
  pos,
  inJail: z.boolean(),
  jailTurns: z.number().int().min(0).max(3),
  jailCards: z.array(deck).max(2),
  bankrupt: z.boolean(),
  lapped: z.boolean(),
  busTickets: z.array(busTicket).max(16),
});

const deed = z.object({
  owner: playerId.nullable(),
  houses: z.number().int().min(0).max(SKYSCRAPER_LEVEL),
  mortgaged: z.boolean(),
  depot: z.boolean().optional(),
});

const basePhase = z.discriminatedUnion("t", [
  z.object({ t: z.literal("roll") }),
  z.object({ t: z.literal("postRoll") }),
  z.object({ t: z.literal("buy"), pos }),
  z.object({ t: z.literal("card"), deck, card: z.number().int().min(0).max(15) }),
  z.object({ t: z.literal("over"), winner: playerId }),
  z.object({ t: z.literal("turbo") }),
  z.object({ t: z.literal("busMove") }),
  z.object({ t: z.literal("pickSpace") }),
  z.object({ t: z.literal("auctionPick") }),
  z.object({ t: z.literal("auctionFallback") }),
  z.object({ t: z.literal("birthday") }),
]);

const auctionPhase = z.object({
  t: z.literal("auction"),
  pos,
  high: z.number().int().min(0),
  highBidder: playerId.nullable(),
  bidders: z.array(playerId).max(6),
  turn: z.number().int().min(0).max(5),
  queue: z.array(pos).max(BOARD_SIZE),
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
  sp: speed.optional(),
  deck: deck.optional(),
  c: z.number().int().min(0).max(15).optional(),
});

export const gameStateSchema = z
  .object({
    version: z.literal(2),
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
    lastSpeed: speed.nullable(),
    pendingTurbo: z.boolean(),
    decks: z.object({
      chance: z.array(z.number().int().min(0).max(15)).max(16),
      chest: z.array(z.number().int().min(0).max(15)).max(16),
    }),
    busDeck: z.array(busTicket).max(16),
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
