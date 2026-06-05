import { useCallback, useMemo, useState } from 'react';
import { MIRROR_ROTATE_STEP, STORAGE_KEY } from './constants';
import { LEVELS } from './levels';
import { isLevelSolved, traceRay } from './rayTrace';

function loadProgress(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? Math.max(0, Math.min(n, LEVELS.length - 1)) : 0;
  } catch {
    return 0;
  }
}

function saveProgress(index: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(index));
  } catch {
    /* ignore */
  }
}

function initialMirrorAngles(levelIndex: number): Record<string, number> {
  const level = LEVELS[levelIndex];
  return Object.fromEntries(level.mirrors.map((m) => [m.id, m.angle]));
}

export function useLightBounceGame() {
  const [levelIndex, setLevelIndex] = useState(loadProgress);
  const [mirrorAngles, setMirrorAngles] = useState(() =>
    initialMirrorAngles(loadProgress()),
  );
  const [showIntro, setShowIntro] = useState(true);

  const level = LEVELS[levelIndex];

  const trace = useMemo(
    () => traceRay(level, mirrorAngles),
    [level, mirrorAngles],
  );

  const solved = useMemo(
    () => isLevelSolved(level, mirrorAngles),
    [level, mirrorAngles],
  );

  const rotateMirror = useCallback((id: string) => {
    setMirrorAngles((prev) => ({
      ...prev,
      [id]: ((prev[id] ?? 0) + MIRROR_ROTATE_STEP) % 180,
    }));
  }, []);

  const resetLevel = useCallback(() => {
    setMirrorAngles(initialMirrorAngles(levelIndex));
  }, [levelIndex]);

  const goToLevel = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, LEVELS.length - 1));
    setLevelIndex(clamped);
    setMirrorAngles(initialMirrorAngles(clamped));
    saveProgress(clamped);
  }, []);

  const nextLevel = useCallback(() => {
    if (levelIndex < LEVELS.length - 1) {
      goToLevel(levelIndex + 1);
    }
  }, [goToLevel, levelIndex]);

  const prevLevel = useCallback(() => {
    if (levelIndex > 0) {
      goToLevel(levelIndex - 1);
    }
  }, [goToLevel, levelIndex]);

  const dismissIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  return {
    level,
    levelIndex,
    totalLevels: LEVELS.length,
    mirrorAngles,
    trace,
    solved,
    showIntro,
    rotateMirror,
    resetLevel,
    nextLevel,
    prevLevel,
    dismissIntro,
  };
}
