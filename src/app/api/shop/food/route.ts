import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FOODS } from "@/lib/gameData";
import { getOrCreatePlayer, normalizeStats, toPlayerDto } from "@/lib/server/player";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, foodKey, qty } = body as { id?: string; foodKey?: "basic" | "premium"; qty?: number };
  const food = FOODS.find((f) => f.key === foodKey);
  const amount = Math.max(1, Math.min(20, Math.floor(qty ?? 1)));
  if (!id || !food) return NextResponse.json({ error: "invalid request" }, { status: 400 });

  const player = await getOrCreatePlayer(id);
  const totalCost = food.cost * amount;
  if (player.coins < totalCost) return NextResponse.json({ error: "not enough coins" }, { status: 400 });

  const stats = normalizeStats(player.stats);
  stats.foodBought += amount;

  const [updated] = await db
    .update(players)
    .set({
      coins: player.coins - totalCost,
      foodBasic: food.key === "basic" ? player.foodBasic + amount : player.foodBasic,
      foodPremium: food.key === "premium" ? player.foodPremium + amount : player.foodPremium,
      stats,
      updatedAt: new Date(),
    })
    .where(eq(players.id, id))
    .returning();

  return NextResponse.json(await toPlayerDto(updated));
}
