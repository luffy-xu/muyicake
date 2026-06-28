import { NextRequest, NextResponse } from "next/server";
import { getPublicStyleDetail } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const localeParam = request.nextUrl.searchParams.get("locale") ?? "zh";
  const locale = isLocale(localeParam) ? localeParam : "zh";
  const style = await getPublicStyleDetail(id, locale);
  if (!style) {
    return NextResponse.json({ error: "Style not found" }, { status: 404 });
  }
  return NextResponse.json({ style });
}
