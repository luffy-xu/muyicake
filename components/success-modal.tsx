"use client";

import { MessageCircle, X } from "lucide-react";
import type { Locale, getDictionary } from "@/lib/i18n";
import type { Reservation } from "@/lib/validations";
import { createMerchantWhatsAppUrl } from "@/lib/whatsapp";

export function SuccessModal({
  reservation,
  dictionary,
  locale,
  onClose,
}: {
  reservation: Reservation;
  dictionary: ReturnType<typeof getDictionary>;
  locale: Locale;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-4 sm:items-center sm:justify-center">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-[2rem] bg-[#FFFCF7] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#D8A95D]">
              {dictionary.reservation.success.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#2B1E1A]">
              {dictionary.reservation.success.title}
            </h2>
          </div>
          <button
            aria-label={dictionary.reservation.success.close}
            onClick={onClose}
            className="rounded-full bg-[#FFF7EC] p-2 text-[#6B3F2A]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-5 rounded-2xl bg-[#FFF7EC] p-4 text-sm leading-7 text-[#7A6258]">
          <p>
            {dictionary.reservation.success.reservationId}:{" "}
            <strong className="text-[#2B1E1A]">{reservation.id}</strong>
          </p>
          <p>{dictionary.reservation.success.product}: {reservation.productName}</p>
          {reservation.selectedStyleName ? (
            <p>
              {dictionary.catalog.selectedStyle}: {reservation.selectedStyleName}
              {reservation.selectedSizeLabel ? ` / ${reservation.selectedSizeLabel}` : ""}
              {reservation.selectedPrice ? ` / S$${reservation.selectedPrice}` : ""}
            </p>
          ) : null}
          <p>{dictionary.reservation.success.delivery}: {reservation.deliveryDate}, {reservation.deliveryArea}</p>
        </div>
        <p className="mt-5 leading-7 text-[#7A6258]">
          {dictionary.reservation.success.text}
        </p>
        <a
          href={createMerchantWhatsAppUrl(reservation.id, locale)}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white"
        >
          <MessageCircle size={18} />
          {dictionary.reservation.success.whatsapp}
        </a>
      </div>
    </div>
  );
}
