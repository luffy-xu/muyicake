import { describe, expect, it } from "vitest";
import { mapPublicCollection, mapPublicStyle } from "@/lib/catalog";
import {
  cakeCollectionSchema,
  cakeSizeOptionSchema,
  cakeStyleSchema,
} from "@/lib/validations";

describe("catalog validation", () => {
  it("accepts collection, style, and size payloads", () => {
    expect(
      cakeCollectionSchema.safeParse({
        slug: "qixi-memory",
        titleZh: "七夕限定蛋糕",
        titleEn: "Qixi Memory Cakes",
        type: "qixi",
        isActive: true,
        sortOrder: 1,
      }).success,
    ).toBe(true);

    expect(
      cakeStyleSchema.safeParse({
        collectionId: "col_1",
        slug: "memory-blush",
        nameZh: "粉色回忆",
        nameEn: "Blush Memory",
        sortOrder: 1,
        isActive: true,
      }).success,
    ).toBe(true);

    expect(
      cakeSizeOptionSchema.safeParse({
        styleId: "style_1",
        sizeLabel: '6"',
        price: 117,
        currency: "SGD",
        isDefault: true,
        isActive: true,
        sortOrder: 1,
      }).success,
    ).toBe(true);
  });

  it("rejects unsafe slugs and non-SGD sizes", () => {
    expect(
      cakeCollectionSchema.safeParse({
        slug: "Bad Slug",
        titleZh: "生日蛋糕",
        titleEn: "Birthday Cakes",
        type: "birthday",
      }).success,
    ).toBe(false);

    expect(
      cakeSizeOptionSchema.safeParse({
        styleId: "style_1",
        sizeLabel: '4"',
        price: 77,
        currency: "USD",
      }).success,
    ).toBe(false);
  });
});

describe("catalog API mapping", () => {
  const now = new Date("2026-06-28T00:00:00+08:00");

  it("maps localized collection and style fields", () => {
    const collection = mapPublicCollection(
      {
        id: "col_1",
        slug: "qixi-memory",
        titleZh: "七夕限定蛋糕",
        titleEn: "Qixi Memory Cakes",
        descriptionZh: "中文描述",
        descriptionEn: "English description",
        type: "qixi",
        coverImageUrl: null,
        isActive: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      "en",
    );
    expect(collection.title).toBe("Qixi Memory Cakes");
    expect(collection.description).toBe("English description");

    const style = mapPublicStyle(
      {
        id: "style_1",
        collectionId: "col_1",
        slug: "memory-blush",
        nameZh: "粉色回忆",
        nameEn: "Blush Memory",
        subtitleZh: "中文副标题",
        subtitleEn: "English subtitle",
        descriptionZh: null,
        descriptionEn: null,
        mainImageUrl: "https://example.com/cake.webp",
        badgeZh: "限定",
        badgeEn: "Limited",
        isActive: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      "zh",
      77,
      "qixi-memory",
    );
    expect(style.name).toBe("粉色回忆");
    expect(style.badge).toBe("限定");
    expect(style.startingPrice).toBe(77);
    expect(style.collectionSlug).toBe("qixi-memory");
  });
});
