import { useCallback, useRef, useState } from 'react';
import type { PadId } from './constants';
import { FLASH_MS, GAP_MS, INITIAL_SEQUENCE_LENGTH } from './constants';

export type GamePhase =
  | 'idle'
  | 'showing'
  | 'input'
  | 'success'
  | 'fail';

function randomPad(): PadId {
  return Math.floor(Math.random() * 4) as PadId;
}

function buildSequence(length: number): PadId[] {
  return Array.from({ length }, randomPad);
}

export function useImitationGame() {
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [sequence, setSequence] = useState<PadId[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [activePad, setActivePad] = useState<PadId | null>(null);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('imitation3d-highscore');
    return saved ? Number(saved) : 0;
  });

  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const flashPad = useCallback((padId: PadId, duration = FLASH_MS) => {
    setActivePad(padId);
    const t = window.setTimeout(() => setActivePad(null), duration);
    timersRef.current.push(t);
  }, []);

  const playSequence = useCallback(
    (seq: PadId[], onDone: () => void) => {
      setPhase('showing');
      let delay = 400;

      seq.forEach((padId, i) => {
        const showAt = delay;
        const hideAt = delay + FLASH_MS;

        timersRef.current.push(
          window.setTimeout(() => flashPad(padId), showAt),
        );

        delay = hideAt + GAP_MS;

        if (i === seq.length - 1) {
          timersRef.current.push(
            window.setTimeout(() => {
              setActivePad(null);
              onDone();
            }, hideAt + 200),
          );
        }
      });
    },
    [flashPad],
  );

  const startGame = useCallback(() => {
    clearTimers();
    const seq = buildSequence(INITIAL_SEQUENCE_LENGTH);
    setSequence(seq);
    setPlayerIndex(0);
    setLevel(1);
    setScore(0);
    playSequence(seq, () => setPhase('input'));
  }, [clearTimers, playSequence]);

  const nextLevel = useCallback(() => {
    setLevel((l) => l + 1);
    setScore((s) => s + 10);
    setSequence((prev) => {
      const next = [...prev, randomPad()];
      playSequence(next, () => setPhase('input'));
      return next;
    });
    setPlayerIndex(0);
  }, [playSequence]);

  const handlePadClick = useCallback(
    (padId: PadId) => {
      if (phase !== 'input') return;

      flashPad(padId, 280);

      const expected = sequence[playerIndex];
      if (padId !== expected) {
        setPhase('fail');
        setHighScore((hs) => {
          const next = Math.max(hs, score);
          localStorage.setItem('imitation3d-highscore', String(next));
          return next;
        });
        return;
      }

      const nextIndex = playerIndex + 1;
      setPlayerIndex(nextIndex);

      if (nextIndex >= sequence.length) {
        setPhase('success');
        setScore((s) => s + sequence.length * 5);
        timersRef.current.push(
          window.setTimeout(() => nextLevel(), 900),
        );
      }
    },
    [phase, sequence, playerIndex, flashPad, score, nextLevel],
  );

  const retry = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setActivePad(null);
  }, [clearTimers]);

  return {
    phase,
    level,
    score,
    highScore,
    activePad,
    sequenceLength: sequence.length,
    startGame,
    handlePadClick,
    retry,
  };
}
