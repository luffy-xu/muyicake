// Pure rules engine for the car-edition property trading game.
// Implements the classic official rules: GO salary, doubles (3 in a row → jail),
// jail (fine / card / doubles, forced fine on 3rd failure), buy-or-auction,
// monopoly double rent, railroads, utilities, even building with a limited
// house/hotel supply, mortgages with 10% interest, card decks, trading,
// debts and bankruptcy (to a player or to the bank with auctions).

import {
  BOARD,
  CHANCE_CARDS,
  CHEST_CARDS,
  GO_SALARY,
  JAIL_FINE,
  JAIL_POS,
  RAILROADS,
  STARTING_CASH,
  TOTAL_HOTELS,
  TOTAL_HOUSES,
  UTILITIES,
  groupMembers,
  groupOf,
  isOwnable,
  priceOf,
  type CardEffect,
  type TokenId,
} from "@/lib/game/board";

export type Deck = "chance" | "chest";
export type Dice = [number, number];

export type Player = {
  id: number;
  name: string;
  token: TokenId;
  cash: number;
  pos: number;
  inJail: boolean;
  jailTurns: number;
  jailCards: Deck[];
  bankrupt: boolean;
};

export type Deed = { owner: number | null; houses: number; mortgaged: boolean };

export type Debt = { debtor: number; creditor: number | "bank"; amount: number };

export type Phase =
  | { t: "roll" }
  | { t: "buy"; pos: number }
  | { t: "card"; deck: Deck; card: number }
  | {
      t: "auction";
      pos: number;
      high: number;
      highBidder: number | null;
      bidders: number[];
      turn: number;
      queue: number[];
      resume: Phase;
    }
  | { t: "debt"; resume: Phase }
  | { t: "postRoll" }
  | { t: "over"; winner: number };

export type LogKey =
  | "rolled"
  | "passGo"
  | "landed"
  | "bought"
  | "rentPaid"
  | "taxPaid"
  | "toJail"
  | "threeDoubles"
  | "jailDoubles"
  | "jailStay"
  | "jailForcedFine"
  | "jailPaid"
  | "jailCardUsed"
  | "cardDrawn"
  | "auctionStart"
  | "auctionWon"
  | "auctionNone"
  | "bid"
  | "bidPass"
  | "built"
  | "soldHouse"
  | "mortgaged"
  | "unmortgaged"
  | "interestPaid"
  | "debtPaid"
  | "bankrupt"
  | "trade"
  | "collected"
  | "paid"
  | "winner";

export type LogEntry = {
  k: LogKey;
  p?: number;
  o?: number;
  s?: number;
  a?: number;
  d?: Dice;
  deck?: Deck;
  c?: number;
};

export type GameState = {
  version: 1;
  players: Player[];
  current: number;
  deeds: Record<number, Deed>;
  phase: Phase;
  debts: Debt[];
  doublesCount: number;
  rollAgain: boolean;
  lastDice: Dice | null;
  decks: Record<Deck, number[]>;
  log: LogEntry[];
  // Total entries ever logged (the log itself is capped); lets the UI animate new entries.
  logSeq?: number;
};

export type TradeOffer = {
  from: number;
  to: number;
  giveCash: number;
  getCash: number;
  giveDeeds: number[];
  getDeeds: number[];
  giveCards: Deck[];
  getCards: Deck[];
};

export type Action =
  | { type: "ROLL"; dice: Dice }
  | { type: "PAY_JAIL" }
  | { type: "USE_JAIL_CARD" }
  | { type: "BUY" }
  | { type: "DECLINE" }
  | { type: "BID"; amount: number }
  | { type: "PASS_BID" }
  | { type: "RESOLVE_CARD"; dice: Dice }
  | { type: "END_TURN" }
  | { type: "BUILD"; player: number; pos: number }
  | { type: "SELL_HOUSE"; player: number; pos: number }
  | { type: "MORTGAGE"; player: number; pos: number }
  | { type: "UNMORTGAGE"; player: number; pos: number }
  | { type: "PAY_DEBT" }
  | { type: "BANKRUPT" }
  | { type: "TRADE"; offer: TradeOffer };

