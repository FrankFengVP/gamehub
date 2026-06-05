import { COLORS } from './constants';
import type { Level, RaySegment, TraceResult } from './types';

const PX = 56;

interface LightBounceBoardProps {
  level: Level;
  mirrorAngles: Record<string, number>;
  trace: TraceResult;
  onRotateMirror: (id: string) => void;
}

export function LightBounceBoard({
  level,
  mirrorAngles,
  trace,
  onRotateMirror,
}: LightBounceBoardProps) {
  const width = level.cols * PX;
  const height = level.rows * PX;
  const hitNodes = new Set(trace.hitNodeIds);

  return (
    <svg
      className="lb-board"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${level.title} 关卡棋盘`}
    >
      <rect width={width} height={height} fill={COLORS.bg} />

      {Array.from({ length: level.cols + 1 }, (_, i) => (
        <line
          key={`v-${i}`}
          x1={i * PX}
          y1={0}
          x2={i * PX}
          y2={height}
          stroke={COLORS.grid}
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: level.rows + 1 }, (_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * PX}
          x2={width}
          y2={i * PX}
          stroke={COLORS.grid}
          strokeWidth={1}
        />
      ))}

      {level.walls.map((wall) => (
        <rect
          key={`w-${wall.x}-${wall.y}`}
          x={wall.x * PX + 2}
          y={wall.y * PX + 2}
          width={PX - 4}
          height={PX - 4}
          rx={6}
          fill={COLORS.wall}
          stroke={COLORS.wallBorder}
          strokeWidth={1.5}
        />
      ))}

      <GoalMarker x={level.goal.x} y={level.goal.y} lit={trace.hitGoal} />

      {level.nodes.map((node) => (
        <NodeMarker
          key={node.id}
          x={node.x}
          y={node.y}
          lit={hitNodes.has(node.id)}
        />
      ))}

      <LaserBeam segments={trace.segments} />

      <SourceMarker
        x={level.source.x}
        y={level.source.y}
        angle={level.source.angle}
      />

      {level.mirrors.map((mirror) => (
        <MirrorControl
          key={mirror.id}
          x={mirror.x}
          y={mirror.y}
          angle={mirrorAngles[mirror.id] ?? mirror.angle}
          onRotate={() => onRotateMirror(mirror.id)}
        />
      ))}
    </svg>
  );
}

function toPx(x: number, y: number): { cx: number; cy: number } {
  return { cx: x * PX, cy: y * PX };
}

function LaserBeam({ segments }: { segments: RaySegment[] }) {
  if (segments.length === 0) return null;

  const d = segments
    .map((seg, i) => {
      const from = toPx(seg.from.x, seg.from.y);
      const to = toPx(seg.to.x, seg.to.y);
      return `${i === 0 ? 'M' : 'L'} ${from.cx} ${from.cy} L ${to.cx} ${to.cy}`;
    })
    .join(' ');

  return (
    <g className="lb-laser">
      <path
        d={d}
        fill="none"
        stroke={COLORS.laserGlow}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke={COLORS.laser}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function SourceMarker({
  x,
  y,
  angle,
}: {
  x: number;
  y: number;
  angle: number;
}) {
  const { cx, cy } = toPx(x, y);
  const r = degToRad(angle);
  const tipX = cx + Math.cos(r) * 18;
  const tipY = cy + Math.sin(r) * 18;

  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill={COLORS.sourceGlow} />
      <circle
        cx={cx}
        cy={cy}
        r={9}
        fill={COLORS.source}
        stroke="#0ea5e9"
        strokeWidth={1.5}
      />
      <line
        x1={cx}
        y1={cy}
        x2={tipX}
        y2={tipY}
        stroke={COLORS.source}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
}

function GoalMarker({
  x,
  y,
  lit,
}: {
  x: number;
  y: number;
  lit: boolean;
}) {
  const { cx, cy } = toPx(x, y);
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={18}
        fill={lit ? COLORS.goalGlow : COLORS.goalDim}
      />
      <circle
        cx={cx}
        cy={cy}
        r={11}
        fill="none"
        stroke={lit ? COLORS.goal : 'rgba(74,222,128,0.45)'}
        strokeWidth={lit ? 3 : 2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={lit ? COLORS.goal : 'rgba(74,222,128,0.5)'}
      />
    </g>
  );
}

function NodeMarker({
  x,
  y,
  lit,
}: {
  x: number;
  y: number;
  lit: boolean;
}) {
  const { cx, cy } = toPx(x, y);
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={14}
        fill={lit ? COLORS.nodeGlow : COLORS.nodeDim}
      />
      <polygon
        points={`${cx},${cy - 9} ${cx + 8},${cy + 6} ${cx - 8},${cy + 6}`}
        fill={lit ? COLORS.node : 'rgba(251,191,36,0.45)'}
        stroke={lit ? '#f59e0b' : 'rgba(251,191,36,0.35)'}
        strokeWidth={1.5}
      />
    </g>
  );
}

function MirrorControl({
  x,
  y,
  angle,
  onRotate,
}: {
  x: number;
  y: number;
  angle: number;
  onRotate: () => void;
}) {
  const { cx, cy } = toPx(x, y);
  const r = degToRad(angle);
  const half = PX * 0.36;
  const x1 = cx - Math.cos(r) * half;
  const y1 = cy - Math.sin(r) * half;
  const x2 = cx + Math.cos(r) * half;
  const y2 = cy + Math.sin(r) * half;

  return (
    <g
      className="lb-mirror"
      onClick={onRotate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRotate();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="旋转镜子"
    >
      <rect
        x={cx - PX / 2 + 4}
        y={cy - PX / 2 + 4}
        width={PX - 8}
        height={PX - 8}
        rx={8}
        fill="rgba(124,110,230,0.12)"
        stroke="rgba(124,110,230,0.25)"
        strokeWidth={1}
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={COLORS.mirrorFrame}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={COLORS.mirror}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} fill={COLORS.mirrorFrame} opacity={0.6} />
    </g>
  );
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
