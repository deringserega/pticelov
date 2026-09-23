// Общая конфигурация игры "Птицелов" — используется и на клиенте, и на сервере (API routes).
// Здесь нет обращений к DOM/React, поэтому файл можно импортировать где угодно.

export type Rarity = "common" | "uncommon" | "rare" | "epic";

export const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic"];

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Обычная",
  uncommon: "Необычная",
  rare: "Редкая",
  epic: "Эпическая",
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#9ca3af",
  uncommon: "#4ade80",
  rare: "#60a5fa",
  epic: "#c084fc",
};

export const RARITY_XP: Record<Rarity, number> = {
  common: 5,
  uncommon: 12,
  rare: 24,
  epic: 45,
};

export interface SpeciesDef {
  key: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  basePrice: number;
  /** 0..1, влияет на радиус настороженности и скорость бегства */
  evasion: number;
  /** множитель скорости полёта относительно базовой */
  speed: number;
  color: string;
}

export const SPECIES: SpeciesDef[] = [
  { key: "vorobey", name: "Воробей", emoji: "🐦", rarity: "common", basePrice: 18, evasion: 0.12, speed: 1.0, color: "#a8825c" },
  { key: "sinitsa", name: "Синица", emoji: "🐤", rarity: "common", basePrice: 26, evasion: 0.16, speed: 1.05, color: "#eab308" },
  { key: "zelenushka", name: "Зеленушка", emoji: "🐥", rarity: "common", basePrice: 32, evasion: 0.2, speed: 1.1, color: "#84cc16" },
  { key: "chizh", name: "Чиж", emoji: "🐦", rarity: "uncommon", basePrice: 48, evasion: 0.26, speed: 1.18, color: "#ca8a04" },
  { key: "chechetka", name: "Чечётка", emoji: "🐦", rarity: "uncommon", basePrice: 58, evasion: 0.3, speed: 1.22, color: "#f43f5e" },
  { key: "popolzen", name: "Поползень", emoji: "🐦", rarity: "uncommon", basePrice: 64, evasion: 0.32, speed: 1.2, color: "#64748b" },
  { key: "kamyshovka", name: "Камышовка", emoji: "🐦", rarity: "rare", basePrice: 95, evasion: 0.42, speed: 1.3, color: "#78716c" },
  { key: "schegol", name: "Щегол", emoji: "🐦", rarity: "rare", basePrice: 118, evasion: 0.46, speed: 1.34, color: "#dc2626" },
  { key: "sviristel", name: "Свиристель", emoji: "🐦", rarity: "rare", basePrice: 145, evasion: 0.5, speed: 1.3, color: "#d6a4a4" },
  { key: "uragus", name: "Урагуз", emoji: "🐦", rarity: "epic", basePrice: 230, evasion: 0.58, speed: 1.4, color: "#ec4899" },
  { key: "snegir", name: "Снегирь", emoji: "🐦", rarity: "epic", basePrice: 270, evasion: 0.62, speed: 1.38, color: "#ef4444" },
];

export const SPECIES_MAP: Record<string, SpeciesDef> = Object.fromEntries(
  SPECIES.map((s) => [s.key, s]),
);

export interface LocationDef {
  key: string;
  name: string;
  description: string;
  unlockLevel: number;
  unlockCost: number;
  image: string;
  /** ключи видов и их относительный вес спавна */
  spawnTable: { key: string; weight: number }[];
  maxBirds: number;
  ambience: string;
}

