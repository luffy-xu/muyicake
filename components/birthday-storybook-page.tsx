"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { WhatsAppIcon } from "@/components/brand-logo";
import { CakeSizeSelector, type SelectedCakeStyle } from "@/components/cake-style-drawer";
import { ReservationForm } from "@/components/reservation-form";
import { SiteHeader } from "@/components/site-header";
import { fmt, type Locale, type getDictionary } from "@/lib/i18n";
import { getProduct, storybookProductCode, type StorybookThemeKey } from "@/lib/products";
import { STORYBOOK_PREP_DAYS, type StorybookChapter } from "@/lib/storybook";
import { createMerchantWhatsAppUrl } from "@/lib/whatsapp";

type Tab = "boy" | "girl";
type Dictionary = ReturnType<typeof getDictionary>;

function subscribeMotionPreference(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function getMotionEnabledSnapshot() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getMotionEnabledServerSnapshot() {
  return true;
}
function useMotionEnabled() {
  return useSyncExternalStore(subscribeMotionPreference, getMotionEnabledSnapshot, getMotionEnabledServerSnapshot);
}

const THEME_STYLE: Record<StorybookThemeKey, { bg: string; accent: string; watermark: string }> = {
  hotwheels: { bg: "#F5D2C0", accent: "#C25B38", watermark: "VROOM" },
  pilot: { bg: "#E2E9F0", accent: "#4A6B94", watermark: "TAKE OFF" },
  dino: { bg: "#DEE8D0", accent: "#7C9A5E", watermark: "ROAR" },
  ocean: { bg: "#D6E6F4", accent: "#5E87B8", watermark: "SPLASH" },
  game: { bg: "#E4E0EE", accent: "#6F62A8", watermark: "LEVEL UP" },
  starlight: { bg: "#F6E7C8", accent: "#C99A3F", watermark: "SHINE" },
  ballet: { bg: "#F8D9E3", accent: "#D66A8C", watermark: "TWIRL" },
  elsa: { bg: "#DCEDF5", accent: "#5D93B5", watermark: "MAGIC" },
  unicorn: { bg: "#E6DFF3", accent: "#8E7BC0", watermark: "DREAM" },
  butterfly: { bg: "#F7E2D0", accent: "#C97F4E", watermark: "BLOOM" },
};

const BENTO_ACCENT_ITEMS = [
  { key: "bag", img: "https://placehold.co/500x500/f7b6c8/6b3f2a?text=Gift+Bags", titleKey: "bentoBagTitle", subtitleKey: "bentoBagSubtitle" },
  { key: "card", img: "https://placehold.co/500x500/ffe4a3/6b3f2a?text=Name+Cards", titleKey: "bentoCardTitle", subtitleKey: "bentoCardSubtitle" },
  { key: "ribbon", img: "https://placehold.co/500x500/d9c7f2/6b3f2a?text=Ribbon", titleKey: "bentoRibbonTitle", subtitleKey: "bentoRibbonSubtitle" },
  { key: "balloon", img: "https://placehold.co/500x500/cfe8ff/6b3f2a?text=Balloons", titleKey: "bentoBalloonTitle", subtitleKey: "bentoBalloonSubtitle" },
  { key: "star", img: "https://placehold.co/500x500/fff7ec/6b3f2a?text=Stars", titleKey: "bentoStarTitle", subtitleKey: "bentoStarSubtitle" },
] as const;

export function BirthdayStorybookPage({
  locale,
  dictionary,
  boyChapters,
  girlChapters,
}: {
  locale: Locale;
  dictionary: Dictionary;
  boyChapters: StorybookChapter[];
  girlChapters: StorybookChapter[];
}) {
  const d = dictionary.storybook;
  const [tab, setTabState] = useState<Tab>("boy");
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [themeError, setThemeError] = useState(false);
  const [navShow, setNavShow] = useState(false);
  const [navActive, setNavActive] = useState(0);
  const motionEnabled = useMotionEnabled();
  const rootRef = useRef<HTMLDivElement>(null);

  const chapters = tab === "boy" ? boyChapters : girlChapters;
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId) ?? null;
  const selectedSize =
    selectedChapter?.sizeOptions.find((size) => size.id === selectedSizeId) ?? selectedChapter?.sizeOptions[0];
  const selectedProduct = selectedChapter ? getProduct(storybookProductCode(selectedChapter.themeKey)) : undefined;
  const selectedCakeStyle: SelectedCakeStyle | null =
    selectedChapter && selectedSize
      ? {
          selectedCollectionId: selectedChapter.collectionId ?? "",
          selectedStyleId: selectedChapter.id,
          selectedStyleName: selectedChapter.name,
          selectedSizeOptionId: selectedSize.id,
          selectedSizeLabel: selectedSize.sizeLabel,
          selectedPrice: selectedSize.price,
        }
      : null;

  function scrollToId(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 64;
    window.scrollTo({ top, behavior: "smooth" });
  }

  function switchTab(next: Tab, scroll?: boolean) {
    setTabState(next);
    setSelectedChapterId(null);
    setSelectedSizeId("");
    setThemeError(false);
    if (scroll) setTimeout(() => scrollToId("themes"), 80);
  }

  function pickChapter(chapter: StorybookChapter, scroll?: boolean) {
    setSelectedChapterId(chapter.id);
    const defaultSize = chapter.sizeOptions.find((size) => size.isDefault) ?? chapter.sizeOptions[0];
    setSelectedSizeId(defaultSize?.id ?? "");
    setThemeError(false);
    if (scroll) setTimeout(() => scrollToId("check-date"), 100);
  }

  // Scroll-driven motion: gentle reveal-on-enter for chapter content (all
  // devices), plus scroll-linked parallax + drifting watermark text on
  // desktop only. Both re-run whenever the visible tab's chapters remount.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mobile = window.innerWidth < 720;
    const revealY = mobile ? "16px" : "28px";
    let revealObserver: IntersectionObserver | null = null;

    if (motionEnabled && "IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
              revealObserver?.unobserve(el);
            }
          });
        },
        { threshold: 0.12 },
      );
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.85) {
          el.style.opacity = "0";
          el.style.transform = `translateY(${revealY})`;
          el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
          revealObserver?.observe(el);
        }
      });
    }

    let paraTicking = false;
    function onParaScroll() {
      if (paraTicking || !root) return;
      paraTicking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        root.querySelectorAll<HTMLElement>("[data-para]").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < -100 || rect.top > vh + 100) return;
          const factor = parseFloat(el.dataset.para ?? "0.05");
          const offset = (rect.top + rect.height / 2 - vh / 2) * factor;
          el.style.transform = `translateY(${(-offset).toFixed(1)}px) rotate(${(offset * 0.012).toFixed(2)}deg)`;
        });
        root.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
          const sec = el.parentElement;
          if (!sec) return;
          const rect = sec.getBoundingClientRect();
          if (rect.bottom < -100 || rect.top > vh + 100) return;
          const factor = parseFloat(el.dataset.drift ?? "0.1");
          const offset = (rect.top + rect.height / 2 - vh / 2) * factor;
          el.style.transform = `translateX(${offset.toFixed(1)}px)`;
        });
        paraTicking = false;
      });
    }

    const scrollFx = motionEnabled && !mobile;
    if (scrollFx) {
      window.addEventListener("scroll", onParaScroll, { passive: true });
      onParaScroll();
    }

    let navTicking = false;
    function onNavScroll() {
      if (navTicking || !root) return;
      navTicking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-chapter]"));
        if (sections.length) {
          const first = sections[0].getBoundingClientRect();
          const last = sections[sections.length - 1].getBoundingClientRect();
          setNavShow(first.top < vh * 0.7 && last.bottom > vh * 0.35);
          sections.forEach((sec) => {
            const rect = sec.getBoundingClientRect();
            if (rect.top <= vh * 0.5 && rect.bottom > vh * 0.5) {
              setNavActive(parseInt(sec.dataset.chapter ?? "0", 10) || 0);
            }
          });
        }
        navTicking = false;
      });
    }
    window.addEventListener("scroll", onNavScroll, { passive: true });
    onNavScroll();

    return () => {
      revealObserver?.disconnect();
      window.removeEventListener("scroll", onParaScroll);
      window.removeEventListener("scroll", onNavScroll);
    };
  }, [tab, motionEnabled, boyChapters, girlChapters]);

  const waLink = createMerchantWhatsAppUrl(undefined, locale);

  const stickyLabel = useMemo(() => {
    if (selectedChapter) {
      const titleZh = locale === "zh" ? selectedChapter.name : selectedChapter.nameOpposite;
      const titleEn = locale === "en" ? selectedChapter.name : selectedChapter.nameOpposite;
      return `${titleZh} ${titleEn} · ${d.chapterFromPrice}`;
    }
    return tab === "boy" ? d.stickyDefaultLabelBoy : d.stickyDefaultLabelGirl;
  }, [selectedChapter, tab, d, locale]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FBF3E7] pb-[110px]" style={{ color: "#2B1E1A" }}>
      <SiteHeader locale={locale} dictionary={dictionary} />

      <Hero d={d} onPickBoy={() => switchTab("boy", true)} onPickGirl={() => switchTab("girl", true)} motionEnabled={motionEnabled} />

      <Marquee items={d.marqueeItems} motionEnabled={motionEnabled} />

      <PackageBento d={d} />

      <section id="themes" className="relative z-[3] mx-auto max-w-[1160px] px-5 pb-[88px] text-center md:px-10">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[3px] text-[#D8A95D]">{d.tabsEyebrow}</p>
        <h2 className="mb-1.5 font-display text-[clamp(30px,4.4vw,52px)] font-semibold leading-[1.08] tracking-[-0.01em]">
          {d.tabsTitle}
        </h2>
        <p className="mb-6 font-chinese-serif text-[clamp(15px,2vw,19px)] tracking-[2px]">{d.tabsSubtitleSerif}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <TabButton active={tab === "boy"} onClick={() => switchTab("boy")}>
            {d.tabBoy}
          </TabButton>
          <TabButton active={tab === "girl"} onClick={() => switchTab("girl")}>
            {d.tabGirl}
          </TabButton>
        </div>
        <p className="mt-4 font-chinese-sans text-xs text-[#9C8A82]">{d.tabsNote}</p>
      </section>

      <div ref={rootRef}>
        {chapters.map((chapter, index) => (
          <Chapter
            key={chapter.id}
            chapter={chapter}
            index={index}
            tab={tab}
            locale={locale}
            d={d}
            waLink={waLink}
            selected={selectedChapterId === chapter.id}
            onPick={() => pickChapter(chapter, true)}
            motionEnabled={motionEnabled}
          />
        ))}
      </div>

      <CheckDateSection
        d={d}
        dictionary={dictionary}
        locale={locale}
        tab={tab}
        chapters={chapters}
        selectedChapter={selectedChapter}
        selectedSize={selectedSize}
        selectedProduct={selectedProduct}
        selectedCakeStyle={selectedCakeStyle}
        themeError={themeError}
        onSwitchTab={(next) => switchTab(next)}
        onPickChapter={(chapter) => pickChapter(chapter)}
        onSelectSize={setSelectedSizeId}
        waLink={waLink}
      />

      {navShow ? (
        <FloatingChapterNav chapters={chapters} active={navActive} onJump={(id) => scrollToId(id)} />
      ) : null}

      <StickyBar label={stickyLabel} note={fmt(d.stickyPrepNote, { prepDays: STORYBOOK_PREP_DAYS })} cta={d.stickyCta} onClick={() => scrollToId("check-date")} />
    </main>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border-[1.5px] border-[#2B1E1A] px-8 py-4 font-chinese-sans text-[15px] font-bold tracking-[0.5px]"
      style={{ background: active ? "#2B1E1A" : "#FBF3E7", color: active ? "#FBF3E7" : "#2B1E1A" }}
    >
      {children}
    </button>
  );
}

