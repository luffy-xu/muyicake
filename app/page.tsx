import Link from "next/link";
import { Gift, Heart, MessageCircle, Sparkles } from "lucide-react";
import { createMerchantWhatsAppUrl } from "@/lib/whatsapp";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFF7EC]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="text-lg font-semibold text-[#6B3F2A]">
          MuYi Cakes SG
        </Link>
        <a
          href={createMerchantWhatsAppUrl()}
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-12 pt-4 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-10">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#D8A95D]">
            Handmade cakes in Singapore
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-[#2B1E1A] md:text-6xl">
            MuYi Cakes SG / 沐伊蛋糕新加坡
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#7A6258] md:text-lg">
            Reserve a romantic Qixi gift set or a daily custom celebration cake.
            No checkout, no cart, no payment online. We follow up on WhatsApp to
            confirm design, price, and delivery timing.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/qixi"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E97796] px-6 py-3 font-semibold text-white shadow-md shadow-[#E97796]/20"
            >
              <Heart size={18} />
              Qixi reservation
            </Link>
            <Link
              href="/custom"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D8A95D] bg-[#FFFCF7] px-6 py-3 font-semibold text-[#6B3F2A]"
            >
              <Sparkles size={18} />
              Custom cake
            </Link>
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#F7B6C8]/50 bg-[#FFFCF7] p-5 shadow-xl shadow-[#E97796]/10">
          <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,#FFE8DC,#F7B6C8_55%,#FFE4A3)] p-8 text-center">
            <div>
              <Gift className="mx-auto mb-4 text-[#6B3F2A]" size={44} />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B3F2A]">
                Cake photo coming soon
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#2B1E1A]">
                Soft cream, blush florals, gift-ready finishing
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#FFFCF7] px-5 py-12">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          <EntryCard
            href="/qixi"
            title="Qixi campaign"
            text={'Mini 4" and Signature 6" cakes with photo frame, printed photo, and gift box.'}
            cta="Reserve Qixi cake"
          />
          <EntryCard
            href="/custom"
            title="Daily custom cakes"
            text="Birthday, kids theme, couple, family, and corporate celebration cakes."
            cta="Reserve custom cake"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            "Choose a cake style.",
            "Submit WhatsApp, name, delivery date, and area.",
            "MuYi follows up on WhatsApp to confirm details.",
          ].map((step, index) => (
            <div key={step} className="rounded-3xl bg-[#FFFCF7] p-5 shadow-sm">
              <span className="text-sm font-semibold text-[#E97796]">
                Step {index + 1}
              </span>
              <p className="mt-3 text-lg font-medium">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#FFE8DC] px-5 py-8 text-center text-sm text-[#7A6258]">
        MuYi Cakes SG. Reservations only. Payment and delivery timing are
        confirmed later on WhatsApp.
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
