import type { PlayerStats, Rarity } from "@/lib/gameData";

export interface InventoryItemDto {
  id: number;
  speciesKey: string;
  rarity: Rarity;
  caughtAt: string;
}

export interface PlayerDto {
  id: string;
  name: string;
  characterKey: string;
  coins: number;
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
  cageCapacity: number;
  effectiveCageCapacity: number;
  foodBasic: number;
  foodPremium: number;
  unlockedCharacters: string[];
  unlockedLocations: string[];
  stats: PlayerStats;
  questsClaimed: string[];
  inventory: InventoryItemDto[];
}

export interface CaughtBirdPayload {
  speciesKey: string;
  rarity: Rarity;
  isGolden?: boolean;
}
