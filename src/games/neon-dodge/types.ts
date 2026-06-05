export type GamePhase = 'idle' | 'playing' | 'dead';

export type PowerUpKind = 'shield' | 'clear';

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glow: string;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: PowerUpKind;
  radius: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  pointerX: number | null;
  pointerY: number | null;
}

export interface GameWorld {
  phase: GamePhase;
  width: number;
  height: number;
  playerX: number;
  playerY: number;
  bullets: Bullet[];
  powerUps: PowerUp[];
  particles: Particle[];
  score: number;
  elapsed: number;
  shieldUntil: number;
  lastSpawnAt: number;
  lastPowerUpAt: number;
  nextBulletId: number;
  nextPowerUpId: number;
  spawnInterval: number;
  difficulty: number;
}

export interface HudState {
  phase: GamePhase;
  score: number;
  highScore: number;
  elapsed: number;
  shieldActive: boolean;
}
