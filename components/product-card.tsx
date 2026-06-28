"use client";

import type { Product } from "@/lib/products";

const cardConfig: Record<string, { gradient: string; emoji: string }> = {
  qixi_4_inch: { gradient: "linear-gradient(140deg,#FFE8DC 0%,#F7C4D0 58%,#F0AABF 100%)", emoji: "🌹" },
  qixi_6_inch: { gradient: "linear-gradient(140deg,#F7B6C8 0%,#E97796 50%,#C85A77 100%)", emoji: "🌹" },
  birthday_4_inch: { gradient: "linear-gradient(140deg,#FFF7DC 0%,#FFE4A3 58%,#F5C330 100%)", emoji: "🎂" },
  birthday_6_inch: { gradient: "linear-gradient(140deg,#FFE4A3 0%,#F5C330 58%,#E8A800 100%)", emoji: "🎂" },
  kids_theme: { gradient: "linear-gradient(140deg,#E4F4FF 0%,#C8E8FF 58%,#A8D4FF 100%)", emoji: "🧒" },
  celebration: { gradient: "linear-gradient(140deg,#ECD5F5 0%,#D9C7F2 58%,#C4ADE8 100%)", emoji: "💐" },
  corporate: { gradient: "linear-gradient(140deg,#D5E8FF 0%,#B8D4FF 58%,#9AB8F0 100%)", emoji: "🏢" },
  custom_theme: { gradient: "linear-gradient(140deg,#F0E8FF 0%,#D9C7F2 58%,#C4ADE8 100%)", emoji: "✨" },
};

export function ProductCard({
  product,
  name,
  description,
  badge,
  limitedLabel,
  photoLabel,
  selectLabel,
  selected,
  onSelect,
}: {
  product: Product;
  name: string;
  description: string;
  badge?: string;
  limitedLabel?: string;
  photoLabel: string;
  selectLabel: string;
  selected: boolean;
  onSelect: (product: Product) => void;
}) {
  const config = cardConfig[product.code] ?? { gradient: "linear-gradient(140deg,#FFE8DC,#F7C4D0)", emoji: "🎂" };

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="flex h-full w-full flex-col overflow-hidden rounded-[22px] text-left transition hover:-translate-y-0.5"
      aria-pressed={selected}
      style={{
        background: selected ? "#FFF0F4" : "#FFFCF7",
        border: selected ? "1.5px solid #E97796" : "1.5px solid rgba(247,182,200,0.38)",
        boxShadow: selected ? "0 3px 18px rgba(233,119,150,0.18)" : "0 3px 18px rgba(0,0,0,0.06)",
      }}
    >
      {/* Image area */}
      <div className="relative w-full" style={{ height: "160px", background: config.gradient }}>
        {badge && (
          <div
            className="absolute left-3 top-3 z-10 flex items-center gap-[5px] rounded-full px-[10px] py-[5px] text-[10px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#D8A95D,#B07F35)", boxShadow: "0 2px 8px rgba(176,127,53,0.4)" }}
          >
            ⭐ {badge}
          </div>
        )}
        {limitedLabel && !badge && (
          <div
            className="absolute left-3 top-3 z-10 rounded-full px-[10px] py-[4px] text-[9px] font-bold uppercase text-white"
            style={{ background: "linear-gradient(135deg,#E97796,#C85A77)", letterSpacing: "0.5px" }}
          >
            {limitedLabel}
          </div>
        )}
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="text-[44px]" role="img" aria-hidden="true">{config.emoji}</div>
          <div
            className="mt-1.5 font-mono text-[8px] uppercase tracking-[1.4px]"
            style={{ color: "rgba(107,63,42,0.55)" }}
          >
            {photoLabel}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col" style={{ padding: "16px 18px 18px" }}>
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] font-semibold leading-[1.3] text-[#2B1E1A]">{name}</h3>
          <div
            className="font-display ml-1 shrink-0 font-bold leading-none text-[#E97796]"
            style={{ fontSize: "20px" }}
          >
            {product.priceLabel}
          </div>
        </div>
        <p className="mb-3 flex items-baseline gap-1.5 text-[11px] leading-[1.6] text-[#7A6258]">
          <span className="shrink-0 text-[#D8A95D]">✦</span>
          <span>{description}</span>
        </p>
        <div className="mt-auto">
          <div
            className="w-full rounded-full py-[10px] text-center text-[12.5px] font-semibold transition"
            style={
              selected
                ? { background: "linear-gradient(135deg,#E97796,#C85A77)", color: "#fff", boxShadow: "0 4px 14px rgba(233,119,150,0.38)" }
                : { background: "#FFF7EC", border: "1.5px solid #E97796", color: "#E97796" }
            }
          >
            {selectLabel}
          </div>
        </div>
      </div>
    </button>
  );
}
