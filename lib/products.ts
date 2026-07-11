export type ProductCategory = "qixi" | "birthday" | "custom";
export type ProductCode =
  | "qixi_4_inch"
  | "qixi_6_inch"
  | "birthday_4_inch"
  | "birthday_6_inch"
  | "kids_theme"
  | "celebration"
  | "corporate"
  | "custom_theme"
  | "storybook_hotwheels"
  | "storybook_pilot"
  | "storybook_dino"
  | "storybook_ocean"
  | "storybook_game"
  | "storybook_starlight"
  | "storybook_ballet"
  | "storybook_elsa"
  | "storybook_unicorn"
  | "storybook_butterfly";

export const storybookThemeKeys = [
  "hotwheels",
  "pilot",
  "dino",
  "ocean",
  "game",
  "starlight",
  "ballet",
  "elsa",
  "unicorn",
  "butterfly",
] as const;
export type StorybookThemeKey = (typeof storybookThemeKeys)[number];

export function storybookProductCode(theme: StorybookThemeKey): ProductCode {
  return `storybook_${theme}` as ProductCode;
}

export type Product = {
  code: ProductCode;
  name: string;
  basePrice: number;
  priceLabel: string;
  category: ProductCategory;
  description: string;
  badge?: string;
};

export const qixiProducts = [
  {
    code: "qixi_4_inch",
    name: 'Qixi Mini Cake 4"',
    basePrice: 77,
    priceLabel: "S$77",
    category: "qixi",
    description: "Petite romantic cake with photo frame, printed photo, gift box.",
  },
  {
    code: "qixi_6_inch",
    name: 'Qixi Signature Cake 6"',
    basePrice: 117,
    priceLabel: "S$117",
    category: "qixi",
    description: "Most giftable size for couples, with photo frame, printed photo, gift box, and preserved flowers.",
    badge: "Most Popular",
  },
] as const satisfies readonly Product[];

export const customProducts = [
  {
    code: "birthday_4_inch",
    name: 'Classic Birthday Cake 4"',
    basePrice: 77,
    priceLabel: "From S$77",
    category: "birthday",
    description: "A warm handmade birthday cake for a small celebration.",
  },
  {
    code: "birthday_6_inch",
    name: 'Signature Birthday Cake 6"',
    basePrice: 117,
    priceLabel: "From S$117",
    category: "birthday",
    description: "A signature size for friends, family, and surprise deliveries.",
  },
  {
    code: "kids_theme",
    name: "Kids Theme Cake",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "custom",
    description: "Soft colors, playful details, and theme-led decoration.",
  },
  {
    code: "celebration",
    name: "Family / Couple Celebration Cake",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "custom",
    description: "Designed for anniversaries, family days, and couple gifts.",
  },
  {
    code: "corporate",
    name: "Corporate Celebration Cake",
    basePrice: 177,
    priceLabel: "From S$177",
    category: "custom",
    description: "Brand-friendly cake for team celebrations and office gifting.",
  },
  {
    code: "custom_theme",
    name: "Custom Theme Cake",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "custom",
    description: "A flexible custom cake brief for themes not listed above.",
  },
] as const satisfies readonly Product[];

export const storybookProducts = [
  {
    code: "storybook_hotwheels",
    name: "Hot Wheels Birthday Storybook",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "birthday",
    description: "Racing-themed party set for ages 4-8, with checkered-flag cream and a matching cake.",
  },
  {
    code: "storybook_pilot",
    name: "Sky Captain Birthday Storybook",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "birthday",
    description: "Aviation-themed party set for ages 3-7, with cloud cream and a little airplane.",
  },
  {
    code: "storybook_dino",
    name: "Little Dino Birthday Storybook",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "birthday",
    description: "Dinosaur-themed party set for ages 1-4, with jungle-green cream and a dino topper.",
  },
  {
    code: "storybook_ocean",
    name: "Ocean Voyage Birthday Storybook",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "birthday",
    description: "Ocean-themed party set for ages 2-6, with wave cream and a little sailboat.",
  },
  {
    code: "storybook_game",
    name: "Game On Birthday Storybook",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "birthday",
    description: "Video-game-themed party set for ages 8-12, with pixel details and a controller topper.",
  },
  {
    code: "storybook_starlight",
    name: "Starlight Birthday Storybook",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "birthday",
    description: "Starlight-themed party set for ages 1-4, with moonlight cream and gold stars.",
  },
  {
    code: "storybook_ballet",
    name: "Ballet Blush Birthday Storybook",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "birthday",
    description: "Ballet-themed party set for ages 2-6, with blush tutu-ruffle cream and satin ribbon.",
  },
  {
    code: "storybook_elsa",
    name: "Elsa Princess Birthday Storybook",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "birthday",
    description: "Ice-princess-themed party set for ages 3-7, with icy-blue cream and a snowflake motif.",
  },
  {
    code: "storybook_unicorn",
    name: "Unicorn Dream Birthday Storybook",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "birthday",
    description: "Unicorn-themed party set for ages 4-8, with lavender cloud cream and a gold horn.",
  },
  {
    code: "storybook_butterfly",
    name: "Butterfly Garden Birthday Storybook",
    basePrice: 157,
    priceLabel: "From S$157",
    category: "birthday",
    description: "Butterfly-garden-themed party set for ages 8-12, with cream petals and paper butterflies.",
  },
] as const satisfies readonly Product[];

export const products = [...qixiProducts, ...customProducts, ...storybookProducts] as const;

export function getProduct(code: string): Product | undefined {
  return products.find((product) => product.code === code);
}

export function getProductsForMode(mode: "qixi" | "custom"): readonly Product[] {
  return mode === "qixi" ? qixiProducts : customProducts;
}
