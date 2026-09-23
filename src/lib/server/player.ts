import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { inventory, players } from "@/db/schema";
import {
  CHARACTERS_MAP,
  computeLevel,
  defaultStats,
  type PlayerStats,
  type Rarity,
} from "@/lib/gameData";
import type { InventoryItemDto, PlayerDto } from "@/lib/types";
import type { PlayerRow } from "@/db/schema";

export function normalizeStats(raw: unknown): PlayerStats {
  const base = defaultStats();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<PlayerStats>;
  return {
    totalCaught: r.totalCaught ?? base.totalCaught,
    totalSold: r.totalSold ?? base.totalSold,
    totalEarned: r.totalEarned ?? base.totalEarned,
    cagesBought: r.cagesBought ?? base.cagesBought,
    foodBought: r.foodBought ?? base.foodBought,
    sessionsPlayed: r.sessionsPlayed ?? base.sessionsPlayed,
    bySpecies: { ...(r.bySpecies ?? {}) },
    byRarity: { ...base.byRarity, ...(r.byRarity ?? {}) },
  };
}

export async function getOrCreatePlayer(id: string, name?: string): Promise<PlayerRow> {
  const existing = await db.select().from(players).where(eq(players.id, id)).limit(1);
  if (existing[0]) return existing[0];

  const inserted = await db
    .insert(players)
    .values({
      id,
      name: name?.trim() || "Птицелов",
      characterKey: "sergey",
      coins: 500,
      xp: 0,
      cageCapacity: 10,
      foodBasic: 5,
      foodPremium: 0,
      unlockedCharacters: ["sergey"],
      unlockedLocations: ["forest"],
      stats: defaultStats(),
      questsClaimed: [],
    })
    .onConflictDoNothing({ target: players.id })
    .returning();

  if (inserted[0]) return inserted[0];

  const row = await db.select().from(players).where(eq(players.id, id)).limit(1);
  return row[0];
}

export function effectiveCapacity(player: PlayerRow): number {
  const char = CHARACTERS_MAP[player.characterKey] ?? CHARACTERS_MAP.sergey;
  return player.cageCapacity + char.stats.capacityBonus;
}

export async function getInventory(playerId: string): Promise<InventoryItemDto[]> {
  const rows = await db
    .select()
    .from(inventory)
    .where(eq(inventory.playerId, playerId))
    .orderBy(asc(inventory.caughtAt));
  return rows.map((r) => ({
    id: r.id,
    speciesKey: r.speciesKey,
    rarity: r.rarity as Rarity,
    caughtAt: r.caughtAt.toISOString(),
  }));
}

export async function toPlayerDto(player: PlayerRow): Promise<PlayerDto> {
  const items = await getInventory(player.id);
  const { level, xpIntoLevel, xpForNext } = computeLevel(player.xp);
  return {
    id: player.id,
    name: player.name,
    characterKey: player.characterKey,
    coins: player.coins,
    xp: player.xp,
    level,
    xpIntoLevel,
    xpForNext,
    cageCapacity: player.cageCapacity,
    effectiveCageCapacity: effectiveCapacity(player),
    foodBasic: player.foodBasic,
    foodPremium: player.foodPremium,
    unlockedCharacters: (player.unlockedCharacters as string[]) ?? ["sergey"],
    unlockedLocations: (player.unlockedLocations as string[]) ?? ["forest"],
    stats: normalizeStats(player.stats),
    questsClaimed: (player.questsClaimed as string[]) ?? [],
    inventory: items,
  };
}

export async function removeInventoryItems(playerId: string, ids: number[]) {
  if (ids.length === 0) return;
  for (const id of ids) {
    await db.delete(inventory).where(and(eq(inventory.id, id), eq(inventory.playerId, playerId)));
  }
}
