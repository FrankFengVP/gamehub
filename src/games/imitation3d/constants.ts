export const PAD_IDS = [0, 1, 2, 3] as const;
export type PadId = (typeof PAD_IDS)[number];

export interface PadConfig {
  id: PadId;
  position: [number, number, number];
  color: string;
  emissive: string;
  label: string;
}

export const PADS: PadConfig[] = [
  {
    id: 0,
    position: [-1.8, 0.5, -1.8],
    color: '#ef4444',
    emissive: '#fca5a5',
    label: '红',
  },
  {
    id: 1,
    position: [1.8, 0.5, -1.8],
    color: '#3b82f6',
    emissive: '#93c5fd',
    label: '蓝',
  },
  {
    id: 2,
    position: [-1.8, 0.5, 1.8],
    color: '#22c55e',
    emissive: '#86efac',
    label: '绿',
  },
  {
    id: 3,
    position: [1.8, 0.5, 1.8],
    color: '#eab308',
    emissive: '#fde047',
    label: '黄',
  },
];

export const INITIAL_SEQUENCE_LENGTH = 3;
export const FLASH_MS = 520;
export const GAP_MS = 180;
