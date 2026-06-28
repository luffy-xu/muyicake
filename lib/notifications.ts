import type { Reservation } from "@/lib/validations";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export async function sendNewReservationNotification(reservation: Reservation) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!apiKey || !to) {
    return;
  }

  const adminUrl = `${getSiteUrl()}/admin/reservations/${reservation.id}`;
  const subject = `New MuYi reservation ${reservation.id}`;
  const lines = [
    `Reservation ID: ${reservation.id}`,
    `Locale: ${reservation.locale}`,
    `Category: ${reservation.reservationCategory}`,
    `Product: ${reservation.productName}`,
    `Customer: ${reservation.customerName}`,
    `WhatsApp: ${reservation.whatsapp}`,
    `Delivery date: ${reservation.deliveryDate}`,
    `Delivery area: ${reservation.deliveryArea}`,
    `Admin detail: ${adminUrl}`,
    reservation.utmSource ? `UTM source: ${reservation.utmSource}` : "",
    reservation.utmCampaign ? `UTM campaign: ${reservation.utmCampaign}` : "",
  ].filter(Boolean);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MuYi Cakes <onboarding@resend.dev>",
        to,
        subject,
        text: lines.join("\n"),
      }),
    });

    if (!response.ok) {
      console.error("Failed to send reservation notification", await response.text());
    }
  } catch (error) {
    console.error("Failed to send reservation notification", error);
  }
}