const MAX_LOG = 300;

export type Rng = () => number;

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function rollDice(rng: Rng = Math.random): Dice {
  return [1 + Math.floor(rng() * 6), 1 + Math.floor(rng() * 6)];
}

export function createGame(players: { name: string; token: TokenId }[], rng: Rng = Math.random): GameState {
  const deeds: Record<number, Deed> = {};
  BOARD.forEach((_, i) => {
    if (isOwnable(i)) deeds[i] = { owner: null, houses: 0, mortgaged: false };
  });
  return {
    version: 1,
    players: players.map((pl, id) => ({
      id,
      name: pl.name,
      token: pl.token,
      cash: STARTING_CASH,
      pos: 0,
      inJail: false,
      jailTurns: 0,
      jailCards: [],
      bankrupt: false,
    })),
    current: 0,
    deeds,
    phase: { t: "roll" },
    debts: [],
    doublesCount: 0,
    rollAgain: false,
    lastDice: null,
    decks: {
      chance: shuffle(CHANCE_CARDS.map((_, i) => i), rng),
      chest: shuffle(CHEST_CARDS.map((_, i) => i), rng),
    },
    log: [],
    logSeq: 0,
  };
}

// ---------- derived helpers ----------

export function housesInBank(s: GameState) {
  let used = 0;
  for (const d of Object.values(s.deeds)) if (d.houses > 0 && d.houses < 5) used += d.houses;
  return TOTAL_HOUSES - used;
}

export function hotelsInBank(s: GameState) {
  let used = 0;
  for (const d of Object.values(s.deeds)) if (d.houses === 5) used += 1;
  return TOTAL_HOTELS - used;
}

export function ownsGroup(s: GameState, player: number, pos: number) {
  const group = groupOf(pos);
  if (!group) return false;
  return groupMembers(group).every((m) => s.deeds[m].owner === player);
}

export function groupHasBuildings(s: GameState, pos: number) {
  const group = groupOf(pos);
  if (!group) return false;
  return groupMembers(group).some((m) => s.deeds[m].houses > 0);
}

export function mortgageValue(pos: number) {
  return priceOf(pos) / 2;
}

export function unmortgageCost(pos: number) {
  return Math.ceil((mortgageValue(pos) * 11) / 10);
}

export function interestOf(pos: number) {
  return Math.ceil(mortgageValue(pos) / 10);
}

export function rentFor(s: GameState, pos: number, diceTotal: number, mode: "normal" | "card" = "normal") {
  const deed = s.deeds[pos];
  const space = BOARD[pos];
  if (!deed || deed.owner === null || deed.mortgaged) return 0;
  const owner = deed.owner;
  if (space.kind === "property") {
    if (deed.houses > 0) return space.rent[deed.houses];
    return ownsGroup(s, owner, pos) ? space.rent[0] * 2 : space.rent[0];
  }
  if (space.kind === "railroad") {
    const count = RAILROADS.filter((r) => s.deeds[r].owner === owner).length;
    const rent = 25 * 2 ** (count - 1);
    return mode === "card" ? rent * 2 : rent;
  }
  if (space.kind === "utility") {
    if (mode === "card") return diceTotal * 10;
    const count = UTILITIES.filter((u) => s.deeds[u].owner === owner).length;
    return diceTotal * (count === 2 ? 10 : 4);
  }
  return 0;
}

export function canBuild(s: GameState, player: number, pos: number) {
  const space = BOARD[pos];
  const deed = s.deeds[pos];
  if (space?.kind !== "property" || !deed || deed.owner !== player) return false;
  if (deed.houses >= 5) return false;
  if (!ownsGroup(s, player, pos)) return false;
  const members = groupMembers(space.group);
  if (members.some((m) => s.deeds[m].mortgaged)) return false;
  const min = Math.min(...members.map((m) => s.deeds[m].houses));
  if (deed.houses !== min) return false;
  if (s.players[player].cash < space.houseCost) return false;
  return deed.houses === 4 ? hotelsInBank(s) > 0 : housesInBank(s) > 0;
}

