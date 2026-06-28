import { describe, expect, it } from "vitest";
import { maxCatalogImageSizeBytes, validateCatalogImageFile } from "@/lib/uploads";

describe("catalog upload validation", () => {
  it("accepts allowed image files under 5MB", () => {
    const file = new File(["image"], "cake.webp", { type: "image/webp" });
    expect(validateCatalogImageFile(file)).toBeNull();
  });

  it("rejects unsupported file types", () => {
    const file = new File(["text"], "cake.txt", { type: "text/plain" });
    expect(validateCatalogImageFile(file)).toContain("JPEG");
  });

  it("rejects images larger than 5MB", () => {
    const file = new File([new Uint8Array(maxCatalogImageSizeBytes + 1)], "cake.png", {
      type: "image/png",
    });
    expect(validateCatalogImageFile(file)).toContain("5MB");
  });
});