export const LOCATIONS: LocationDef[] = [
  {
    key: "forest",
    name: "Лес",
    description: "Спокойная опушка леса — отличное место для новичка.",
    unlockLevel: 1,
    unlockCost: 0,
    image: "/images/loc-forest.jpg",
    spawnTable: [
      { key: "vorobey", weight: 30 },
      { key: "sinitsa", weight: 26 },
      { key: "zelenushka", weight: 18 },
      { key: "chizh", weight: 14 },
      { key: "popolzen", weight: 8 },
      { key: "schegol", weight: 4 },
    ],
    maxBirds: 7,
    ambience: "linear-gradient(180deg,#bfe3ff 0%,#eaffd8 60%,#dff5c2 100%)",
  },
  {
    key: "river",
    name: "Река",
    description: "Птицы слетаются к воде — больше редких видов.",
    unlockLevel: 3,
    unlockCost: 1500,
    image: "/images/loc-river.jpg",
    spawnTable: [
      { key: "sinitsa", weight: 22 },
      { key: "chechetka", weight: 20 },
      { key: "kamyshovka", weight: 20 },
      { key: "zelenushka", weight: 16 },
      { key: "chizh", weight: 14 },
      { key: "schegol", weight: 8 },
    ],
    maxBirds: 8,
    ambience: "linear-gradient(180deg,#bfe0ff 0%,#dff1ff 55%,#cdeaf0 100%)",
  },
  {
    key: "mountains",
    name: "Горы",
    description: "Высоко в горах гнездятся осторожные и редкие птицы.",
    unlockLevel: 6,
    unlockCost: 4000,
    image: "/images/loc-mountains.jpg",
    spawnTable: [
      { key: "schegol", weight: 24 },
      { key: "popolzen", weight: 22 },
      { key: "chechetka", weight: 20 },
      { key: "uragus", weight: 16 },
      { key: "sviristel", weight: 12 },
      { key: "snegir", weight: 6 },
    ],
    maxBirds: 8,
    ambience: "linear-gradient(180deg,#dceeff 0%,#eef4ff 60%,#e7e2f0 100%)",
  },
  {
    key: "swamp",
    name: "Болото",
    description: "Топкие места полны камышовок и свиристелей.",
    unlockLevel: 9,
    unlockCost: 8000,
    image: "/images/loc-swamp.jpg",
    spawnTable: [
      { key: "kamyshovka", weight: 26 },
      { key: "sviristel", weight: 22 },
      { key: "chechetka", weight: 18 },
      { key: "schegol", weight: 16 },
      { key: "uragus", weight: 12 },
      { key: "snegir", weight: 6 },
    ],
    maxBirds: 9,
    ambience: "linear-gradient(180deg,#cfe6d8 0%,#e3ecd2 55%,#d8e0bd 100%)",
  },
  {
    key: "winter",
    name: "Зимний лес",
    description: "Морозная тайга — царство снегирей и урагузов.",
    unlockLevel: 13,
    unlockCost: 16000,
    image: "/images/loc-winter.jpg",
    spawnTable: [
      { key: "snegir", weight: 26 },
      { key: "uragus", weight: 22 },
      { key: "sviristel", weight: 20 },
      { key: "schegol", weight: 18 },
      { key: "chechetka", weight: 14 },
    ],
    maxBirds: 9,
    ambience: "linear-gradient(180deg,#e8f2ff 0%,#f5fbff 55%,#e6edf5 100%)",
  },
];

export const LOCATIONS_MAP: Record<string, LocationDef> = Object.fromEntries(
  LOCATIONS.map((l) => [l.key, l]),
);

export interface CharacterDef {
  key: string;
  name: string;
  title: string;
  description: string;
  cost: number;
  image: string;
  stats: {
    speed: number; // множитель скорости передвижения
    catchBonus: number; // добавка к шансу поимки (0..1)
    netRadius: number; // множитель радиуса сачка
    luck: number; // добавка к весу редких/эпических птиц при спавне
    capacityBonus: number; // бонус к базовой вместимости клеток
  };
}

