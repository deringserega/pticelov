import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inventory, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { RARITY_XP, SPECIES_MAP, type Rarity } from "@/lib/gameData";
import { effectiveCapacity, getInventory, getOrCreatePlayer, normalizeStats, toPlayerDto } from "@/lib/server/player";
import type { CaughtBirdPayload } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, birds } = body as { id?: string; birds?: CaughtBirdPayload[] };
  if (!id || !Array.isArray(birds) || birds.length === 0) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const player = await getOrCreatePlayer(id);
  const capacity = effectiveCapacity(player);
  const currentItems = await getInventory(id);
  let freeSlots = Math.max(0, capacity - currentItems.length);

  const stats = normalizeStats(player.stats);
  let coinsGained = 0;
  let xpGained = 0;
  let placedCount = 0;
  let overflowCount = 0;
  const placed: { speciesKey: string; rarity: Rarity }[] = [];

  for (const bird of birds) {
    const species = SPECIES_MAP[bird.speciesKey];
    if (!species) continue;
    const rarity = species.rarity;
    const goldenMult = bird.isGolden ? 3 : 1;

    stats.totalCaught += 1;
    stats.bySpecies[bird.speciesKey] = (stats.bySpecies[bird.speciesKey] ?? 0) + 1;
    stats.byRarity[rarity] = (stats.byRarity[rarity] ?? 0) + 1;
    xpGained += RARITY_XP[rarity] * goldenMult;

    if (freeSlots > 0) {
      freeSlots -= 1;
      placedCount += 1;
      placed.push({ speciesKey: bird.speciesKey, rarity });
    } else {
      overflowCount += 1;
      const price = Math.round(species.basePrice * 0.5 * goldenMult);
      coinsGained += price;
      stats.totalSold += 1;
      stats.totalEarned += price;
    }
  }

  if (placed.length > 0) {
    await db.insert(inventory).values(
      placed.map((p) => ({ playerId: id, speciesKey: p.speciesKey, rarity: p.rarity })),
    );
  }

  const [updated] = await db
    .update(players)
    .set({
      coins: player.coins + coinsGained,
      xp: player.xp + xpGained,
      stats,
      updatedAt: new Date(),
    })
    .where(eq(players.id, id))
    .returning();

  return NextResponse.json({
    player: await toPlayerDto(updated),
    result: { placedCount, overflowCount, coinsGained, xpGained },
  });
}
