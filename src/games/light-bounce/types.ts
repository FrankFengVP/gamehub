export interface Vec2 {
  x: number;
  y: number;
}

export interface RaySegment {
  from: Vec2;
  to: Vec2;
}

export interface LevelMirror {
  id: string;
  x: number;
  y: number;
  /** 初始角度（度），点击每次 +45° */
  angle: number;
}

export interface LevelNode {
  id: string;
  x: number;
  y: number;
}

export interface LevelWall {
  x: number;
  y: number;
}

export interface LevelSource {
  x: number;
  y: number;
  /** 0=东, 90=南, 180=西, 270=北 */
  angle: number;
}

export interface LevelGoal {
  x: number;
  y: number;
}

export interface Level {
  id: number;
  title: string;
  hint: string;
  cols: number;
  rows: number;
  source: LevelSource;
  goal: LevelGoal;
  mirrors: LevelMirror[];
  nodes: LevelNode[];
  walls: LevelWall[];
}

export interface TraceResult {
  segments: RaySegment[];
  hitNodeIds: string[];
  hitGoal: boolean;
}
