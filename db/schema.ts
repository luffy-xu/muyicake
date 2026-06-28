import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const customers = pgTable("customers", {
  whatsappKey: text("whatsapp_key").primaryKey(),
  whatsappDisplay: text("whatsapp_display").notNull(),
  name: text("name").notNull(),
  firstReservationId: text("first_reservation_id"),
  latestReservationId: text("latest_reservation_id"),
  reservationCount: integer("reservation_count").default(0).notNull(),
  completedReservationCount: integer("completed_reservation_count")
    .default(0)
    .notNull(),
  cancelledReservationCount: integer("cancelled_reservation_count")
    .default(0)
    .notNull(),
  totalQuotedBasePrice: integer("total_quoted_base_price").default(0).notNull(),
  preferredDeliveryArea: text("preferred_delivery_area"),
  preferredProductCategory: text("preferred_product_category"),
  lastStatus: text("last_status"),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
  id: text("id").primaryKey(),
  locale: text("locale").default("zh").notNull(),
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
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  referrer: text("referrer"),
  landingPath: text("landing_path"),
  isInterestedInMembership: boolean("is_interested_in_membership")
    .default(false)
    .notNull(),
  status: text("status").default("new").notNull(),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CustomerRow = typeof customers.$inferSelect;
export type ReservationRow = typeof reservations.$inferSelect;
