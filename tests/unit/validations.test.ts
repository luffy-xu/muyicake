import { describe, expect, it } from "vitest";
import { reservationCreateSchema } from "@/lib/validations";

const basePayload = {
  sourcePage: "qixi",
  reservationCategory: "qixi",
  productCode: "qixi_6_inch",
  productName: 'Qixi Signature Cake 6"',
  basePrice: 117,
  currency: "SGD",
  whatsapp: "+65 9123 4567",
  customerName: "Mei Lin",
  deliveryDate: "2026-08-19",
  deliveryAddress: "Blk 123 Tampines St 11 #08-88, Singapore 521123",
};

describe("reservationCreateSchema", () => {
  it("accepts required reservation fields", () => {
    const result = reservationCreateSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.locale).toBe("zh");
      expect(result.data.deliveryArea).toBe("521123");
    }
  });

  it("accepts locale and attribution fields", () => {
    const result = reservationCreateSchema.safeParse({
      ...basePayload,
      locale: "en",
      utmSource: "instagram",
      utmCampaign: "qixi_preheat",
      referrer: "https://www.instagram.com/",
      landingPath: "/en/qixi?utm_source=instagram",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched product details", () => {
    const result = reservationCreateSchema.safeParse({
      ...basePayload,
      productName: "Wrong cake",
    });
    expect(result.success).toBe(false);
  });

  it("rejects qixi category with a custom product", () => {
    const result = reservationCreateSchema.safeParse({
      ...basePayload,
      productCode: "birthday_6_inch",
      productName: 'Signature Birthday Cake 6"',
      basePrice: 117,
    });
    expect(result.success).toBe(false);
  });

  it("rejects delivery dates before launch availability", () => {
    const result = reservationCreateSchema.safeParse({
      ...basePayload,
      deliveryDate: "2026-08-17",
    });
    expect(result.success).toBe(false);
  });

  it("rejects addresses without a Singapore postal code", () => {
    const result = reservationCreateSchema.safeParse({
      ...basePayload,
      deliveryAddress: "Tampines Street 11",
    });
    expect(result.success).toBe(false);
  });
});
