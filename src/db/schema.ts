import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("Птицелов"),
  characterKey: text("character_key").notNull().default("sergey"),
  coins: integer("coins").notNull().default(500),
  xp: integer("xp").notNull().default(0),
  cageCapacity: integer("cage_capacity").notNull().default(10),
  foodBasic: integer("food_basic").notNull().default(5),
  foodPremium: integer("food_premium").notNull().default(0),
  unlockedCharacters: jsonb("unlocked_characters").notNull().default(["sergey"]),
  unlockedLocations: jsonb("unlocked_locations").notNull().default(["forest"]),
  stats: jsonb("stats").notNull().default({
    totalCaught: 0,
    totalSold: 0,
    totalEarned: 0,
    cagesBought: 0,
    foodBought: 0,
    sessionsPlayed: 0,
    bySpecies: {},
    byRarity: { common: 0, uncommon: 0, rare: 0, epic: 0 },
  }),
  questsClaimed: jsonb("quests_claimed").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  speciesKey: text("species_key").notNull(),
  rarity: text("rarity").notNull(),
  caughtAt: timestamp("caught_at").notNull().defaultNow(),
});

export type PlayerRow = typeof players.$inferSelect;
export type InventoryRow = typeof inventory.$inferSelect;
