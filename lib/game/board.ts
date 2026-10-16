// Board data for the car-edition property trading game, laid out like the
// 52-space Mega Edition: three or four cars per colour set, four expressways,
// three utilities, plus the Car Auction, Bus Ticket and Birthday Gift spaces.
// Display names live in lib/i18n.ts under `game.spaces` (same index order).

export type ColorGroup = "brown" | "lightBlue" | "pink" | "orange" | "red" | "yellow" | "green" | "darkBlue";

// Rent by building level: unimproved, 1-4 garages, showroom, auto tower.
export type RentTable = readonly [number, number, number, number, number, number, number];

export type Space =
  | { kind: "go" }
  | { kind: "property"; group: ColorGroup; price: number; houseCost: number; rent: RentTable }
  | { kind: "railroad"; price: number }
  | { kind: "utility"; price: number }
  | { kind: "chance" }
  | { kind: "chest" }
  | { kind: "tax"; amount: number }
  | { kind: "jail" }
  | { kind: "freeParking" }
  | { kind: "goToJail" }
  | { kind: "auction" }
  | { kind: "busTicket" }
  | { kind: "birthday" };

// The auto tower (skyscraper) rents for 1.5× the showroom, rounded to $5.
const p = (
  group: ColorGroup,
  price: number,
  houseCost: number,
  rent: readonly [number, number, number, number, number, number],
): Space => ({
  kind: "property",
  group,
  price,
  houseCost,
  rent: [...rent, Math.round((rent[5] * 1.5) / 5) * 5] as unknown as RentTable,
});

export const BOARD: readonly Space[] = [
  // Bottom side: GO → Jail
  { kind: "go" },
  p("brown", 60, 50, [2, 10, 30, 90, 160, 250]),
  { kind: "chest" },
  p("brown", 60, 50, [4, 20, 60, 180, 320, 450]),
  p("brown", 80, 50, [5, 30, 80, 240, 360, 500]),
  { kind: "tax", amount: 200 },
  { kind: "railroad", price: 200 },
  p("lightBlue", 100, 50, [6, 30, 90, 270, 400, 550]),
  p("lightBlue", 100, 50, [6, 30, 90, 270, 400, 550]),
  { kind: "chance" },
  { kind: "utility", price: 150 },
  p("lightBlue", 100, 50, [6, 30, 90, 270, 400, 550]),
  p("lightBlue", 120, 50, [8, 40, 100, 300, 450, 600]),
  // Left side: Jail → Free Parking
  { kind: "jail" },
  { kind: "auction" },
  p("pink", 140, 100, [10, 50, 150, 450, 625, 750]),
  p("pink", 140, 100, [10, 50, 150, 450, 625, 750]),
  { kind: "utility", price: 150 },
  p("pink", 140, 100, [10, 50, 150, 450, 625, 750]),
  p("pink", 160, 100, [12, 60, 180, 500, 700, 900]),
  { kind: "railroad", price: 200 },
  p("orange", 180, 100, [14, 70, 200, 550, 750, 950]),
  { kind: "chest" },
  p("orange", 180, 100, [14, 70, 200, 550, 750, 950]),
  p("orange", 200, 100, [16, 80, 220, 600, 800, 1000]),
  p("orange", 200, 100, [16, 80, 220, 600, 800, 1000]),
  // Top side: Free Parking → Go to Jail
  { kind: "freeParking" },
  p("red", 220, 150, [18, 90, 250, 700, 875, 1050]),
  { kind: "chance" },
  p("red", 220, 150, [18, 90, 250, 700, 875, 1050]),
  p("red", 240, 150, [20, 100, 300, 750, 925, 1100]),
  p("red", 240, 150, [20, 100, 300, 750, 925, 1100]),
  { kind: "busTicket" },
  { kind: "railroad", price: 200 },
  p("yellow", 260, 150, [22, 110, 330, 800, 975, 1150]),
  p("yellow", 260, 150, [22, 110, 330, 800, 975, 1150]),
  { kind: "utility", price: 150 },
  p("yellow", 280, 150, [24, 120, 360, 850, 1025, 1200]),
  p("yellow", 280, 150, [24, 120, 360, 850, 1025, 1200]),
  // Right side: Go to Jail → GO
  { kind: "goToJail" },
  p("green", 300, 200, [26, 130, 390, 900, 1100, 1275]),
  p("green", 300, 200, [26, 130, 390, 900, 1100, 1275]),
  p("green", 300, 200, [26, 130, 390, 900, 1100, 1275]),
  { kind: "chest" },
  p("green", 320, 200, [28, 150, 450, 1000, 1200, 1400]),
  { kind: "railroad", price: 200 },
  { kind: "chance" },
  { kind: "birthday" },
  p("darkBlue", 350, 200, [35, 175, 500, 1100, 1300, 1500]),
  p("darkBlue", 350, 200, [35, 175, 500, 1100, 1300, 1500]),
  { kind: "tax", amount: 100 },
  p("darkBlue", 400, 200, [50, 200, 600, 1400, 1700, 2000]),
];

