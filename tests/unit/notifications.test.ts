import { describe, expect, it, vi } from "vitest";
import { sendNewReservationNotification } from "@/lib/notifications";
import type { Reservation } from "@/lib/validations";

const reservation: Reservation = {
  id: "MUYI-20260628-1234",
  locale: "en",
  sourcePage: "custom",
  reservationCategory: "birthday",
  productCode: "birthday_6_inch",
  productName: 'Signature Birthday Cake 6"',
  basePrice: 117,
  currency: "SGD",
  whatsapp: "+65 9123 4567",
  customerName: "Jane",
  deliveryDate: "2026-08-20",
  deliveryArea: "238872",
  deliveryAddress: "391 Orchard Road #10-01, Singapore 238872",
  isInterestedInMembership: false,
  status: "new",
  adminNote: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("sendNewReservationNotification", () => {
  it("does nothing when Resend env vars are missing", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    await sendNewReservationNotification(reservation);
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });
});
