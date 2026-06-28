import { z } from "zod";
import { getProduct } from "@/lib/products";

export const statusValues = [
  "new",
  "contacted",
  "design_confirmed",
  "price_confirmed",
  "delivery_time_confirmed",
  "in_production",
  "out_for_delivery",
  "completed",
  "cancelled",
] as const;

export const deliverySlots = [
  "10:00 AM - 1:00 PM",
  "1:00 PM - 4:00 PM",
  "4:00 PM - 7:00 PM",
  "7:00 PM - 9:00 PM",
] as const;

export const reservationCategorySchema = z.enum(["qixi", "birthday", "custom"]);
export const sourcePageSchema = z.enum(["home", "qixi", "custom"]);
export const statusSchema = z.enum(statusValues);
export const localeSchema = z.enum(["zh", "en"]);
export const catalogCollectionTypeSchema = z.enum(["qixi", "birthday", "custom"]);
export const catalogImageTypeSchema = z.enum(["main", "gallery", "detail"]);

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));
const optionalAttributionText = z.string().trim().max(1000).optional().or(z.literal(""));
const optionalId = z.string().trim().max(120).optional().or(z.literal(""));
const optionalCatalogText = z.string().trim().max(2000).optional().or(z.literal(""));
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.");
const dateStringRegex = /^\d{4}-\d{2}-\d{2}$/;

export const earliestDeliveryDate = "2026-08-18";