function Hero({
  d,
  onPickBoy,
  onPickGirl,
  motionEnabled,
}: {
  d: Dictionary["storybook"];
  onPickBoy: () => void;
  onPickGirl: () => void;
  motionEnabled: boolean;
}) {
  return (
    <header className="relative mx-auto max-w-[1160px] px-5 py-[clamp(40px,7vw,84px)] md:px-10">
      <FloatingStar className="left-[2%] top-[12%] text-[26px] text-[#D8A95D]" delay={0} enabled={motionEnabled} />
      <FloatingStar className="right-[8%] top-[6%] text-[18px] text-[#E97796]" delay={0.55} enabled={motionEnabled} variant="b" />
      <FloatingStar className="bottom-[10%] left-[44%] text-[20px] text-[#D8A95D]" delay={1.1} enabled={motionEnabled} />

      <div className="flex flex-wrap items-center gap-[clamp(32px,5vw,64px)]">
        <div className="min-w-[min(480px,100%)] flex-[1_1_480px]">
          <p className="mb-[18px] flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[3.2px] text-[#E97796]">
            <span className="inline-block h-[1.5px] w-[26px] bg-[#E97796]" />
            {d.heroEyebrow}
          </p>
          <h1 className="mb-2.5 font-display text-[clamp(46px,7.4vw,104px)] font-semibold leading-[0.98] tracking-[-0.02em]">
            Every birthday<br />is a <em className="text-[#E97796] italic">story</em>.
          </h1>
          <p className="mb-[18px] font-chinese-serif text-[clamp(18px,2.4vw,26px)] font-medium tracking-[2px]">{d.heroSubtitleSerif}</p>
          <p className="mb-7 max-w-[460px] font-chinese-sans text-[14.5px] leading-[1.9] text-[#7A6258]">{d.heroBody}</p>

          <div className="mb-[30px] flex flex-wrap gap-2.5">
            <Chip>
              {d.chipFromPrice} <span className="text-[#E97796]">S$157</span>
            </Chip>
            <Chip>{d.chipThemeCount}</Chip>
            <Chip>{fmt(d.chipPrepDays, { prepDays: STORYBOOK_PREP_DAYS })}</Chip>
            <Chip>{d.chipDelivery}</Chip>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onPickBoy}
              className="rounded-full bg-[#2B1E1A] px-[30px] py-[17px] font-chinese-sans text-[15px] font-semibold tracking-[0.5px] text-[#FBF3E7]"
            >
              {d.ctaBoy}
            </button>
            <button
              type="button"
              onClick={onPickGirl}
              className="rounded-full bg-[#E97796] px-[30px] py-[17px] font-chinese-sans text-[15px] font-semibold tracking-[0.5px] text-white"
            >
              {d.ctaGirl}
            </button>
          </div>
          <p className="mt-4 text-[11.5px] text-[#9C8A82]">{d.heroNote}</p>
        </div>

        <div className="flex min-w-[min(340px,100%)] flex-[1_1_340px] justify-center">
          <div className="relative w-[min(400px,86vw)]">
            <div className="mt-14 aspect-[0.92] w-full rounded-[48px]" style={{ background: "#F8D9E3" }} />
            <div className="absolute left-1/2 top-0 aspect-[0.94] w-[82%] -translate-x-1/2 overflow-hidden rounded-[32px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://placehold.co/700x760/f8d9e3/e97796?text=Signature+Storybook+Cake" alt="" className="h-full w-full object-cover" />
            </div>
            <div className="absolute bottom-[-26px] right-[-18px] aspect-[0.85] w-[31%] overflow-hidden rounded-[20px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://placehold.co/300x350/ffe8dc/6b3f2a?text=Gift+Bag" alt="" className="h-full w-full object-cover" />
            </div>
            <div className="absolute left-[-14px] top-[38px] rounded-full border border-black/10 bg-[#FFFCF7] px-[15px] py-2 text-[11px] font-bold uppercase tracking-[1.2px] shadow-[0_4px_16px_rgba(43,30,26,0.08)]">
              Fresh cream · 动物奶油
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-black/10 bg-[#FFFCF7] px-4 py-[9px] font-chinese-sans text-[12.5px] font-semibold">
      {children}
    </div>
  );
}

