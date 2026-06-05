import type { GameDefinition } from './types';
import { imitation3d } from '@/games/imitation3d';
import { lightBounce } from '@/games/light-bounce';
import { neonDodge } from '@/games/neon-dodge';

/**
 * 游戏注册表 — 新增游戏时在此 import 并加入数组即可。
 *
 * 步骤：
 * 1. 在 src/games/<gameId>/ 下实现游戏与 index.ts 导出
 * 2. import 后 push 到 games 数组
 */
export const games: GameDefinition[] = [imitation3d, lightBounce, neonDodge];

export function getGameById(id: string): GameDefinition | undefined {
  return games.find((g) => g.id === id);
}