export const CHARACTERS: CharacterDef[] = [
  {
    key: "sergey",
    name: "Серёга",
    title: "Универсал",
    description: "Сбалансированный герой без слабых мест. Мечтает поймать всех птиц.",
    cost: 0,
    image: "/images/char-sergey.jpg",
    stats: { speed: 1, catchBonus: 0, netRadius: 1, luck: 0, capacityBonus: 0 },
  },
  {
    key: "kazak",
    name: "Казак",
    title: "Сила и выносливость",
    description: "Большой сачок и уверенная хватка — реже упускает добычу.",
    cost: 3000,
    image: "/images/char-kazak.jpg",
    stats: { speed: 0.9, catchBonus: 0.08, netRadius: 1.25, luck: -0.02, capacityBonus: 5 },
  },
  {
    key: "docent",
    name: "Доцент",
    title: "Больше клеток и науки",
    description: "Разбирается в повадках птиц — чаще встречает редкие виды.",
    cost: 5000,
    image: "/images/char-docent.jpg",
    stats: { speed: 0.85, catchBonus: 0.04, netRadius: 1, luck: 0.12, capacityBonus: 10 },
  },
  {
    key: "vitalya",
    name: "Виталя",
    title: "Скорость и ловкость",
    description: "Быстрые ноги и реакция — успевает туда, куда другие не добегут.",
    cost: 4000,
    image: "/images/char-vitalya.jpg",
    stats: { speed: 1.3, catchBonus: 0.06, netRadius: 1.05, luck: 0, capacityBonus: 0 },
  },
];

export const CHARACTERS_MAP: Record<string, CharacterDef> = Object.fromEntries(
  CHARACTERS.map((c) => [c.key, c]),
);

export interface FoodDef {
  key: "basic" | "premium";
  name: string;
  description: string;
  cost: number;
  duration: number; // seconds
  luckBonus: number; // добавка к весу редких птиц
  alertReduction: number; // уменьшение радиуса настороженности птиц, 0..1
}

export const FOODS: FoodDef[] = [
  {
    key: "basic",
    name: "Обычный корм",
    description: "Простая прикормка. Сессия ловли — 45 секунд.",
    cost: 60,
    duration: 45,
    luckBonus: 0,
    alertReduction: 0,
  },
  {
    key: "premium",
    name: "Улучшенный корм",
    description: "Птицы слетаются охотнее, редкие виды встречаются чаще. Сессия — 70 секунд.",
    cost: 180,
    duration: 70,
    luckBonus: 0.18,
    alertReduction: 0.25,
  },
];

export const BASE_CAGE_CAPACITY = 10;
export const CAGE_UPGRADE_STEP = 5;

export function cageUpgradeCost(cagesBought: number): number {
  return Math.round(450 * Math.pow(1.55, cagesBought));
}

export interface PlayerStats {
  totalCaught: number;
  totalSold: number;
  totalEarned: number;
  cagesBought: number;
  foodBought: number;
  sessionsPlayed: number;
  bySpecies: Record<string, number>;
  byRarity: Record<Rarity, number>;
}

export function defaultStats(): PlayerStats {
  return {
    totalCaught: 0,
    totalSold: 0,
    totalEarned: 0,
    cagesBought: 0,
    foodBought: 0,
    sessionsPlayed: 0,
    bySpecies: {},
    byRarity: { common: 0, uncommon: 0, rare: 0, epic: 0 },
  };
}

/** Вычисляет уровень игрока по общему опыту. */
export function computeLevel(xp: number): { level: number; xpIntoLevel: number; xpForNext: number } {
  let level = 1;
  let need = 150;
  let remaining = xp;
  while (remaining >= need) {
    remaining -= need;
    level++;
    need = 150 + (level - 1) * 90;
  }
  return { level, xpIntoLevel: remaining, xpForNext: need };
}

export interface QuestDef {
  key: string;
  title: string;
  description: string;
  metric:
    | "totalCaught"
    | "totalEarned"
    | "cagesBought"
    | "foodBought"
    | "sessionsPlayed"
    | "level"
    | `species:${string}`
    | `rarity:${Rarity}`;
  target: number;
  rewardCoins: number;
  rewardXp: number;
}

