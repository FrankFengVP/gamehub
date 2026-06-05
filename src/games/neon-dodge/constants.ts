export const STORAGE_KEY = 'gamehub-neon-dodge-highscore';

export const PLAYER_WIDTH = 36;
export const PLAYER_HEIGHT = 28;
export const PLAYER_SPEED = 300;
export const PLAYER_MARGIN = 28;

export const BASE_SPAWN_MS = 820;
export const MIN_SPAWN_MS = 220;
export const POWERUP_SPAWN_MS = 9000;

export const SHIELD_DURATION_MS = 4000;

export const BULLET_PALETTE = [
  { color: '#ff6b6b', glow: 'rgba(255,107,107,0.55)' },
  { color: '#f472b6', glow: 'rgba(244,114,182,0.55)' },
  { color: '#c084fc', glow: 'rgba(192,132,252,0.55)' },
  { color: '#60a5fa', glow: 'rgba(96,165,250,0.55)' },
  { color: '#34d399', glow: 'rgba(52,211,153,0.55)' },
  { color: '#fbbf24', glow: 'rgba(251,191,36,0.55)' },
] as const;

export const COLORS = {
  bg: '#0a0814',
  grid: 'rgba(255,255,255,0.04)',
  player: '#38bdf8',
  playerGlow: 'rgba(56,189,248,0.65)',
  shield: '#67e8f9',
  shieldGlow: 'rgba(103,232,249,0.5)',
  powerShield: '#38bdf8',
  powerClear: '#f472b6',
} as const;
