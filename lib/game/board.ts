// Board data for the wildlife-edition property trading game.
// Prices, rents and building costs follow the classic 40-space board;
// display names live in lib/i18n.ts under `game.spaces` (same index order).

export type ColorGroup = "brown" | "lightBlue" | "pink" | "orange" | "red" | "yellow" | "green" | "darkBlue";

export type Space =
  | { kind: "go" }
  | { kind: "property"; group: ColorGroup; price: number; houseCost: number; rent: readonly [number, number, number, number, number, number] }
  | { kind: "railroad"; price: number }
  | { kind: "utility"; price: number }
  | { kind: "chance" }
  | { kind: "chest" }
  | { kind: "tax"; amount: number }
  | { kind: "jail" }
  | { kind: "freeParking" }
  | { kind: "goToJail" };

const p = (
  group: ColorGroup,
  price: number,
  houseCost: number,
  rent: readonly [number, number, number, number, number, number],
): Space => ({ kind: "property", group, price, houseCost, rent });

export const BOARD: readonly Space[] = [
  { kind: "go" },
  p("brown", 60, 50, [2, 10, 30, 90, 160, 250]),
  { kind: "chest" },
  p("brown", 60, 50, [4, 20, 60, 180, 320, 450]),
  { kind: "tax", amount: 200 },
  { kind: "railroad", price: 200 },
  p("lightBlue", 100, 50, [6, 30, 90, 270, 400, 550]),
  { kind: "chance" },
  p("lightBlue", 100, 50, [6, 30, 90, 270, 400, 550]),
  p("lightBlue", 120, 50, [8, 40, 100, 300, 450, 600]),
  { kind: "jail" },
  p("pink", 140, 100, [10, 50, 150, 450, 625, 750]),
  { kind: "utility", price: 150 },
  p("pink", 140, 100, [10, 50, 150, 450, 625, 750]),
  p("pink", 160, 100, [12, 60, 180, 500, 700, 900]),
  { kind: "railroad", price: 200 },
  p("orange", 180, 100, [14, 70, 200, 550, 750, 950]),
  { kind: "chest" },
  p("orange", 180, 100, [14, 70, 200, 550, 750, 950]),
  p("orange", 200, 100, [16, 80, 220, 600, 800, 1000]),
  { kind: "freeParking" },
  p("red", 220, 150, [18, 90, 250, 700, 875, 1050]),
  { kind: "chance" },
  p("red", 220, 150, [18, 90, 250, 700, 875, 1050]),
  p("red", 240, 150, [20, 100, 300, 750, 925, 1100]),
  { kind: "railroad", price: 200 },
  p("yellow", 260, 150, [22, 110, 330, 800, 975, 1150]),
  p("yellow", 260, 150, [22, 110, 330, 800, 975, 1150]),
  { kind: "utility", price: 150 },
  p("yellow", 280, 150, [24, 120, 360, 850, 1025, 1200]),
  { kind: "goToJail" },
  p("green", 300, 200, [26, 130, 390, 900, 1100, 1275]),
  p("green", 300, 200, [26, 130, 390, 900, 1100, 1275]),
  { kind: "chest" },
  p("green", 320, 200, [28, 150, 450, 1000, 1200, 1400]),
  { kind: "railroad", price: 200 },
  { kind: "chance" },
  p("darkBlue", 350, 200, [35, 175, 500, 1100, 1300, 1500]),
  { kind: "tax", amount: 100 },
  p("darkBlue", 400, 200, [50, 200, 600, 1400, 1700, 2000]),
];

export const SPACE_ICONS: readonly string[] = [
  "➡️", "🐊", "💚", "🦦", "💰", "🏞️", "🐒", "🌿", "🦎", "🦛",
  "🔒", "🦊", "🛍️", "🐈", "🐆", "🦉", "🐗", "💚", "🐻", "🐵",
  "🅿️", "🦒", "🌿", "🦓", "🦏", "🐟", "🦁", "🐆", "🚋", "🐅",
  "👮", "🌊", "🦦", "💚", "🦜", "🦩", "🌿", "🐼", "💰", "🐘",
];

