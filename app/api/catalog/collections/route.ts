import { NextRequest, NextResponse } from "next/server";
import { listPublicCollections } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const localeParam = params.get("locale") ?? "zh";
  const locale = isLocale(localeParam) ? localeParam : "zh";
  const typeParam = params.get("type");
  const types = typeParam
    ?.split(",")
    .filter((type): type is "qixi" | "birthday" | "custom" =>
      type === "qixi" || type === "birthday" || type === "custom",
    );
  const collections = await listPublicCollections(locale, types?.length ? types : undefined);
  return NextResponse.json({ collections });
}
