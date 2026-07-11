import { describe, expect, it } from "vitest";
import { themeKeyFromStyleId } from "@/lib/storybook";
import { storybookThemeKeys } from "@/lib/products";

describe("themeKeyFromStyleId", () => {
  it("extracts a known theme key from a storybook style id", () => {
    expect(themeKeyFromStyleId("style_storybook_hotwheels")).toBe("hotwheels");
    expect(themeKeyFromStyleId("style_storybook_elsa")).toBe("elsa");
  });

  it("covers every declared storybook theme key", () => {
    for (const theme of storybookThemeKeys) {
      expect(themeKeyFromStyleId(`style_storybook_${theme}`)).toBe(theme);
    }
  });

  it("returns null for ids outside the storybook collections", () => {
    expect(themeKeyFromStyleId("style_qixi_memory_blush")).toBeNull();
    expect(themeKeyFromStyleId("style_storybook_unknown")).toBeNull();
  });
});
