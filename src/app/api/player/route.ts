import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreatePlayer, toPlayerDto } from "@/lib/server/player";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const player = await getOrCreatePlayer(id);
  return NextResponse.json(await toPlayerDto(player));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, name } = body as { id?: string; name?: string };
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const player = await getOrCreatePlayer(id, name);
  if (name && name.trim() && name.trim() !== player.name) {
    const [updated] = await db
      .update(players)
      .set({ name: name.trim(), updatedAt: new Date() })
      .where(eq(players.id, id))
      .returning();
    return NextResponse.json(await toPlayerDto(updated));
  }
  return NextResponse.json(await toPlayerDto(player));
}
