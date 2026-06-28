import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  createCollection,
  createSizeOption,
  createStyle,
  createStyleImage,
  createStyleSection,
  deleteCollection,
  deleteSizeOption,
  deleteStyle,
  deleteStyleImage,
  deleteStyleSection,
  setCollectionActive,
  setStyleActive,
  updateCollection,
  updateSizeOption,
  updateStyle,
  updateStyleImage,
  updateStyleMainImage,
  updateStyleSection,
} from "@/lib/catalog";
import {
  adminCatalogActionSchema,
  cakeCollectionSchema,
  cakeSizeOptionSchema,
  cakeStyleImageSchema,
  cakeStyleSchema,
  cakeStyleSectionSchema,
} from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const action = adminCatalogActionSchema.safeParse(body);
  if (!action.success) {
    return NextResponse.json({ error: "Invalid catalog action", issues: action.error.flatten() }, { status: 400 });
  }

  try {
    const result = await runAction(action.data.action, action.data.id, body);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Catalog action failed." },
      { status: 400 },
    );
  }
}

async function runAction(action: string, id: string | undefined, body: unknown) {
  if (action === "createCollection") {
    return createCollection(cakeCollectionSchema.parse(body));
  }
  if (action === "updateCollection") {
    requireId(id);
    return updateCollection(id, cakeCollectionSchema.parse(body));
  }
  if (action === "toggleCollection") {
    requireId(id);
    return setCollectionActive(id, Boolean((body as { isActive?: unknown }).isActive));
  }
  if (action === "deleteCollection") {
    requireId(id);
    await deleteCollection(id);
    return null;
  }
  if (action === "createStyle") {
    return createStyle(cakeStyleSchema.parse(body));
  }
  if (action === "updateStyle") {
    requireId(id);
    return updateStyle(id, cakeStyleSchema.parse(body));
  }
  if (action === "toggleStyle") {
    requireId(id);
    return setStyleActive(id, Boolean((body as { isActive?: unknown }).isActive));
  }
  if (action === "deleteStyle") {
    requireId(id);
    await deleteStyle(id);
    return null;
  }
  if (action === "updateStyleMainImage") {
    requireId(id);
    const mainImageUrl = String((body as { mainImageUrl?: unknown }).mainImageUrl ?? "");
    if (!mainImageUrl) {
      throw new Error("Main image URL is required.");
    }
    return updateStyleMainImage(id, mainImageUrl);
  }
  if (action === "createImage") {
    return createStyleImage(cakeStyleImageSchema.parse(body));
  }
  if (action === "updateImage") {
    requireId(id);
    const parsed = cakeStyleImageSchema.parse(body);
    return updateStyleImage(id, parsed);
  }
  if (action === "deleteImage") {
    requireId(id);
    await deleteStyleImage(id);
    return null;
  }
  if (action === "createSection") {
    return createStyleSection(cakeStyleSectionSchema.parse(body));
  }
  if (action === "updateSection") {
    requireId(id);
    const parsed = cakeStyleSectionSchema.parse(body);
    return updateStyleSection(id, parsed);
  }
  if (action === "deleteSection") {
    requireId(id);
    await deleteStyleSection(id);
    return null;
  }
  if (action === "createSize") {
    return createSizeOption(cakeSizeOptionSchema.parse(body));
  }
  if (action === "updateSize") {
    requireId(id);
    const parsed = cakeSizeOptionSchema.parse(body);
    return updateSizeOption(id, parsed);
  }
  if (action === "deleteSize") {
    requireId(id);
    await deleteSizeOption(id);
    return null;
  }
  throw new Error("Unsupported catalog action.");
}

function requireId(id: string | undefined): asserts id is string {
  if (!id) {
    throw new Error("ID is required.");
  }
}
