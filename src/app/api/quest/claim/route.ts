import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { computeLevel, getQuestProgress, QUESTS } from "@/lib/gameData";
import { getOrCreatePlayer, normalizeStats, toPlayerDto } from "@/lib/server/player";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { id, questKey } = body as { id?: string; questKey?: string };
  const quest = QUESTS.find((q) => q.key === questKey);
  if (!id || !quest) return NextResponse.json({ error: "invalid request" }, { status: 400 });

  const player = await getOrCreatePlayer(id);
  const claimed = new Set<string>((player.questsClaimed as string[]) ?? []);
  if (claimed.has(quest.key)) {
    return NextResponse.json({ error: "already claimed" }, { status: 400 });
  }

  const stats = normalizeStats(player.stats);
  const { level } = computeLevel(player.xp);
  const progress = getQuestProgress(quest.metric, stats, level);
  if (progress < quest.target) {
    return NextResponse.json({ error: "quest not completed" }, { status: 400 });
  }

  claimed.add(quest.key);

  const [updated] = await db
    .update(players)
    .set({
      coins: player.coins + quest.rewardCoins,
      xp: player.xp + quest.rewardXp,
      questsClaimed: Array.from(claimed),
      updatedAt: new Date(),
    })
    .where(eq(players.id, id))
    .returning();

  return NextResponse.json(await toPlayerDto(updated));
}