export function canSellHouse(s: GameState, player: number, pos: number) {
  const space = BOARD[pos];
  const deed = s.deeds[pos];
  if (space?.kind !== "property" || !deed || deed.owner !== player || deed.houses === 0) return false;
  const max = Math.max(...groupMembers(space.group).map((m) => s.deeds[m].houses));
  return deed.houses === max;
}

export function canMortgage(s: GameState, player: number, pos: number) {
  const deed = s.deeds[pos];
  if (!deed || deed.owner !== player || deed.mortgaged) return false;
  return !groupHasBuildings(s, pos);
}

export function canUnmortgage(s: GameState, player: number, pos: number) {
  const deed = s.deeds[pos];
  if (!deed || deed.owner !== player || !deed.mortgaged) return false;
  return s.players[player].cash >= unmortgageCost(pos);
}

export function netWorth(s: GameState, player: number) {
  let total = s.players[player].cash;
  for (const [key, d] of Object.entries(s.deeds)) {
    if (d.owner !== player) continue;
    const pos = Number(key);
    const space = BOARD[pos];
    total += d.mortgaged ? 0 : mortgageValue(pos);
    if (space.kind === "property") total += (d.houses * space.houseCost) / 2;
  }
  return total;
}

export function activePlayers(s: GameState) {
  return s.players.filter((pl) => !pl.bankrupt);
}

export function debtor(s: GameState) {
  return s.debts[0]?.debtor ?? null;
}

// ---------- reducer ----------

type Draft = GameState;

function clone(s: GameState): Draft {
  return structuredClone(s);
}

function log(s: Draft, entry: LogEntry) {
  s.log.push(entry);
  s.logSeq = (s.logSeq ?? s.log.length - 1) + 1;
  if (s.log.length > MAX_LOG) s.log.splice(0, s.log.length - MAX_LOG);
}

function credit(s: Draft, to: number | "bank", amount: number) {
  if (to !== "bank") s.players[to].cash += amount;
}

// Pay if possible, otherwise queue a debt the player must settle (or go bankrupt).
function charge(s: Draft, from: number, to: number | "bank", amount: number) {
  if (amount <= 0) return;
  const pl = s.players[from];
  if (pl.cash >= amount) {
    pl.cash -= amount;
    credit(s, to, amount);
  } else {
    s.debts.push({ debtor: from, creditor: to, amount });
  }
}

function afterTurnPhase(s: Draft): Phase {
  const pl = s.players[s.current];
  return s.rollAgain && !pl.inJail && !pl.bankrupt ? { t: "roll" } : { t: "postRoll" };
}

function sendToJail(s: Draft, player: number) {
  const pl = s.players[player];
  pl.pos = JAIL_POS;
  pl.inJail = true;
  pl.jailTurns = 0;
  s.rollAgain = false;
  log(s, { k: "toJail", p: player });
}

function moveTo(s: Draft, player: number, to: number, collectGo: boolean) {
  const pl = s.players[player];
  if (collectGo && to < pl.pos) {
    pl.cash += GO_SALARY;
    log(s, { k: "passGo", p: player, a: GO_SALARY });
  }
  pl.pos = to;
}

function land(s: Draft, diceTotal: number, mode: "normal" | "card" = "normal", cardDice?: Dice) {
  const player = s.current;
  const pl = s.players[player];
  const pos = pl.pos;
  const space = BOARD[pos];
  log(s, { k: "landed", p: player, s: pos });

  if (isOwnable(pos)) {
    const deed = s.deeds[pos];
    if (deed.owner === null) {
      s.phase = { t: "buy", pos };
      return;
    }
    if (deed.owner !== player && !deed.mortgaged) {
      const total = mode === "card" && space.kind === "utility" && cardDice ? cardDice[0] + cardDice[1] : diceTotal;
      const rent = rentFor(s, pos, total, mode);
      log(s, { k: "rentPaid", p: player, o: deed.owner, s: pos, a: rent });
      charge(s, player, deed.owner, rent);
    }
    s.phase = afterTurnPhase(s);
    return;
  }

  switch (space.kind) {
    case "tax":
      log(s, { k: "taxPaid", p: player, s: pos, a: space.amount });
      charge(s, player, "bank", space.amount);
      break;
    case "chance":
    case "chest": {
      const deck = space.kind;
      const card = s.decks[deck].shift()!;
      log(s, { k: "cardDrawn", p: player, deck, c: card });
      s.phase = { t: "card", deck, card };
      return;
    }
    case "goToJail":
      sendToJail(s, player);
      break;
    default:
      break;
  }
  s.phase = afterTurnPhase(s);
}

