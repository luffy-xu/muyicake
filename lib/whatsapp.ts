import type { Locale } from "@/lib/i18n";
import type { Reservation } from "@/lib/validations";

export function normalizeWhatsApp(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function createMerchantWhatsAppUrl(reservationId?: string, locale: Locale = "zh") {
  const phone = normalizeWhatsApp(
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE ??
      process.env.NEXT_PUBLIC_MERCHANT_WHATSAPP ??
      "6591234567",
  );
  const text =
    locale === "en"
      ? reservationId
        ? `Hi MuYi Cakes, I submitted reservation ${reservationId}.`
        : "Hi MuYi Cakes, I would like to reserve a cake."
      : reservationId
        ? `你好沐伊蛋糕，我已提交预订 ${reservationId}。`
        : "你好沐伊蛋糕，我想预订蛋糕。";

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function createCustomerWhatsAppUrl(reservation: Pick<Reservation, "whatsapp" | "id" | "customerName" | "productName" | "locale">) {
  const phone = normalizeWhatsApp(reservation.whatsapp);
  const text =
    reservation.locale === "en"
      ? `Hi ${reservation.customerName}, this is MuYi Cakes about your reservation ${reservation.id} for ${reservation.productName}.`
      : `${reservation.customerName} 你好，这里是沐伊蛋糕。我们想跟进你的预订 ${reservation.id}（${reservation.productName}）。`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
