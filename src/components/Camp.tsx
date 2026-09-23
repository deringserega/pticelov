"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  CAGE_UPGRADE_STEP,
  cageUpgradeCost,
  CHARACTERS_MAP,
  FOODS,
  formatCoins,
  getQuestProgress,
  LOCATIONS,
  QUESTS,
  RARITY_COLOR,
  RARITY_LABEL,
  SPECIES_MAP,
} from "@/lib/gameData";
import type { PlayerDto } from "@/lib/types";
import * as api from "@/lib/api";

type Tab = "map" | "aviary" | "shop" | "quests" | "hero";

interface Props {
  playerId: string;
  player: PlayerDto;
  setPlayer: (p: PlayerDto) => void;
  onStartSession: (locationKey: string, foodKey: "basic" | "premium") => void;
  onOpenCharacterSelect: () => void;
}

export default function Camp({ playerId, player, setPlayer, onStartSession, onOpenCharacterSelect }: Props) {
  const [tab, setTab] = useState<Tab>("map");
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  async function guarded(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  const character = CHARACTERS_MAP[player.characterKey];
  const xpPct = Math.min(100, Math.round((player.xpIntoLevel / player.xpForNext) * 100));

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-[#0c1710] to-[#152a1b]">
      <header className="flex items-center gap-3 border-b border-white/10 bg-black/30 px-3 py-2.5 pt-[max(0.6rem,env(safe-area-inset-top))]">
        <button onClick={onOpenCharacterSelect} className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-amber-400">
          <Image src={character.image} alt={character.name} fill className="object-cover" sizes="44px" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-xs font-semibold text-white">
            <span className="truncate">{character.name} · Ур. {player.level}</span>
            <span className="text-emerald-300">{player.xpIntoLevel}/{player.xpForNext}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-sm font-bold text-amber-300">
          🪙 {formatCoins(player.coins)}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {tab === "map" && <MapTab player={player} playerId={playerId} setPlayer={setPlayer} onStartSession={onStartSession} notify={notify} guarded={guarded} busy={busy} />}
        {tab === "aviary" && <AviaryTab player={player} playerId={playerId} setPlayer={setPlayer} notify={notify} guarded={guarded} busy={busy} />}
        {tab === "shop" && <ShopTab player={player} playerId={playerId} setPlayer={setPlayer} notify={notify} guarded={guarded} busy={busy} />}
        {tab === "quests" && <QuestsTab player={player} playerId={playerId} setPlayer={setPlayer} notify={notify} guarded={guarded} busy={busy} />}
      </div>

      {toast && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black/85 px-4 py-2 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      <nav className="absolute inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-white/10 bg-[#0c1710]/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur">
        {(
          [
            { key: "map", label: "Карта", icon: "🗺️" },
            { key: "aviary", label: "Клетка", icon: "🐦" },
            { key: "shop", label: "Магазин", icon: "🛒" },
            { key: "quests", label: "Квесты", icon: "📜" },
          ] as { key: Tab; label: string; icon: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${
              tab === t.key ? "text-amber-300" : "text-white/60"
            }`}
          >
            <span className="text-lg">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

interface TabProps {
  player: PlayerDto;
  playerId: string;
  setPlayer: (p: PlayerDto) => void;
  notify: (m: string) => void;
  guarded: (fn: () => Promise<void>) => Promise<void>;
  busy: boolean;
}

function MapTab({ player, playerId, setPlayer, onStartSession, notify, guarded, busy }: TabProps & { onStartSession: Props["onStartSession"] }) {
  const [selectedLocation, setSelectedLocation] = useState(player.unlockedLocations[player.unlockedLocations.length - 1] ?? "forest");
  const [selectedFood, setSelectedFood] = useState<"basic" | "premium">(player.foodBasic > 0 ? "basic" : "premium");
  const usedSlots = player.inventory.length;
  const cap = player.effectiveCageCapacity;

  const loc = LOCATIONS.find((l) => l.key === selectedLocation)!;
  const unlocked = player.unlockedLocations.includes(loc.key);
  const canUnlock = player.level >= loc.unlockLevel;

  const foodCount = selectedFood === "basic" ? player.foodBasic : player.foodPremium;

  return (
    <div className="space-y-3 p-3">
      <div className="rounded-2xl bg-black/25 p-2 text-center text-xs font-semibold text-emerald-100/80">
        В клетках: {usedSlots}/{cap} {usedSlots >= cap && <span className="text-red-400">— клетка заполнена, продайте птиц</span>}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {LOCATIONS.map((l) => {
          const isUnlocked = player.unlockedLocations.includes(l.key);
          const isSelected = selectedLocation === l.key;
          return (
            <button
              key={l.key}
              onClick={() => setSelectedLocation(l.key)}
              className={`relative overflow-hidden rounded-2xl border-2 text-left ${
                isSelected ? "border-amber-400" : "border-white/10"
              }`}
            >
              <div className="relative h-24 w-full">
                <Image src={l.image} alt={l.name} fill className="object-cover" sizes="200px" />
                {!isUnlocked && <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-2xl">🔒</div>}
              </div>
              <div className="bg-black/50 px-2 py-1.5">
                <div className="text-sm font-bold text-white">{l.name}</div>
                <div className="text-[10px] text-emerald-200/70">
                  {isUnlocked ? "Открыто" : `Ур. ${l.unlockLevel} · ${formatCoins(l.unlockCost)} 🪙`}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-black/25 p-4">
        <div className="text-base font-bold text-white">{loc.name}</div>
        <p className="mt-1 text-xs text-emerald-100/70">{loc.description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {loc.spawnTable.map((s) => {
            const sp = SPECIES_MAP[s.key];
            return (
              <span
                key={s.key}
                className="rounded-full px-2 py-1 text-[10px] font-semibold"
                style={{ backgroundColor: `${RARITY_COLOR[sp.rarity]}22`, color: RARITY_COLOR[sp.rarity] }}
              >
                {sp.emoji} {sp.name}
              </span>
            );
          })}
        </div>

        {!unlocked ? (
          <button
            disabled={!canUnlock || player.coins < loc.unlockCost || busy}
            onClick={() =>
              guarded(async () => {
                const updated = await api.unlockLocation(playerId, loc.key);
                setPlayer(updated);
                notify(`Локация «${loc.name}» открыта!`);
              })
            }
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 py-2.5 text-sm font-bold text-black disabled:opacity-40"
          >
            {canUnlock ? `Открыть за ${formatCoins(loc.unlockCost)} 🪙` : `Нужен ${loc.unlockLevel} уровень`}
          </button>
        ) : (
          <>
            <div className="mt-3 flex gap-2">
              {FOODS.map((f) => {
                const count = f.key === "basic" ? player.foodBasic : player.foodPremium;
                return (
                  <button
                    key={f.key}
                    onClick={() => setSelectedFood(f.key)}
                    className={`flex-1 rounded-xl border-2 p-2 text-left ${
                      selectedFood === f.key ? "border-amber-400 bg-amber-400/10" : "border-white/10"
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{f.name}</div>
                    <div className="text-[10px] text-emerald-200/70">{f.duration}с · есть: {count}</div>
                  </button>
                );
              })}
            </div>
            <button
              disabled={foodCount <= 0 || busy}
              onClick={() =>
                guarded(async () => {
                  const { player: updated, session } = await api.startSession(playerId, selectedFood);
                  setPlayer(updated);
                  onStartSession(loc.key, selectedFood);
                  void session;
                })
              }
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-bold text-black shadow-lg disabled:opacity-40"
            >
              {foodCount > 0 ? "Отправиться на ловлю 🥅" : "Нет корма — купите в магазине"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AviaryTab({ player, playerId, setPlayer, notify, guarded, busy }: TabProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const grouped = useMemo(() => {
    const map = new Map<string, { count: number; ids: number[] }>();
    for (const item of player.inventory) {
      const cur = map.get(item.speciesKey) ?? { count: 0, ids: [] };
      cur.count += 1;
      cur.ids.push(item.id);
      map.set(item.speciesKey, cur);
    }
    return Array.from(map.entries()).map(([key, v]) => ({ species: SPECIES_MAP[key], ...v }));
  }, [player.inventory]);

  const selectedTotal = player.inventory
    .filter((i) => selected.has(i.id))
    .reduce((s, i) => s + (SPECIES_MAP[i.speciesKey]?.basePrice ?? 0), 0);
  const allTotal = player.inventory.reduce((s, i) => s + (SPECIES_MAP[i.speciesKey]?.basePrice ?? 0), 0);

  function toggleSpecies(ids: number[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      for (const id of ids) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-3 p-3">
      <div className="rounded-2xl bg-black/25 p-3 text-center text-sm font-semibold text-white">
        Вместимость клеток: {player.inventory.length}/{player.effectiveCageCapacity}
      </div>

      {player.inventory.length === 0 ? (
        <div className="rounded-2xl bg-black/20 p-6 text-center text-sm text-emerald-100/60">
          Клетка пуста. Отправляйся на карту и лови птиц!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {grouped.map((g) => (
            <button
              key={g.species.key}
              onClick={() => toggleSpecies(g.ids)}
              className={`rounded-2xl border-2 p-3 text-left ${
                g.ids.every((id) => selected.has(id)) ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-black/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{g.species.emoji}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                  style={{ backgroundColor: `${RARITY_COLOR[g.species.rarity]}33`, color: RARITY_COLOR[g.species.rarity] }}
                >
                  {RARITY_LABEL[g.species.rarity]}
                </span>
              </div>
              <div className="mt-1 text-sm font-bold text-white">{g.species.name}</div>
              <div className="text-[11px] text-emerald-200/70">×{g.count} · {g.species.basePrice} 🪙/шт</div>
            </button>
          ))}
        </div>
      )}

      {player.inventory.length > 0 && (
        <div className="sticky bottom-0 flex gap-2 rounded-2xl bg-black/40 p-3">
          <button
            disabled={selected.size === 0 || busy}
            onClick={() =>
              guarded(async () => {
                const ids = Array.from(selected);
                const { player: updated, result } = await api.sellBirds(playerId, ids);
                setPlayer(updated);
                setSelected(new Set());
                notify(`Продано ${result.count} птиц за ${formatCoins(result.coinsGained)} 🪙`);
              })
            }
            className="flex-1 rounded-xl bg-white/15 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            Продать выбранных ({formatCoins(selectedTotal)} 🪙)
          </button>
          <button
            disabled={busy}
            onClick={() =>
              guarded(async () => {
                const { player: updated, result } = await api.sellBirds(playerId, undefined, true);
                setPlayer(updated);
                setSelected(new Set());
                notify(`Продано ${result.count} птиц за ${formatCoins(result.coinsGained)} 🪙`);
              })
            }
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 py-2.5 text-sm font-bold text-black disabled:opacity-40"
          >
            Продать всё ({formatCoins(allTotal)} 🪙)
          </button>
        </div>
      )}
    </div>
  );
}

function ShopTab({ player, playerId, setPlayer, notify, guarded, busy }: TabProps) {
  const cageCost = cageUpgradeCost(player.stats.cagesBought);

  return (
    <div className="space-y-4 p-3">
      <div>
        <h3 className="mb-2 px-1 text-sm font-bold text-amber-300">Корм и приманка</h3>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {FOODS.map((f) => (
            <div key={f.key} className="rounded-2xl bg-black/25 p-3.5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white">{f.name}</div>
                <div className="text-xs text-emerald-200/70">есть: {f.key === "basic" ? player.foodBasic : player.foodPremium}</div>
              </div>
              <p className="mt-1 text-[11px] text-emerald-100/70">{f.description}</p>
              <div className="mt-3 flex gap-2">
                {[1, 5].map((qty) => (
                  <button
                    key={qty}
                    disabled={player.coins < f.cost * qty || busy}
                    onClick={() =>
                      guarded(async () => {
                        const updated = await api.buyFood(playerId, f.key, qty);
                        setPlayer(updated);
                        notify(`Куплено ${qty} × ${f.name}`);
                      })
                    }
                    className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 py-2 text-xs font-bold text-black disabled:opacity-40"
                  >
                    ×{qty} за {formatCoins(f.cost * qty)} 🪙
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 px-1 text-sm font-bold text-amber-300">Клетки</h3>
        <div className="rounded-2xl bg-black/25 p-3.5">
          <div className="text-sm font-bold text-white">Расширить вольеру</div>
          <p className="mt-1 text-[11px] text-emerald-100/70">
            Текущая вместимость: {player.cageCapacity} (+{player.effectiveCageCapacity - player.cageCapacity} от героя). Каждое улучшение
            добавляет +{CAGE_UPGRADE_STEP} мест.
          </p>
          <button
            disabled={player.coins < cageCost || busy}
            onClick={() =>
              guarded(async () => {
                const updated = await api.buyCage(playerId);
                setPlayer(updated);
                notify(`Клетка расширена до ${updated.cageCapacity}!`);
              })
            }
            className="mt-3 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 py-2.5 text-sm font-bold text-black disabled:opacity-40"
          >
            Улучшить за {formatCoins(cageCost)} 🪙
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestsTab({ player, playerId, setPlayer, notify, guarded, busy }: TabProps) {
  return (
    <div className="space-y-2 p-3">
      {QUESTS.map((q) => {
        const progress = getQuestProgress(q.metric, player.stats, player.level);
        const done = progress >= q.target;
        const claimed = player.questsClaimed.includes(q.key);
        const pct = Math.min(100, Math.round((progress / q.target) * 100));
        return (
          <div key={q.key} className={`rounded-2xl p-3.5 ${claimed ? "bg-black/10 opacity-60" : "bg-black/25"}`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-white">{q.title}</div>
                <div className="text-[11px] text-emerald-100/70">{q.description}</div>
              </div>
              <div className="shrink-0 text-right text-[11px] font-semibold text-amber-300">
                +{formatCoins(q.rewardCoins)} 🪙{q.rewardXp > 0 && ` · +${q.rewardXp} XP`}
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${done ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-white/60">
                {Math.min(progress, q.target)}/{q.target}
              </span>
              {claimed ? (
                <span className="text-[11px] font-bold text-emerald-400">Получено ✓</span>
              ) : (
                <button
                  disabled={!done || busy}
                  onClick={() =>
                    guarded(async () => {
                      const updated = await api.claimQuest(playerId, q.key);
                      setPlayer(updated);
                      notify(`Награда получена: +${formatCoins(q.rewardCoins)} 🪙`);
                    })
                  }
                  className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[11px] font-bold text-black disabled:opacity-30"
                >
                  Забрать
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
