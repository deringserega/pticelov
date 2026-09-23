import type { CaughtBirdPayload, PlayerDto } from "@/lib/types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Ошибка запроса");
  }
  return data as T;
}

export function fetchPlayer(id: string) {
  return request<PlayerDto>(`/api/player?id=${encodeURIComponent(id)}`);
}

export function createOrGetPlayer(id: string, name?: string) {
  return request<PlayerDto>("/api/player", { method: "POST", body: JSON.stringify({ id, name }) });
}

export function selectCharacter(id: string, characterKey: string) {
  return request<PlayerDto>("/api/player/character", {
    method: "POST",
    body: JSON.stringify({ id, characterKey }),
  });
}

export function unlockLocation(id: string, locationKey: string) {
  return request<PlayerDto>("/api/location/unlock", {
    method: "POST",
    body: JSON.stringify({ id, locationKey }),
  });
}

export function startSession(id: string, foodKey: "basic" | "premium") {
  return request<{ player: PlayerDto; session: { duration: number; luckBonus: number; alertReduction: number } }>(
    "/api/session/start",
    { method: "POST", body: JSON.stringify({ id, foodKey }) },
  );
}

export function submitCatches(id: string, birds: CaughtBirdPayload[]) {
  return request<{
    player: PlayerDto;
    result: { placedCount: number; overflowCount: number; coinsGained: number; xpGained: number };
  }>("/api/catch", { method: "POST", body: JSON.stringify({ id, birds }) });
}

export function sellBirds(id: string, ids?: number[], all?: boolean) {
  return request<{ player: PlayerDto; result: { coinsGained: number; count: number } }>("/api/sell", {
    method: "POST",
    body: JSON.stringify({ id, ids, all }),
  });
}

export function buyFood(id: string, foodKey: "basic" | "premium", qty: number) {
  return request<PlayerDto>("/api/shop/food", { method: "POST", body: JSON.stringify({ id, foodKey, qty }) });
}

export function buyCage(id: string) {
  return request<PlayerDto>("/api/shop/cage", { method: "POST", body: JSON.stringify({ id }) });
}

export function claimQuest(id: string, questKey: string) {
  return request<PlayerDto>("/api/quest/claim", { method: "POST", body: JSON.stringify({ id, questKey }) });
}
