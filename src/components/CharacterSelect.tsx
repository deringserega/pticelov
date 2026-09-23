"use client";

import Image from "next/image";
import { useState } from "react";
import { CHARACTERS } from "@/lib/gameData";

interface Props {
  unlockedCharacters: string[];
  currentCharacter: string;
  coins: number;
  busy: boolean;
  onChoose: (key: string) => void;
  onClose?: () => void;
  standalone?: boolean;
}

export default function CharacterSelect({
  unlockedCharacters,
  currentCharacter,
  coins,
  busy,
  onChoose,
  onClose,
  standalone,
}: Props) {
  const [selected, setSelected] = useState(currentCharacter);
  const selectedDef = CHARACTERS.find((c) => c.key === selected)!;
  const isUnlocked = unlockedCharacters.includes(selected);

  return (
    <div className={standalone ? "flex min-h-screen flex-col items-center justify-center bg-[#0c1710] px-4 py-10" : "flex flex-col"}>
      {standalone && (
        <div className="mb-6 text-center">
          <h1 className="font-display text-4xl font-bold text-amber-300 drop-shadow-lg sm:text-5xl">ПТИЦЕЛОВ</h1>
          <p className="mt-2 text-sm text-emerald-100/80">Лови · Собирай · Продавай · Развивайся</p>
        </div>
      )}

      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#14251a]/90 p-4 shadow-2xl backdrop-blur sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white sm:text-xl">Выбери героя</h2>
          {onClose && (
            <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
              ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CHARACTERS.map((c) => {
            const unlocked = unlockedCharacters.includes(c.key);
            const active = selected === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelected(c.key)}
                className={`group relative flex flex-col items-center rounded-2xl border-2 p-2 transition ${
                  active ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-black/20 hover:border-white/30"
                }`}
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-xl sm:h-24 sm:w-24">
                  <Image src={c.image} alt={c.name} fill className="object-cover" sizes="120px" />
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg">🔒</div>
                  )}
                </div>
                <div className="mt-2 text-sm font-bold text-white">{c.name}</div>
                <div className="text-[11px] text-emerald-200/70">{c.title}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl bg-black/25 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-bold text-amber-300">{selectedDef.name}</div>
              <div className="text-xs text-emerald-200/70">{selectedDef.title}</div>
              <p className="mt-2 text-sm text-white/80">{selectedDef.description}</p>
            </div>
            <div className="shrink-0 space-y-1 text-right text-[11px] text-white/70">
              <div>Скорость: {Math.round(selectedDef.stats.speed * 100)}%</div>
              <div>Точность: +{Math.round(selectedDef.stats.catchBonus * 100)}%</div>
              <div>Радиус сачка: {Math.round(selectedDef.stats.netRadius * 100)}%</div>
              <div>Удача: {selectedDef.stats.luck >= 0 ? "+" : ""}{Math.round(selectedDef.stats.luck * 100)}%</div>
              <div>Клетка: +{selectedDef.stats.capacityBonus}</div>
            </div>
          </div>

          <button
            disabled={busy}
            onClick={() => onChoose(selected)}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-bold text-black shadow-lg disabled:opacity-50"
          >
            {isUnlocked
              ? selected === currentCharacter
                ? "Выбран"
                : "Играть за него"
              : `Открыть за ${selectedDef.cost.toLocaleString("ru-RU")} 🪙 (у вас ${coins.toLocaleString("ru-RU")})`}
          </button>
        </div>
      </div>
    </div>
  );
}
