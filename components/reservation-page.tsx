"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ReservationForm } from "@/components/reservation-form";
import type { Product } from "@/lib/products";
import { createMerchantWhatsAppUrl } from "@/lib/whatsapp";

export function ReservationPage({
  mode,
  title,
  subtitle,
  products,
}: {
  mode: "qixi" | "custom";
  title: string;
  subtitle: string;
  products: readonly Product[];
}) {
  const [selectedCode, setSelectedCode] = useState(products[0]?.code ?? "");
  const selectedProduct = useMemo(
    () => products.find((product) => product.code === selectedCode) ?? products[0],
    [products, selectedCode],
  );

  function selectProduct(product: Product) {
    setSelectedCode(product.code);
    document.getElementById("reservation-form")?.scrollIntoView({ block: "start" });
  }

  return (
    <main className="min-h-screen bg-[#FFF7EC] pb-24">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="font-semibold text-[#6B3F2A]">
          MuYi Cakes SG
        </Link>
        <a
          href={createMerchantWhatsAppUrl()}
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-6 md:py-12">
        <div className="grid gap-7 md:grid-cols-[1fr_0.85fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#D8A95D]">
              {mode === "qixi" ? "Qixi gift set" : "Daily custom cakes"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#7A6258] md:text-lg">
              {subtitle}
            </p>
            <button
              onClick={() =>
                document.getElementById("reservation-form")?.scrollIntoView()
              }
              className="mt-7 rounded-full bg-[#E97796] px-6 py-3 font-semibold text-white shadow-md shadow-[#E97796]/20"
            >
              Reserve now
            </button>
          </div>
          <div className="rounded-[2rem] border border-[#FFE8DC] bg-[#FFFCF7] p-5 shadow-xl shadow-[#E97796]/10">
            <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,#FFE8DC,#F7B6C8,#CFE8FF)] p-8 text-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B3F2A]">
                  {mode === "qixi" ? "Qixi gift set placeholder" : "Custom cake example placeholder"}
                </p>
                <p className="mt-3 text-2xl font-semibold">
                  Handmade, giftable, and confirmed personally on WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <h2 className="text-2xl font-semibold">Choose your cake</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.code}
              product={product}
              selected={selectedProduct.code === product.code}
              onSelect={selectProduct}
            />
          ))}
        </div>
      </section>

      <section className="bg-[#FFFCF7] px-5 py-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold">
            {mode === "qixi" ? "Photo frame gift included" : "Photo memory gift service"}
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-[#7A6258]">
            {mode === "qixi"
              ? "Each Qixi set includes cake, photo frame, printed photo, and gift box."
              : "Share your idea and references after reservation. We will confirm what is possible through WhatsApp before production."}
          </p>
        </div>
      </section>

      <section id="reservation-form" className="mx-auto max-w-3xl scroll-mt-6 px-5 py-10">
        <h2 className="mb-5 text-2xl font-semibold">Reservation details</h2>
        <ReservationForm
          key={selectedProduct.code}
          mode={mode}
          selectedProduct={selectedProduct}
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Faq title="Do I pay online?" text="No. This MVP only collects reservation details. Payment is discussed later on WhatsApp." />
          <Faq title="Is delivery time fixed now?" text="No. Submit the date and area first; the exact slot is confirmed by the merchant." />
          <Faq title="Can I customize details?" text="Yes. Add optional notes, colors, flavours, and message. We will follow up." />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#FFE8DC] bg-[#FFFCF7]/95 p-3 backdrop-blur md:hidden">
        <button
          onClick={() => document.getElementById("reservation-form")?.scrollIntoView()}
          className="w-full rounded-full bg-[#E97796] px-5 py-3 font-semibold text-white"
        >
          Reserve selected cake
        </button>
      </div>
    </main>
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