export const BOARD_SIZE = BOARD.length;
export const SIDE_LENGTH = BOARD_SIZE / 4;

export const SPACE_ICONS: readonly string[] = [
  "➡️", "🛺", "🔧", "🚗", "🚘", "💰", "🛣️", "🚙", "🚘", "🎲", "🔌", "🚗", "🚙",
  "🔒", "🔨", "🚐", "🚐", "⛽", "🚙", "🛻", "🛣️", "🔋", "🔧", "🌱", "🚘", "☀️",
  "🅿️", "🚗", "🎲", "🚘", "🚙", "🏎️", "🎫", "🛣️", "🏎️", "🏎️", "🧽", "🚘", "🏎️",
  "👮", "🚘", "🏎️", "🚀", "🔧", "🏎️", "🛣️", "🎲", "🎁", "🚀", "🏎️", "💰", "🏆",
];

export const GROUP_COLORS: Record<ColorGroup, string> = {
  brown: "#8B5A2B",
  lightBlue: "#9ED3F0",
  pink: "#D63E8C",
  orange: "#F39A1E",
  red: "#E2342D",
  yellow: "#F7DF2D",
  green: "#1F9E55",
  darkBlue: "#1E4FA1",
};

export const TOKENS = ["raceCar", "taxi", "suv", "pickup", "motorbike", "bus"] as const;
export type TokenId = (typeof TOKENS)[number];

export const TOKEN_ICONS: Record<TokenId, string> = {
  raceCar: "🏎️",
  taxi: "🚕",
  suv: "🚙",
  pickup: "🛻",
  motorbike: "🏍️",
  bus: "🚌",
};

export const PLAYER_COLORS = ["#E2342D", "#1E4FA1", "#1F9E55", "#F39A1E", "#8E44AD", "#2B1E1A"];

export const JAIL_POS = 13;
export const GO_SALARY = 200;
export const JAIL_FINE = 50;
export const STARTING_CASH = 2500;
export const BIRTHDAY_GIFT = 100;
export const DEPOT_COST = 100;
export const TOTAL_HOUSES = 48;
export const TOTAL_HOTELS = 16;
export const TOTAL_SKYSCRAPERS = 8;

// Building levels stored on a deed: 1-4 garages, 5 showroom, 6 auto tower.
export const HOTEL_LEVEL = 5;
export const SKYSCRAPER_LEVEL = 6;

// Speed die faces: 1, 2, 3, two Turbo faces (Mr. Monopoly) and one Bus face.
export type Speed = 1 | 2 | 3 | "turbo" | "bus";
export const SPEED_FACES: readonly Speed[] = [1, 2, 3, "turbo", "turbo", "bus"];

// Bus ticket deck: 0 = ordinary ticket, 1 = ticket that makes everyone else's tickets expire.
export type BusTicket = 0 | 1;
export const BUS_TICKETS: readonly BusTicket[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1];

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

// Spaces ahead of `pos` up to and including the next corner (a bus ticket's range).
export function busDestinations(pos: number) {
  const sideEnd = (Math.floor(pos / SIDE_LENGTH) + 1) * SIDE_LENGTH;
  return Array.from({ length: sideEnd - pos }, (_, i) => (pos + 1 + i) % BOARD_SIZE);
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

// "Joyride" deck (replaces Chance). Text: game.chanceCards[i].
export const CHANCE_CARDS: readonly CardEffect[] = [
  { kind: "advance", to: 0 },
  { kind: "advance", to: 51 },
  { kind: "advance", to: 30 },
  { kind: "advance", to: 16 },
  { kind: "nearestRailroad" },
  { kind: "nearestRailroad" },
  { kind: "nearestUtility" },
  { kind: "collect", amount: 50 },
  { kind: "jailFree" },
  { kind: "back", spaces: 3 },
  { kind: "jail" },
  { kind: "repairs", house: 25, hotel: 100 },
  { kind: "pay", amount: 15 },
  { kind: "advance", to: 6 },
  { kind: "payEach", amount: 50 },
  { kind: "collect", amount: 150 },
];

// "Pit Stop" deck (replaces Community Chest). Text: game.chestCards[i].
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