export const GROUP_COLORS: Record<ColorGroup, string> = {
  brown: "#8B5A2B",
  lightBlue: "#9ED3F0",
  pink: "#D9418C",
  orange: "#F39A1E",
  red: "#E2342D",
  yellow: "#F7DF2D",
  green: "#1F9E55",
  darkBlue: "#1E4FA1",
};

export const TOKENS = ["orangutan", "pangolin", "turtle", "cockatoo", "walkieTalkie", "gumboot"] as const;
export type TokenId = (typeof TOKENS)[number];

export const TOKEN_ICONS: Record<TokenId, string> = {
  orangutan: "🦧",
  pangolin: "🦔",
  turtle: "🐢",
  cockatoo: "🦜",
  walkieTalkie: "📻",
  gumboot: "🥾",
};

export const PLAYER_COLORS = ["#E2342D", "#1E4FA1", "#1F9E55", "#F39A1E", "#8E44AD", "#2B1E1A"];

export const JAIL_POS = 10;
export const GO_SALARY = 200;
export const JAIL_FINE = 50;
export const STARTING_CASH = 1500;
export const TOTAL_HOUSES = 32;
export const TOTAL_HOTELS = 12;

export function isOwnable(pos: number) {
  const kind = BOARD[pos].kind;
  return kind === "property" || kind === "railroad" || kind === "utility";
}

export function priceOf(pos: number) {
  const space = BOARD[pos];
  return space.kind === "property" || space.kind === "railroad" || space.kind === "utility" ? space.price : 0;
}

export function groupOf(pos: number): ColorGroup | null {
  const space = BOARD[pos];
  return space.kind === "property" ? space.group : null;
}

export function groupMembers(group: ColorGroup) {
  return BOARD.flatMap((space, i) => (space.kind === "property" && space.group === group ? [i] : []));
}

export const RAILROADS = BOARD.flatMap((s, i) => (s.kind === "railroad" ? [i] : []));
export const UTILITIES = BOARD.flatMap((s, i) => (s.kind === "utility" ? [i] : []));

export type CardEffect =
  | { kind: "advance"; to: number }
  | { kind: "nearestRailroad" }
  | { kind: "nearestUtility" }
  | { kind: "collect"; amount: number }
  | { kind: "pay"; amount: number }
  | { kind: "jailFree" }
  | { kind: "back"; spaces: number }
  | { kind: "jail" }
  | { kind: "repairs"; house: number; hotel: number }
  | { kind: "payEach"; amount: number }
  | { kind: "collectEach"; amount: number };

// "Act for Wildlife" deck (replaces Chance). Text: game.chanceCards[i].
export const CHANCE_CARDS: readonly CardEffect[] = [
  { kind: "advance", to: 0 },
  { kind: "advance", to: 39 },
  { kind: "advance", to: 24 },
  { kind: "advance", to: 11 },
  { kind: "nearestRailroad" },
  { kind: "nearestRailroad" },
  { kind: "nearestUtility" },
  { kind: "collect", amount: 50 },
  { kind: "jailFree" },
  { kind: "back", spaces: 3 },
  { kind: "jail" },
  { kind: "repairs", house: 25, hotel: 100 },
  { kind: "pay", amount: 15 },
  { kind: "advance", to: 5 },
  { kind: "payEach", amount: 50 },
  { kind: "collect", amount: 150 },
];

// "Care for Wildlife" deck (replaces Community Chest). Text: game.chestCards[i].
export const CHEST_CARDS: readonly CardEffect[] = [
  { kind: "advance", to: 0 },
  { kind: "collect", amount: 200 },
  { kind: "pay", amount: 50 },
  { kind: "collect", amount: 50 },
  { kind: "jailFree" },
  { kind: "jail" },
  { kind: "collect", amount: 100 },
  { kind: "collect", amount: 20 },
  { kind: "collectEach", amount: 10 },
  { kind: "collect", amount: 100 },
  { kind: "pay", amount: 100 },
  { kind: "pay", amount: 50 },
  { kind: "collect", amount: 25 },
  { kind: "repairs", house: 40, hotel: 115 },
  { kind: "collect", amount: 10 },
  { kind: "collect", amount: 100 },
];
