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
  {
    id: "col_birthday_storybook_boy",
    slug: "birthday-boy",
    titleZh: "生日故事书 · 男孩主题",
    titleEn: "Birthday Storybook · For Him",
    descriptionZh: "男孩主题生日派对包，五个章节，覆盖 1–12 岁。",
    descriptionEn: "Birthday party sets for boys, five chapters covering ages 1-12.",
    type: "birthday",
    sortOrder: 4,
  },
  {
    id: "col_birthday_storybook_girl",
    slug: "birthday-girl",
    titleZh: "生日故事书 · 女孩主题",
    titleEn: "Birthday Storybook · For Her",
    descriptionZh: "女孩主题生日派对包，五个章节，覆盖 1–12 岁。",
    descriptionEn: "Birthday party sets for girls, five chapters covering ages 1-12.",
    type: "birthday",
    sortOrder: 5,
  },
];

// Each storybook style ships as: a hero cake cutout (mainImageUrl) + one
// accent object cutout (images[0], imageType 'detail') + four bullet
// "included items" sections (sections[]) instead of the single free-text
// 'details' section the base seed styles use.
const storybookStyles = [
  {
    id: "style_storybook_hotwheels",
    collectionId: "col_birthday_storybook_boy",
    slug: "hotwheels",
    nameZh: "风火轮赛车",
    nameEn: "Hot Wheels",
    subtitleZh: "适合 弯道超车的孩子",
    subtitleEn: "For kids who love taking the corner fast",
    descriptionZh: "黑白格纹旗和火焰红奶油，赛车冲上蛋糕顶。给一开口就是“预备——开！”的小车手。",
    descriptionEn: 'A checkered flag and fire-red cream, with a race car speeding across the top. For the kid who yells "Ready, set, go!" the second they can talk.',
    mainImageUrl: "https://placehold.co/900x900/f5d2c0/c25b38?text=Hot+Wheels+Cake",
    badgeZh: "适合 4–8 岁",
    badgeEn: "Ages 4-8",
    sortOrder: 1,
    accentImage: { url: "https://placehold.co/400x400/f5d2c0/c25b38?text=Race+Car", altZh: "赛车玩具", altEn: "Race car toy" },
    bullets: [
      ["6寸赛道蛋糕 · 赛车装饰 + 名字定制", '6" racetrack cake · race-car decor + name customization'],
      ["红色礼品袋 ×10 + 名字卡 ×10", "Red gift bags ×10 + name cards ×10"],
      ["格纹旗丝带包装 + 星星蜡烛", "Checkered-flag ribbon wrap + star candles"],
      ["红黑气球布置包", "Red & black balloon set"],
    ],
    sizes: [
      { id: "size_storybook_hotwheels_cake", label: "Cake only", servingsZh: "约 4-6 人", servingsEn: "Serves 4-6", price: 117, sortOrder: 1, isDefault: false },
      { id: "size_storybook_hotwheels_set", label: "Full party set", servingsZh: "蛋糕 + 全套派对小物", servingsEn: "Cake + full party set", price: 157, sortOrder: 2, isDefault: true },
    ],
  },
  {
    id: "style_storybook_pilot",
    collectionId: "col_birthday_storybook_boy",
    slug: "sky-captain",
    nameZh: "航空机长",
    nameEn: "Sky Captain",
    subtitleZh: "适合 想开飞机的孩子",
    subtitleEn: "For kids who want to fly the plane",
    descriptionZh: "云朵奶油和小飞机航线，机长徽章别在礼袋上。这一章从跑道起飞，穿过云层。",
    descriptionEn: "Cloud cream and a little flight path, with a captain's badge pinned to the gift bag. This chapter takes off from the runway and climbs through the clouds.",
    mainImageUrl: "https://placehold.co/900x900/e2e9f0/4a6b94?text=Sky+Captain+Cake",
    badgeZh: "适合 3–7 岁",
    badgeEn: "Ages 3-7",
    sortOrder: 2,
    accentImage: { url: "https://placehold.co/400x400/e2e9f0/4a6b94?text=Airplane", altZh: "小飞机", altEn: "Little airplane" },
    bullets: [
      ["6寸云朵蛋糕 · 小飞机 + 名字定制", '6" cloud cake · little airplane + name customization'],
      ["蓝白礼品袋 ×10 + 登机牌名字卡 ×10", "Blue & white gift bags ×10 + boarding-pass name cards ×10"],
      ["航线丝带包装 + 星星蜡烛", "Flight-path ribbon wrap + star candles"],
      ["蓝白气球布置包", "Blue & white balloon set"],
    ],
    sizes: [
      { id: "size_storybook_pilot_cake", label: "Cake only", servingsZh: "约 4-6 人", servingsEn: "Serves 4-6", price: 117, sortOrder: 1, isDefault: false },
      { id: "size_storybook_pilot_set", label: "Full party set", servingsZh: "蛋糕 + 全套派对小物", servingsEn: "Cake + full party set", price: 157, sortOrder: 2, isDefault: true },
    ],
  },
  {
    id: "style_storybook_dino",
    collectionId: "col_birthday_storybook_boy",
    slug: "little-dino",
    nameZh: "恐龙小队",
    nameEn: "Little Dino",
    subtitleZh: "适合 恐龙探险家",
    subtitleEn: "For little dinosaur explorers",
    descriptionZh: "苔绿色奶油丛林，恐龙插牌踩在蛋糕顶上。属于每天问“恐龙吃什么”的小小探险家。",
    descriptionEn: 'A moss-green cream jungle, with a dinosaur topper stomping across the top. For the little explorer who asks "what do dinosaurs eat" every single day.',
    mainImageUrl: "https://placehold.co/900x900/dee8d0/7c9a5e?text=Little+Dino+Cake",
    badgeZh: "适合 1–4 岁",
    badgeEn: "Ages 1-4",
    sortOrder: 3,
    accentImage: { url: "https://placehold.co/400x400/dee8d0/7c9a5e?text=Dino+Topper", altZh: "恐龙插牌", altEn: "Dinosaur topper" },
    bullets: [
      ["6寸丛林蛋糕 · 恐龙插牌 + 名字定制", '6" jungle cake · dinosaur topper + name customization'],
      ["绿色礼品袋 ×10 + 名字卡 ×10", "Green gift bags ×10 + name cards ×10"],
      ["主题丝带包装 + 恐龙小物", "Theme ribbon wrap + dinosaur favors"],
      ["绿白气球布置包 + 星星蜡烛", "Green & white balloon set + star candles"],
    ],
    sizes: [
      { id: "size_storybook_dino_cake", label: "Cake only", servingsZh: "约 4-6 人", servingsEn: "Serves 4-6", price: 117, sortOrder: 1, isDefault: false },
      { id: "size_storybook_dino_set", label: "Full party set", servingsZh: "蛋糕 + 全套派对小物", servingsEn: "Cake + full party set", price: 157, sortOrder: 2, isDefault: true },
    ],
  },
  {
    id: "style_storybook_ocean",
    collectionId: "col_birthday_storybook_boy",
    slug: "ocean-voyage",
    nameZh: "海洋航行",
    nameEn: "Ocean Voyage",
    subtitleZh: "适合 想去看海的孩子",
    subtitleEn: "For kids who dream of the sea",
    descriptionZh: "浅蓝奶油海浪一层层推上来，帆船和小鲸鱼停在蛋糕边。给梦里都在出海的小船长。",
    descriptionEn: "Light-blue cream waves rolling in, with a little sailboat and whale resting at the edge. For the small captain who sets sail even in their dreams.",
    mainImageUrl: "https://placehold.co/900x900/d6e6f4/5e87b8?text=Ocean+Voyage+Cake",
    badgeZh: "适合 2–6 岁",
    badgeEn: "Ages 2-6",
    sortOrder: 4,
    accentImage: { url: "https://placehold.co/400x400/d6e6f4/5e87b8?text=Balloon+Garland", altZh: "气球串", altEn: "Balloon garland" },
    bullets: [
      ["6寸海浪蛋糕 · 名字 + 年龄定制", '6" wave cake · name + age customization'],
      ["蓝色礼品袋 ×10 + 名字卡 ×10", "Blue gift bags ×10 + name cards ×10"],
      ["海军条纹丝带 + 小船装饰", "Navy-stripe ribbon + little sailboat decor"],
      ["蓝白气球布置包 + 星星蜡烛", "Blue & white balloon set + star candles"],
    ],
    sizes: [
      { id: "size_storybook_ocean_cake", label: "Cake only", servingsZh: "约 4-6 人", servingsEn: "Serves 4-6", price: 117, sortOrder: 1, isDefault: false },
      { id: "size_storybook_ocean_set", label: "Full party set", servingsZh: "蛋糕 + 全套派对小物", servingsEn: "Cake + full party set", price: 157, sortOrder: 2, isDefault: true },
    ],
  },
  {
    id: "style_storybook_game",
    collectionId: "col_birthday_storybook_boy",
    slug: "game-on",
    nameZh: "电玩世界",
    nameEn: "Game On",
    subtitleZh: "适合 通关高手",
    subtitleEn: "For the kid who's already leveled up",
    descriptionZh: "像素方块和手柄按键铺在奶油上，过了今天就升一级。大孩子也愿意拍照发朋友圈的一章。",
    descriptionEn: "Pixel blocks and controller buttons across the cream — level up today. The chapter big kids actually want to post about.",
    mainImageUrl: "https://placehold.co/900x900/e4e0ee/6f62a8?text=Game+On+Cake",
    badgeZh: "适合 8–12 岁",
    badgeEn: "Ages 8-12",
    sortOrder: 5,
    accentImage: { url: "https://placehold.co/400x400/e4e0ee/6f62a8?text=Controller", altZh: "手柄装饰", altEn: "Controller decor" },
    bullets: [
      ["6寸像素蛋糕 · 手柄装饰 + 名字定制", '6" pixel cake · controller decor + name customization'],
      ["礼品袋 ×10 + 像素名字卡 ×10", "Gift bags ×10 + pixel-art name cards ×10"],
      ["主题丝带包装 + 星星蜡烛", "Theme ribbon wrap + star candles"],
      ["紫黑气球布置包", "Purple & black balloon set"],
    ],
    sizes: [
      { id: "size_storybook_game_cake", label: "Cake only", servingsZh: "约 4-6 人", servingsEn: "Serves 4-6", price: 117, sortOrder: 1, isDefault: false },
      { id: "size_storybook_game_set", label: "Full party set", servingsZh: "蛋糕 + 全套派对小物", servingsEn: "Cake + full party set", price: 157, sortOrder: 2, isDefault: true },
    ],
  },
  {
    id: "style_storybook_starlight",
    collectionId: "col_birthday_storybook_girl",
    slug: "starlight",
    nameZh: "星光派对",
    nameEn: "Starlight",
    subtitleZh: "适合 摘星星的孩子",
    subtitleEn: "For kids who reach for the stars",
    descriptionZh: "奶油底色如月光，金色星星洒在蛋糕和餐桌上。安静、闪闪发光，是许愿型小孩的一章。",
    descriptionEn: "Moonlight-toned cream with gold stars scattered across the cake and table. Quiet, sparkling — the chapter for a little wish-maker.",
    mainImageUrl: "https://placehold.co/900x900/f6e7c8/c99a3f?text=Starlight+Cake",
    badgeZh: "适合 1–4 岁",
    badgeEn: "Ages 1-4",
    sortOrder: 1,
    accentImage: { url: "https://placehold.co/400x400/f6e7c8/c99a3f?text=Star+Candles", altZh: "星星蜡烛", altEn: "Star candles" },
    bullets: [
      ["6寸星光蛋糕 · 名字 + 年龄定制", '6" starlight cake · name + age customization'],
      ["金色礼品袋 ×10 + 名字卡 ×10", "Gold gift bags ×10 + name cards ×10"],
      ["金星丝带包装 + 星星蜡烛", "Gold-star ribbon wrap + star candles"],
      ["奶油色 & 金色气球布置包", "Cream & gold balloon set"],
    ],
    sizes: [
      { id: "size_storybook_starlight_cake", label: "Cake only", servingsZh: "约 4-6 人", servingsEn: "Serves 4-6", price: 117, sortOrder: 1, isDefault: false },
      { id: "size_storybook_starlight_set", label: "Full party set", servingsZh: "蛋糕 + 全套派对小物", servingsEn: "Cake + full party set", price: 157, sortOrder: 2, isDefault: true },
    ],
  },
  {
    id: "style_storybook_ballet",
    collectionId: "col_birthday_storybook_girl",
    slug: "ballet-blush",
    nameZh: "芭蕾粉纱",
    nameEn: "Ballet Blush",
    subtitleZh: "适合 踮脚尖旋转的孩子",
    subtitleEn: "For kids who twirl on their toes",
    descriptionZh: "粉纱裙摆一样的奶油褶皱，缎面丝带绕着礼品袋打结。轻盈、柔软，给爱跳舞的小公主。",
    descriptionEn: "Cream ruffles like a blush tutu, with satin ribbon tied around each gift bag. Light, soft — for the little dancer who loves to twirl.",
    mainImageUrl: "https://placehold.co/900x900/f8d9e3/d66a8c?text=Ballet+Blush+Cake",
    badgeZh: "适合 2–6 岁",
    badgeEn: "Ages 2-6",
    sortOrder: 2,
    accentImage: { url: "https://placehold.co/400x400/f8d9e3/d66a8c?text=Satin+Ribbon", altZh: "缎面丝带", altEn: "Satin ribbon" },
    bullets: [
      ["6寸裙摆奶油蛋糕 · 名字 + 年龄定制", '6" ruffle cream cake · name + age customization'],
      ["粉色礼品袋 ×10 + 名字卡 ×10", "Blush gift bags ×10 + name cards ×10"],
      ["缎面丝带包装 + 蝴蝶结装饰", "Satin ribbon wrap + bow decor"],
      ["粉白气球布置包 + 星星蜡烛", "Pink & white balloon set + star candles"],
    ],
    sizes: [
      { id: "size_storybook_ballet_cake", label: "Cake only", servingsZh: "约 4-6 人", servingsEn: "Serves 4-6", price: 117, sortOrder: 1, isDefault: false },
      { id: "size_storybook_ballet_set", label: "Full party set", servingsZh: "蛋糕 + 全套派对小物", servingsEn: "Cake + full party set", price: 157, sortOrder: 2, isDefault: true },
    ],
  },
  {
    id: "style_storybook_elsa",
    collectionId: "col_birthday_storybook_girl",
    slug: "elsa-princess",
    nameZh: "艾莎公主 · 冰雪主题",
    nameEn: "Elsa Princess",
    subtitleZh: "适合 每天都在唱 Let It Go 的孩子",
    subtitleEn: "For kids who sing Let It Go on repeat",
    descriptionZh: "冰蓝奶油和雪花糖片，公主站在蛋糕顶。冰雪王国的一章，为家里的小公主加冕。",
    descriptionEn: "Icy-blue cream and snowflake sugar pieces, with a princess standing at the top. A chapter from the ice kingdom, to crown the little princess at home.",
    mainImageUrl: "https://placehold.co/900x900/dcedf5/5d93b5?text=Elsa+Princess+Cake",
    badgeZh: "适合 3–7 岁",
    badgeEn: "Ages 3-7",
    sortOrder: 3,
    accentImage: { url: "https://placehold.co/400x400/dcedf5/5d93b5?text=Princess+Figure", altZh: "公主玩偶", altEn: "Princess figure" },
    bullets: [
      ["6寸冰雪蛋糕 · 公主玩偶 + 名字定制", '6" ice cake · princess figure + name customization'],
      ["冰蓝礼品袋 ×10 + 雪花名字卡 ×10", "Icy-blue gift bags ×10 + snowflake name cards ×10"],
      ["雪花丝带包装 + 星星蜡烛", "Snowflake ribbon wrap + star candles"],
      ["蓝白气球布置包", "Blue & white balloon set"],
    ],
    sizes: [
      { id: "size_storybook_elsa_cake", label: "Cake only", servingsZh: "约 4-6 人", servingsEn: "Serves 4-6", price: 117, sortOrder: 1, isDefault: false },
      { id: "size_storybook_elsa_set", label: "Full party set", servingsZh: "蛋糕 + 全套派对小物", servingsEn: "Cake + full party set", price: 157, sortOrder: 2, isDefault: true },
    ],
  },
  {
    id: "style_storybook_unicorn",
    collectionId: "col_birthday_storybook_girl",
    slug: "unicorn-dream",
    nameZh: "独角兽之梦",
    nameEn: "Unicorn Dream",
    subtitleZh: "适合 相信魔法的孩子",
    subtitleEn: "For kids who believe in magic",
    descriptionZh: "薰衣草紫的云朵奶油，独角兽的角是金色的。柔软安静，又带一点点魔法。",
    descriptionEn: "Lavender cloud cream with a gold unicorn horn. Soft and quiet, with a little bit of magic.",
    mainImageUrl: "https://placehold.co/900x900/e6dff3/8e7bc0?text=Unicorn+Dream+Cake",
    badgeZh: "适合 4–8 岁",
    badgeEn: "Ages 4-8",
    sortOrder: 4,
    accentImage: { url: "https://placehold.co/400x400/e6dff3/8e7bc0?text=Bow+Gift+Bag", altZh: "蝴蝶结礼袋", altEn: "Bow gift bag" },
    bullets: [
      ["6寸云朵蛋糕 · 独角兽装饰 + 名字定制", '6" cloud cake · unicorn decor + name customization'],
      ["紫色蝴蝶结礼袋 ×10 + 名字卡 ×10", "Purple bow gift bags ×10 + name cards ×10"],
      ["主题丝带包装 + 星星蜡烛", "Theme ribbon wrap + star candles"],
      ["紫白气球布置包", "Purple & white balloon set"],
    ],
    sizes: [
      { id: "size_storybook_unicorn_cake", label: "Cake only", servingsZh: "约 4-6 人", servingsEn: "Serves 4-6", price: 117, sortOrder: 1, isDefault: false },
      { id: "size_storybook_unicorn_set", label: "Full party set", servingsZh: "蛋糕 + 全套派对小物", servingsEn: "Cake + full party set", price: 157, sortOrder: 2, isDefault: true },
    ],
  },
  {
    id: "style_storybook_butterfly",
    collectionId: "col_birthday_storybook_girl",
    slug: "butterfly-garden",
    nameZh: "蝴蝶花园",
    nameEn: "Butterfly Garden",
    subtitleZh: "适合 快要长大的女孩",
    subtitleEn: "For girls who are almost grown up",
    descriptionZh: "奶油花瓣和纸艺蝴蝶落在蛋糕边，颜色像下午四点的花园。不幼稚，刚刚好。",
    descriptionEn: "Cream petals and paper butterflies resting at the edge, colored like a garden at four in the afternoon. Not childish — just right.",
    mainImageUrl: "https://placehold.co/900x900/f7e2d0/c97f4e?text=Butterfly+Garden+Cake",
    badgeZh: "适合 8–12 岁",
    badgeEn: "Ages 8-12",
    sortOrder: 5,
    accentImage: { url: "https://placehold.co/400x400/f7e2d0/c97f4e?text=Paper+Butterflies", altZh: "纸艺蝴蝶", altEn: "Paper butterflies" },
    bullets: [
      ["6寸花园蛋糕 · 纸艺蝴蝶 + 名字定制", '6" garden cake · paper butterflies + name customization'],
      ["杏色礼品袋 ×10 + 花卉名字卡 ×10", "Apricot gift bags ×10 + floral name cards ×10"],
      ["主题丝带包装 + 星星蜡烛", "Theme ribbon wrap + star candles"],
      ["杏白气球布置包", "Apricot & white balloon set"],
    ],
    sizes: [
      { id: "size_storybook_butterfly_cake", label: "Cake only", servingsZh: "约 4-6 人", servingsEn: "Serves 4-6", price: 117, sortOrder: 1, isDefault: false },
      { id: "size_storybook_butterfly_set", label: "Full party set", servingsZh: "蛋糕 + 全套派对小物", servingsEn: "Cake + full party set", price: 157, sortOrder: 2, isDefault: true },
    ],
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
    insert into cake_collections (
      id, slug, title_zh, title_en, description_zh, description_en, type, is_active, sort_order, created_at, updated_at
    )
    values (
      ${collection.id}, ${collection.slug}, ${collection.titleZh}, ${collection.titleEn},
      ${collection.descriptionZh ?? null}, ${collection.descriptionEn ?? null}, ${collection.type}, true, ${collection.sortOrder}, now(), now()
    )
    on conflict (slug) do update set
      title_zh = excluded.title_zh,
      title_en = excluded.title_en,
      description_zh = excluded.description_zh,
      description_en = excluded.description_en,
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

// Birthday Storybook styles: same style/size upserts as above, but bullets
// go in as four ordered sections (instead of one free-text 'details'
// section) and each style also carries one accent object cutout image.
for (const style of storybookStyles) {
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
    insert into cake_style_images (id, style_id, image_url, alt_zh, alt_en, image_type, sort_order, created_at)
    values (${`img_${style.id}`}, ${style.id}, ${style.accentImage.url}, ${style.accentImage.altZh}, ${style.accentImage.altEn}, 'detail', 1, now())
    on conflict (id) do update set
      image_url = excluded.image_url,
      alt_zh = excluded.alt_zh,
      alt_en = excluded.alt_en
  `;

  for (const [index, [titleZh, titleEn]] of style.bullets.entries()) {
    await sql`
      insert into cake_style_sections (id, style_id, section_key, title_zh, title_en, body_zh, body_en, sort_order, is_active, created_at, updated_at)
      values (${`sec_${style.id}_${index + 1}`}, ${style.id}, ${`include-${index + 1}`}, ${titleZh}, ${titleEn}, null, null, ${index + 1}, true, now(), now())
      on conflict (id) do update set
        title_zh = excluded.title_zh,
        title_en = excluded.title_en,
        sort_order = excluded.sort_order,
        updated_at = now()
    `;
  }

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
