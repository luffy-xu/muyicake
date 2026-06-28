export type ProductCategory = "qixi" | "birthday" | "custom";
export type ProductCode =
  | "qixi_4_inch"
  | "qixi_6_inch"
  | "birthday_4_inch"
  | "birthday_6_inch"
  | "kids_theme"
  | "celebration"
  | "corporate"
  | "custom_theme";

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
    description: "Most giftable size for couples, including the full Qixi set.",
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

export const products = [...qixiProducts, ...customProducts] as const;

export function getProduct(code: string): Product | undefined {
  return products.find((product) => product.code === code);
}

export function getProductsForMode(mode: "qixi" | "custom"): readonly Product[] {
  return mode === "qixi" ? qixiProducts : customProducts;
}
