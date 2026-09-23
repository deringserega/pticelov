"use client";

import { useEffect, useState } from "react";
import CharacterSelect from "@/components/CharacterSelect";
import Camp from "@/components/Camp";
import GameCanvas from "@/components/GameCanvas";
import SessionResults from "@/components/SessionResults";
import * as api from "@/lib/api";
import { FOODS } from "@/lib/gameData";
import type { CaughtBirdPayload, PlayerDto } from "@/lib/types";

const STORAGE_KEY = "birdcatcher_player_id";
const INTRO_KEY = "birdcatcher_intro_done";

function getOrCreateLocalId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

type Screen = "boot" | "intro" | "camp" | "playing";

export default function GameApp() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerDto | null>(null);
  const [screen, setScreen] = useState<Screen>("boot");
  const [error, setError] = useState<string | null>(null);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    locationKey: string;
    duration: number;
    luckBonus: number;
    alertReduction: number;
    freeSlots: number;
  } | null>(null);
  const [results, setResults] = useState<{
    caught: CaughtBirdPayload[];
    coinsGained: number;
    xpGained: number;
    overflowCount: number;
  } | null>(null);

  useEffect(() => {
    const id = getOrCreateLocalId();
    setPlayerId(id);
    api
      .createOrGetPlayer(id)
      .then((p) => {
        setPlayer(p);
        const introDone = window.localStorage.getItem(INTRO_KEY) === "1";
        setScreen(introDone ? "camp" : "intro");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Не удалось загрузить игрока"));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c1710] p-6 text-center text-red-300">
        Ошибка загрузки: {error}
      </div>
    );
  }

  if (screen === "boot" || !player || !playerId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0c1710] text-amber-200">
        <div className="text-4xl">🐦</div>
        <div className="text-sm font-semibold">Загружаем лагерь птицелова…</div>
      </div>
    );
  }

  if (screen === "intro") {
    return (
      <CharacterSelect
        standalone
        unlockedCharacters={player.unlockedCharacters}
        currentCharacter={player.characterKey}
        coins={player.coins}
        busy={false}
        onChoose={async (key) => {
          const updated = await api.selectCharacter(playerId, key);
          setPlayer(updated);
          window.localStorage.setItem(INTRO_KEY, "1");
          setScreen("camp");
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-[#0c1710]">
      {screen === "camp" && (
        <Camp
          playerId={playerId}
          player={player}
          setPlayer={setPlayer}
          onOpenCharacterSelect={() => setShowCharacterModal(true)}
          onStartSession={(locationKey, foodKey) => {
            const food = FOODS.find((f) => f.key === foodKey) ?? FOODS[0];
            const freeSlots = Math.max(0, player.effectiveCageCapacity - player.inventory.length);
            setActiveSession({ locationKey, duration: food.duration, luckBonus: food.luckBonus, alertReduction: food.alertReduction, freeSlots });
            setScreen("playing");
          }}
        />
      )}

      {screen === "playing" && activeSession && (
        <GameCanvas
          locationKey={activeSession.locationKey}
          characterKey={player.characterKey}
          duration={activeSession.duration}
          luckBonus={activeSession.luckBonus}
          alertReduction={activeSession.alertReduction}
          freeSlots={activeSession.freeSlots}
          onFinish={async (caught) => {
            if (caught.length === 0) {
              setResults({ caught: [], coinsGained: 0, xpGained: 0, overflowCount: 0 });
              setScreen("camp");
              return;
            }
            try {
              const { player: updated, result } = await api.submitCatches(playerId, caught);
              setPlayer(updated);
              setResults({
                caught,
                coinsGained: result.coinsGained,
                xpGained: result.xpGained,
                overflowCount: result.overflowCount,
              });
            } catch {
              setResults({ caught, coinsGained: 0, xpGained: 0, overflowCount: 0 });
            }
            setScreen("camp");
          }}
        />
      )}

      {results && (
        <SessionResults
          caught={results.caught}
          coinsGained={results.coinsGained}
          xpGained={results.xpGained}
          overflowCount={results.overflowCount}
          onClose={() => setResults(null)}
        />
      )}

      {showCharacterModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <CharacterSelect
              unlockedCharacters={player.unlockedCharacters}
              currentCharacter={player.characterKey}
              coins={player.coins}
              busy={false}
              onClose={() => setShowCharacterModal(false)}
              onChoose={async (key) => {
                try {
                  const updated = await api.selectCharacter(playerId, key);
                  setPlayer(updated);
                  setShowCharacterModal(false);
                } catch (e) {
                  setError(null);
                  alert(e instanceof Error ? e.message : "Ошибка");
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
