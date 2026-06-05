/** 网格单元逻辑尺寸（坐标系 1 单位 = 1 格） */
export const CELL = 1;

export const MIRROR_ROTATE_STEP = 45;

export const COLORS = {
  bg: '#12141c',
  grid: 'rgba(255,255,255,0.06)',
  wall: '#2a3044',
  wallBorder: '#3d4660',
  source: '#38bdf8',
  sourceGlow: 'rgba(56,189,248,0.5)',
  goal: '#4ade80',
  goalGlow: 'rgba(74,222,128,0.45)',
  goalDim: 'rgba(74,222,128,0.2)',
  node: '#fbbf24',
  nodeGlow: 'rgba(251,191,36,0.55)',
  nodeDim: 'rgba(251,191,36,0.2)',
  mirror: '#c4b5fd',
  mirrorFrame: '#7c6ee6',
  laser: '#ff4d6d',
  laserGlow: 'rgba(255,77,109,0.35)',
} as const;

export const STORAGE_KEY = 'gamehub-light-bounce-progress';
