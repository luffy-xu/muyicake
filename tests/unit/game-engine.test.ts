import { describe, expect, it } from "vitest";
import { BOARD, CHANCE_CARDS, CHEST_CARDS, busDestinations } from "@/lib/game/board";
import {
  canBuild,
  canMortgage,
  createGame,
  housesInBank,
  reduce,
  rentFor,
  skyscrapersInBank,
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

// A game where player 1 has already been around the board, so the speed die is in play.
function lappedGame() {
  const s = newGame();
  s.players[0].lapped = true;
  return s;
}

const passAll: Action[] = [{ type: "PASS_BID" }, { type: "PASS_BID" }, { type: "PASS_BID" }];

describe("board", () => {
  it("has the 52-space Mega layout with 37 deeds and 16 cards per deck", () => {
    expect(BOARD).toHaveLength(52);
    expect(BOARD.filter((s) => s.kind === "property")).toHaveLength(30);
    expect(BOARD.filter((s) => s.kind === "railroad")).toHaveLength(4);
    expect(BOARD.filter((s) => s.kind === "utility")).toHaveLength(3);
    expect([0, 13, 26, 39].map((i) => BOARD[i].kind)).toEqual(["go", "jail", "freeParking", "goToJail"]);
    expect(BOARD.filter((s) => s.kind === "auction" || s.kind === "busTicket" || s.kind === "birthday")).toHaveLength(3);
    expect(CHANCE_CARDS).toHaveLength(16);
    expect(CHEST_CARDS).toHaveLength(16);
  });

  it("makes every car pricier, with higher rent at every level, than the car before it", () => {
    const cars = BOARD.flatMap((s) => (s.kind === "property" ? [s] : []));
    for (let i = 1; i < cars.length; i++) {
      expect(cars[i].price).toBeGreaterThan(cars[i - 1].price);
      cars[i].rent.forEach((rent, level) => expect(rent).toBeGreaterThan(cars[i - 1].rent[level]));
    }
    expect(cars[0]).toMatchObject({ price: 60, rent: [2, 10, 30, 90, 160, 250, 375] });
    expect(cars.at(-1)).toMatchObject({ price: 400, rent: [50, 200, 600, 1400, 1700, 2000, 3000] });
  });
});

describe("movement", () => {
  it("starts everyone with $2500 on GO", () => {
    const s = newGame();
    expect(s.players.every((p) => p.cash === 2500 && p.pos === 0)).toBe(true);
  });

  it("lets players choose $1000, $1500, $2000 or $2500 starting money", () => {
    const players = [
      { name: "A", token: "raceCar" as const },
      { name: "B", token: "taxi" as const },
    ];
    for (const cash of [1000, 1500, 2000, 2500]) {
      expect(createGame(players, () => 0.5, cash).players.every((p) => p.cash === cash)).toBe(true);
    }
    expect(createGame(players, () => 0.5, 5000).players[0].cash).toBe(2500);
  });

  it("moves, offers purchase and buys", () => {
    let s = run(newGame(), { type: "ROLL", dice: [1, 2] });
    expect(s.players[0].pos).toBe(3);
    expect(s.phase).toEqual({ t: "buy", pos: 3 });
    s = run(s, { type: "BUY" });
    expect(s.deeds[3].owner).toBe(0);
    expect(s.players[0].cash).toBe(2430);
    expect(s.phase.t).toBe("postRoll");
    s = run(s, { type: "END_TURN" });
    expect(s.current).toBe(1);
  });

  it("collects $200 when passing GO and starts using the speed die", () => {
    const s0 = newGame();
    s0.players[0].pos = 50;
    const s = run(s0, { type: "ROLL", dice: [2, 3] });
    expect(s.players[0].pos).toBe(3);
    expect(s.players[0].cash).toBe(2700);
    expect(s.players[0].lapped).toBe(true);
  });

  it("gives another roll on doubles and jails on the third", () => {
    let s = run(newGame(), { type: "ROLL", dice: [3, 3] }, { type: "DECLINE" }, ...passAll);
    expect(s.phase.t).toBe("roll");
    expect(s.current).toBe(0);
    s = run(s, { type: "ROLL", dice: [3, 3] }, { type: "DECLINE" }, ...passAll);
    expect(s.phase.t).toBe("roll");
    s = run(s, { type: "ROLL", dice: [1, 1] });
    expect(s.players[0].inJail).toBe(true);
    expect(s.players[0].pos).toBe(13);
    expect(s.phase.t).toBe("postRoll");
  });

  it("sends to jail from Go To Jail without GO salary", () => {
    const s0 = newGame();
    s0.players[0].pos = 34;
    const s = run(s0, { type: "ROLL", dice: [2, 3] });
    expect(s.players[0].inJail).toBe(true);
    expect(s.players[0].pos).toBe(13);
    expect(s.players[0].cash).toBe(2500);
  });
});

describe("jail", () => {
  it("forces the $50 fine on the third failed roll", () => {
    const s0 = newGame();
    s0.players[0].inJail = true;
    s0.players[0].pos = 13;
    s0.players[0].jailTurns = 2;
    const s = run(s0, { type: "ROLL", dice: [1, 3] });
    expect(s.players[0].inJail).toBe(false);
    expect(s.players[0].pos).toBe(17);
    expect(s.players[0].cash).toBe(2450);
  });

  it("leaves on doubles without an extra roll and without the speed die", () => {
    const s0 = lappedGame();
    s0.players[0].inJail = true;
    s0.players[0].pos = 13;
    const s = run(s0, { type: "ROLL", dice: [4, 4], speed: 3 }, { type: "DECLINE" }, ...passAll);
    expect(s.players[0].pos).toBe(21);
    expect(s.phase.t).toBe("postRoll");
  });
});

describe("rent", () => {
  it("doubles unimproved rent with all but one of a colour and triples it with the whole set", () => {
    const s = give(newGame(), 1, 1);
    expect(rentFor(s, 1, 7)).toBe(2);
    give(s, 1, 3);
    expect(rentFor(s, 1, 7)).toBe(4);
    give(s, 1, 4);
    expect(rentFor(s, 1, 7)).toBe(6);

    give(s, 2, 7, 8);
    expect(rentFor(s, 7, 7)).toBe(6);
    give(s, 2, 11);
    expect(rentFor(s, 7, 7)).toBe(12);
    give(s, 2, 12);
    expect(rentFor(s, 7, 7)).toBe(18);
  });

  it("scales railroads (doubled by a depot) and three utilities", () => {
    const s = give(newGame(), 1, 6, 20, 33);
    expect(rentFor(s, 6, 7)).toBe(100);
    expect(rentFor(s, 6, 7, "card")).toBe(200);
    s.deeds[6].depot = true;
    expect(rentFor(s, 6, 7)).toBe(200);
    give(s, 1, 10);
    expect(rentFor(s, 10, 7)).toBe(28);
    give(s, 1, 17);
    expect(rentFor(s, 10, 7)).toBe(70);
    give(s, 1, 36);
    expect(rentFor(s, 10, 7)).toBe(140);
  });

  it("charges rent and creates a debt when cash is short", () => {
    const s0 = give(newGame(), 1, 48, 49, 51);
    s0.deeds[51].houses = 5;
    s0.players[0].pos = 48;
    s0.players[0].cash = 100;
    let s = run(s0, { type: "ROLL", dice: [1, 2] });
    expect(s.phase.t).toBe("debt");
    expect(s.debts[0]).toEqual({ debtor: 0, creditor: 1, amount: 2000 });
    s = run(s, { type: "BANKRUPT" });
    expect(s.players[0].bankrupt).toBe(true);
    expect(s.players[1].cash).toBe(2600);
    expect(s.current).toBe(1);
  });
});

describe("building", () => {
  it("requires the full set and even building, and respects house supply", () => {
    let s = give(newGame(), 0, 1, 3);
    expect(canBuild(s, 0, 1)).toBe(false);
    give(s, 0, 4);
    s = run(s, { type: "BUILD", player: 0, pos: 1 });
    expect(s.deeds[1].houses).toBe(1);
    expect(canBuild(s, 0, 1)).toBe(false);
    s = run(s, { type: "BUILD", player: 0, pos: 3 }, { type: "BUILD", player: 0, pos: 4 }, { type: "BUILD", player: 0, pos: 1 });
    expect(housesInBank(s)).toBe(44);
    expect(run(s, { type: "SELL_HOUSE", player: 0, pos: 3 })).toBe(s);
    s = run(s, { type: "SELL_HOUSE", player: 0, pos: 1 });
    expect(s.deeds[1].houses).toBe(1);
    expect(s.players[0].cash).toBe(2500 - 200 + 25);
  });

  it("builds auto towers (skyscrapers) on top of showrooms", () => {
    let s = give(newGame(), 0, 1, 3, 4);
    s.deeds[1].houses = 5;
    s.deeds[3].houses = 5;
    s.deeds[4].houses = 4;
    expect(canBuild(s, 0, 1)).toBe(false);
    s.deeds[4].houses = 5;
    s = run(s, { type: "BUILD", player: 0, pos: 1 });
    expect(s.deeds[1].houses).toBe(6);
    expect(skyscrapersInBank(s)).toBe(7);
    expect(rentFor(s, 1, 7)).toBe(375);
    s = run(s, { type: "SELL_HOUSE", player: 0, pos: 1 });
    expect(s.deeds[1].houses).toBe(5);
  });

  it("buys and sells ERP gantries (train depots), which block mortgaging", () => {
    let s = give(newGame(), 0, 6);
    s = run(s, { type: "BUILD_DEPOT", player: 0, pos: 6 });
    expect(s.deeds[6].depot).toBe(true);
    expect(s.players[0].cash).toBe(2400);
    expect(canMortgage(s, 0, 6)).toBe(false);
    s = run(s, { type: "SELL_DEPOT", player: 0, pos: 6 });
    expect(s.players[0].cash).toBe(2450);
    expect(canMortgage(s, 0, 6)).toBe(true);
  });

  it("mortgages and unmortgages with 10% interest", () => {
    let s = give(newGame(), 0, 51);
    s = run(s, { type: "MORTGAGE", player: 0, pos: 51 });
    expect(s.players[0].cash).toBe(2700);
    s = run(s, { type: "UNMORTGAGE", player: 0, pos: 51 });
    expect(s.players[0].cash).toBe(2480);
  });
});

describe("speed die", () => {
  it("is ignored until the player has passed GO", () => {
    const s = run(newGame(), { type: "ROLL", dice: [1, 2], speed: 3 });
    expect(s.players[0].pos).toBe(3);
    expect(s.lastSpeed).toBeNull();
  });

  it("adds a number face to the white dice", () => {
    const s = run(lappedGame(), { type: "ROLL", dice: [1, 2], speed: 3 });
    expect(s.players[0].pos).toBe(6);
  });

  it("Turbo resolves the space, then advances to the next unowned car", () => {
    let s = run(lappedGame(), { type: "ROLL", dice: [1, 2], speed: "turbo" }, { type: "BUY" });
    expect(s.phase.t).toBe("turbo");
    s = run(s, { type: "TURBO" });
    expect(s.players[0].pos).toBe(4);
    expect(s.phase).toEqual({ t: "buy", pos: 4 });
  });

  it("Turbo goes to the next car you owe rent on when everything is owned", () => {
    const s0 = lappedGame();
    for (const key of Object.keys(s0.deeds)) s0.deeds[Number(key)].owner = 0;
    give(s0, 1, 11);
    let s = run(s0, { type: "ROLL", dice: [1, 2], speed: "turbo" });
    expect(s.phase.t).toBe("turbo");
    s = run(s, { type: "TURBO" });
    expect(s.players[0].pos).toBe(11);
    expect(s.players[0].cash).toBe(2492);
  });

  it("Bus lets the player move by either die or the total", () => {
    let s = run(lappedGame(), { type: "ROLL", dice: [1, 4], speed: "bus" });
    expect(s.phase.t).toBe("busMove");
    expect(run(s, { type: "BUS_MOVE", steps: 3 })).toBe(s);
    s = run(s, { type: "BUS_MOVE", steps: 4 });
    expect(s.players[0].pos).toBe(4);
  });

  it("triples move the player anywhere and end the turn", () => {
    let s = run(lappedGame(), { type: "ROLL", dice: [2, 2], speed: 2 });
    expect(s.phase.t).toBe("pickSpace");
    s = run(s, { type: "PICK_SPACE", pos: 51 }, { type: "DECLINE" }, ...passAll);
    expect(s.players[0].pos).toBe(51);
    expect(s.phase.t).toBe("postRoll");
  });
});

describe("Mega spaces", () => {
  it("Car Auction lets the player auction any unowned car (not expressways or utilities)", () => {
    const s0 = newGame();
    s0.players[0].pos = 11;
    let s = run(s0, { type: "ROLL", dice: [1, 2] });
    expect(s.phase.t).toBe("auctionPick");
    expect(run(s, { type: "AUCTION_PICK", pos: 14 })).toBe(s);
    expect(run(s, { type: "AUCTION_PICK", pos: 6 })).toBe(s);
    s = run(s, { type: "AUCTION_PICK", pos: 51 }, { type: "BID", amount: 10 }, { type: "PASS_BID" }, { type: "PASS_BID" });
    expect(s.deeds[51].owner).toBe(0);
    expect(s.phase.t).toBe("postRoll");
  });

  it("with no unowned cars, Car Auction offers the highest-rent car or staying put", () => {
    const s0 = newGame();
    for (const pos of Object.keys(s0.deeds).map(Number)) if (BOARD[pos].kind === "property") s0.deeds[pos].owner = 0;
    give(s0, 1, 19, 51);
    s0.players[0].pos = 11;
    s0.deeds[6].owner = null;
    let s = run(s0, { type: "ROLL", dice: [1, 2] });
    expect(s.phase.t).toBe("auctionFallback");
    const stay = run(s, { type: "AUCTION_FALLBACK", go: false });
    expect(stay.players[0].pos).toBe(14);
    expect(stay.phase.t).toBe("postRoll");
    s = run(s, { type: "AUCTION_FALLBACK", go: true });
    expect(s.players[0].pos).toBe(51);
    expect(s.players[0].cash).toBe(2450);
  });

  it("Birthday Gift pays $100 or gives a bus ticket", () => {
    const s0 = newGame();
    s0.players[0].pos = 44;
    let s = run(s0, { type: "ROLL", dice: [1, 2] });
    expect(s.phase.t).toBe("birthday");
    s = run(s, { type: "BIRTHDAY", choice: "cash" });
    expect(s.players[0].cash).toBe(2600);
    const t = run(s0, { type: "ROLL", dice: [1, 2] }, { type: "BIRTHDAY", choice: "bus" });
    expect(t.players[0].busTickets).toHaveLength(1);
  });

  it("Bus Ticket space draws a ticket; an expiring ticket cancels everyone else's", () => {
    const s0 = newGame();
    s0.players[0].pos = 29;
    s0.players[1].busTickets = [0];
    s0.busDeck = [1, ...s0.busDeck.slice(1)];
    const s = run(s0, { type: "ROLL", dice: [1, 2] });
    expect(s.players[0].busTickets).toEqual([1]);
    expect(s.players[1].busTickets).toEqual([]);
    expect(s.busDeck.at(-1)).toBe(0);
  });

  it("bus tickets move forward to any space on the same side instead of rolling", () => {
    expect(busDestinations(0)).toEqual(Array.from({ length: 13 }, (_, i) => i + 1));
    expect(busDestinations(47)).toEqual([48, 49, 50, 51, 0]);
    const s0 = newGame();
    s0.players[0].busTickets = [0];
    expect(run(s0, { type: "USE_BUS", pos: 14, dice: [1, 2] })).toBe(s0);
    const s = run(s0, { type: "USE_BUS", pos: 12, dice: [1, 2] });
    expect(s.players[0].pos).toBe(12);
    expect(s.players[0].busTickets).toEqual([]);
    expect(s.phase).toEqual({ t: "buy", pos: 12 });
  });
});

describe("auction and trade", () => {
  it("sells to the highest bidder", () => {
    let s = run(newGame(), { type: "ROLL", dice: [1, 2] }, { type: "DECLINE" });
    expect(s.phase.t).toBe("auction");
    s = run(s, { type: "BID", amount: 10 }, { type: "BID", amount: 20 }, { type: "PASS_BID" }, { type: "PASS_BID" });
    expect(s.deeds[3].owner).toBe(1);
    expect(s.players[1].cash).toBe(2480);
  });

  it("accepts any open-ended bid above the high bid, up to the bidder's cash", () => {
    let s = run(newGame(), { type: "ROLL", dice: [1, 2] }, { type: "DECLINE" });
    s = run(s, { type: "BID", amount: 137 });
    expect(s.phase).toMatchObject({ t: "auction", high: 137 });
    expect(run(s, { type: "BID", amount: 137 })).toBe(s);
    expect(run(s, { type: "BID", amount: 2501 })).toBe(s);
    s = run(s, { type: "BID", amount: 2500 }, { type: "PASS_BID" }, { type: "PASS_BID" });
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
    expect(s.players[0].cash).toBe(2600);
    expect(s.players[1].cash).toBe(2397);
  });
});

describe("cards", () => {
  it("collects from every player on a birthday-style card", () => {
    const s0 = newGame();
    s0.players[0].pos = 20;
    s0.decks.chest = [8, ...s0.decks.chest.filter((c) => c !== 8)];
    let s = run(s0, { type: "ROLL", dice: [1, 1] });
    expect(s.phase).toEqual({ t: "card", deck: "chest", card: 8 });
    s = run(s, { type: "RESOLVE_CARD", dice: [1, 1] });
    expect(s.players[0].cash).toBe(2520);
    expect(s.decks.chest.at(-1)).toBe(8);
  });

  it("keeps Get Out of Jail Free cards out of the deck until used", () => {
    const s0 = newGame();
    s0.players[0].pos = 7;
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
