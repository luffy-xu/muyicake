"use client";

import { useEffect, useState } from "react";
import type { getDictionary } from "@/lib/i18n";

type SlotData = { total: number; used: number; remaining: number };

function fmt(template: string, vars: Record<string, number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export function QixiSlotCounter({ dictionary }: { dictionary: ReturnType<typeof getDictionary> }) {
  const [data, setData] = useState<SlotData | null>(null);

  useEffect(() => {
    fetch("/api/qixi-slots")
      .then((r) => r.json() as Promise<SlotData>)
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  const d = dictionary.reservation.qixiSlots;
  const isSoldOut = data.remaining <= 0;
  const isLow = data.remaining <= 10;

  if (isSoldOut) {
    return (
      <div
        className="rounded-[14px] py-3 px-4 text-center text-[13px] font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#9B4060,#C86080)" }}
      >
        {d.soldOut}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center gap-2 rounded-[14px] py-3 px-4"
      style={{
        background: isLow ? "linear-gradient(135deg,#FFF2F6,#FFE8DC)" : "linear-gradient(135deg,#FFF7EC,#FFFCF7)",
        border: isLow ? "1.5px solid rgba(233,119,150,0.35)" : "1.5px solid rgba(216,169,93,0.3)",
      }}
    >
      <span className="text-[15px]">{isLow ? "🔥" : "✦"}</span>
      <span className="text-[13px] font-semibold text-[#2B1E1A]">
        {fmt(d.counter, { total: data.total, remaining: data.remaining })}
      </span>
      <span className="text-[11px] text-[#9C8A82]">{d.firstCome}</span>
    </div>
  );
}
