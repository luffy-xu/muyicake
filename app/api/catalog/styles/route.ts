import { NextRequest, NextResponse } from "next/server";
import { listPublicStyles } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const localeParam = params.get("locale") ?? "zh";
  const locale = isLocale(localeParam) ? localeParam : "zh";
  const styles = await listPublicStyles(locale, params.get("collectionSlug") ?? undefined);
  return NextResponse.json({ styles });
}
