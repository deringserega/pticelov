import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CHARACTERS_MAP } from "@/lib/gameData";
import { getOrCreatePlayer, toPlayerDto } from "@/lib/server/player";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, characterKey } = body as { id?: string; characterKey?: string };
  if (!id || !characterKey || !CHARACTERS_MAP[characterKey]) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const player = await getOrCreatePlayer(id);
  const unlocked = new Set<string>((player.unlockedCharacters as string[]) ?? ["sergey"]);
  const def = CHARACTERS_MAP[characterKey];

  if (unlocked.has(characterKey)) {
    const [updated] = await db
      .update(players)
      .set({ characterKey, updatedAt: new Date() })
      .where(eq(players.id, id))
      .returning();
    return NextResponse.json(await toPlayerDto(updated));
  }

  if (player.coins < def.cost) {
    return NextResponse.json({ error: "not enough coins" }, { status: 400 });
  }

  unlocked.add(characterKey);
  const [updated] = await db
    .update(players)
    .set({
      coins: player.coins - def.cost,
      characterKey,
      unlockedCharacters: Array.from(unlocked),
      updatedAt: new Date(),
    })
    .where(eq(players.id, id))
    .returning();

  return NextResponse.json(await toPlayerDto(updated));
}
