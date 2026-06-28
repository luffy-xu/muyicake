import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { validateCatalogImageFile } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured. Add it before uploading catalog images." },
      { status: 503 },
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const validationError = validateCatalogImageFile(file instanceof File ? file : null);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const safeName = (file as File).name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
  const blob = await put(`catalog/${Date.now()}-${safeName}`, file as File, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return NextResponse.json({ success: true, url: blob.url });
}
