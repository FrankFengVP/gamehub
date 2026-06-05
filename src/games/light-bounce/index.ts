import type { GameDefinition } from '@/core/types';
import { LightBounceGame } from './LightBounceGame';

export const lightBounce: GameDefinition = {
  id: 'light-bounce',
  title: '光线折射实验室',
  description:
    '旋转镜子引导激光路径，激活所有能量节点并抵达终点。考验逻辑与空间想象力。',
  tags: ['2D', '益智', '解谜'],
  accent: ['#1a1a2e', '#e94560'],
  component: LightBounceGame,
};
