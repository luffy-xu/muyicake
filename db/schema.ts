import { boolean, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

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
  selectedCollectionId: text("selected_collection_id"),
  selectedStyleId: text("selected_style_id"),
  selectedStyleName: text("selected_style_name"),
  selectedSizeOptionId: text("selected_size_option_id"),
  selectedSizeLabel: text("selected_size_label"),
  selectedPrice: integer("selected_price"),
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

export const cakeCollections = pgTable("cake_collections", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleZh: text("title_zh").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionZh: text("description_zh"),
  descriptionEn: text("description_en"),
  type: text("type").notNull(),
  coverImageUrl: text("cover_image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cakeStyles = pgTable(
  "cake_styles",
  {
    id: text("id").primaryKey(),
    collectionId: text("collection_id").references(() => cakeCollections.id, {
      onDelete: "cascade",
    }),
    slug: text("slug").notNull(),
    nameZh: text("name_zh").notNull(),
    nameEn: text("name_en").notNull(),
    subtitleZh: text("subtitle_zh"),
    subtitleEn: text("subtitle_en"),
    descriptionZh: text("description_zh"),
    descriptionEn: text("description_en"),
    mainImageUrl: text("main_image_url"),
    badgeZh: text("badge_zh"),
    badgeEn: text("badge_en"),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("cake_styles_collection_slug_unique").on(table.collectionId, table.slug)],
);

export const cakeStyleImages = pgTable("cake_style_images", {
  id: text("id").primaryKey(),
  styleId: text("style_id").references(() => cakeStyles.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  altZh: text("alt_zh"),
  altEn: text("alt_en"),
  imageType: text("image_type").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cakeStyleSections = pgTable("cake_style_sections", {
  id: text("id").primaryKey(),
  styleId: text("style_id").references(() => cakeStyles.id, { onDelete: "cascade" }),
  sectionKey: text("section_key").notNull(),
  titleZh: text("title_zh").notNull(),
  titleEn: text("title_en").notNull(),
  bodyZh: text("body_zh"),
  bodyEn: text("body_en"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cakeSizeOptions = pgTable("cake_size_options", {
  id: text("id").primaryKey(),
  styleId: text("style_id").references(() => cakeStyles.id, { onDelete: "cascade" }),
  sizeLabel: text("size_label").notNull(),
  servingsZh: text("servings_zh"),
  servingsEn: text("servings_en"),
  price: integer("price").notNull(),
  currency: text("currency").default("SGD").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CustomerRow = typeof customers.$inferSelect;
export type ReservationRow = typeof reservations.$inferSelect;
export type CakeCollectionRow = typeof cakeCollections.$inferSelect;
export type CakeStyleRow = typeof cakeStyles.$inferSelect;
export type CakeStyleImageRow = typeof cakeStyleImages.$inferSelect;
export type CakeStyleSectionRow = typeof cakeStyleSections.$inferSelect;
export type CakeSizeOptionRow = typeof cakeSizeOptions.$inferSelect;
