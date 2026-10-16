import { describe, expect, it } from "vitest";
import { createGame, reduce } from "@/lib/game/engine";
import { normalizeRoomSlug, parseGameState } from "@/lib/game/validate";

const players = [
  { name: "A", token: "orangutan" as const },
  { name: "B", token: "pangolin" as const },
];

describe("game state validation", () => {
  it("accepts states produced by the engine", () => {
    let s = createGame(players, () => 0.3);
    expect(parseGameState(JSON.parse(JSON.stringify(s)))).not.toBeNull();
    s = reduce(s, { type: "ROLL", dice: [1, 2] });
    s = reduce(s, { type: "DECLINE" });
    expect(s.phase.t).toBe("auction");
    expect(parseGameState(JSON.parse(JSON.stringify(s)))).not.toBeNull();
  });

  it("rejects malformed or out-of-range payloads", () => {
    const s = createGame(players, () => 0.3);
    expect(parseGameState(null)).toBeNull();
    expect(parseGameState({ ...s, version: 2 })).toBeNull();
    expect(parseGameState({ ...s, current: 5 })).toBeNull();
    expect(parseGameState({ ...s, players: [{ ...s.players[0], pos: 40 }, s.players[1]] })).toBeNull();
    expect(parseGameState({ ...s, phase: { t: "hack" } })).toBeNull();
  });

  it("tracks a monotonically increasing log sequence", () => {
    const s = reduce(createGame(players, () => 0.3), { type: "ROLL", dice: [1, 2] });
    expect(s.logSeq).toBe(s.log.length);
  });
});

describe("room slugs", () => {
  it("decodes, trims and rejects path-like names", () => {
    expect(normalizeRoomSlug("%E5%AE%B6%E5%BA%AD")).toBe("家庭");
    expect(normalizeRoomSlug("  abc ")).toBe("abc");
    expect(normalizeRoomSlug("a%2Fb")).toBeNull();
    expect(normalizeRoomSlug("   ")).toBeNull();
  });
});
