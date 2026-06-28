import { describe, expect, it } from "vitest";
import { localizedPath, oppositeLocalePath } from "@/lib/i18n";

describe("locale route helpers", () => {
  it("builds default Chinese paths without a locale prefix", () => {
    expect(localizedPath("/en/qixi", "zh")).toBe("/qixi");
    expect(localizedPath("/en", "zh")).toBe("/");
  });

  it("builds English paths with the /en prefix", () => {
    expect(localizedPath("/qixi", "en")).toBe("/en/qixi");
    expect(localizedPath("/", "en")).toBe("/en");
  });

  it("switches to the equivalent opposite locale route", () => {
    expect(oppositeLocalePath("/qixi")).toBe("/en/qixi");
    expect(oppositeLocalePath("/en/custom")).toBe("/custom");
  });
});
