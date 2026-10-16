import { describe, expect, it } from "vitest";
import { BOARD, CHANCE_CARDS, CHEST_CARDS } from "@/lib/game/board";
import {
  canBuild,
  createGame,
  housesInBank,
  reduce,
  rentFor,
  type Action,
  type GameState,
} from "@/lib/game/engine";

function newGame(n = 3) {
  const tokens = ["raceCar", "taxi", "suv", "pickup"] as const;
  return createGame(
    Array.from({ length: n }, (_, i) => ({ name: `P${i + 1}`, token: tokens[i] })),
    () => 0.5,
  );
}

function run(s: GameState, ...actions: Action[]) {
  return actions.reduce(reduce, s);
}

function give(s: GameState, owner: number, ...positions: number[]) {
  for (const pos of positions) s.deeds[pos].owner = owner;
  return s;
}

describe("board", () => {
  it("has 40 spaces, 28 deeds and 16 cards per deck", () => {
    expect(BOARD).toHaveLength(40);
    expect(BOARD.filter((s) => s.kind === "property")).toHaveLength(22);
    expect(BOARD.filter((s) => s.kind === "railroad")).toHaveLength(4);
    expect(BOARD.filter((s) => s.kind === "utility")).toHaveLength(2);
    expect(CHANCE_CARDS).toHaveLength(16);
    expect(CHEST_CARDS).toHaveLength(16);
  });
});

describe("movement", () => {
  it("starts everyone with $1500 on GO", () => {
    const s = newGame();
    expect(s.players.every((p) => p.cash === 1500 && p.pos === 0)).toBe(true);
  });

  it("moves, offers purchase and buys", () => {
    let s = run(newGame(), { type: "ROLL", dice: [1, 2] });
    expect(s.players[0].pos).toBe(3);
    expect(s.phase).toEqual({ t: "buy", pos: 3 });
    s = run(s, { type: "BUY" });
    expect(s.deeds[3].owner).toBe(0);
    expect(s.players[0].cash).toBe(1440);
    expect(s.phase.t).toBe("postRoll");
    s = run(s, { type: "END_TURN" });
    expect(s.current).toBe(1);
  });

  it("collects $200 when passing GO", () => {
    const s0 = newGame();
    s0.players[0].pos = 38;
    const s = run(s0, { type: "ROLL", dice: [2, 3] });
    expect(s.players[0].pos).toBe(3);
    expect(s.players[0].cash).toBe(1700);
  });

  it("gives another roll on doubles and jails on the third", () => {
    let s = run(newGame(), { type: "ROLL", dice: [3, 3] }); // 6, buy
    s = run(s, { type: "DECLINE" }, { type: "PASS_BID" }, { type: "PASS_BID" }, { type: "PASS_BID" });
    expect(s.phase.t).toBe("roll");
    expect(s.current).toBe(0);
    s = run(s, { type: "ROLL", dice: [2, 2] }); // 10 just visiting
    expect(s.phase.t).toBe("roll");
    s = run(s, { type: "ROLL", dice: [1, 1] });
    expect(s.players[0].inJail).toBe(true);
    expect(s.players[0].pos).toBe(10);
    expect(s.phase.t).toBe("postRoll");
  });

  it("sends to jail from Go To Jail without GO salary", () => {
    const s0 = newGame();
    s0.players[0].pos = 25;
    const s = run(s0, { type: "ROLL", dice: [2, 3] });
    expect(s.players[0].inJail).toBe(true);
    expect(s.players[0].cash).toBe(1500);
  });
});

describe("jail", () => {
  it("forces the $50 fine on the third failed roll", () => {
    const s0 = newGame();
    s0.players[0].inJail = true;
    s0.players[0].pos = 10;
    s0.players[0].jailTurns = 2;
    const s = run(s0, { type: "ROLL", dice: [1, 3] });
    expect(s.players[0].inJail).toBe(false);
    expect(s.players[0].pos).toBe(14);
    expect(s.players[0].cash).toBe(1450);
  });

  it("leaves on doubles without an extra roll", () => {
    const s0 = newGame();
    s0.players[0].inJail = true;
    s0.players[0].pos = 10;
    const s = run(s0, { type: "ROLL", dice: [4, 4] }, { type: "DECLINE" }, { type: "PASS_BID" }, { type: "PASS_BID" }, { type: "PASS_BID" });
    expect(s.players[0].pos).toBe(18);
    expect(s.phase.t).toBe("postRoll");
  });
});

