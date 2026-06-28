"use client";

import { WhatsAppIcon } from "@/components/brand-logo";
import { useEffect, useMemo, useState } from "react";
import {
  CakeStyleDrawer,
  type SelectedCakeStyle,
} from "@/components/cake-style-drawer";
import { ProductCard } from "@/components/product-card";
import { QixiSlotCounter } from "@/components/qixi-slot-counter";
import { ReservationForm } from "@/components/reservation-form";
import { SiteHeader } from "@/components/site-header";
import type { Locale, getDictionary } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import { createMerchantWhatsAppUrl } from "@/lib/whatsapp";

export function ReservationPage({
  locale,
  mode,
  dictionary,
  products,
}: {
  locale: Locale;
  mode: "qixi" | "custom";
  dictionary: ReturnType<typeof getDictionary>;
  products: readonly Product[];
}) {
  const [selectedCode, setSelectedCode] = useState(products[0]?.code ?? "");
  const [catalogTypes, setCatalogTypes] = useState<Array<"qixi" | "birthday" | "custom">>([]);
  const [availableCatalogTypes, setAvailableCatalogTypes] = useState<Array<"qixi" | "birthday" | "custom">>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCakeStyle, setSelectedCakeStyle] = useState<SelectedCakeStyle | null>(null);
  const selectedProduct = useMemo(
    () => products.find((product) => product.code === selectedCode) ?? products[0],
    [products, selectedCode],
  );

  useEffect(() => {
    const types = mode === "qixi" ? "qixi" : "birthday,custom";
    fetch(`/api/catalog/collections?locale=${locale}&type=${types}`)
      .then((response) => response.json() as Promise<{ collections: Array<{ type: "qixi" | "birthday" | "custom" }> }>)
      .then((payload) => {
        setAvailableCatalogTypes([...new Set(payload.collections.map((collection) => collection.type))]);
      })
      .catch(() => setAvailableCatalogTypes([]));
  }, [locale, mode]);

  function selectProduct(product: Product) {
    setSelectedCode(product.code);
    const types = product.category === "qixi" ? ["qixi" as const] : [product.category];
    const hasCatalog = types.some((type) => availableCatalogTypes.includes(type));
    if (hasCatalog) {
      setCatalogTypes(types);
      setDrawerOpen(true);
      return;
    }
    setSelectedCakeStyle(null);
    document.getElementById("reservation-form")?.scrollIntoView({ block: "start" });
  }

  function selectCakeStyle(selection: SelectedCakeStyle) {
    setSelectedCakeStyle(selection);
    document.getElementById("reservation-form")?.scrollIntoView({ block: "start" });
  }

  function reopenDrawer() {
    const type = selectedProduct.category === "qixi" ? "qixi" : selectedProduct.category;
    setCatalogTypes([type]);
    setDrawerOpen(true);
  }

  return (
    <main className="min-h-screen bg-[#FFF7EC] pb-24">
      <SiteHeader locale={locale} dictionary={dictionary} />

      {/* Full-bleed hero */}
      <section
        className="relative overflow-hidden px-5 py-14 text-center"
        style={{ background: "linear-gradient(145deg,#F7C4D0 0%,#E97796 42%,#C86080 78%,#9B4060 100%)" }}
      >
        <div className="pointer-events-none absolute -right-[55px] -top-[55px] h-[210px] w-[210px] rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
        <div className="pointer-events-none absolute -bottom-[38px] -left-[38px] h-[155px] w-[155px] rounded-full" style={{ background: "rgba(216,169,93,0.18)" }} />
        <div className="pointer-events-none absolute left-[22px] top-[62px] h-12 w-12 rounded-full" style={{ background: "rgba(255,255,255,0.14)" }} />
        <div className="pointer-events-none absolute bottom-[75px] right-[30px] h-7 w-7 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />

        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="font-semibold uppercase tracking-[0.16em] text-white/75" style={{ fontSize: "11px", letterSpacing: "2.8px" }}>
            {mode === "qixi" ? dictionary.reservation.qixiEyebrow : dictionary.reservation.customEyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white font-chinese-serif md:text-4xl" style={{ letterSpacing: "1px" }}>
            {mode === "qixi" ? dictionary.reservation.qixiTitle : dictionary.reservation.customTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/80 md:text-base">
            {mode === "qixi" ? dictionary.reservation.qixiSubtitle : dictionary.reservation.customSubtitle}
          </p>
          <button
            onClick={() => document.getElementById("reservation-form")?.scrollIntoView()}
            className="mt-7 rounded-full bg-[#FFFCF7] px-6 py-3 font-semibold text-[#6B3F2A] shadow-lg shadow-black/10"
          >
            {dictionary.reservation.reserveNow}
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <SectionHeader eyebrow={dictionary.reservation.chooseCakeEyebrow} title={dictionary.reservation.chooseCake} />
        {mode === "qixi" && (
          <div className="mt-5">
            <QixiSlotCounter dictionary={dictionary} />
          </div>
        )}
        <div className="mt-3 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <LocalizedProductCard
              key={product.code}
              product={product}
              locale={locale}
              dictionary={dictionary}
              selected={selectedProduct.code === product.code}
              onSelect={selectProduct}
            />
          ))}
        </div>
      </section>

      <section className="bg-[#FFFCF7] px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow={dictionary.reservation.includedEyebrow}
            title={mode === "qixi" ? dictionary.reservation.includedTitleQixi : dictionary.reservation.includedTitleCustom}
          />
          <div
            className="mt-5 rounded-[20px] p-5"
            style={{ background: "#FFF7EC", border: "1px solid rgba(247,182,200,0.28)" }}
          >
            <p className="leading-[1.85] text-[#7A6258]">
              {mode === "qixi"
                ? dictionary.reservation.includedTextQixi
                : dictionary.reservation.includedTextCustom}
            </p>
          </div>
        </div>
      </section>

      <section id="reservation-form" className="mx-auto max-w-3xl scroll-mt-6 px-5 py-10">
        <SectionHeader eyebrow={dictionary.reservation.formEyebrow} title={dictionary.reservation.detailsTitle} className="mb-6" />
        <ReservationForm
          key={selectedProduct.code}
          locale={locale}
          dictionary={dictionary}
          mode={mode}
          selectedProduct={selectedProduct}
          selectedCakeStyle={selectedCakeStyle}
          onChangeCakeStyle={availableCatalogTypes.length ? reopenDrawer : undefined}
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <SectionHeader eyebrow={dictionary.reservation.faqEyebrow} title={dictionary.reservation.faqTitle} />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {dictionary.reservation.faq.map(([title, text]) => (
            <Faq key={title} title={title} text={text} />
          ))}
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#FFE8DC] bg-[#FFFCF7]/95 p-3 backdrop-blur-sm md:hidden">
        <div className="flex gap-2">
          <a
            href={createMerchantWhatsAppUrl(undefined, locale)}
            aria-label="WhatsApp"
            className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-4 py-3 text-white shadow-sm"
          >
            <WhatsAppIcon size={20} />
          </a>
          <button
            onClick={() => document.getElementById("reservation-form")?.scrollIntoView()}
            className="flex-1 rounded-full bg-[#E97796] px-5 py-3 font-semibold text-white shadow-md shadow-[#E97796]/20"
          >
            {dictionary.reservation.stickyCta}
          </button>
        </div>
      </div>

      <CakeStyleDrawer
        key={`${drawerOpen}-${catalogTypes.join("-")}-${locale}`}
        open={drawerOpen}
        locale={locale}
        collectionTypes={catalogTypes}
        dictionary={dictionary}
        onClose={() => setDrawerOpen(false)}
        onSelect={selectCakeStyle}
      />
    </main>
  );
}

