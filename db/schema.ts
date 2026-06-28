import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const reservations = pgTable("reservations", {
  id: text("id").primaryKey(),
  sourcePage: text("source_page").notNull(),
  reservationCategory: text("reservation_category").notNull(),
  productCode: text("product_code").notNull(),
  productName: text("product_name").notNull(),
  basePrice: integer("base_price").notNull(),
  currency: text("currency").default("SGD").notNull(),
  whatsapp: text("whatsapp").notNull(),
  customerName: text("customer_name").notNull(),
  deliveryDate: text("delivery_date").notNull(),
  deliveryArea: text("delivery_area").notNull(),
  deliveryAddress: text("delivery_address"),
  confirmedDeliverySlot: text("confirmed_delivery_slot"),
  cakeMessage: text("cake_message"),
  recipientName: text("recipient_name"),
  age: text("age"),
  flavourPreference: text("flavour_preference"),
  preferredColor: text("preferred_color"),
  stylePreference: text("style_preference"),
  budgetRange: text("budget_range"),
  photoService: text("photo_service"),
  referenceImageUrl: text("reference_image_url"),
  allergyNote: text("allergy_note"),
  notes: text("notes"),
  isInterestedInMembership: boolean("is_interested_in_membership")
    .default(false)
    .notNull(),
  status: text("status").default("new").notNull(),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ReservationRow = typeof reservations.$inferSelect;
