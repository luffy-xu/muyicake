import Link from "next/link";
import { Gift, Heart, MessageCircle, Sparkles } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale, getDictionary } from "@/lib/i18n";
import { createMerchantWhatsAppUrl } from "@/lib/whatsapp";

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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href={prefix || "/"} className="text-lg font-semibold text-[#6B3F2A]">
          MuYi Cakes SG
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <a
            href={createMerchantWhatsAppUrl(undefined, locale)}
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <MessageCircle size={16} />
            {dictionary.header.whatsapp}
          </a>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-12 pt-4 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-10">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#D8A95D]">
            {dictionary.home.eyebrow}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#2B1E1A] md:text-6xl">
            {dictionary.home.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#7A6258] md:text-lg">
            {dictionary.home.subtitle}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`${prefix}/qixi`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E97796] px-6 py-3 font-semibold text-white shadow-md shadow-[#E97796]/20"
            >
              <Heart size={18} />
              {dictionary.home.qixiCta}
            </Link>
            <Link
              href={`${prefix}/custom`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8A95D] bg-[#FFFCF7] px-6 py-3 font-semibold text-[#6B3F2A]"
            >
              <Sparkles size={18} />
              {dictionary.home.customCta}
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#F7B6C8]/50 bg-[#FFFCF7] p-5 shadow-xl shadow-[#E97796]/10">
          <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,#FFE8DC,#F7B6C8_55%,#FFE4A3)] p-8 text-center">
            <div>
              <Gift className="mx-auto mb-4 text-[#6B3F2A]" size={44} />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B3F2A]">
                {dictionary.home.imageEyebrow}
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#2B1E1A]">
                {dictionary.home.imageText}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FFFCF7] px-5 py-12">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          <EntryCard
            href={`${prefix}/qixi`}
            title={dictionary.home.qixiTitle}
            text={dictionary.home.qixiText}
            cta={dictionary.home.qixiCta}
          />
          <EntryCard
            href={`${prefix}/custom`}
            title={dictionary.home.customTitle}
            text={dictionary.home.customText}
            cta={dictionary.home.customCta}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-2xl font-semibold">{dictionary.home.howTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {dictionary.home.steps.map((step, index) => (
            <div key={step} className="rounded-3xl bg-[#FFFCF7] p-5 shadow-sm">
              <span className="text-sm font-semibold text-[#E97796]">
                {locale === "en" ? `Step ${index + 1}` : `步骤 ${index + 1}`}
              </span>
              <p className="mt-3 text-lg font-medium">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#FFE8DC] px-5 py-8 text-center text-sm text-[#7A6258]">
        {dictionary.home.footer}
      </footer>
    </main>
  );
}

function EntryCard({
  href,
  title,
  text,
  cta,
}: {
  href: string;
  title: string;
  text: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[2rem] border border-[#FFE8DC] bg-[#FFF7EC] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <p className="text-2xl font-semibold text-[#2B1E1A]">{title}</p>
      <p className="mt-3 leading-7 text-[#7A6258]">{text}</p>
      <span className="mt-5 inline-flex rounded-full bg-[#6B3F2A] px-5 py-3 font-semibold text-white">
        {cta}
      </span>
    </Link>
  );
}
