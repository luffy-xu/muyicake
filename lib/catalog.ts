import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray } from "drizzle-orm";
import {
  cakeCollections,
  cakeSizeOptions,
  cakeStyleImages,
  cakeStyleSections,
  cakeStyles,
  type CakeCollectionRow,
  type CakeSizeOptionRow,
  type CakeStyleImageRow,
  type CakeStyleRow,
  type CakeStyleSectionRow,
} from "@/db/schema";
import { getDb } from "@/lib/db";
import type { Locale } from "@/lib/i18n";
import type {
  CakeCollectionInput,
  CakeSizeOptionInput,
  CakeStyleImageInput,
  CakeStyleInput,
  CakeStyleSectionInput,
} from "@/lib/validations";

export type PublicCollection = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: "qixi" | "birthday" | "custom";
  coverImageUrl?: string;
};

export type PublicStyleSummary = {
  id: string;
  collectionId: string | null;
  collectionSlug?: string;
  slug: string;
  name: string;
  subtitle?: string;
  description?: string;
  mainImageUrl?: string;
  badge?: string;
  startingPrice?: number;
  currency: string;
};

export type PublicStyleDetail = PublicStyleSummary & {
  galleryImages: PublicStyleImage[];
  sections: PublicStyleSection[];
  sizeOptions: PublicSizeOption[];
};

export type PublicStyleImage = {
  id: string;
  imageUrl: string;
  alt?: string;
  imageType: string;
};

export type PublicStyleSection = {
  id: string;
  sectionKey: string;
  title: string;
  body?: string;
};

export type PublicSizeOption = {
  id: string;
  sizeLabel: string;
  servings?: string;
  price: number;
  currency: string;
  isDefault: boolean;
};

