import { describe, expect, it } from "vitest";
import { createCustomerWhatsAppUrl, createMerchantWhatsAppUrl, normalizeWhatsApp } from "@/lib/whatsapp";

describe("whatsapp helpers", () => {
  it("normalizes phone numbers", () => {
    expect(normalizeWhatsApp("+65 9123-4567")).toBe("6591234567");
  });

  it("includes the reservation id in merchant follow-up links", () => {
    expect(createMerchantWhatsAppUrl("MUYI-20260628-1234")).toContain(
      "MUYI-20260628-1234",
    );
  });

  it("uses English customer follow-up text for English reservations", () => {
    const url = createCustomerWhatsAppUrl({
      id: "MUYI-20260628-1234",
      locale: "en",
      customerName: "Jane",
      productName: "Cake",
      whatsapp: "+65 9123 4567",
    });
    expect(decodeURIComponent(url)).toContain("Hi Jane");
  });

  it("uses Chinese customer follow-up text for Chinese reservations", () => {
    const url = createCustomerWhatsAppUrl({
      id: "MUYI-20260628-1234",
      locale: "zh",
      customerName: "小美",
      productName: "蛋糕",
      whatsapp: "+65 9123 4567",
    });
    expect(decodeURIComponent(url)).toContain("小美 你好");
  });
});
