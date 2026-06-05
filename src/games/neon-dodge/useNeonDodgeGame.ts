import { useCallback, useEffect, useRef, useState } from 'react';
import { STORAGE_KEY } from './constants';
import {
  createWorld,
  drawWorld,
  resizeWorld,
  startWorld,
  updateWorld,
} from './engine';
import type { GameWorld, HudState, InputState } from './types';

function loadHighScore(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(score));
  } catch {
    /* ignore */
  }
}

const EMPTY_INPUT: InputState = {
  left: false,
  right: false,
  up: false,
  down: false,
  pointerX: null,
  pointerY: null,
};

export function useNeonDodgeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<GameWorld | null>(null);
  const inputRef = useRef<InputState>({ ...EMPTY_INPUT });
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const hudTimerRef = useRef<number>(0);

  const [hud, setHud] = useState<HudState>(() => ({
    phase: 'idle',
    score: 0,
    highScore: loadHighScore(),
    elapsed: 0,
    shieldActive: false,
  }));

  const syncHud = useCallback((world: GameWorld, now: number, force = false) => {
    if (!force && now - hudTimerRef.current < 80) return;
    hudTimerRef.current = now;
    setHud((prev) => {
      const highScore = Math.max(prev.highScore, world.score);
      if (highScore > prev.highScore) saveHighScore(highScore);
      return {
        phase: world.phase,
        score: world.score,
        highScore,
        elapsed: world.elapsed,
        shieldActive: now < world.shieldUntil,
      };
    });
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!worldRef.current) {
      worldRef.current = createWorld(width, height);
    } else {
      worldRef.current = resizeWorld(worldRef.current, width, height);
    }
  }, []);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const width = parent?.clientWidth ?? canvas.clientWidth;
    const height = parent?.clientHeight ?? canvas.clientHeight;
    worldRef.current = startWorld(createWorld(width, height));
    lastFrameRef.current = performance.now();
    syncHud(worldRef.current, performance.now(), true);
  }, [syncHud]);

  const resetToIdle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const width = parent?.clientWidth ?? canvas.clientWidth;
    const height = parent?.clientHeight ?? canvas.clientHeight;
    worldRef.current = createWorld(width, height);
    syncHud(worldRef.current, performance.now(), true);
  }, [syncHud]);

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    const parent = canvasRef.current?.parentElement;
    if (parent) observer.observe(parent);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    const setKey = (key: string, pressed: boolean) => {
      switch (key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          inputRef.current.left = pressed;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          inputRef.current.right = pressed;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          inputRef.current.up = pressed;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          inputRef.current.down = pressed;
          break;
        default:
          break;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => setKey(e.key, true);
    const onKeyUp = (e: KeyboardEvent) => setKey(e.key, false);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const setPointerPos = useCallback(
    (clientX: number | null, clientY: number | null) => {
      const canvas = canvasRef.current;
      if (!canvas || clientX == null || clientY == null) {
        inputRef.current.pointerX = null;
        inputRef.current.pointerY = null;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      inputRef.current.pointerX = clientX - rect.left;
      inputRef.current.pointerY = clientY - rect.top;
    },
    [],
  );

  useEffect(() => {
    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      if (!worldRef.current) {
        worldRef.current = createWorld(canvas.clientWidth, canvas.clientHeight);
      }

      const last = lastFrameRef.current || now;
      const dt = Math.min((now - last) / 1000, 0.05);
      lastFrameRef.current = now;

      if (worldRef.current.phase === 'playing') {
        worldRef.current = updateWorld(
          worldRef.current,
          inputRef.current,
          now,
          dt,
        );
        syncHud(worldRef.current, now);
      } else if (
        worldRef.current.phase === 'dead' &&
        worldRef.current.particles.length > 0
      ) {
        worldRef.current = {
          ...worldRef.current,
          particles: worldRef.current.particles
            .map((p) => ({
              ...p,
              x: p.x + p.vx * dt,
              y: p.y + p.vy * dt,
              vy: p.vy + 120 * dt,
              life: p.life - dt,
            }))
            .filter((p) => p.life > 0),
        };
      }

      drawWorld(ctx, worldRef.current, now);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [syncHud]);

  return {
    canvasRef,
    hud,
    startGame,
    resetToIdle,
    setPointerPos,
  };
}