export const QUESTS: QuestDef[] = [
  { key: "catch_10", title: "Первая добыча", description: "Поймай 10 птиц", metric: "totalCaught", target: 10, rewardCoins: 150, rewardXp: 30 },
  { key: "catch_50", title: "Опытный птицелов", description: "Поймай 50 птиц", metric: "totalCaught", target: 50, rewardCoins: 500, rewardXp: 80 },
  { key: "catch_200", title: "Мастер сачка", description: "Поймай 200 птиц", metric: "totalCaught", target: 200, rewardCoins: 2000, rewardXp: 250 },
  { key: "catch_sinitsa_10", title: "Синичкин день", description: "Поймай 10 синиц", metric: "species:sinitsa", target: 10, rewardCoins: 250, rewardXp: 40 },
  { key: "catch_schegol_5", title: "Охота на щеглов", description: "Поймай 5 щеглов", metric: "species:schegol", target: 5, rewardCoins: 400, rewardXp: 60 },
  { key: "catch_rare_1", title: "Редкая удача", description: "Поймай 1 редкую птицу", metric: "rarity:rare", target: 1, rewardCoins: 300, rewardXp: 50 },
  { key: "catch_epic_1", title: "Легендарный трофей", description: "Поймай 1 эпическую птицу", metric: "rarity:epic", target: 1, rewardCoins: 800, rewardXp: 120 },
  { key: "catch_epic_5", title: "Коллекционер редкостей", description: "Поймай 5 эпических птиц", metric: "rarity:epic", target: 5, rewardCoins: 2500, rewardXp: 300 },
  { key: "sell_1000", title: "Первая выручка", description: "Продай птиц на 1000 монет суммарно", metric: "totalEarned", target: 1000, rewardCoins: 300, rewardXp: 40 },
  { key: "sell_10000", title: "Успешный бизнес", description: "Продай птиц на 10000 монет суммарно", metric: "totalEarned", target: 10000, rewardCoins: 1500, rewardXp: 200 },
  { key: "buy_cage_1", title: "Новый дом для птиц", description: "Купи улучшение клетки", metric: "cagesBought", target: 1, rewardCoins: 200, rewardXp: 30 },
  { key: "buy_cage_3", title: "Просторная вольера", description: "Купи 3 улучшения клетки", metric: "cagesBought", target: 3, rewardCoins: 900, rewardXp: 100 },
  { key: "buy_food_5", title: "Запасливый охотник", description: "Купи 5 упаковок корма", metric: "foodBought", target: 5, rewardCoins: 150, rewardXp: 20 },
  { key: "sessions_10", title: "Завсегдатай природы", description: "Сыграй 10 вылазок за птицами", metric: "sessionsPlayed", target: 10, rewardCoins: 400, rewardXp: 60 },
  { key: "level_5", title: "Растущее мастерство", description: "Достигни 5 уровня", metric: "level", target: 5, rewardCoins: 500, rewardXp: 0 },
  { key: "level_10", title: "Признанный птицелов", description: "Достигни 10 уровня", metric: "level", target: 10, rewardCoins: 1200, rewardXp: 0 },
];

export function getQuestProgress(
  metric: QuestDef["metric"],
  stats: PlayerStats,
  level: number,
): number {
  if (metric === "totalCaught") return stats.totalCaught;
  if (metric === "totalEarned") return stats.totalEarned;
  if (metric === "cagesBought") return stats.cagesBought;
  if (metric === "foodBought") return stats.foodBought;
  if (metric === "sessionsPlayed") return stats.sessionsPlayed;
  if (metric === "level") return level;
  if (metric.startsWith("species:")) {
    const key = metric.split(":")[1];
    return stats.bySpecies[key] ?? 0;
  }
  if (metric.startsWith("rarity:")) {
    const key = metric.split(":")[1] as Rarity;
    return stats.byRarity[key] ?? 0;
  }
  return 0;
}

export function weightedPick<T extends { key: string; weight: number }>(
  table: T[],
  luckBonus: number,
): string {
  const adjusted = table.map((t) => {
    const species = SPECIES_MAP[t.key];
    const rarityMult =
      species.rarity === "rare" ? 1 + luckBonus * 2 : species.rarity === "epic" ? 1 + luckBonus * 3 : 1;
    return { key: t.key, weight: Math.max(0.5, t.weight * rarityMult) };
  });
  const total = adjusted.reduce((s, t) => s + t.weight, 0);
  let roll = Math.random() * total;
  for (const item of adjusted) {
    roll -= item.weight;
    if (roll <= 0) return item.key;
  }
  return adjusted[adjusted.length - 1].key;
}

export function formatCoins(n: number): string {
  return n.toLocaleString("ru-RU");
}
