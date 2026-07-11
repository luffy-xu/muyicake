import type { PublicStyleDetail } from "@/lib/catalog";
import { storybookThemeKeys, type StorybookThemeKey } from "@/lib/products";

/** Marketing copy only ("book N days ahead"). The actual minimum
 * deliverable date is enforced separately by getMinimumDeliveryDate(). */
export const STORYBOOK_PREP_DAYS = 5;

export type StorybookChapter = PublicStyleDetail & {
  /** The style's display name in the locale NOT being rendered, so a chapter
   * can show its bilingual title pair (EN + ZH) regardless of route locale. */
  nameOpposite: string;
  themeKey: StorybookThemeKey;
};

export function themeKeyFromStyleId(id: string): StorybookThemeKey | null {
  const key = id.replace(/^style_storybook_/, "");
  return (storybookThemeKeys as readonly string[]).includes(key) ? (key as StorybookThemeKey) : null;
}
