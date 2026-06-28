"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CakeStyleDrawer,
  type SelectedCakeStyle,
} from "@/components/cake-style-drawer";
import { ProductCard } from "@/components/product-card";
import { ReservationForm } from "@/components/reservation-form";
import { LanguageSwitcher } from "@/components/language-switcher";
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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href={locale === "en" ? "/en" : "/"} className="font-semibold text-[#6B3F2A]">
          MuYi Cakes SG
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <a
            href={createMerchantWhatsAppUrl(undefined, locale)}
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
          >
            <MessageCircle size={16} />
            {dictionary.header.whatsapp}
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-6 md:py-12">
        <div className="grid gap-7 md:grid-cols-[1fr_0.85fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#D8A95D]">
              {mode === "qixi" ? dictionary.reservation.qixiEyebrow : dictionary.reservation.customEyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">
              {mode === "qixi" ? dictionary.reservation.qixiTitle : dictionary.reservation.customTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#7A6258] md:text-lg">
              {mode === "qixi" ? dictionary.reservation.qixiSubtitle : dictionary.reservation.customSubtitle}
            </p>
            <button
              onClick={() =>
                document.getElementById("reservation-form")?.scrollIntoView()
              }
              className="mt-7 rounded-full bg-[#E97796] px-6 py-3 font-semibold text-white shadow-md shadow-[#E97796]/20"
            >
              {dictionary.reservation.reserveNow}
            </button>
          </div>
          <div className="rounded-[2rem] border border-[#FFE8DC] bg-[#FFFCF7] p-5 shadow-xl shadow-[#E97796]/10">
            <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,#FFE8DC,#F7B6C8,#CFE8FF)] p-8 text-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B3F2A]">
                  {mode === "qixi" ? dictionary.reservation.heroPlaceholderQixi : dictionary.reservation.heroPlaceholderCustom}
                </p>
                <p className="mt-3 text-2xl font-semibold">
                  {dictionary.reservation.heroText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <h2 className="text-2xl font-semibold">{dictionary.reservation.chooseCake}</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <LocalizedProductCard
              key={product.code}
              product={product}
              dictionary={dictionary}
              selected={selectedProduct.code === product.code}
              onSelect={selectProduct}
            />
          ))}
        </div>
      </section>

      <section className="bg-[#FFFCF7] px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold">
            {mode === "qixi" ? dictionary.reservation.includedTitleQixi : dictionary.reservation.includedTitleCustom}
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-[#7A6258]">
            {mode === "qixi"
              ? dictionary.reservation.includedTextQixi
              : dictionary.reservation.includedTextCustom}
          </p>
        </div>
      </section>

      <section id="reservation-form" className="mx-auto max-w-3xl scroll-mt-6 px-5 py-10">
        <h2 className="mb-5 text-2xl font-semibold">{dictionary.reservation.detailsTitle}</h2>
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
        <h2 className="text-2xl font-semibold">{dictionary.reservation.faqTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {dictionary.reservation.faq.map(([title, text]) => (
            <Faq key={title} title={title} text={text} />
          ))}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#FFE8DC] bg-[#FFFCF7]/95 p-3 backdrop-blur md:hidden">
        <button
          onClick={() => document.getElementById("reservation-form")?.scrollIntoView()}
          className="w-full rounded-full bg-[#E97796] px-5 py-3 font-semibold text-white"
        >
          {dictionary.reservation.stickyCta}
        </button>
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

function LocalizedProductCard({
  product,
  dictionary,
  selected,
  onSelect,
}: {
  product: Product;
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
      photoLabel={dictionary.reservation.photoComing}
      selectLabel={dictionary.reservation.selectReserve}
      selected={selected}
      onSelect={onSelect}
    />
  );
}

function Faq({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-[#FFFCF7] p-5 shadow-sm">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#7A6258]">{text}</p>
    </div>
  );
}
