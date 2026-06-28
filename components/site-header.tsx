import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { WhatsAppIcon } from "@/components/brand-logo";
import type { Locale, getDictionary } from "@/lib/i18n";
import { createMerchantWhatsAppUrl } from "@/lib/whatsapp";

export function SiteHeader({
  locale,
  dictionary,
}: {
  locale: Locale;
  dictionary: ReturnType<typeof getDictionary>;
}) {
  const prefix = locale === "en" ? "/en" : "";

  return (
    <header className="sticky top-0 z-40 border-b border-[#F7B6C8]/25 bg-[#FFFCF7]/97 shadow-[0_1px_12px_rgba(0,0,0,0.04)] backdrop-blur-[16px]">
      <div className="flex items-center justify-between px-5 py-2.5">
        <Link href={prefix || "/"} className="flex items-center gap-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/muyi-logo.png"
            alt="MuYi Cakes 沐伊蛋糕"
            className="h-11 w-auto"
            style={{ mixBlendMode: "multiply" }}
          />
          <div className="flex flex-col justify-center">
            <span className="whitespace-nowrap font-sans text-[9px] uppercase leading-[1.4] tracking-[1.4px] text-[#9C8A82]">
              Custom Cakes
            </span>
            <span className="whitespace-nowrap text-[9px] leading-[1.4] tracking-[1px] text-[#9C8A82]">
              Singapore
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <a
            href={createMerchantWhatsAppUrl(undefined, locale)}
            className="flex items-center gap-[5px] rounded-full bg-[#25D366] px-3.5 py-2 text-[11.5px] font-semibold text-white shadow-[0_2px_8px_rgba(37,211,102,0.32)] whitespace-nowrap"
          >
            <WhatsAppIcon size={13} />
            <span className="hidden sm:inline">{dictionary.header.whatsapp}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
