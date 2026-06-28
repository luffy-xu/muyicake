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
  deliveryArea: "Tampines",
};

describe("reservationCreateSchema", () => {
  it("accepts required reservation fields", () => {
    expect(reservationCreateSchema.safeParse(basePayload).success).toBe(true);
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
});
