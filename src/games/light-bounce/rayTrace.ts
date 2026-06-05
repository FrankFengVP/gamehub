import type { Level, RaySegment, TraceResult, Vec2 } from './types';

const EPS = 1e-5;
const MAX_BOUNCES = 24;
const NODE_RADIUS = 0.28;
const GOAL_RADIUS = 0.32;
const MIRROR_HALF = 0.42;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function dirFromAngle(deg: number): Vec2 {
  const r = degToRad(deg);
  return { x: Math.cos(r), y: Math.sin(r) };
}

function normalize(v: Vec2): Vec2 {
  const len = Math.hypot(v.x, v.y);
  if (len < EPS) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

function reflect(dir: Vec2, normal: Vec2): Vec2 {
  const n = normalize(normal);
  const dot = dir.x * n.x + dir.y * n.y;
  return normalize({
    x: dir.x - 2 * dot * n.x,
    y: dir.y - 2 * dot * n.y,
  });
}

function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

function scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

function raySegmentHit(
  origin: Vec2,
  dir: Vec2,
  a: Vec2,
  b: Vec2,
): number | null {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const cross = dir.x * vy - dir.y * vx;
  if (Math.abs(cross) < EPS) return null;

  const ox = a.x - origin.x;
  const oy = a.y - origin.y;
  const t = (ox * vy - oy * vx) / cross;
  const u = (ox * dir.y - oy * dir.x) / cross;

  if (t > EPS && u >= -EPS && u <= 1 + EPS) return t;
  return null;
}

function rayAabbHit(
  origin: Vec2,
  dir: Vec2,
  cx: number,
  cy: number,
  half: number,
): { t: number; normal: Vec2 } | null {
  const minX = cx - half;
  const maxX = cx + half;
  const minY = cy - half;
  const maxY = cy + half;

  const hits: { t: number; normal: Vec2 }[] = [];

  if (Math.abs(dir.x) > EPS) {
    const tLeft = (minX - origin.x) / dir.x;
    const yLeft = origin.y + dir.y * tLeft;
    if (tLeft > EPS && yLeft >= minY - EPS && yLeft <= maxY + EPS) {
      hits.push({ t: tLeft, normal: { x: -1, y: 0 } });
    }
    const tRight = (maxX - origin.x) / dir.x;
    const yRight = origin.y + dir.y * tRight;
    if (tRight > EPS && yRight >= minY - EPS && yRight <= maxY + EPS) {
      hits.push({ t: tRight, normal: { x: 1, y: 0 } });
    }
  }

  if (Math.abs(dir.y) > EPS) {
    const tTop = (minY - origin.y) / dir.y;
    const xTop = origin.x + dir.x * tTop;
    if (tTop > EPS && xTop >= minX - EPS && xTop <= maxX + EPS) {
      hits.push({ t: tTop, normal: { x: 0, y: -1 } });
    }
    const tBottom = (maxY - origin.y) / dir.y;
    const xBottom = origin.x + dir.x * tBottom;
    if (tBottom > EPS && xBottom >= minX - EPS && xBottom <= maxX + EPS) {
      hits.push({ t: tBottom, normal: { x: 0, y: 1 } });
    }
  }

  if (hits.length === 0) return null;
  return hits.reduce((best, h) => (h.t < best.t ? h : best));
}

function rayCircleHit(
  origin: Vec2,
  dir: Vec2,
  center: Vec2,
  radius: number,
): number | null {
  const ox = origin.x - center.x;
  const oy = origin.y - center.y;
  const b = 2 * (ox * dir.x + oy * dir.y);
  const c = ox * ox + oy * oy - radius * radius;
  const disc = b * b - 4 * c;
  if (disc < 0) return null;
  const sqrt = Math.sqrt(disc);
  const t1 = (-b - sqrt) / 2;
  const t2 = (-b + sqrt) / 2;
  const candidates = [t1, t2].filter((t) => t > EPS);
  if (candidates.length === 0) return null;
  return Math.min(...candidates);
}

function mirrorSegment(cx: number, cy: number, angleDeg: number): [Vec2, Vec2] {
  const r = degToRad(angleDeg);
  const dx = Math.cos(r) * MIRROR_HALF;
  const dy = Math.sin(r) * MIRROR_HALF;
  return [
    { x: cx - dx, y: cy - dy },
    { x: cx + dx, y: cy + dy },
  ];
}

function mirrorNormal(angleDeg: number, incident: Vec2): Vec2 {
  const r = degToRad(angleDeg);
  const along = { x: Math.cos(r), y: Math.sin(r) };
  const n1 = { x: -along.y, y: along.x };
  const n2 = { x: along.y, y: -along.x };
  const dot1 = incident.x * n1.x + incident.y * n1.y;
  return dot1 < 0 ? n1 : n2;
}

function inBounds(p: Vec2, cols: number, rows: number): boolean {
  return p.x >= -EPS && p.x <= cols + EPS && p.y >= -EPS && p.y <= rows + EPS;
}

type HitKind = 'mirror' | 'wall' | 'node' | 'goal' | 'bounds';

interface Hit {
  t: number;
  kind: HitKind;
  id?: string;
  normal?: Vec2;
  point?: Vec2;
}

export function traceRay(
  level: Level,
  mirrorAngles: Record<string, number>,
): TraceResult {
  const segments: RaySegment[] = [];
  const hitNodeIds = new Set<string>();
  let hitGoal = false;

  let origin: Vec2 = { x: level.source.x, y: level.source.y };
  let dir = normalize(dirFromAngle(level.source.angle));
  let skipMirrorId: string | null = null;

  for (let bounce = 0; bounce < MAX_BOUNCES; bounce++) {
    const hits: Hit[] = [];

    for (const wall of level.walls) {
      const hit = rayAabbHit(origin, dir, wall.x + 0.5, wall.y + 0.5, 0.5);
      if (hit) hits.push({ ...hit, kind: 'wall' });
    }

    for (const mirror of level.mirrors) {
      if (mirror.id === skipMirrorId) continue;
      const angle = mirrorAngles[mirror.id] ?? mirror.angle;
      const [a, b] = mirrorSegment(mirror.x, mirror.y, angle);
      const t = raySegmentHit(origin, dir, a, b);
      if (t != null) {
        hits.push({
          t,
          kind: 'mirror',
          id: mirror.id,
          normal: mirrorNormal(angle, dir),
          point: add(origin, scale(dir, t)),
        });
      }
    }

    for (const node of level.nodes) {
      const t = rayCircleHit(origin, dir, { x: node.x, y: node.y }, NODE_RADIUS);
      if (t != null) hits.push({ t, kind: 'node', id: node.id });
    }

    const goalT = rayCircleHit(
      origin,
      dir,
      { x: level.goal.x, y: level.goal.y },
      GOAL_RADIUS,
    );
    if (goalT != null) hits.push({ t: goalT, kind: 'goal' });

    const boundsT = 50;
    const far = add(origin, scale(dir, boundsT));
    if (!inBounds(far, level.cols, level.rows)) {
      let bestT = boundsT;
      if (dir.x > EPS) bestT = Math.min(bestT, (level.cols - origin.x) / dir.x);
      if (dir.x < -EPS) bestT = Math.min(bestT, -origin.x / dir.x);
      if (dir.y > EPS) bestT = Math.min(bestT, (level.rows - origin.y) / dir.y);
      if (dir.y < -EPS) bestT = Math.min(bestT, -origin.y / dir.y);
      if (bestT > EPS && bestT < boundsT) {
        hits.push({ t: bestT, kind: 'bounds' });
      }
    }

    if (hits.length === 0) break;

    hits.sort((a, b) => a.t - b.t);

    const primary = hits[0];
    const end = add(origin, scale(dir, primary.t));
    segments.push({ from: { ...origin }, to: end });

    if (primary.kind === 'mirror' && primary.normal) {
      dir = reflect(dir, primary.normal);
      origin = add(end, scale(dir, EPS * 16));
      skipMirrorId = primary.id ?? null;
      continue;
    }

    skipMirrorId = null;

    if (primary.kind === 'node' && primary.id) {
      hitNodeIds.add(primary.id);
      origin = add(end, scale(dir, EPS * 16));
      continue;
    }

    if (primary.kind === 'goal') {
      hitGoal = true;
    }

    break;
  }

  return {
    segments,
    hitNodeIds: [...hitNodeIds],
    hitGoal,
  };
}

export function isLevelSolved(
  level: Level,
  mirrorAngles: Record<string, number>,
): boolean {
  const result = traceRay(level, mirrorAngles);
  if (!result.hitGoal) return false;
  return level.nodes.every((n) => result.hitNodeIds.includes(n.id));
}
