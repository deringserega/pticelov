import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { computeLevel, LOCATIONS_MAP } from "@/lib/gameData";
import { getOrCreatePlayer, toPlayerDto } from "@/lib/server/player";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, locationKey } = body as { id?: string; locationKey?: string };
  if (!id || !locationKey || !LOCATIONS_MAP[locationKey]) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const player = await getOrCreatePlayer(id);
  const unlocked = new Set<string>((player.unlockedLocations as string[]) ?? ["forest"]);
  if (unlocked.has(locationKey)) {
    return NextResponse.json(await toPlayerDto(player));
  }

  const def = LOCATIONS_MAP[locationKey];
  const { level } = computeLevel(player.xp);
  if (level < def.unlockLevel) {
    return NextResponse.json({ error: "level too low" }, { status: 400 });
  }
  if (player.coins < def.unlockCost) {
    return NextResponse.json({ error: "not enough coins" }, { status: 400 });
  }

  unlocked.add(locationKey);
  const [updated] = await db
    .update(players)
    .set({
      coins: player.coins - def.unlockCost,
      unlockedLocations: Array.from(unlocked),
      updatedAt: new Date(),
    })
    .where(eq(players.id, id))
    .returning();

  return NextResponse.json(await toPlayerDto(updated));
}