function FloatingStar({
  className,
  delay,
  enabled,
  variant = "a",
}: {
  className: string;
  delay: number;
  enabled: boolean;
  variant?: "a" | "b";
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={
        enabled
          ? { animation: `${variant === "a" ? "muFloat" : "muFloatB"} ${5.5 + delay}s ease-in-out ${delay}s infinite` }
          : undefined
      }
    >
      ✦
    </span>
  );
}

function Marquee({ items, motionEnabled }: { items: readonly string[]; motionEnabled: boolean }) {
  const row = (keyPrefix: string) => (
    <div className="flex items-center gap-7 whitespace-nowrap pr-7 font-display text-[19px] font-medium tracking-[1.5px]">
      {items.map((item, i) => (
        <span key={`${keyPrefix}-${i}`} className={/[一-鿿]/.test(item) ? "font-chinese-serif" : ""}>
          {item} <span className="text-[#E97796]">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <div aria-hidden="true" className="relative z-[3] overflow-hidden bg-[#2B1E1A] py-4 text-[#FBF3E7]">
      <div
        className="flex w-max"
        style={motionEnabled ? { animation: "muMarquee 36s linear infinite" } : undefined}
      >
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

function PackageBento({ d }: { d: Dictionary["storybook"] }) {
  return (
    <section className="mx-auto max-w-[1160px] px-5 py-[clamp(56px,8vw,96px)] md:px-10">
      <div className="mb-[34px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[3px] text-[#D8A95D]">{d.bentoEyebrow}</p>
          <h2 className="font-display text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.05] tracking-[-0.01em]">
            One box, <em className="italic text-[#E97796]">whole party</em>.
          </h2>
          <p className="mt-2 font-chinese-serif text-[clamp(15px,2vw,19px)] tracking-[1.5px]">{d.bentoSubtitleSerif}</p>
        </div>
        <div className="text-right">
          <div className="font-display text-[clamp(26px,3.4vw,40px)] font-bold leading-none text-[#E97796]">{d.bentoFromPrice}</div>
          <div className="mt-1.5 font-chinese-sans text-xs text-[#9C8A82]">{fmt(d.bentoSingleCakeNote, { prepDays: STORYBOOK_PREP_DAYS })}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3.5">
        <div className="flex flex-[2_1_300px] flex-col gap-3.5 rounded-[28px] border border-black/10 bg-[#FFFCF7] p-4">
          <div className="relative min-h-[250px] flex-1 overflow-hidden rounded-[18px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://placehold.co/900x700/ffe8dc/6b3f2a?text=6-inch+Theme+Cake" alt={d.bentoCakeTitle} className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="flex items-baseline justify-between gap-2.5">
            <div>
              <div className="font-chinese-sans text-[15px] font-bold">{d.bentoCakeTitle}</div>
              <div className="mt-0.5 text-[11.5px] text-[#9C8A82]">{d.bentoCakeSubtitle}</div>
            </div>
            <div className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[1px] text-[#E97796]">{d.bentoCakeTag}</div>
          </div>
        </div>

        <div className="flex min-w-[min(300px,100%)] flex-[1_1_300px] flex-col gap-3.5">
          <div className="flex flex-1 gap-3.5">
            {BENTO_ACCENT_ITEMS.slice(0, 2).map((item) => (
              <BentoTile key={item.key} item={item} d={d} />
            ))}
          </div>
          <div className="flex flex-1 gap-3.5">
            {BENTO_ACCENT_ITEMS.slice(2, 5).map((item) => (
              <BentoTile key={item.key} item={item} d={d} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BentoTile({ item, d }: { item: (typeof BENTO_ACCENT_ITEMS)[number]; d: Dictionary["storybook"] }) {
  const title = d[item.titleKey];
  const subtitle = d[item.subtitleKey];
  return (
    <div className="flex flex-1 flex-col gap-2.5 rounded-[28px] border border-black/10 bg-[#FFFCF7] p-3.5">
      <div className="relative min-h-[110px] flex-1 overflow-hidden rounded-[14px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.img} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="font-chinese-sans text-[13px] font-bold">
        {title}
        <div className="mt-px text-[10.5px] font-normal text-[#9C8A82]">{subtitle}</div>
      </div>
    </div>
  );
}

function Chapter({
  chapter,
  index,
  tab,
  locale,
  d,
  waLink,
  selected,
  onPick,
  motionEnabled,
}: {
  chapter: StorybookChapter;
  index: number;
  tab: Tab;
  locale: Locale;
  d: Dictionary["storybook"];
  waLink: string;
  selected: boolean;
  onPick: () => void;
  motionEnabled: boolean;
}) {
  const style = THEME_STYLE[chapter.themeKey];
  const titleEn = locale === "en" ? chapter.name : chapter.nameOpposite;
  const titleZh = locale === "zh" ? chapter.name : chapter.nameOpposite;
  const imageFirst = index % 2 === 0;
  const accent = chapter.galleryImages.find((image) => image.imageType === "detail") ?? chapter.galleryImages[0];

  return (
    <section
      id={`${tab}-ch${index + 1}`}
      data-chapter={index}
      className="relative z-[4] overflow-hidden rounded-t-[clamp(28px,5vw,52px)] px-5 py-[clamp(52px,7vw,88px)] pb-[clamp(80px,10vw,130px)] md:px-10"
      style={{ background: style.bg, marginTop: index === 0 ? "-36px" : "-44px", zIndex: 4 + index }}
    >
      <div
        aria-hidden="true"
        data-drift={imageFirst ? "-0.1" : "0.1"}
        className={`pointer-events-none absolute top-3.5 font-display text-[clamp(64px,11vw,160px)] font-bold italic leading-none ${
          imageFirst ? "right-[-2%]" : "left-[-2%]"
        }`}
        style={{ color: hexToRgba(style.accent, 0.16), whiteSpace: "nowrap" }}
      >
        {style.watermark}
      </div>
      <FloatingStar className={`${imageFirst ? "right-[6%]" : "left-[5%]"} top-[8%] text-[26px]`} delay={index * 0.4} enabled={motionEnabled} />

      <div className="relative mx-auto max-w-[1120px]">
        <div className="mb-2 flex flex-wrap items-baseline gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[3px]" style={{ color: style.accent }}>
            {fmt(d.chapterNumberLabel, { number: String(index + 1).padStart(2, "0") })} · {tab === "boy" ? d.chapterForHim : d.chapterForHer}
          </span>
          <span className="rounded-full bg-[#2B1E1A] px-3 py-1 font-chinese-sans text-[11px] font-bold text-[#FBF3E7]">{chapter.badge}</span>
          <span className="h-px min-w-10 flex-1 bg-black/15" />
          {chapter.subtitle ? <span className="font-chinese-sans text-xs text-[#7A6258]">{chapter.subtitle}</span> : null}
        </div>
        <h2 className="mb-1 font-display text-[clamp(44px,7.4vw,104px)] font-semibold italic leading-[0.95] tracking-[-0.02em]">{titleEn}</h2>
        <p className="mb-[clamp(28px,4vw,44px)] font-chinese-serif text-[clamp(18px,2.4vw,26px)] font-medium tracking-[3px]">{titleZh}</p>

        <div data-reveal className={`flex flex-wrap items-center gap-[clamp(28px,5vw,60px)] ${imageFirst ? "" : "flex-wrap-reverse"}`}>
          <div className={`flex min-w-[min(380px,100%)] flex-[1_1_380px] justify-center ${imageFirst ? "order-2 md:order-1" : "order-2"}`}>
            <div data-para="0.05" className="relative w-[min(380px,84vw)]" style={{ marginTop: "clamp(-24px,-2vw,-12px)" }}>
              <div className="relative mx-auto aspect-[0.95] w-[88%] overflow-hidden rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={chapter.mainImageUrl} alt={chapter.name} className="h-full w-full object-cover" />
              </div>
              {accent ? (
                <div className={`absolute bottom-[-20px] w-[30%] overflow-hidden rounded-[18px] ${imageFirst ? "right-[2%]" : "left-[2%]"}`} style={{ aspectRatio: 0.85 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={accent.imageUrl} alt={accent.alt ?? ""} className="h-full w-full object-cover" />
                </div>
              ) : null}
            </div>
          </div>

          <div className={`max-w-[520px] min-w-[min(380px,100%)] flex-[1_1_380px] ${imageFirst ? "order-1 md:order-2" : "order-1"}`}>
            <p className="mb-[22px] font-chinese-sans text-[14.5px] leading-[1.9] text-[#5C463C]">{chapter.description}</p>
            <div className="mb-6 flex flex-col gap-2.5">
              {chapter.sections.map((section) => (
                <div key={section.id} className="flex gap-2.5 font-chinese-sans text-[13.5px]">
                  <span className="shrink-0" style={{ color: style.accent }}>
                    ✦
                  </span>
                  {section.title}
                </div>
              ))}
            </div>
            <div className="mb-5 flex flex-wrap items-baseline gap-3.5">
              <span className="font-display text-[30px] font-bold text-[#E97796]">{d.chapterFromPrice}</span>
              <span className="font-chinese-sans text-xs text-[#7A6258]">{d.chapterSingleCakeNote}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPick}
                className="rounded-full bg-[#2B1E1A] px-[30px] py-[15px] font-chinese-sans text-sm font-semibold text-[#FBF3E7]"
              >
                {selected ? `✓ ${d.chapterCta}` : d.chapterCta}
              </button>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="border-b-[1.5px] border-[#2B1E1A] pb-0.5 text-[13px] font-semibold">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckDateSection({
  d,
  dictionary,
  locale,
  tab,
  chapters,
  selectedChapter,
  selectedSize,
  selectedProduct,
  selectedCakeStyle,
  themeError,
  onSwitchTab,
  onPickChapter,
  onSelectSize,
  waLink,
}: {
  d: Dictionary["storybook"];
  dictionary: Dictionary;
  locale: Locale;
  tab: Tab;
  chapters: StorybookChapter[];
  selectedChapter: StorybookChapter | null;
  selectedSize: StorybookChapter["sizeOptions"][number] | undefined;
  selectedProduct: ReturnType<typeof getProduct>;
  selectedCakeStyle: SelectedCakeStyle | null;
  themeError: boolean;
  onSwitchTab: (tab: Tab) => void;
  onPickChapter: (chapter: StorybookChapter) => void;
  onSelectSize: (id: string) => void;
  waLink: string;
}) {
  return (
    <section id="check-date" className="relative z-[9] rounded-t-[clamp(28px,5vw,52px)] bg-[#2B1E1A] px-5 py-[clamp(56px,8vw,96px)] pb-[clamp(72px,9vw,110px)] text-[#FBF3E7] md:px-10" style={{ marginTop: "-44px" }}>
      <div className="mx-auto max-w-[1120px]">
        <div className="flex flex-wrap gap-[clamp(36px,6vw,72px)]">
          <div className="min-w-[min(400px,100%)] flex-[1_1_400px]">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[3px] text-[#D8A95D]">{d.checkDateEyebrow}</p>
            <h2 className="mb-2 font-display text-[clamp(38px,5.4vw,68px)] font-semibold leading-[1.02] tracking-[-0.01em] text-[#FBF3E7]">
              Save the <em className="italic text-[#E97796]">date</em>.
            </h2>
            <p className="mb-[26px] font-chinese-serif text-[clamp(16px,2.2vw,22px)] tracking-[2px] text-[#FBF3E7]">{d.checkDateSubtitleSerif}</p>

            <div className="flex flex-col gap-[18px]">
              {[d.checkDateStep1, d.checkDateStep2, d.checkDateStep3].map((step, i) => (
                <div key={step} className="flex items-start gap-3.5">
                  <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#D8A95D] text-xs font-bold text-[#D8A95D]">
                    {i + 1}
                  </div>
                  <div className="font-chinese-sans text-[13.5px] leading-[1.75] text-[#FBF3E7]/85">{step}</div>
                </div>
              ))}
            </div>

            <div className="mt-[30px] flex flex-wrap gap-[22px] border-t border-white/15 pt-[22px] font-chinese-sans text-xs text-[#FBF3E7]/65">
              <span>{fmt(d.checkDateFootPrepDays, { prepDays: STORYBOOK_PREP_DAYS })}</span>
              <span>{d.checkDateFootDelivery}</span>
              <span>{d.checkDateFootPayment}</span>
            </div>
          </div>

          <div className="min-w-[min(380px,100%)] flex-[1_1_380px] rounded-[28px] bg-[#FBF3E7] p-[clamp(22px,3vw,34px)] text-[#2B1E1A]">
            <label className="mb-2.5 block font-chinese-sans text-xs font-bold">{d.checkDatePanelStep1}</label>
            <div className="mb-[18px] flex gap-2">
              <button
                type="button"
                onClick={() => onSwitchTab("boy")}
                className="flex-1 rounded-full border-[1.5px] border-[#2B1E1A] py-2.5 font-chinese-sans text-[12.5px] font-bold"
                style={{ background: tab === "boy" ? "#2B1E1A" : "#FBF3E7", color: tab === "boy" ? "#FBF3E7" : "#2B1E1A" }}
              >
                {d.tabBoy.split(" ·")[0]}
              </button>
              <button
                type="button"
                onClick={() => onSwitchTab("girl")}
                className="flex-1 rounded-full border-[1.5px] border-[#2B1E1A] py-2.5 font-chinese-sans text-[12.5px] font-bold"
                style={{ background: tab === "girl" ? "#2B1E1A" : "#FBF3E7", color: tab === "girl" ? "#FBF3E7" : "#2B1E1A" }}
              >
                {d.tabGirl.split(" ·")[0]}
              </button>
            </div>

            <label className="mb-2.5 block font-chinese-sans text-xs font-bold">{d.checkDatePanelStep2}</label>
            <div className="mb-1.5 flex flex-wrap gap-2">
              {chapters.map((chapter) => {
                const active = selectedChapter?.id === chapter.id;
                const style = THEME_STYLE[chapter.themeKey];
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => onPickChapter(chapter)}
                    className="rounded-full border-[1.5px] border-[#2B1E1A] px-[15px] py-[9px] font-chinese-sans text-[12.5px] font-semibold"
                    style={{ background: active ? style.accent : "#FBF3E7", color: active ? "#FFFFFF" : "#2B1E1A" }}
                  >
                    {locale === "en" ? chapter.name : chapter.name} {chapter.badge}
                  </button>
                );
              })}
            </div>
            {!selectedChapter ? <p className="mt-1 font-chinese-sans text-[11.5px] text-[#9C8A82]">{d.checkDatePanelNoTheme}</p> : null}
            {themeError ? <p className="mt-2 font-chinese-sans text-[12.5px] text-[#B04A66]">{d.errorPickTheme}</p> : null}

            {selectedChapter && selectedSize && selectedProduct && selectedCakeStyle ? (
              <div className="mt-5">
                <CakeSizeSelector
                  sizes={selectedChapter.sizeOptions}
                  selectedSizeId={selectedSize.id}
                  dictionary={dictionary}
                  onSelectSize={onSelectSize}
                />
                <div className="mt-5 rounded-[24px] bg-white p-1">
                  <ReservationForm
                    key={`${selectedChapter.id}-${selectedSize.id}`}
                    locale={locale}
                    dictionary={dictionary}
                    mode="birthday"
                    selectedProduct={selectedProduct}
                    selectedCakeStyle={selectedCakeStyle}
                  />
                </div>
              </div>
            ) : (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 font-chinese-sans font-semibold text-white"
              >
                <WhatsAppIcon size={18} />
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="mt-[clamp(48px,7vw,80px)] flex flex-wrap items-center justify-between gap-3.5 border-t border-white/12 pt-[26px]">
          <div className="font-display text-[17px] italic text-[#FBF3E7]/80">{d.checkDateFooterBrand}</div>
          <div className="font-chinese-sans text-[11.5px] text-[#FBF3E7]/50">{d.checkDateFooterTagline}</div>
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="border-b border-[#25D366] pb-0.5 text-xs font-semibold text-[#25D366]">
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

function FloatingChapterNav({
  chapters,
  active,
  onJump,
}: {
  chapters: StorybookChapter[];
  active: number;
  onJump: (id: string) => void;
}) {
  return (
    <div className="fixed right-[clamp(6px,1.6vw,20px)] top-1/2 z-[290] flex -translate-y-1/2 flex-col items-end gap-[7px]">
      {chapters.map((chapter, i) => {
        const style = THEME_STYLE[chapter.themeKey];
        const isActive = i === active;
        return (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onJump(chapter.id)}
            className="flex items-center gap-[7px] rounded-full border border-black/[0.14] px-[11px] py-2 font-chinese-sans text-[11px] font-bold shadow-[0_4px_14px_rgba(43,30,26,0.14)] transition-colors"
            style={{ background: isActive ? "#2B1E1A" : "#FFFCF7", color: isActive ? "#FBF3E7" : "#2B1E1A" }}
          >
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: style.accent }} />
            <span className="whitespace-nowrap">{isActive ? chapter.name : String(i + 1).padStart(2, "0")}</span>
          </button>
        );
      })}
    </div>
  );
}

function StickyBar({ label, note, cta, onClick }: { label: string; note: string; cta: string; onClick: () => void }) {
  return (
    <div className="fixed bottom-3 left-1/2 z-[300] flex w-[min(520px,calc(100%-24px))] -translate-x-1/2 items-center justify-between gap-3 rounded-full bg-[#2B1E1A]/96 py-2 pl-[22px] pr-2 shadow-[0_10px_36px_rgba(43,30,26,0.35)] backdrop-blur-md">
      <div className="min-w-0 overflow-hidden">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap font-chinese-sans text-[12.5px] font-semibold text-[#FBF3E7]">{label}</div>
        <div className="whitespace-nowrap font-chinese-sans text-[10.5px] text-[#FBF3E7]/60">{note}</div>
      </div>
      <button type="button" onClick={onClick} className="shrink-0 whitespace-nowrap rounded-full bg-[#E97796] px-6 py-3.5 font-chinese-sans text-[13.5px] font-semibold text-white">
        {cta}
      </button>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