function applyCard(s: Draft, deck: Deck, cardIndex: number, dice: Dice) {
  const player = s.current;
  const pl = s.players[player];
  const effect: CardEffect = (deck === "chance" ? CHANCE_CARDS : CHEST_CARDS)[cardIndex];
  const diceTotal = s.lastDice ? s.lastDice[0] + s.lastDice[1] : 0;

  if (effect.kind === "jailFree") {
    pl.jailCards.push(deck);
  } else {
    s.decks[deck].push(cardIndex);
  }

  switch (effect.kind) {
    case "advance":
      moveTo(s, player, effect.to, true);
      land(s, diceTotal);
      return;
    case "nearestRailroad": {
      const to = RAILROADS.find((r) => r > pl.pos) ?? RAILROADS[0];
      moveTo(s, player, to, true);
      land(s, diceTotal, "card");
      return;
    }
    case "nearestUtility": {
      const to = UTILITIES.find((u) => u > pl.pos) ?? UTILITIES[0];
      moveTo(s, player, to, true);
      land(s, diceTotal, "card", dice);
      return;
    }
    case "back":
      pl.pos = (pl.pos - effect.spaces + 40) % 40;
      land(s, diceTotal);
      return;
    case "jail":
      sendToJail(s, player);
      break;
    case "collect":
      pl.cash += effect.amount;
      log(s, { k: "collected", p: player, a: effect.amount });
      break;
    case "pay":
      log(s, { k: "paid", p: player, a: effect.amount });
      charge(s, player, "bank", effect.amount);
      break;
    case "repairs": {
      let cost = 0;
      for (const d of Object.values(s.deeds)) {
        if (d.owner !== player) continue;
        cost += d.houses === 5 ? effect.hotel : d.houses * effect.house;
      }
      log(s, { k: "paid", p: player, a: cost });
      charge(s, player, "bank", cost);
      break;
    }
    case "payEach":
      for (const other of activePlayers(s)) {
        if (other.id === player) continue;
        log(s, { k: "paid", p: player, o: other.id, a: effect.amount });
        charge(s, player, other.id, effect.amount);
      }
      break;
    case "collectEach":
      for (const other of activePlayers(s)) {
        if (other.id === player) continue;
        log(s, { k: "collected", p: player, o: other.id, a: effect.amount });
        charge(s, other.id, player, effect.amount);
      }
      break;
    default:
      break;
  }
  s.phase = afterTurnPhase(s);
}

function moveBy(s: Draft, dice: Dice) {
  const player = s.current;
  const pl = s.players[player];
  const total = dice[0] + dice[1];
  const to = (pl.pos + total) % 40;
  moveTo(s, player, to, true);
  land(s, total);
}

function nextPlayer(s: Draft) {
  const n = s.players.length;
  let next = s.current;
  for (let i = 0; i < n; i++) {
    next = (next + 1) % n;
    if (!s.players[next].bankrupt) break;
  }
  s.current = next;
  s.doublesCount = 0;
  s.rollAgain = false;
  s.phase = { t: "roll" };
}

function startAuction(s: Draft, queue: number[], resume: Phase) {
  const [pos, ...rest] = queue;
  if (pos === undefined) {
    s.phase = resume;
    return;
  }
  const bidders = activePlayers(s).map((pl) => pl.id);
  // Bidding starts with the current player if still active, otherwise the next active one.
  const startIdx = Math.max(0, bidders.findIndex((id) => id >= s.current));
  s.phase = { t: "auction", pos, high: 0, highBidder: null, bidders, turn: startIdx, queue: rest, resume };
  log(s, { k: "auctionStart", s: pos });
}

