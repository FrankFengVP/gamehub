import type { GameDefinition } from '@/core/types';
import { NeonDodgeGame } from './NeonDodgeGame';

export const neonDodge: GameDefinition = {
  id: 'neon-dodge',
  title: '霓虹弹幕躲避',
  description:
    '四向自由移动，躲避从四面八方飞来的霓虹弹幕，拾取护盾与清屏道具挑战高分。',
  tags: ['2D', '街机', '反应'],
  accent: ['#0f0c29', '#ff6b6b'],
  component: NeonDodgeGame,
};
