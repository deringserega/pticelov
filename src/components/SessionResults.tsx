"use client";

import { formatCoins, RARITY_COLOR, SPECIES_MAP } from "@/lib/gameData";
import type { CaughtBirdPayload } from "@/lib/types";

interface Props {
  caught: CaughtBirdPayload[];
  coinsGained: number;
  xpGained: number;
  overflowCount: number;
  onClose: () => void;
}

export default function SessionResults({ caught, coinsGained, xpGained, overflowCount, onClose }: Props) {
  const grouped = new Map<string, number>();
  for (const b of caught) grouped.set(b.speciesKey, (grouped.get(b.speciesKey) ?? 0) + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="animate-pop-in w-full max-w-md rounded-3xl border border-white/10 bg-[#14251a] p-5 shadow-2xl">
        <h2 className="text-center text-xl font-bold text-amber-300">Вылазка завершена!</h2>

        {caught.length === 0 ? (
          <p className="mt-4 text-center text-sm text-emerald-100/70">В этот раз никого поймать не удалось. Попробуй ещё раз!</p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {Array.from(grouped.entries()).map(([key, count]) => {
              const sp = SPECIES_MAP[key];
              return (
                <div key={key} className="rounded-xl bg-black/25 p-2 text-center">
                  <div className="text-2xl">{sp.emoji}</div>
                  <div className="mt-1 text-xs font-bold text-white">{sp.name}</div>
                  <div className="text-[10px]" style={{ color: RARITY_COLOR[sp.rarity] }}>
                    ×{count}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex justify-around rounded-xl bg-black/25 p-3 text-sm font-bold">
          <div className="text-emerald-300">+{xpGained} XP</div>
          {coinsGained > 0 && <div className="text-amber-300">+{formatCoins(coinsGained)} 🪙</div>}
        </div>

        {overflowCount > 0 && (
          <p className="mt-3 text-center text-[11px] text-red-300">
            Клетка была заполнена: {overflowCount} птиц продано автоматически за полцены.
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-bold text-black shadow-lg"
        >
          В лагерь
        </button>
      </div>
    </div>
  );
}
