import { describe, expect, it } from "vitest";
import { createMerchantWhatsAppUrl, normalizeWhatsApp } from "@/lib/whatsapp";

describe("whatsapp helpers", () => {
  it("normalizes phone numbers", () => {
    expect(normalizeWhatsApp("+65 9123-4567")).toBe("6591234567");
  });

  it("includes the reservation id in merchant follow-up links", () => {
    expect(createMerchantWhatsAppUrl("MUYI-20260628-1234")).toContain(
      "MUYI-20260628-1234",
    );
  });
});
