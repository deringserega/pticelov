import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FOODS } from "@/lib/gameData";
import { getOrCreatePlayer, normalizeStats, toPlayerDto } from "@/lib/server/player";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, foodKey } = body as { id?: string; foodKey?: "basic" | "premium" };
  const food = FOODS.find((f) => f.key === foodKey);
  if (!id || !food) return NextResponse.json({ error: "invalid request" }, { status: 400 });

  const player = await getOrCreatePlayer(id);
  const have = food.key === "basic" ? player.foodBasic : player.foodPremium;
  if (have <= 0) return NextResponse.json({ error: "no food" }, { status: 400 });

  const stats = normalizeStats(player.stats);
  stats.sessionsPlayed += 1;

  const [updated] = await db
    .update(players)
    .set({
      foodBasic: food.key === "basic" ? player.foodBasic - 1 : player.foodBasic,
      foodPremium: food.key === "premium" ? player.foodPremium - 1 : player.foodPremium,
      stats,
      updatedAt: new Date(),
    })
    .where(eq(players.id, id))
    .returning();

  return NextResponse.json({
    player: await toPlayerDto(updated),
    session: {
      duration: food.duration,
      luckBonus: food.luckBonus,
      alertReduction: food.alertReduction,
    },
  });
}
