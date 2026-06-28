"use client";

import type { Product } from "@/lib/products";

export function ProductCard({
  product,
  name,
  description,
  badge,
  photoLabel,
  selectLabel,
  selected,
  onSelect,
}: {
  product: Product;
  name: string;
  description: string;
  badge?: string;
  photoLabel: string;
  selectLabel: string;
  selected: boolean;
  onSelect: (product: Product) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={`flex h-full w-full flex-col rounded-[1.75rem] border p-5 text-left shadow-sm transition ${
        selected
          ? "border-[#E97796] bg-[#FFE8DC]"
          : "border-[#FFE8DC] bg-[#FFFCF7] hover:border-[#F7B6C8]"
      }`}
      aria-pressed={selected}
    >
      <div className="mb-4 flex aspect-[5/3] items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#FFF7EC,#F7B6C8,#D9C7F2)] text-center text-sm font-semibold text-[#6B3F2A]">
        {photoLabel}
      </div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-[#2B1E1A]">{name}</h3>
        {badge ? (
          <span className="shrink-0 rounded-full bg-[#D8A95D] px-3 py-1 text-xs font-semibold text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xl font-semibold text-[#E97796]">
        {product.priceLabel}
      </p>
      <p className="mt-3 flex-1 text-sm leading-6 text-[#7A6258]">
        {description}
      </p>
      <span className="mt-5 text-sm font-semibold text-[#6B3F2A]">
        {selectLabel}
      </span>
    </button>
  );
}
