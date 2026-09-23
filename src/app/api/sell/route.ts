import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SPECIES_MAP } from "@/lib/gameData";
import { getInventory, getOrCreatePlayer, normalizeStats, removeInventoryItems, toPlayerDto } from "@/lib/server/player";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, ids, all } = body as { id?: string; ids?: number[]; all?: boolean };
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const player = await getOrCreatePlayer(id);
  const items = await getInventory(id);

  const toSell = all ? items : items.filter((i) => ids?.includes(i.id));
  if (toSell.length === 0) {
    return NextResponse.json({ player: await toPlayerDto(player), result: { coinsGained: 0, count: 0 } });
  }

  const stats = normalizeStats(player.stats);
  let coinsGained = 0;
  for (const item of toSell) {
    const species = SPECIES_MAP[item.speciesKey];
    const price = species?.basePrice ?? 10;
    coinsGained += price;
    stats.totalSold += 1;
    stats.totalEarned += price;
  }

  await removeInventoryItems(id, toSell.map((i) => i.id));

  const [updated] = await db
    .update(players)
    .set({ coins: player.coins + coinsGained, stats, updatedAt: new Date() })
    .where(eq(players.id, id))
    .returning();

  return NextResponse.json({
    player: await toPlayerDto(updated),
    result: { coinsGained, count: toSell.length },
  });
}
