import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CAGE_UPGRADE_STEP, cageUpgradeCost } from "@/lib/gameData";
import { getOrCreatePlayer, normalizeStats, toPlayerDto } from "@/lib/server/player";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id } = body as { id?: string };
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const player = await getOrCreatePlayer(id);
  const stats = normalizeStats(player.stats);
  const cost = cageUpgradeCost(stats.cagesBought);
  if (player.coins < cost) return NextResponse.json({ error: "not enough coins" }, { status: 400 });

  stats.cagesBought += 1;

  const [updated] = await db
    .update(players)
    .set({
      coins: player.coins - cost,
      cageCapacity: player.cageCapacity + CAGE_UPGRADE_STEP,
      stats,
      updatedAt: new Date(),
    })
    .where(eq(players.id, id))
    .returning();

  return NextResponse.json(await toPlayerDto(updated));
}
