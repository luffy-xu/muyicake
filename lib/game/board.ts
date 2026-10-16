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

// Rent rows of the classic deeds, used as anchors: every car's rent is interpolated
// from its price, so a pricier (better) car always earns more rent at every level.
const RENT_ANCHORS: readonly (readonly [number, readonly [number, number, number, number, number, number]])[] = [
  [60, [2, 10, 30, 90, 160, 250]],
  [100, [6, 30, 90, 270, 400, 550]],
  [120, [8, 40, 100, 300, 450, 600]],
  [140, [10, 50, 150, 450, 625, 750]],
  [160, [12, 60, 180, 500, 700, 900]],
  [180, [14, 70, 200, 550, 750, 950]],
  [200, [16, 80, 220, 600, 800, 1000]],
  [220, [18, 90, 250, 700, 875, 1050]],
  [240, [20, 100, 300, 750, 925, 1100]],
  [260, [22, 110, 330, 800, 975, 1150]],
  [280, [24, 120, 360, 850, 1025, 1200]],
  [300, [26, 130, 390, 900, 1100, 1275]],
  [320, [28, 150, 450, 1000, 1200, 1400]],
  [350, [35, 175, 500, 1100, 1300, 1500]],
  [400, [50, 200, 600, 1400, 1700, 2000]],
];

export function rentTableFor(price: number): RentTable {
  const hi = RENT_ANCHORS.findIndex(([anchor]) => anchor >= price);
  const [p1, r1] = RENT_ANCHORS[Math.max(0, hi - 1)];
  const [p2, r2] = RENT_ANCHORS[Math.max(0, hi)];
  const f = p2 === p1 ? 0 : (price - p1) / (p2 - p1);
  const rent = r1.map((v, i) => {
    const x = v + (r2[i] - v) * f;
    return i === 0 ? Math.round(x) : Math.round(x / 5) * 5;
  });
  // The auto tower (skyscraper) rents for 1.5× the showroom, rounded to $5.
  return [...rent, Math.round((rent[5] * 1.5) / 5) * 5] as unknown as RentTable;
}

const HOUSE_COST: Record<ColorGroup, number> = {
  brown: 50,
  lightBlue: 50,
  pink: 100,
  orange: 100,
  red: 150,
  yellow: 150,
  green: 200,
  darkBlue: 200,
};

const car = (group: ColorGroup, price: number): Space => ({
  kind: "property",
  group,
  price,
  houseCost: HOUSE_COST[group],
  rent: rentTableFor(price),
});

// Cars get pricier around the board, from a mini car to an F1 car; every car has its own price.
export const BOARD: readonly Space[] = [
  // Bottom side: GO → Jail
  { kind: "go" },
  car("brown", 60), // Mini Car
  { kind: "chest" },
  car("brown", 70), // City Car
  car("brown", 80), // Hatchback
  { kind: "tax", amount: 200 },
  { kind: "railroad", price: 200 },
  car("lightBlue", 100), // Compact Sedan
  car("lightBlue", 110), // Family Sedan
  { kind: "chance" },
  { kind: "utility", price: 150 },
  car("lightBlue", 120), // Station Wagon
  car("lightBlue", 130), // Crossover
  // Left side: Jail → Free Parking
  { kind: "jail" },
  { kind: "auction" },
  car("pink", 140), // Minivan
  car("pink", 150), // Pickup Truck
  { kind: "utility", price: 150 },
  car("pink", 160), // SUV
  car("pink", 170), // Camper Van
  { kind: "railroad", price: 200 },
  car("orange", 180), // Hybrid
  { kind: "chest" },
  car("orange", 190), // Electric Car
  car("orange", 200), // Convertible
  car("orange", 210), // Luxury Sedan
  // Top side: Free Parking → Go to Jail
  { kind: "freeParking" },
  car("red", 220), // Muscle Car
  { kind: "chance" },
  car("red", 230), // Drift Car
  car("red", 240), // Rally Car
  car("red", 250), // Classic Roadster
  { kind: "busTicket" },
  { kind: "railroad", price: 200 },
  car("yellow", 260), // Sports Coupe
  car("yellow", 270), // Grand Tourer
  { kind: "utility", price: 150 },
  car("yellow", 280), // Track Car
  car("yellow", 290), // Limousine
  // Right side: Go to Jail → GO
  { kind: "goToJail" },
  car("green", 300), // Supercar
  car("green", 310), // Concept Car
  car("green", 320), // Land Speed Car
  { kind: "chest" },
  car("green", 330), // Le Mans Racer
  { kind: "railroad", price: 200 },
  { kind: "chance" },
  { kind: "birthday" },
  car("darkBlue", 350), // Hypercar
  car("darkBlue", 375), // Formula E Car
  { kind: "tax", amount: 100 },
  car("darkBlue", 400), // F1 Race Car
];

export const BOARD_SIZE = BOARD.length;
export const SIDE_LENGTH = BOARD_SIZE / 4;

export const SPACE_ICONS: readonly string[] = [
  "➡️", "🛺", "🔧", "🚘", "🚗", "💰", "🛣️", "🚘", "🚗", "🎲", "🔌", "🚙", "🚙",
  "🔒", "🔨", "🚐", "🛻", "⛽", "🚙", "🚐", "🛣️", "🌱", "🔧", "🔋", "🚘", "🚘",
  "🅿️", "🚗", "🎲", "🚗", "🚙", "🚘", "🎫", "🛣️", "🏎️", "🏎️", "🧽", "🏎️", "🚘",
  "👮", "🏎️", "🚀", "🚀", "🔧", "🏎️", "🛣️", "🎲", "🎁", "🏎️", "⚡", "💰", "🏆",
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
// Players pick the starting money at setup; $2500 (the Mega Edition amount) is the maximum.
export const STARTING_CASH_OPTIONS: readonly number[] = [1000, 1500, 2000, 2500];
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
  { kind: "advance", to: 15 },
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