export function getSingaporeDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addDaysToDateString(value: string, days: number) {
  const date = new Date(`${value}T00:00:00+08:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getMinimumDeliveryDate(date = new Date()) {
  const tomorrow = addDaysToDateString(getSingaporeDateString(date), 1);
  return tomorrow > earliestDeliveryDate ? tomorrow : earliestDeliveryDate;
}

export function extractSingaporePostalCode(value: string | undefined) {
  return value?.match(/(?:singapore\s*)?(\d{6})\b/i)?.[1];
}

function hasSingaporeAddressShape(value: string | undefined) {
  if (!value) {
    return false;
  }
  const postalCode = extractSingaporePostalCode(value);
  if (!postalCode) {
    return false;
  }
  return /\d/.test(value.replace(postalCode, ""));
}

function isValidDateString(value: string) {
  if (!dateStringRegex.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const reservationCreateSchema = z
  .object({
    locale: localeSchema.default("zh"),
    sourcePage: sourcePageSchema,
    reservationCategory: reservationCategorySchema,
    productCode: z.string().trim().min(1),
    productName: z.string().trim().min(1),
    basePrice: z.coerce.number().int().positive(),
    currency: z.literal("SGD").default("SGD"),
    selectedCollectionId: optionalId,
    selectedStyleId: optionalId,
    selectedStyleName: z.string().trim().max(160).optional().or(z.literal("")),
    selectedSizeOptionId: optionalId,
    selectedSizeLabel: z.string().trim().max(80).optional().or(z.literal("")),
    selectedPrice: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce.number().int().positive().optional(),
    ),
    whatsapp: z.string().trim().min(8).max(20).regex(/^[+\d\s-]+$/, "Use a valid WhatsApp number."),
    customerName: z.string().trim().min(2).max(80),
    deliveryDate: z.string().trim().min(1),
    deliveryArea: optionalText,
    deliveryAddress: z.string().trim().min(8).max(500),
    confirmedDeliverySlot: optionalText,
    cakeMessage: optionalText,
    recipientName: optionalText,
    age: optionalText,
    flavourPreference: optionalText,
    preferredColor: optionalText,
    stylePreference: optionalText,
    budgetRange: optionalText,
    photoService: optionalText,
    referenceImageUrl: optionalText,
    allergyNote: optionalText,
    notes: optionalText,
    utmSource: optionalAttributionText,
    utmMedium: optionalAttributionText,
    utmCampaign: optionalAttributionText,
    referrer: optionalAttributionText,
    landingPath: optionalAttributionText,
    isInterestedInMembership: z.coerce.boolean().default(false),
    website: z.string().max(0).optional(),
  })
  .superRefine((data, ctx) => {
    const product = getProduct(data.productCode);

    if (!product) {
      ctx.addIssue({
        code: "custom",
        path: ["productCode"],
        message: "Choose a valid cake product.",
      });
      return;
    }

    if (data.reservationCategory === "qixi" && product.category !== "qixi") {
      ctx.addIssue({
        code: "custom",
        path: ["productCode"],
        message: "Choose a valid Qixi cake.",
      });
    }

    if (data.reservationCategory !== "qixi" && product.category === "qixi") {
      ctx.addIssue({
        code: "custom",
        path: ["productCode"],
        message: "Choose a valid custom cake.",
      });
    }

    if (product.name !== data.productName || product.basePrice !== data.basePrice) {
      ctx.addIssue({
        code: "custom",
        path: ["productName"],
        message: "Product details do not match our current menu.",
      });
    }

    if (!isValidDateString(data.deliveryDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryDate"],
        message: "Choose a valid delivery date.",
      });
    } else if (data.deliveryDate < getMinimumDeliveryDate()) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryDate"],
        message: "Choose a later delivery date.",
      });
    }

    if (!hasSingaporeAddressShape(data.deliveryAddress)) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryAddress"],
        message: "Enter a Singapore address with a block/house number and 6-digit postal code.",
      });
    }
  })
  .transform((data) => ({
    ...data,
    deliveryArea: extractSingaporePostalCode(data.deliveryAddress) ?? data.deliveryArea ?? "",
  }));

export const reservationUpdateSchema = z.object({
  status: statusSchema.optional(),
  confirmedDeliverySlot: z.enum(deliverySlots).optional().or(z.literal("")),
  adminNote: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const cakeCollectionSchema = z.object({
  slug: slugSchema,
  titleZh: z.string().trim().min(1).max(160),
  titleEn: z.string().trim().min(1).max(160),
  descriptionZh: optionalCatalogText,
  descriptionEn: optionalCatalogText,
  type: catalogCollectionTypeSchema,
  coverImageUrl: z.string().trim().url().optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const cakeStyleSchema = z.object({
  collectionId: optionalId,
  slug: slugSchema,
  nameZh: z.string().trim().min(1).max(160),
  nameEn: z.string().trim().min(1).max(160),
  subtitleZh: z.string().trim().max(240).optional().or(z.literal("")),
  subtitleEn: z.string().trim().max(240).optional().or(z.literal("")),
  descriptionZh: optionalCatalogText,
  descriptionEn: optionalCatalogText,
  mainImageUrl: z.string().trim().url().optional().or(z.literal("")),
  badgeZh: z.string().trim().max(80).optional().or(z.literal("")),
  badgeEn: z.string().trim().max(80).optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const cakeStyleImageSchema = z.object({
  styleId: z.string().trim().min(1),
  imageUrl: z.string().trim().url(),
  altZh: z.string().trim().max(160).optional().or(z.literal("")),
  altEn: z.string().trim().max(160).optional().or(z.literal("")),
  imageType: catalogImageTypeSchema.default("gallery"),
  sortOrder: z.coerce.number().int().default(0),
});

export const cakeStyleSectionSchema = z.object({
  styleId: z.string().trim().min(1),
  sectionKey: slugSchema,
  titleZh: z.string().trim().min(1).max(160),
  titleEn: z.string().trim().min(1).max(160),
  bodyZh: optionalCatalogText,
  bodyEn: optionalCatalogText,
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const cakeSizeOptionSchema = z.object({
  styleId: z.string().trim().min(1),
  sizeLabel: z.string().trim().min(1).max(80),
  servingsZh: z.string().trim().max(160).optional().or(z.literal("")),
  servingsEn: z.string().trim().max(160).optional().or(z.literal("")),
  price: z.coerce.number().int().positive(),
  currency: z.literal("SGD").default("SGD"),
  isDefault: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const adminCatalogActionSchema = z.object({
  action: z.enum([
    "createCollection",
    "updateCollection",
    "toggleCollection",
    "deleteCollection",
    "createStyle",
    "updateStyle",
    "toggleStyle",
    "deleteStyle",
    "updateStyleMainImage",
    "createImage",
    "updateImage",
    "deleteImage",
    "createSection",
    "updateSection",
    "deleteSection",
    "createSize",
    "updateSize",
    "deleteSize",
  ]),
  id: z.string().trim().optional(),
});

export type ReservationCreateInput = z.infer<typeof reservationCreateSchema>;
export type ReservationCreateFormValues = z.input<typeof reservationCreateSchema>;
export type ReservationUpdateInput = z.infer<typeof reservationUpdateSchema>;
export type CakeCollectionInput = z.infer<typeof cakeCollectionSchema>;
export type CakeStyleInput = z.infer<typeof cakeStyleSchema>;
export type CakeStyleImageInput = z.infer<typeof cakeStyleImageSchema>;
export type CakeStyleSectionInput = z.infer<typeof cakeStyleSectionSchema>;
export type CakeSizeOptionInput = z.infer<typeof cakeSizeOptionSchema>;

export type Reservation = Omit<ReservationCreateInput, "website"> & {
  id: string;
  status: (typeof statusValues)[number];
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
};