function SectionHeader({ eyebrow, title, className = "" }: { eyebrow: string; title: string; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-[6px] text-[10px] font-semibold uppercase tracking-[2.8px] text-[#D8A95D]">{eyebrow}</p>
      <h2 className="text-[21px] font-semibold text-[#2B1E1A] font-chinese-serif" style={{ letterSpacing: "0.5px" }}>{title}</h2>
    </div>
  );
}

function LocalizedProductCard({
  product,
  locale,
  dictionary,
  selected,
  onSelect,
}: {
  product: Product;
  locale: Locale;
  dictionary: ReturnType<typeof getDictionary>;
  selected: boolean;
  onSelect: (product: Product) => void;
}) {
  const copy = dictionary.products[product.code];

  return (
    <ProductCard
      product={product}
      name={copy.name}
      description={copy.description}
      badge={"badge" in copy ? copy.badge : undefined}
      limitedLabel={product.category === "qixi" ? (locale === "en" ? "LIMITED" : "限定") : undefined}
      photoLabel={dictionary.reservation.photoComing}
      selectLabel={dictionary.reservation.selectReserve}
      selected={selected}
      onSelect={onSelect}
    />
  );
}

function Faq({ title, text }: { title: string; text: string }) {
  return (
    <div
      className="rounded-[16px] p-5"
      style={{ background: "#FFF7EC", border: "1px solid rgba(247,182,200,0.3)" }}
    >
      <h3 className="text-[14px] font-semibold text-[#2B1E1A]">{title}</h3>
      <p className="mt-2 text-[13px] leading-[1.7] text-[#7A6258]">{text}</p>
    </div>
  );
}
