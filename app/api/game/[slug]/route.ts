import { NextResponse } from "next/server";
import { deleteRoom, getRoom, saveRoom } from "@/lib/game/rooms";
import { normalizeRoomSlug, parseGameState } from "@/lib/game/validate";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 200_000;

type Context = { params: Promise<{ slug: string }> };

async function roomSlug(context: Context) {
  return normalizeRoomSlug((await context.params).slug);
}

export async function GET(_request: Request, context: Context) {
  const slug = await roomSlug(context);
  if (!slug) return NextResponse.json({ error: "invalid_room" }, { status: 400 });
  const room = await getRoom(slug);
  return NextResponse.json({ room }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request, context: Context) {
  const slug = await roomSlug(context);
  if (!slug) return NextResponse.json({ error: "invalid_room" }, { status: 400 });

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });

  let body: { state?: unknown; baseRevision?: unknown; force?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const state = parseGameState(body.state);
  if (!state) return NextResponse.json({ error: "invalid_state" }, { status: 400 });
  const baseRevision = typeof body.baseRevision === "number" ? body.baseRevision : null;

  const result = await saveRoom(slug, state, baseRevision, body.force === true);
  if (!result.ok) return NextResponse.json({ error: "conflict", room: result.current }, { status: 409 });
  return NextResponse.json({ room: { revision: result.room.revision, updatedAt: result.room.updatedAt } });
}

export async function DELETE(_request: Request, context: Context) {
  const slug = await roomSlug(context);
  if (!slug) return NextResponse.json({ error: "invalid_room" }, { status: 400 });
  await deleteRoom(slug);
  return new NextResponse(null, { status: 204 });
}
