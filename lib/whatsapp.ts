import type { Reservation } from "@/lib/validations";

export function normalizeWhatsApp(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function createMerchantWhatsAppUrl(reservationId?: string) {
  const phone = normalizeWhatsApp(
    process.env.NEXT_PUBLIC_MERCHANT_WHATSAPP ?? "6591234567",
  );
  const text = reservationId
    ? `Hi MuYi Cakes, I submitted reservation ${reservationId}.`
    : "Hi MuYi Cakes, I would like to reserve a cake.";

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function createCustomerWhatsAppUrl(reservation: Pick<Reservation, "whatsapp" | "id" | "customerName" | "productName">) {
  const phone = normalizeWhatsApp(reservation.whatsapp);
  const text = `Hi ${reservation.customerName}, this is MuYi Cakes about your reservation ${reservation.id} for ${reservation.productName}.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
