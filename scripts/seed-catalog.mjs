import nextEnv from "@next/env";
import postgres from "postgres";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for npm run db:seed.");
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

const collections = [
  {
    id: "col_qixi_memory",
    slug: "qixi-memory",
    titleZh: "七夕限定蛋糕",
    titleEn: "Qixi Memory Cakes",
    type: "qixi",
    sortOrder: 1,
  },
  {
    id: "col_birthday_classic",
    slug: "birthday-classic",
    titleZh: "生日蛋糕",
    titleEn: "Birthday Cakes",
    type: "birthday",
    sortOrder: 2,
  },
  {
    id: "col_kids_theme",
    slug: "kids-theme",
    titleZh: "儿童主题蛋糕",
    titleEn: "Kids Theme Cakes",
    type: "custom",
    sortOrder: 3,
  },
];

const styles = [
  {
    id: "style_qixi_memory_blush",
    collectionId: "col_qixi_memory",
    slug: "memory-blush",
    nameZh: "粉色回忆七夕蛋糕",
    nameEn: "Blush Memory Qixi Cake",
    subtitleZh: "相框礼盒搭配柔粉奶油",
    subtitleEn: "Soft blush cream with photo-frame gift set",
    descriptionZh: "适合七夕送礼的温柔款式，可通过 WhatsApp 继续确认照片与文字。",
    descriptionEn: "A soft romantic style for Qixi gifting, with photo and message confirmed on WhatsApp.",
    mainImageUrl: "https://placehold.co/900x700/f7b6c8/6b3f2a?text=Qixi+Cake",
    badgeZh: "七夕限定",
    badgeEn: "Qixi",
    sortOrder: 1,
    sizes: [
      { id: "size_qixi_memory_4", label: '4"', servingsZh: "约 2-4 人", servingsEn: "Serves 2-4", price: 77, sortOrder: 1, isDefault: true },
      { id: "size_qixi_memory_6", label: '6"', servingsZh: "约 6-8 人", servingsEn: "Serves 6-8", price: 117, sortOrder: 2, isDefault: false },
    ],
  },
  {
    id: "style_birthday_classic_cream",
    collectionId: "col_birthday_classic",
    slug: "classic-cream",
    nameZh: "经典奶油生日蛋糕",
    nameEn: "Classic Cream Birthday Cake",
    subtitleZh: "日常生日与家庭庆祝",
    subtitleEn: "For birthdays and family celebrations",
    descriptionZh: "经典生日蛋糕底款，可继续沟通颜色、祝福语与简洁装饰。",
    descriptionEn: "A classic birthday base style with color, message, and simple decoration confirmed later.",
    mainImageUrl: "https://placehold.co/900x700/ffe8dc/6b3f2a?text=Birthday+Cake",
    badgeZh: "生日款",
    badgeEn: "Birthday",
    sortOrder: 1,
    sizes: [
      { id: "size_birthday_classic_4", label: '4"', servingsZh: "约 2-4 人", servingsEn: "Serves 2-4", price: 77, sortOrder: 1, isDefault: true },
      { id: "size_birthday_classic_6", label: '6"', servingsZh: "约 6-8 人", servingsEn: "Serves 6-8", price: 117, sortOrder: 2, isDefault: false },
    ],
  },
  {
    id: "style_kids_theme_soft",
    collectionId: "col_kids_theme",
    slug: "soft-kids-theme",
    nameZh: "柔色儿童主题蛋糕",
    nameEn: "Soft Kids Theme Cake",
    subtitleZh: "儿童主题、颜色与元素可沟通",
    subtitleEn: "Theme, colors, and details confirmed on WhatsApp",
    descriptionZh: "适合儿童生日的主题蛋糕，从基础主题价开始，复杂造型另行确认。",
    descriptionEn: "A kids birthday theme cake from the base theme price; complex designs are confirmed separately.",
    mainImageUrl: "https://placehold.co/900x700/cfe8ff/6b3f2a?text=Theme+Cake",
    badgeZh: "主题款",
    badgeEn: "Theme",
    sortOrder: 1,
    sizes: [
      { id: "size_kids_theme_from", label: "Theme", servingsZh: "按主题确认", servingsEn: "Confirmed by theme", price: 157, sortOrder: 1, isDefault: true },
    ],
  },
];

for (const collection of collections) {
  await sql`
    insert into cake_collections (id, slug, title_zh, title_en, type, is_active, sort_order, created_at, updated_at)
    values (${collection.id}, ${collection.slug}, ${collection.titleZh}, ${collection.titleEn}, ${collection.type}, true, ${collection.sortOrder}, now(), now())
    on conflict (slug) do update set
      title_zh = excluded.title_zh,
      title_en = excluded.title_en,
      type = excluded.type,
      is_active = true,
      sort_order = excluded.sort_order,
      updated_at = now()
  `;
}

for (const style of styles) {
  await sql`
    insert into cake_styles (
      id, collection_id, slug, name_zh, name_en, subtitle_zh, subtitle_en, description_zh, description_en,
      main_image_url, badge_zh, badge_en, is_active, sort_order, created_at, updated_at
    )
    values (
      ${style.id}, ${style.collectionId}, ${style.slug}, ${style.nameZh}, ${style.nameEn}, ${style.subtitleZh}, ${style.subtitleEn},
      ${style.descriptionZh}, ${style.descriptionEn}, ${style.mainImageUrl}, ${style.badgeZh}, ${style.badgeEn}, true, ${style.sortOrder}, now(), now()
    )
    on conflict (collection_id, slug) do update set
      name_zh = excluded.name_zh,
      name_en = excluded.name_en,
      subtitle_zh = excluded.subtitle_zh,
      subtitle_en = excluded.subtitle_en,
      description_zh = excluded.description_zh,
      description_en = excluded.description_en,
      main_image_url = excluded.main_image_url,
      badge_zh = excluded.badge_zh,
      badge_en = excluded.badge_en,
      is_active = true,
      sort_order = excluded.sort_order,
      updated_at = now()
  `;

  await sql`
    insert into cake_style_sections (id, style_id, section_key, title_zh, title_en, body_zh, body_en, sort_order, is_active, created_at, updated_at)
    values (${`sec_${style.id}`}, ${style.id}, 'details', '款式细节', 'Style details', ${style.descriptionZh}, ${style.descriptionEn}, 1, true, now(), now())
    on conflict (id) do update set
      body_zh = excluded.body_zh,
      body_en = excluded.body_en,
      updated_at = now()
  `;

  for (const size of style.sizes) {
    await sql`
      insert into cake_size_options (id, style_id, size_label, servings_zh, servings_en, price, currency, is_default, is_active, sort_order, created_at, updated_at)
      values (${size.id}, ${style.id}, ${size.label}, ${size.servingsZh}, ${size.servingsEn}, ${size.price}, 'SGD', ${size.isDefault}, true, ${size.sortOrder}, now(), now())
      on conflict (id) do update set
        size_label = excluded.size_label,
        servings_zh = excluded.servings_zh,
        servings_en = excluded.servings_en,
        price = excluded.price,
        is_default = excluded.is_default,
        is_active = true,
        sort_order = excluded.sort_order,
        updated_at = now()
    `;
  }
}

await sql.end();
console.log("Catalog seed complete.");
