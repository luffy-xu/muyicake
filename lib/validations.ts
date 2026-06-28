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

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));
const optionalAttributionText = z.string().trim().max(1000).optional().or(z.literal(""));

export const reservationCreateSchema = z
  .object({
    locale: localeSchema.default("zh"),
    sourcePage: sourcePageSchema,
    reservationCategory: reservationCategorySchema,
    productCode: z.string().trim().min(1),
    productName: z.string().trim().min(1),
    basePrice: z.coerce.number().int().positive(),
    currency: z.literal("SGD").default("SGD"),
    whatsapp: z.string().trim().min(8).max(20).regex(/^[+\d\s-]+$/, "Use a valid WhatsApp number."),
    customerName: z.string().trim().min(2).max(80),
    deliveryDate: z.string().trim().min(1),
    deliveryArea: z.string().trim().min(2).max(120),
    deliveryAddress: optionalText,
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
  });

export const reservationUpdateSchema = z.object({
  status: statusSchema.optional(),
  confirmedDeliverySlot: z.enum(deliverySlots).optional().or(z.literal("")),
  adminNote: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type ReservationCreateInput = z.infer<typeof reservationCreateSchema>;
export type ReservationCreateFormValues = z.input<typeof reservationCreateSchema>;
export type ReservationUpdateInput = z.infer<typeof reservationUpdateSchema>;

export type Reservation = Omit<ReservationCreateInput, "website"> & {
  id: string;
  status: (typeof statusValues)[number];
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
};
