import { getPublicStyleDetail, listPublicStyles, type PublicStyleDetail } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { themeKeyFromStyleId, type StorybookChapter } from "@/lib/storybook";

export async function loadStorybookChapters(locale: Locale, collectionSlug: string): Promise<StorybookChapter[]> {
  const oppositeLocale: Locale = locale === "en" ? "zh" : "en";
  const [details, oppositeSummaries] = await Promise.all([
    listPublicStyles(locale, collectionSlug).then((summaries) =>
      Promise.all(summaries.map((summary) => getPublicStyleDetail(summary.id, locale))),
    ),
    listPublicStyles(oppositeLocale, collectionSlug),
  ]);

  const oppositeById = new Map(oppositeSummaries.map((summary) => [summary.id, summary.name]));

  return details
    .filter((detail): detail is PublicStyleDetail => detail !== null)
    .map((detail) => {
      const themeKey = themeKeyFromStyleId(detail.id);
      if (!themeKey) {
        return null;
      }
      return {
        ...detail,
        nameOpposite: oppositeById.get(detail.id) ?? detail.name,
        themeKey,
      };
    })
    .filter((chapter): chapter is StorybookChapter => chapter !== null);
}
