"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { oppositeLocalePath, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <Link
      href={oppositeLocalePath(pathname)}
      className="inline-flex h-10 items-center gap-1 rounded-full border border-[#FFE8DC] bg-[#FFFCF7] px-3 text-sm font-semibold text-[#6B3F2A]"
      aria-label={locale === "en" ? "Switch to Chinese" : "Switch to English"}
    >
      <Languages size={15} />
      {locale === "en" ? "中文" : "EN"}
    </Link>
  );
}