describe("rent", () => {
  it("doubles unimproved rent for a full colour set", () => {
    const s = give(newGame(), 1, 1);
    expect(rentFor(s, 1, 7)).toBe(2);
    give(s, 1, 3);
    expect(rentFor(s, 1, 7)).toBe(4);
  });

  it("scales railroads and utilities", () => {
    const s = give(newGame(), 1, 5, 15, 25);
    expect(rentFor(s, 5, 7)).toBe(100);
    expect(rentFor(s, 5, 7, "card")).toBe(200);
    give(s, 1, 12);
    expect(rentFor(s, 12, 7)).toBe(28);
    give(s, 1, 28);
    expect(rentFor(s, 12, 7)).toBe(70);
  });

  it("charges rent and creates a debt when cash is short", () => {
    const s0 = give(newGame(), 1, 37, 39);
    s0.deeds[39].houses = 5;
    s0.players[0].pos = 35;
    s0.players[0].cash = 100;
    let s = run(s0, { type: "ROLL", dice: [1, 3] });
    expect(s.phase.t).toBe("debt");
    expect(s.debts[0]).toEqual({ debtor: 0, creditor: 1, amount: 2000 });
    s = run(s, { type: "BANKRUPT" });
    expect(s.players[0].bankrupt).toBe(true);
    expect(s.players[1].cash).toBe(1600);
    expect(s.current).toBe(1);
  });
});

describe("building", () => {
  it("requires the full set and even building, and respects house supply", () => {
    let s = give(newGame(), 0, 1);
    expect(canBuild(s, 0, 1)).toBe(false);
    give(s, 0, 3);
    s = run(s, { type: "BUILD", player: 0, pos: 1 });
    expect(s.deeds[1].houses).toBe(1);
    expect(canBuild(s, 0, 1)).toBe(false);
    s = run(s, { type: "BUILD", player: 0, pos: 3 }, { type: "BUILD", player: 0, pos: 1 });
    expect(housesInBank(s)).toBe(29);
    expect(run(s, { type: "SELL_HOUSE", player: 0, pos: 3 })).toBe(s);
    s = run(s, { type: "SELL_HOUSE", player: 0, pos: 1 });
    expect(s.deeds[1].houses).toBe(1);
    expect(s.players[0].cash).toBe(1500 - 150 + 25);
  });

  it("mortgages and unmortgages with 10% interest", () => {
    let s = give(newGame(), 0, 39);
    s = run(s, { type: "MORTGAGE", player: 0, pos: 39 });
    expect(s.players[0].cash).toBe(1700);
    s = run(s, { type: "UNMORTGAGE", player: 0, pos: 39 });
    expect(s.players[0].cash).toBe(1480);
  });
});

describe("auction and trade", () => {
  it("sells to the highest bidder", () => {
    let s = run(newGame(), { type: "ROLL", dice: [1, 2] }, { type: "DECLINE" });
    expect(s.phase.t).toBe("auction");
    s = run(s, { type: "BID", amount: 10 }, { type: "BID", amount: 20 }, { type: "PASS_BID" }, { type: "PASS_BID" });
    expect(s.deeds[3].owner).toBe(1);
    expect(s.players[1].cash).toBe(1480);
  });

  it("accepts any open-ended bid above the high bid, up to the bidder's cash", () => {
    let s = run(newGame(), { type: "ROLL", dice: [1, 2] }, { type: "DECLINE" });
    s = run(s, { type: "BID", amount: 137 });
    expect(s.phase).toMatchObject({ t: "auction", high: 137 });
    expect(run(s, { type: "BID", amount: 137 })).toBe(s);
    expect(run(s, { type: "BID", amount: 1501 })).toBe(s);
    s = run(s, { type: "BID", amount: 1500 }, { type: "PASS_BID" }, { type: "PASS_BID" });
    expect(s.deeds[3].owner).toBe(1);
    expect(s.players[1].cash).toBe(0);
  });

  it("trades deeds and cash and charges interest on mortgaged deeds", () => {
    const s0 = give(newGame(), 0, 1);
    s0.deeds[1].mortgaged = true;
    const s = run(s0, {
      type: "TRADE",
      offer: { from: 0, to: 1, giveCash: 0, getCash: 100, giveDeeds: [1], getDeeds: [], giveCards: [], getCards: [] },
    });
    expect(s.deeds[1].owner).toBe(1);
    expect(s.players[0].cash).toBe(1600);
    expect(s.players[1].cash).toBe(1397);
  });
});

describe("cards", () => {
  it("collects from every player on a birthday-style card", () => {
    const s0 = newGame();
    s0.players[0].pos = 15;
    s0.decks.chest = [8, ...s0.decks.chest.filter((c) => c !== 8)];
    let s = run(s0, { type: "ROLL", dice: [1, 1] });
    expect(s.phase).toEqual({ t: "card", deck: "chest", card: 8 });
    s = run(s, { type: "RESOLVE_CARD", dice: [1, 1] });
    expect(s.players[0].cash).toBe(1520);
    expect(s.decks.chest.at(-1)).toBe(8);
  });

  it("keeps Get Out of Jail Free cards out of the deck until used", () => {
    const s0 = newGame();
    s0.players[0].pos = 5;
    s0.decks.chance = [8, ...s0.decks.chance.filter((c) => c !== 8)];
    let s = run(s0, { type: "ROLL", dice: [1, 1] }, { type: "RESOLVE_CARD", dice: [1, 1] });
    expect(s.players[0].jailCards).toEqual(["chance"]);
    expect(s.decks.chance).not.toContain(8);
    s.players[0].inJail = true;
    s.phase = { t: "roll" };
    s = run(s, { type: "USE_JAIL_CARD" });
    expect(s.players[0].inJail).toBe(false);
    expect(s.decks.chance.at(-1)).toBe(8);
  });
});
