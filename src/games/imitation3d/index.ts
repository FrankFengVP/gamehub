import type { GameDefinition } from '@/core/types';
import { Imitation3DGame } from './Imitation3DGame';

export const imitation3d: GameDefinition = {
  id: 'imitation3d',
  title: '3D 模仿记忆',
  description: '观察方块闪烁顺序，在 3D 场景中按相同顺序点击复现，关卡越长难度越高。',
  tags: ['3D', '记忆', 'Three.js'],
  accent: ['#1e3a5f', '#6ee7b7'],
  component: Imitation3DGame,
};