function finishAuctionIfDone(s: Draft) {
  const ph = s.phase;
  if (ph.t !== "auction") return;
  const done = ph.bidders.length === 0 || (ph.bidders.length === 1 && ph.highBidder === ph.bidders[0]);
  if (!done) return;
  if (ph.highBidder !== null) {
    s.players[ph.highBidder].cash -= ph.high;
    s.deeds[ph.pos].owner = ph.highBidder;
    log(s, { k: "auctionWon", p: ph.highBidder, s: ph.pos, a: ph.high });
  } else {
    log(s, { k: "auctionNone", s: ph.pos });
  }
  startAuction(s, ph.queue, ph.resume);
}

function transferDeed(s: Draft, pos: number, to: number) {
  const deed = s.deeds[pos];
  deed.owner = to;
  if (deed.mortgaged) {
    // Receiving a mortgaged deed costs 10% interest immediately.
    const interest = interestOf(pos);
    log(s, { k: "interestPaid", p: to, s: pos, a: interest });
    charge(s, to, "bank", interest);
  }
}

function declareBankrupt(s: Draft) {
  const debt = s.debts[0];
  if (!debt) return;
  const loser = debt.debtor;
  const pl = s.players[loser];
  const creditor = debt.creditor;
  pl.bankrupt = true;
  log(s, { k: "bankrupt", p: loser, o: creditor === "bank" ? undefined : creditor });

  const owned = Object.keys(s.deeds)
    .map(Number)
    .filter((pos) => s.deeds[pos].owner === loser);

  // Buildings are sold back to the bank at half price first.
  for (const pos of owned) {
    const space = BOARD[pos];
    const deed = s.deeds[pos];
    if (space.kind === "property" && deed.houses > 0) {
      pl.cash += (deed.houses * space.houseCost) / 2;
      deed.houses = 0;
    }
  }

  const auctionQueue: number[] = [];
  if (creditor === "bank") {
    for (const pos of owned) {
      s.deeds[pos] = { owner: null, houses: 0, mortgaged: false };
      auctionQueue.push(pos);
    }
    pl.jailCards.forEach((deck) => s.decks[deck].push(CARD_JAIL_FREE[deck]));
  } else {
    s.players[creditor].cash += pl.cash;
    s.players[creditor].jailCards.push(...pl.jailCards);
    for (const pos of owned) transferDeed(s, pos, creditor);
  }
  pl.cash = 0;
  pl.jailCards = [];
  s.debts = s.debts.filter((d) => d.debtor !== loser);

  const resume: Phase =
    s.phase.t === "debt" ? s.phase.resume : s.phase;
  let after: Phase = resume;
  if (loser === s.current) {
    nextPlayer(s);
    after = { t: "roll" };
  }
  if (activePlayers(s).length <= 1) {
    const winner = activePlayers(s)[0]?.id ?? loser;
    s.phase = { t: "over", winner };
    log(s, { k: "winner", p: winner });
    return;
  }
  if (auctionQueue.length) {
    startAuction(s, auctionQueue, after);
  } else {
    s.phase = after;
  }
}

const CARD_JAIL_FREE: Record<Deck, number> = {
  chance: CHANCE_CARDS.findIndex((c) => c.kind === "jailFree"),
  chest: CHEST_CARDS.findIndex((c) => c.kind === "jailFree"),
};

function normalize(s: Draft) {
  if (s.phase.t === "over") return;
  if (s.debts.length && s.phase.t !== "debt") {
    s.phase = { t: "debt", resume: s.phase };
  } else if (!s.debts.length && s.phase.t === "debt") {
    s.phase = s.phase.resume;
  }
}

