/**
 * 关卡可解性验证（暴力枚举镜子角度 0/45/90/135°）
 * 用法: node scripts/verify-levels.mjs
 */
import { LEVELS } from '../src/games/light-bounce/levels.ts';
import { isLevelSolved } from '../src/games/light-bounce/rayTrace.ts';

const ANGLES = [0, 45, 90, 135];

function findSolutions(level) {
  const mirrors = level.mirrors;
  const total = 4 ** mirrors.length;
  const solutions = [];
  for (let i = 0; i < total; i++) {
    const angles = {};
    let t = i;
    for (const m of mirrors) {
      angles[m.id] = ANGLES[t % 4];
      t = Math.floor(t / 4);
    }
    if (isLevelSolved(level, angles)) solutions.push({ ...angles });
  }
  return solutions;
}

let ok = true;
for (const level of LEVELS) {
  const sols = findSolutions(level);
  const status = sols.length > 0 ? 'OK' : 'UNSOLVABLE';
  if (sols.length === 0) ok = false;
  console.log(
    `L${level.id} ${level.title}: ${sols.length} solutions [${status}]` +
      (sols.length > 0 && sols.length <= 4 ? ` e.g. ${JSON.stringify(sols[0])}` : ''),
  );
}
if (!ok) process.exit(1);
