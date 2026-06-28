import { Fragment } from "react";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { SiteHeader } from "@/components/site-header";
import type { Locale, getDictionary } from "@/lib/i18n";

export function HomePage({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: ReturnType<typeof getDictionary>;
}) {
  const prefix = locale === "en" ? "/en" : "";

  return (
    <main className="min-h-screen bg-[#FFF7EC]">
      <SiteHeader locale={locale} dictionary={dictionary} />

      {/* Hero section */}
      <section style={{ background: "linear-gradient(165deg,#FFE8DC 0%,#FFF7EC 70%)" }}>

        {/* Pink gradient block */}
        <div className="relative h-[320px] w-full overflow-hidden" style={{ background: "linear-gradient(145deg,#F7C4D0 0%,#E97796 42%,#C86080 78%,#9B4060 100%)" }}>
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-[55px] -top-[55px] h-[210px] w-[210px] rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
          <div className="pointer-events-none absolute -bottom-[38px] -left-[38px] h-[155px] w-[155px] rounded-full" style={{ background: "rgba(216,169,93,0.18)" }} />
          <div className="pointer-events-none absolute left-[22px] top-[62px] h-12 w-12 rounded-full" style={{ background: "rgba(255,255,255,0.14)" }} />
          <div className="pointer-events-none absolute bottom-[75px] right-[30px] h-7 w-7 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />

          {/* Centered logo + tagline */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/muyi-logo.png"
              alt="MuYi Cakes 沐伊蛋糕"
              className="block w-[200px]"
              style={{ mixBlendMode: "multiply", filter: "drop-shadow(0 6px 22px rgba(107,30,50,0.28))" }}
            />
            <div className="mt-1 text-center font-mono text-[8.5px] uppercase leading-[2.1] text-white/70" style={{ letterSpacing: "2px" }}>
              Qixi · Birthday · Custom Cake · Singapore
            </div>
          </div>

          {/* Gold badge */}
          <div
            className="absolute left-3.5 top-3.5 rounded-full px-[13px] py-[6px] text-[10px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#D8A95D,#B07F35)", letterSpacing: "0.4px", boxShadow: "0 2px 12px rgba(176,127,53,0.5)" }}
          >
            {dictionary.home.heroBadge}
          </div>

          {/* Bottom fade */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[80px]" style={{ background: "linear-gradient(0deg,#FFE8DC,transparent)" }} />
        </div>

        {/* Below-hero content */}
        <div className="px-6 pb-9 pt-[22px]">
          {/* Decorative divider */}
          <div className="mb-4 flex items-center gap-2.5">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg,transparent,rgba(233,119,150,0.32))" }} />
            <span className="text-[11px] text-[#D8A95D]" style={{ letterSpacing: "3px" }}>✦ ✦ ✦</span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg,rgba(233,119,150,0.32),transparent)" }} />
          </div>

          <h1 className="mb-[7px] text-center text-[26px] font-semibold leading-[1.3] text-[#2B1E1A] font-chinese-serif" style={{ letterSpacing: "2px" }}>
            {dictionary.home.heroTitle}
          </h1>
          <p className="mb-3.5 text-center text-[15px] italic text-[#E97796] font-display" style={{ letterSpacing: "0.3px" }}>
            {dictionary.home.heroSubtitle}
          </p>
          <p className="mb-6 text-center text-[13px] leading-[1.88] text-[#7A6258]">
            {dictionary.home.subtitle}
          </p>

          <div className="flex flex-col gap-[11px]">
            <Link
              href={`${prefix}/qixi`}
              className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-[17px] text-base font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#E97796,#C85A77)", animation: "glowPulse 2.8s ease-in-out infinite", letterSpacing: "0.8px" }}
            >
              <Heart size={17} />
              {dictionary.home.qixiCta}
            </Link>
            <Link
              href={`${prefix}/custom`}
              className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[#E97796] bg-[#FFF7EC] px-6 py-[15px] text-[15px] font-medium text-[#E97796]"
            >
              <Sparkles size={16} />
              {dictionary.home.customCta}
            </Link>
          </div>
          <p className="mt-3.5 text-center text-[11.5px] text-[#9C8A82]" style={{ letterSpacing: "0.2px" }}>
            {dictionary.home.heroNote}
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-[#F7B6C8]/20 bg-[#FFFCF7] px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center">
          {(
            [
              { emoji: "💬", title: dictionary.home.trustItems[0][0] },
              { emoji: "🎨", title: dictionary.home.trustItems[1][0] },
              { emoji: "🚚", title: dictionary.home.trustItems[2][0] },
              { emoji: "🎁", title: dictionary.home.trustItems[3][0] },
            ] as const
          ).map(({ emoji, title }, idx) => (
            <Fragment key={title}>
              {idx > 0 && (
                <div className="h-[34px] w-px shrink-0" style={{ background: "rgba(247,182,200,0.4)" }} />
              )}
              <div className="flex flex-1 flex-col items-center text-center">
                <div className="mb-[3px] text-[18px]" role="img" aria-hidden="true">{emoji}</div>
                <div className="text-[10px] leading-[1.5] text-[#7A6258]">{title}</div>
              </div>
            </Fragment>
          ))}
        </div>
      </section>

      {/* Entry cards */}
      <section className="px-5 py-9" style={{ background: "#FFF7EC" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-[22px] text-center">
            <p className="mb-[6px] text-[10px] font-semibold uppercase tracking-[2.8px] text-[#D8A95D]">
              {dictionary.home.chooseCakeEyebrow}
            </p>
            <h2 className="text-[19px] font-semibold text-[#2B1E1A] font-chinese-serif">
              {locale === "en" ? "Choose your cake type" : "选择你的蛋糕类型"}
            </h2>
          </div>
          <div className="flex flex-col gap-[14px] md:grid md:grid-cols-2">
            <EntryCard
              href={`${prefix}/qixi`}
              emoji="🌹"
              emojiGradient="linear-gradient(135deg,#F7B6C8,#E97796)"
              emojiShadow="rgba(233,119,150,0.3)"
              cardGradient="linear-gradient(135deg,#FFF2F6,#FFE8DC)"
              border="rgba(233,119,150,0.22)"
              badge={locale === "en" ? "LIMITED" : "限定"}
              title={dictionary.home.qixiTitle}
              subtitle={locale === "en" ? "S$77 / S$117 · Cake + Frame + Photo" : "S$77 / S$117 · 蛋糕 + 相框 + 照片"}
              cta={dictionary.home.qixiCta}
              ctaStyle="background:#E97796;color:#fff;border:none"
            />
            <EntryCard
              href={`${prefix}/custom`}
              emoji="🎂"
              emojiGradient="linear-gradient(135deg,#FFE4A3,#F5C330)"
              emojiShadow="rgba(245,195,48,0.28)"
              cardGradient="linear-gradient(135deg,#FFFDF0,#FFF9E8)"
              border="rgba(255,228,163,0.45)"
              title={dictionary.home.customTitle}
              subtitle={locale === "en" ? "From S$77 · Name / Age / Wishes" : "From S$77 · 名字/年龄/祝福语定制"}
              cta={dictionary.home.customCta}
              ctaStyle="background:linear-gradient(135deg,#F5C330,#E8A800);color:#fff;border:none"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#FFFCF7] px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 text-center">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[2.8px] text-[#D8A95D]">
              {dictionary.home.howEyebrow}
            </p>
            <h2 className="text-[21px] font-semibold text-[#2B1E1A] font-chinese-serif" style={{ letterSpacing: "1px" }}>
              {dictionary.home.howTitle}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {dictionary.home.steps.map((step, index) => (
              <div key={step} className="rounded-[22px] bg-[#FFF7EC] p-5 shadow-sm" style={{ border: "1.5px solid rgba(247,182,200,0.22)" }}>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E97796] text-sm font-bold text-white shadow-[0_3px_10px_rgba(233,119,150,0.3)]">
                  {index + 1}
                </span>
                <p className="mt-3 text-[14px] font-medium leading-[1.65] text-[#2B1E1A]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#FFE8DC] px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
          <BrandLogo size="sm" />
          <p className="text-sm text-[#7A6258]">{dictionary.home.footer}</p>
        </div>
      </footer>
    </main>
  );
}

function EntryCard({
  href,
  emoji,
  emojiGradient,
  emojiShadow,
  cardGradient,
  border,
  badge,
  title,
  subtitle,
  cta,
  ctaStyle,
}: {
  href: string;
  emoji: string;
  emojiGradient: string;
  emojiShadow: string;
  cardGradient: string;
  border: string;
  badge?: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaStyle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-[22px] p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
      style={{ background: cardGradient, border: `1.5px solid ${border}`, boxShadow: "0 3px 20px rgba(247,182,200,0.18)" }}
    >
      <div
        className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-[18px] text-[28px]"
        style={{ background: emojiGradient, boxShadow: `0 3px 14px ${emojiShadow}` }}
        role="img"
        aria-hidden="true"
      >
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-[3px] flex flex-wrap items-center gap-1.5">
          <span className="font-display text-base font-semibold text-[#2B1E1A]">{title}</span>
          {badge && (
            <span className="shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold text-white" style={{ background: "linear-gradient(135deg,#D8A95D,#B07F35)", letterSpacing: "0.3px" }}>
              {badge}
            </span>
          )}
        </div>
        <div className="mb-2.5 text-[11px] text-[#9C8A82]">{subtitle}</div>
        <div className="inline-block rounded-full px-[18px] py-2 text-xs font-semibold" style={{ ...parseStyle(ctaStyle) }}>
          {cta} →
        </div>
      </div>
    </Link>
  );
}

function parseStyle(s: string): Record<string, string> {
  return Object.fromEntries(
    s.split(";")
      .filter(Boolean)
      .map((p) => {
        const [k, ...v] = p.split(":");
        const key = k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
        return [key, v.join(":").trim()];
      })
  );
}