function createId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 18)}`;
}

function nullable(value: string | undefined) {
  return value ? value : null;
}

function assertCatalogDb() {
  const db = getDb();
  if (!db) {
    throw new Error("DATABASE_URL is required for catalog administration.");
  }
  return db;
}

export function mapPublicCollection(row: CakeCollectionRow, locale: Locale): PublicCollection {
  return {
    id: row.id,
    slug: row.slug,
    title: locale === "en" ? row.titleEn : row.titleZh,
    description: (locale === "en" ? row.descriptionEn : row.descriptionZh) ?? undefined,
    type: row.type as PublicCollection["type"],
    coverImageUrl: row.coverImageUrl ?? undefined,
  };
}

export function mapPublicStyle(
  row: CakeStyleRow,
  locale: Locale,
  startingPrice?: number,
  collectionSlug?: string,
): PublicStyleSummary {
  return {
    id: row.id,
    collectionId: row.collectionId,
    collectionSlug,
    slug: row.slug,
    name: locale === "en" ? row.nameEn : row.nameZh,
    subtitle: (locale === "en" ? row.subtitleEn : row.subtitleZh) ?? undefined,
    description: (locale === "en" ? row.descriptionEn : row.descriptionZh) ?? undefined,
    mainImageUrl: row.mainImageUrl ?? undefined,
    badge: (locale === "en" ? row.badgeEn : row.badgeZh) ?? undefined,
    startingPrice,
    currency: "SGD",
  };
}

export async function listAdminCollections() {
  const db = assertCatalogDb();
  return db.select().from(cakeCollections).orderBy(asc(cakeCollections.sortOrder), asc(cakeCollections.createdAt));
}

export async function listAdminStyles() {
  const db = assertCatalogDb();
  const rows = await db
    .select({ style: cakeStyles, collection: cakeCollections })
    .from(cakeStyles)
    .leftJoin(cakeCollections, eq(cakeStyles.collectionId, cakeCollections.id))
    .orderBy(asc(cakeStyles.sortOrder), asc(cakeStyles.createdAt));
  return rows.map((row) => ({ ...row.style, collection: row.collection }));
}

export async function getAdminStyleDetail(id: string) {
  const db = assertCatalogDb();
  const [style] = await db.select().from(cakeStyles).where(eq(cakeStyles.id, id)).limit(1);
  if (!style) {
    return null;
  }
  const [collections, images, sections, sizes] = await Promise.all([
    listAdminCollections(),
    db.select().from(cakeStyleImages).where(eq(cakeStyleImages.styleId, id)).orderBy(asc(cakeStyleImages.sortOrder)),
    db.select().from(cakeStyleSections).where(eq(cakeStyleSections.styleId, id)).orderBy(asc(cakeStyleSections.sortOrder)),
    db.select().from(cakeSizeOptions).where(eq(cakeSizeOptions.styleId, id)).orderBy(asc(cakeSizeOptions.sortOrder)),
  ]);
  return { style, collections, images, sections, sizes };
}

export async function createCollection(input: CakeCollectionInput) {
  const db = assertCatalogDb();
  const now = new Date();
  const [row] = await db
    .insert(cakeCollections)
    .values({
      id: createId("col"),
      ...input,
      descriptionZh: nullable(input.descriptionZh),
      descriptionEn: nullable(input.descriptionEn),
      coverImageUrl: nullable(input.coverImageUrl),
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row;
}

export async function updateCollection(id: string, input: CakeCollectionInput) {
  const db = assertCatalogDb();
  const [row] = await db
    .update(cakeCollections)
    .set({
      ...input,
      descriptionZh: nullable(input.descriptionZh),
      descriptionEn: nullable(input.descriptionEn),
      coverImageUrl: nullable(input.coverImageUrl),
      updatedAt: new Date(),
    })
    .where(eq(cakeCollections.id, id))
    .returning();
  return row ?? null;
}

export async function createStyle(input: CakeStyleInput) {
  const db = assertCatalogDb();
  const now = new Date();
  const [row] = await db
    .insert(cakeStyles)
    .values({
      id: createId("style"),
      ...input,
      collectionId: nullable(input.collectionId),
      subtitleZh: nullable(input.subtitleZh),
      subtitleEn: nullable(input.subtitleEn),
      descriptionZh: nullable(input.descriptionZh),
      descriptionEn: nullable(input.descriptionEn),
      mainImageUrl: nullable(input.mainImageUrl),
      badgeZh: nullable(input.badgeZh),
      badgeEn: nullable(input.badgeEn),
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row;
}

export async function updateStyle(id: string, input: CakeStyleInput) {
  const db = assertCatalogDb();
  const [row] = await db
    .update(cakeStyles)
    .set({
      ...input,
      collectionId: nullable(input.collectionId),
      subtitleZh: nullable(input.subtitleZh),
      subtitleEn: nullable(input.subtitleEn),
      descriptionZh: nullable(input.descriptionZh),
      descriptionEn: nullable(input.descriptionEn),
      mainImageUrl: nullable(input.mainImageUrl),
      badgeZh: nullable(input.badgeZh),
      badgeEn: nullable(input.badgeEn),
      updatedAt: new Date(),
    })
    .where(eq(cakeStyles.id, id))
    .returning();
  return row ?? null;
}

export async function updateStyleMainImage(id: string, mainImageUrl: string) {
  const db = assertCatalogDb();
  const [row] = await db
    .update(cakeStyles)
    .set({ mainImageUrl, updatedAt: new Date() })
    .where(eq(cakeStyles.id, id))
    .returning();
  return row ?? null;
}

export async function setCollectionActive(id: string, isActive: boolean) {
  const db = assertCatalogDb();
  const [row] = await db
    .update(cakeCollections)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(cakeCollections.id, id))
    .returning();
  return row ?? null;
}

export async function setStyleActive(id: string, isActive: boolean) {
  const db = assertCatalogDb();
  const [row] = await db
    .update(cakeStyles)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(cakeStyles.id, id))
    .returning();
  return row ?? null;
}

export async function createStyleImage(input: CakeStyleImageInput) {
  const db = assertCatalogDb();
  const [row] = await db
    .insert(cakeStyleImages)
    .values({
      id: createId("img"),
      ...input,
      altZh: nullable(input.altZh),
      altEn: nullable(input.altEn),
      createdAt: new Date(),
    })
    .returning();
  return row;
}

export async function updateStyleImage(id: string, input: Omit<CakeStyleImageInput, "styleId">) {
  const db = assertCatalogDb();
  const [row] = await db
    .update(cakeStyleImages)
    .set({ ...input, altZh: nullable(input.altZh), altEn: nullable(input.altEn) })
    .where(eq(cakeStyleImages.id, id))
    .returning();
  return row ?? null;
}

export async function deleteStyleImage(id: string) {
  const db = assertCatalogDb();
  await db.delete(cakeStyleImages).where(eq(cakeStyleImages.id, id));
}

export async function createStyleSection(input: CakeStyleSectionInput) {
  const db = assertCatalogDb();
  const now = new Date();
  const [row] = await db
    .insert(cakeStyleSections)
    .values({
      id: createId("sec"),
      ...input,
      bodyZh: nullable(input.bodyZh),
      bodyEn: nullable(input.bodyEn),
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row;
}

export async function updateStyleSection(id: string, input: Omit<CakeStyleSectionInput, "styleId">) {
  const db = assertCatalogDb();
  const [row] = await db
    .update(cakeStyleSections)
    .set({ ...input, bodyZh: nullable(input.bodyZh), bodyEn: nullable(input.bodyEn), updatedAt: new Date() })
    .where(eq(cakeStyleSections.id, id))
    .returning();
  return row ?? null;
}

export async function deleteStyleSection(id: string) {
  const db = assertCatalogDb();
  await db.delete(cakeStyleSections).where(eq(cakeStyleSections.id, id));
}

export async function createSizeOption(input: CakeSizeOptionInput) {
  const db = assertCatalogDb();
  const now = new Date();
  const [row] = await db
    .insert(cakeSizeOptions)
    .values({
      id: createId("size"),
      ...input,
      servingsZh: nullable(input.servingsZh),
      servingsEn: nullable(input.servingsEn),
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row;
}

export async function updateSizeOption(id: string, input: Omit<CakeSizeOptionInput, "styleId">) {
  const db = assertCatalogDb();
  const [row] = await db
    .update(cakeSizeOptions)
    .set({
      ...input,
      servingsZh: nullable(input.servingsZh),
      servingsEn: nullable(input.servingsEn),
      updatedAt: new Date(),
    })
    .where(eq(cakeSizeOptions.id, id))
    .returning();
  return row ?? null;
}

export async function deleteSizeOption(id: string) {
  const db = assertCatalogDb();
  await db.delete(cakeSizeOptions).where(eq(cakeSizeOptions.id, id));
}

export async function listPublicCollections(locale: Locale, types?: Array<"qixi" | "birthday" | "custom">) {
  const db = getDb();
  if (!db) {
    return [];
  }
  const rows = await db
    .select()
    .from(cakeCollections)
    .where(
      types?.length
        ? and(eq(cakeCollections.isActive, true), inArray(cakeCollections.type, types))
        : eq(cakeCollections.isActive, true),
    )
    .orderBy(asc(cakeCollections.sortOrder), asc(cakeCollections.createdAt));
  return rows.map((row) => mapPublicCollection(row, locale));
}

export async function getPublicCollectionBySlug(slug: string, locale: Locale) {
  const db = getDb();
  if (!db) {
    return null;
  }
  const [row] = await db
    .select()
    .from(cakeCollections)
    .where(and(eq(cakeCollections.slug, slug), eq(cakeCollections.isActive, true)))
    .limit(1);
  return row ? mapPublicCollection(row, locale) : null;
}

export async function listPublicStyles(locale: Locale, collectionSlug?: string) {
  const db = getDb();
  if (!db) {
    return [];
  }
  const rows = await db
    .select({ style: cakeStyles, collection: cakeCollections })
    .from(cakeStyles)
    .leftJoin(cakeCollections, eq(cakeStyles.collectionId, cakeCollections.id))
    .where(
      collectionSlug
        ? and(
            eq(cakeStyles.isActive, true),
            eq(cakeCollections.isActive, true),
            eq(cakeCollections.slug, collectionSlug),
          )
        : and(eq(cakeStyles.isActive, true), eq(cakeCollections.isActive, true)),
    )
    .orderBy(asc(cakeStyles.sortOrder), asc(cakeStyles.createdAt));

  const styleIds = rows.map((row) => row.style.id);
  const sizes = styleIds.length
    ? await db
        .select()
        .from(cakeSizeOptions)
        .where(and(inArray(cakeSizeOptions.styleId, styleIds), eq(cakeSizeOptions.isActive, true)))
        .orderBy(asc(cakeSizeOptions.price))
    : [];

  return rows.map((row) => {
    const styleSizes = sizes.filter((size) => size.styleId === row.style.id);
    return mapPublicStyle(row.style, locale, styleSizes[0]?.price, row.collection?.slug);
  });
}

export async function getPublicStyleDetail(id: string, locale: Locale): Promise<PublicStyleDetail | null> {
  const db = getDb();
  if (!db) {
    return null;
  }
  const [row] = await db
    .select({ style: cakeStyles, collection: cakeCollections })
    .from(cakeStyles)
    .leftJoin(cakeCollections, eq(cakeStyles.collectionId, cakeCollections.id))
    .where(and(eq(cakeStyles.id, id), eq(cakeStyles.isActive, true), eq(cakeCollections.isActive, true)))
    .limit(1);
  if (!row) {
    return null;
  }

  const [images, sections, sizes] = await Promise.all([
    db.select().from(cakeStyleImages).where(eq(cakeStyleImages.styleId, id)).orderBy(asc(cakeStyleImages.sortOrder)),
    db
      .select()
      .from(cakeStyleSections)
      .where(and(eq(cakeStyleSections.styleId, id), eq(cakeStyleSections.isActive, true)))
      .orderBy(asc(cakeStyleSections.sortOrder)),
    db
      .select()
      .from(cakeSizeOptions)
      .where(and(eq(cakeSizeOptions.styleId, id), eq(cakeSizeOptions.isActive, true)))
      .orderBy(asc(cakeSizeOptions.sortOrder), asc(cakeSizeOptions.price)),
  ]);

  const summary = mapPublicStyle(row.style, locale, sizes[0]?.price, row.collection?.slug);
  return {
    ...summary,
    galleryImages: images.map((image) => publicImage(image, locale)),
    sections: sections.map((section) => publicSection(section, locale)),
    sizeOptions: sizes.map((size) => publicSize(size, locale)),
  };
}

function publicImage(row: CakeStyleImageRow, locale: Locale): PublicStyleImage {
  return {
    id: row.id,
    imageUrl: row.imageUrl,
    alt: (locale === "en" ? row.altEn : row.altZh) ?? undefined,
    imageType: row.imageType,
  };
}

function publicSection(row: CakeStyleSectionRow, locale: Locale): PublicStyleSection {
  return {
    id: row.id,
    sectionKey: row.sectionKey,
    title: locale === "en" ? row.titleEn : row.titleZh,
    body: (locale === "en" ? row.bodyEn : row.bodyZh) ?? undefined,
  };
}

function publicSize(row: CakeSizeOptionRow, locale: Locale): PublicSizeOption {
  return {
    id: row.id,
    sizeLabel: row.sizeLabel,
    servings: (locale === "en" ? row.servingsEn : row.servingsZh) ?? undefined,
    price: row.price,
    currency: row.currency,
    isDefault: row.isDefault,
  };
}
