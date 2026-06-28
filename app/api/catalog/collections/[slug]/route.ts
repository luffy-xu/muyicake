import { NextRequest, NextResponse } from "next/server";
import { getPublicCollectionBySlug } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const localeParam = request.nextUrl.searchParams.get("locale") ?? "zh";
  const locale = isLocale(localeParam) ? localeParam : "zh";
  const collection = await getPublicCollectionBySlug(slug, locale);
  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }
  return NextResponse.json({ collection });
}
