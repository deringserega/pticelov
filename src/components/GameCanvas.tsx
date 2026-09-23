"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CHARACTERS_MAP,
  LOCATIONS_MAP,
  RARITY_COLOR,
  SPECIES_MAP,
  weightedPick,
} from "@/lib/gameData";
import type { CaughtBirdPayload } from "@/lib/types";

interface Bird {
  id: number;
  speciesKey: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: "idle" | "flee";
  spookedUntil: number;
  wanderTarget: { x: number; y: number };
  nextDecision: number;
  isGolden: boolean;
  flapPhase: number;
  caught: boolean;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface GameCanvasProps {
  locationKey: string;
  characterKey: string;
  duration: number;
  luckBonus: number;
  alertReduction: number;
  freeSlots: number;
  onFinish: (caught: CaughtBirdPayload[]) => void;
}

let birdIdSeq = 1;
let textIdSeq = 1;

export default function GameCanvas({
  locationKey,
  characterKey,
  duration,
  luckBonus,
  alertReduction,
  freeSlots,
  onFinish,
}: GameCanvasProps) {
  const location = LOCATIONS_MAP[locationKey];
  const character = CHARACTERS_MAP[characterKey];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const sizeRef = useRef({ w: 800, h: 500 });

  const playerRef = useRef({ x: 400, y: 300, facing: 1 });
  const moveKeysRef = useRef<Record<string, boolean>>({});
  const joystickVecRef = useRef({ x: 0, y: 0 });
  const birdsRef = useRef<Bird[]>([]);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const charImageRef = useRef<HTMLImageElement | null>(null);
  const sessionCaughtRef = useRef<CaughtBirdPayload[]>([]);
  const freeSlotsRef = useRef(freeSlots);
  const cooldownRef = useRef(0);
  const comboRef = useRef(0);
  const finishedRef = useRef(false);
  const catchFxRef = useRef<{ x: number; y: number; born: number } | null>(null);

  const [timeLeft, setTimeLeft] = useState(duration);
  const [caughtCount, setCaughtCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [joystick, setJoystick] = useState<{ active: boolean; baseX: number; baseY: number; knobX: number; knobY: number }>({
    active: false,
    baseX: 0,
    baseY: 0,
    knobX: 0,
    knobY: 0,
  });

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const spawnTable = useMemo(() => location.spawnTable, [location]);

  function pushFloatingText(x: number, y: number, text: string, color: string) {
    const id = textIdSeq++;
    setFloatingTexts((prev) => [...prev, { id, x, y, text, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 1100);
  }

  function spawnBird(w: number, h: number): Bird {
    const speciesKey = weightedPick(spawnTable, luckBonus);
    const isGolden = Math.random() < 0.025;
    const margin = 60;
    const x = margin + Math.random() * (w - margin * 2);
    const y = margin + Math.random() * (h * 0.6 - margin) + h * 0.05;
    return {
      id: birdIdSeq++,
      speciesKey,
      x,
      y,
      vx: 0,
      vy: 0,
      state: "idle",
      spookedUntil: 0,
      wanderTarget: { x, y },
      nextDecision: 0,
      isGolden,
      flapPhase: Math.random() * Math.PI * 2,
      caught: false,
    };
  }

  // load images once per key
  useEffect(() => {
    const img = new Image();
    img.src = location.image;
    bgImageRef.current = img;
  }, [location.image]);

  useEffect(() => {
    const img = new Image();
    img.src = character.image;
    charImageRef.current = img;
  }, [character.image]);

  // init birds + resize handling
  useEffect(() => {
    finishedRef.current = false;
    sessionCaughtRef.current = [];
    freeSlotsRef.current = freeSlots;
    comboRef.current = 0;
    setCaughtCount(0);
    setCombo(0);
    setTimeLeft(duration);

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    function resize() {
      if (!wrap || !canvas) return;
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
      playerRef.current.x = rect.width / 2;
      playerRef.current.y = rect.height * 0.72;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const { w, h } = sizeRef.current;
    birdsRef.current = Array.from({ length: location.maxBirds }, () => spawnBird(w, h));

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey, duration]);

  // keyboard controls
  useEffect(() => {
    function down(e: KeyboardEvent) {
      moveKeysRef.current[e.key.toLowerCase()] = true;
      if (e.key === " ") {
        e.preventDefault();
        tryCatch();
      }
    }
    function up(e: KeyboardEvent) {
      moveKeysRef.current[e.key.toLowerCase()] = false;
    }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinishRef.current([...sessionCaughtRef.current]);
  }

  function tryCatch() {
    if (finishedRef.current) return;
    const now = performance.now();
    if (now < cooldownRef.current) return;
    cooldownRef.current = now + 550;

    const player = playerRef.current;
    catchFxRef.current = { x: player.x, y: player.y, born: now };

    const netRadius = 78 * character.stats.netRadius;
    let nearest: Bird | null = null;
    let nearestDist = Infinity;
    for (const b of birdsRef.current) {
      if (b.caught) continue;
      const dist = Math.hypot(b.x - player.x, b.y - player.y);
      if (dist <= netRadius && dist < nearestDist) {
        nearest = b;
        nearestDist = dist;
      }
    }

    if (!nearest) {
      comboRef.current = 0;
      setCombo(0);
      pushFloatingText(player.x, player.y - 40, "Мимо!", "#f87171");
      return;
    }

    const species = SPECIES_MAP[nearest.speciesKey];
    const distanceFactor = (nearestDist / netRadius) * 0.18;
    const comboBonus = Math.min(0.1, comboRef.current * 0.015);
    const chance = Math.min(
      0.92,
      Math.max(0.06, 0.58 - species.evasion * 0.55 + character.stats.catchBonus + comboBonus - distanceFactor),
    );

    if (Math.random() < chance) {
      nearest.caught = true;
      comboRef.current += 1;
      setCombo(comboRef.current);
      sessionCaughtRef.current.push({ speciesKey: species.key, rarity: species.rarity, isGolden: nearest.isGolden });
      freeSlotsRef.current -= 1;
      setCaughtCount(sessionCaughtRef.current.length);
      const label = nearest.isGolden ? `✨ ${species.name}!` : `+ ${species.name}`;
      pushFloatingText(nearest.x, nearest.y - 30, label, nearest.isGolden ? "#facc15" : RARITY_COLOR[species.rarity]);

      const { w, h } = sizeRef.current;
      setTimeout(() => {
        if (finishedRef.current) return;
        const idx = birdsRef.current.indexOf(nearest as Bird);
        if (idx >= 0) birdsRef.current[idx] = spawnBird(w, h);
      }, 500 + Math.random() * 900);
    } else {
      nearest.state = "flee";
      nearest.spookedUntil = now + 2600;
      comboRef.current = 0;
      setCombo(0);
      pushFloatingText(nearest.x, nearest.y - 30, "Ускользнула!", "#f87171");
    }
  }

  // main loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    function update(dt: number, now: number) {
      const { w, h } = sizeRef.current;
      const player = playerRef.current;

      let dx = 0;
      let dy = 0;
      const keys = moveKeysRef.current;
      if (keys["arrowup"] || keys["w"]) dy -= 1;
      if (keys["arrowdown"] || keys["s"]) dy += 1;
      if (keys["arrowleft"] || keys["a"]) dx -= 1;
      if (keys["arrowright"] || keys["d"]) dx += 1;
      if (joystickVecRef.current.x || joystickVecRef.current.y) {
        dx += joystickVecRef.current.x;
        dy += joystickVecRef.current.y;
      }
      const len = Math.hypot(dx, dy) || 1;
      if (dx || dy) {
        const speed = 190 * character.stats.speed;
        player.x += (dx / len) * speed * dt;
        player.y += (dy / len) * speed * dt;
        player.facing = dx < 0 ? -1 : dx > 0 ? 1 : player.facing;
      }
      player.x = Math.max(30, Math.min(w - 30, player.x));
      player.y = Math.max(h * 0.25, Math.min(h - 30, player.y));

      const alertBase = 95;
      for (const b of birdsRef.current) {
        if (b.caught) continue;
        const species = SPECIES_MAP[b.speciesKey];
        const spooked = now < b.spookedUntil;
        const alertRadius = (alertBase + species.evasion * 170) * (1 - alertReduction) * (spooked ? 1.3 : 1);
        const distToPlayer = Math.hypot(b.x - player.x, b.y - player.y);

        if (distToPlayer < alertRadius || spooked) {
          b.state = "flee";
          const fx = b.x - player.x || Math.random() - 0.5;
          const fy = b.y - player.y || Math.random() - 0.5;
          const flen = Math.hypot(fx, fy) || 1;
          const fleeSpeed = 95 * species.speed * (spooked ? 1.5 : 1.15);
          b.vx = (fx / flen) * fleeSpeed;
          b.vy = (fy / flen) * fleeSpeed;
        } else {
          b.state = "idle";
          if (now > b.nextDecision) {
            const margin = 50;
            b.wanderTarget = {
              x: margin + Math.random() * (w - margin * 2),
              y: h * 0.05 + margin + Math.random() * (h * 0.55 - margin),
            };
            b.nextDecision = now + 1500 + Math.random() * 1800;
          }
          const tx = b.wanderTarget.x - b.x;
          const ty = b.wanderTarget.y - b.y;
          const tlen = Math.hypot(tx, ty) || 1;
          const wanderSpeed = 34 * species.speed;
          b.vx = (tx / tlen) * wanderSpeed;
          b.vy = (ty / tlen) * wanderSpeed;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const margin = 24;
        if (b.x < margin) { b.x = margin; b.vx *= -1; }
        if (b.x > w - margin) { b.x = w - margin; b.vx *= -1; }
        if (b.y < h * 0.03) { b.y = h * 0.03; b.vy *= -1; }
        if (b.y > h * 0.68) { b.y = h * 0.68; b.vy *= -1; }
        b.flapPhase += dt * (8 + species.speed * 4);
      }
    }

    function render(now: number) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      const bg = bgImageRef.current;
      if (bg && bg.complete && bg.naturalWidth > 0) {
        const scale = Math.max(w / bg.naturalWidth, h / bg.naturalHeight);
        const iw = bg.naturalWidth * scale;
        const ih = bg.naturalHeight * scale;
        ctx.drawImage(bg, (w - iw) / 2, (h - ih) / 2, iw, ih);
      } else {
        ctx.fillStyle = "#bfe3ff";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, w, h);

      for (const b of birdsRef.current) {
        if (b.caught) continue;
        const species = SPECIES_MAP[b.speciesKey];
        const bob = Math.sin(b.flapPhase) * 4;
        const scale = b.isGolden ? 1.35 : 1;
        ctx.save();
        ctx.translate(b.x, b.y + bob);

        if (b.isGolden) {
          ctx.save();
          ctx.rotate(now / 300);
          ctx.strokeStyle = "rgba(250,204,21,0.85)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.fillStyle = b.isGolden ? "rgba(250,204,21,0.35)" : hexToRgba(RARITY_COLOR[species.rarity], 0.28);
        ctx.arc(0, 0, 20 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `${28 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(species.emoji, 0, 2);
        ctx.restore();
      }

      // catch fx ring
      const fx = catchFxRef.current;
      if (fx && now - fx.born < 400) {
        const t = (now - fx.born) / 400;
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, 20 + t * (78 * character.stats.netRadius - 20), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // player
      const player = playerRef.current;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(player.x, player.y + 26, 22, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fill();

      const charImg = charImageRef.current;
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.scale(player.facing, 1);
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.closePath();
      ctx.save();
      ctx.clip();
      if (charImg && charImg.complete && charImg.naturalWidth > 0) {
        ctx.drawImage(charImg, -26, -30, 52, 52);
      } else {
        ctx.fillStyle = "#8b5e34";
        ctx.fillRect(-26, -26, 52, 52);
      }
      ctx.restore();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#fefce8";
      ctx.stroke();
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🥅", 24, -18);
      ctx.restore();
      ctx.restore();
    }

    function loop(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt, now);
      render(now);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKey, characterKey, alertReduction]);

  // touch joystick handlers
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setJoystick({ active: true, baseX: x, baseY: y, knobX: x, knobY: y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    setJoystick((j) => {
      if (!j.active) return j;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - j.baseX;
      const dy = y - j.baseY;
      const dist = Math.hypot(dx, dy);
      const maxDist = 46;
      const clampedDist = Math.min(dist, maxDist);
      const angle = Math.atan2(dy, dx);
      const knobX = j.baseX + Math.cos(angle) * clampedDist;
      const knobY = j.baseY + Math.sin(angle) * clampedDist;
      joystickVecRef.current = { x: (knobX - j.baseX) / maxDist, y: (knobY - j.baseY) / maxDist };
      return { ...j, knobX, knobY };
    });
  }
  function handlePointerUp() {
    joystickVecRef.current = { x: 0, y: 0 };
    setJoystick((j) => ({ ...j, active: false }));
  }

  const capacityWarn = freeSlotsRef.current - caughtCount <= 0;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          onClick={finish}
          className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur active:scale-95"
        >
          ← В лагерь
        </button>
        <div className="flex-1">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width] duration-1000 ease-linear"
              style={{ width: `${(timeLeft / duration) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          ⏱ {timeLeft}с
        </div>
      </div>

      <div className="absolute right-3 top-14 z-20 flex flex-col items-end gap-1.5">
        <div className="rounded-xl bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          🐦 Поймано: {caughtCount}
        </div>
        {combo >= 2 && (
          <div className="animate-pop-in rounded-xl bg-amber-500/90 px-3 py-1 text-xs font-bold text-black">
            Комбо ×{combo}
          </div>
        )}
        {capacityWarn && (
          <div className="max-w-[10rem] rounded-xl bg-red-600/85 px-2.5 py-1 text-right text-[11px] font-semibold text-white">
            Клетка полна — лишние птицы продаются за полцены
          </div>
        )}
      </div>

      <div ref={wrapRef} className="relative flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {floatingTexts.map((t) => (
          <div
            key={t.id}
            className="animate-float-up pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-sm font-bold drop-shadow"
            style={{ left: t.x, top: t.y, color: t.color }}
          >
            {t.text}
          </div>
        ))}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 z-20 h-40 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {joystick.active && (
          <>
            <div
              className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40 bg-white/10"
              style={{ left: joystick.baseX, top: joystick.baseY }}
            />
            <div
              className="pointer-events-none absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70"
              style={{ left: joystick.knobX, top: joystick.knobY }}
            />
          </>
        )}
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            tryCatch();
          }}
          className="absolute bottom-6 right-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/80 bg-gradient-to-br from-amber-400 to-orange-600 text-3xl shadow-xl active:scale-90"
        >
          🥅
        </button>
        <div className="pointer-events-none absolute bottom-8 left-6 text-[11px] font-semibold text-white/70">
          Джойстик · Пробел/тап — ловить
        </div>
      </div>
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