export function validateTrade(s: GameState, o: TradeOffer): boolean {
  const a = s.players[o.from];
  const b = s.players[o.to];
  if (!a || !b || a.bankrupt || b.bankrupt || o.from === o.to) return false;
  if (o.giveCash < 0 || o.getCash < 0 || o.giveCash > a.cash || o.getCash > b.cash) return false;
  const okDeeds = (list: number[], owner: number) =>
    list.every((pos) => s.deeds[pos]?.owner === owner && !groupHasBuildings(s, pos));
  if (!okDeeds(o.giveDeeds, o.from) || !okDeeds(o.getDeeds, o.to)) return false;
  const okCards = (list: Deck[], pl: Player) => list.every((d) => pl.jailCards.filter((c) => c === d).length >= list.filter((x) => x === d).length);
  if (!okCards(o.giveCards, a) || !okCards(o.getCards, b)) return false;
  return o.giveCash + o.getCash + o.giveDeeds.length + o.getDeeds.length + o.giveCards.length + o.getCards.length > 0;
}

function removeCards(pl: Player, cards: Deck[]) {
  for (const c of cards) pl.jailCards.splice(pl.jailCards.indexOf(c), 1);
}

export function reduce(state: GameState, action: Action): GameState {
  if (state.phase.t === "over") return state;
  const s = clone(state);
  const ph = s.phase;
  const pl = s.players[s.current];

  switch (action.type) {
    case "ROLL": {
      if (ph.t !== "roll") return state;
      const dice = action.dice;
      const doubles = dice[0] === dice[1];
      s.lastDice = dice;
      log(s, { k: "rolled", p: pl.id, d: dice });
      if (pl.inJail) {
        if (doubles) {
          pl.inJail = false;
          pl.jailTurns = 0;
          s.rollAgain = false;
          log(s, { k: "jailDoubles", p: pl.id });
          moveBy(s, dice);
        } else {
          pl.jailTurns += 1;
          if (pl.jailTurns >= 3) {
            pl.inJail = false;
            pl.jailTurns = 0;
            s.rollAgain = false;
            log(s, { k: "jailForcedFine", p: pl.id, a: JAIL_FINE });
            charge(s, pl.id, "bank", JAIL_FINE);
            moveBy(s, dice);
          } else {
            log(s, { k: "jailStay", p: pl.id });
            s.phase = { t: "postRoll" };
          }
        }
        break;
      }
      if (doubles) {
        s.doublesCount += 1;
        if (s.doublesCount >= 3) {
          log(s, { k: "threeDoubles", p: pl.id });
          sendToJail(s, pl.id);
          s.phase = { t: "postRoll" };
          break;
        }
      }
      s.rollAgain = doubles;
      moveBy(s, dice);
      break;
    }
    case "PAY_JAIL": {
      if (ph.t !== "roll" || !pl.inJail || pl.cash < JAIL_FINE) return state;
      pl.cash -= JAIL_FINE;
      pl.inJail = false;
      pl.jailTurns = 0;
      log(s, { k: "jailPaid", p: pl.id, a: JAIL_FINE });
      break;
    }
    case "USE_JAIL_CARD": {
      if (ph.t !== "roll" || !pl.inJail || !pl.jailCards.length) return state;
      const deck = pl.jailCards.shift()!;
      s.decks[deck].push(CARD_JAIL_FREE[deck]);
      pl.inJail = false;
      pl.jailTurns = 0;
      log(s, { k: "jailCardUsed", p: pl.id });
      break;
    }
    case "BUY": {
      if (ph.t !== "buy") return state;
      const price = priceOf(ph.pos);
      if (pl.cash < price) return state;
      pl.cash -= price;
      s.deeds[ph.pos].owner = pl.id;
      log(s, { k: "bought", p: pl.id, s: ph.pos, a: price });
      s.phase = afterTurnPhase(s);
      break;
    }
    case "DECLINE": {
      if (ph.t !== "buy") return state;
      startAuction(s, [ph.pos], afterTurnPhase(s));
      break;
    }
    case "BID": {
      if (ph.t !== "auction") return state;
      const bidder = ph.bidders[ph.turn];
      if (action.amount <= ph.high || action.amount > s.players[bidder].cash) return state;
      ph.high = action.amount;
      ph.highBidder = bidder;
      log(s, { k: "bid", p: bidder, a: action.amount });
      ph.turn = (ph.turn + 1) % ph.bidders.length;
      finishAuctionIfDone(s);
      break;
    }
    case "PASS_BID": {
      if (ph.t !== "auction") return state;
      const bidder = ph.bidders[ph.turn];
      log(s, { k: "bidPass", p: bidder });
      ph.bidders.splice(ph.turn, 1);
      if (ph.bidders.length) ph.turn = ph.turn % ph.bidders.length;
      finishAuctionIfDone(s);
      break;
    }
    case "RESOLVE_CARD": {
      if (ph.t !== "card") return state;
      applyCard(s, ph.deck, ph.card, action.dice);
      break;
    }
    case "END_TURN": {
      if (ph.t !== "postRoll") return state;
      nextPlayer(s);
      break;
    }
    case "BUILD": {
      if (!canBuild(s, action.player, action.pos)) return state;
      const space = BOARD[action.pos];
      if (space.kind !== "property") return state;
      s.players[action.player].cash -= space.houseCost;
      s.deeds[action.pos].houses += 1;
      log(s, { k: "built", p: action.player, s: action.pos, a: s.deeds[action.pos].houses });
      break;
    }
    case "SELL_HOUSE": {
      if (!canSellHouse(s, action.player, action.pos)) return state;
      const space = BOARD[action.pos];
      if (space.kind !== "property") return state;
      const deed = s.deeds[action.pos];
      let newLevel = deed.houses - 1;
      if (deed.houses === 5) newLevel = Math.min(4, housesInBank(s));
      const refund = ((deed.houses - newLevel) * space.houseCost) / 2;
      deed.houses = newLevel;
      s.players[action.player].cash += refund;
      log(s, { k: "soldHouse", p: action.player, s: action.pos, a: refund });
      break;
    }
    case "MORTGAGE": {
      if (!canMortgage(s, action.player, action.pos)) return state;
      s.deeds[action.pos].mortgaged = true;
      s.players[action.player].cash += mortgageValue(action.pos);
      log(s, { k: "mortgaged", p: action.player, s: action.pos, a: mortgageValue(action.pos) });
      break;
    }
    case "UNMORTGAGE": {
      if (!canUnmortgage(s, action.player, action.pos)) return state;
      s.deeds[action.pos].mortgaged = false;
      s.players[action.player].cash -= unmortgageCost(action.pos);
      log(s, { k: "unmortgaged", p: action.player, s: action.pos, a: unmortgageCost(action.pos) });
      break;
    }
    case "PAY_DEBT": {
      const debt = s.debts[0];
      if (!debt) return state;
      const d = s.players[debt.debtor];
      if (d.cash < debt.amount) return state;
      d.cash -= debt.amount;
      credit(s, debt.creditor, debt.amount);
      log(s, { k: "debtPaid", p: debt.debtor, o: debt.creditor === "bank" ? undefined : debt.creditor, a: debt.amount });
      s.debts.shift();
      break;
    }
    case "BANKRUPT": {
      if (!s.debts.length) return state;
      declareBankrupt(s);
      break;
    }
    case "TRADE": {
      const o = action.offer;
      if (ph.t === "auction" || ph.t === "card" || !validateTrade(s, o)) return state;
      const a = s.players[o.from];
      const b = s.players[o.to];
      a.cash += o.getCash - o.giveCash;
      b.cash += o.giveCash - o.getCash;
      removeCards(a, o.giveCards);
      removeCards(b, o.getCards);
      a.jailCards.push(...o.getCards);
      b.jailCards.push(...o.giveCards);
      log(s, { k: "trade", p: o.from, o: o.to });
      o.giveDeeds.forEach((pos) => transferDeed(s, pos, o.to));
      o.getDeeds.forEach((pos) => transferDeed(s, pos, o.from));
      break;
    }
    default:
      return state;
  }

  normalize(s);
  return s;
}
