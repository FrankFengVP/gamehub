import {
  BASE_SPAWN_MS,
  BULLET_PALETTE,
  COLORS,
  MIN_SPAWN_MS,
  PLAYER_HEIGHT,
  PLAYER_MARGIN,
  PLAYER_SPEED,
  PLAYER_WIDTH,
  POWERUP_SPAWN_MS,
  SHIELD_DURATION_MS,
} from './constants';
import type {
  Bullet,
  GameWorld,
  InputState,
  Particle,
  PowerUp,
  PowerUpKind,
} from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampPlayer(
  x: number,
  y: number,
  width: number,
  height: number,
): { x: number; y: number } {
  return {
    x: clamp(x, PLAYER_MARGIN, width - PLAYER_MARGIN),
    y: clamp(y, PLAYER_MARGIN, height - PLAYER_MARGIN),
  };
}

function isInBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  margin: number,
): boolean {
  return (
    x > -margin &&
    x < width + margin &&
    y > -margin &&
    y < height + margin
  );
}

export function createWorld(width: number, height: number): GameWorld {
  return {
    phase: 'idle',
    width,
    height,
    playerX: width / 2,
    playerY: height / 2,
    bullets: [],
    powerUps: [],
    particles: [],
    score: 0,
    elapsed: 0,
    shieldUntil: 0,
    lastSpawnAt: 0,
    lastPowerUpAt: 0,
    nextBulletId: 1,
    nextPowerUpId: 1,
    spawnInterval: BASE_SPAWN_MS,
    difficulty: 0,
  };
}

export function startWorld(world: GameWorld): GameWorld {
  const next = createWorld(world.width, world.height);
  next.phase = 'playing';
  return next;
}

function aimVelocity(
  fromX: number,
  fromY: number,
  speed: number,
  width: number,
  height: number,
  spread = 0.35,
): { vx: number; vy: number } {
  const targetX = width / 2 + (Math.random() - 0.5) * width * spread;
  const targetY = height / 2 + (Math.random() - 0.5) * height * spread;
  const dx = targetX - fromX;
  const dy = targetY - fromY;
  const len = Math.hypot(dx, dy) || 1;
  const jitter = 1 + (Math.random() - 0.5) * 0.18;
  return {
    vx: (dx / len) * speed * jitter,
    vy: (dy / len) * speed * jitter,
  };
}

function spawnFromEdge(
  width: number,
  height: number,
  inset: number,
): { x: number; y: number } {
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0:
      return { x: inset + Math.random() * (width - inset * 2), y: -inset };
    case 1:
      return { x: width + inset, y: inset + Math.random() * (height - inset * 2) };
    case 2:
      return { x: inset + Math.random() * (width - inset * 2), y: height + inset };
    default:
      return { x: -inset, y: inset + Math.random() * (height - inset * 2) };
  }
}

function spawnBullet(world: GameWorld): Bullet {
  const palette =
    BULLET_PALETTE[Math.floor(Math.random() * BULLET_PALETTE.length)];
  const radius = 5 + Math.random() * 5;
  const speed = 120 + world.difficulty * 60 + Math.random() * 55;
  const { x, y } = spawnFromEdge(world.width, world.height, radius);
  const { vx, vy } = aimVelocity(x, y, speed, world.width, world.height, 0.55);

  return {
    id: world.nextBulletId,
    x,
    y,
    vx,
    vy,
    radius,
    color: palette.color,
    glow: palette.glow,
  };
}

function spawnPowerUp(world: GameWorld): PowerUp {
  const kind: PowerUpKind = Math.random() < 0.55 ? 'shield' : 'clear';
  const { x, y } = spawnFromEdge(world.width, world.height, 20);
  const { vx, vy } = aimVelocity(x, y, 85, world.width, world.height, 0.25);

  return {
    id: world.nextPowerUpId,
    x,
    y,
    vx,
    vy,
    kind,
    radius: 14,
  };
}

function spawnBurst(
  particles: Particle[],
  x: number,
  y: number,
  color: string,
  count = 18,
): Particle[] {
  const next = [...particles];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 60 + Math.random() * 180;
    next.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.4,
      maxLife: 0.9,
      color,
      size: 2 + Math.random() * 3,
    });
  }
  return next;
}

function circleHit(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
}

function shipHitbox(x: number, y: number) {
  return {
    x,
    y,
    radius: Math.min(PLAYER_WIDTH, PLAYER_HEIGHT) * 0.38,
  };
}

export function resizeWorld(world: GameWorld, width: number, height: number): GameWorld {
  const ratioX = world.width > 0 ? width / world.width : 1;
  const ratioY = world.height > 0 ? height / world.height : 1;
  const pos = clampPlayer(
    world.playerX * ratioX,
    world.playerY * ratioY,
    width,
    height,
  );
  return {
    ...world,
    width,
    height,
    playerX: pos.x,
    playerY: pos.y,
  };
}

function movePlayer(
  world: GameWorld,
  input: InputState,
  dt: number,
): { x: number; y: number } {
  let px = world.playerX;
  let py = world.playerY;

  if (input.pointerX != null && input.pointerY != null) {
    px = input.pointerX;
    py = input.pointerY;
  } else {
    let dx = 0;
    let dy = 0;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;

    if (dx !== 0 && dy !== 0) {
      const inv = 1 / Math.SQRT2;
      dx *= inv;
      dy *= inv;
    }

    px += dx * PLAYER_SPEED * dt;
    py += dy * PLAYER_SPEED * dt;
  }

  return clampPlayer(px, py, world.width, world.height);
}

export function updateWorld(
  world: GameWorld,
  input: InputState,
  now: number,
  dt: number,
): GameWorld {
  if (world.phase !== 'playing') return world;

  let next: GameWorld = {
    ...world,
    elapsed: world.elapsed + dt,
    difficulty: Math.min(1, world.elapsed / 55),
    spawnInterval: Math.max(
      MIN_SPAWN_MS,
      BASE_SPAWN_MS - world.elapsed * 12,
    ),
    score: Math.floor(world.elapsed * 10),
  };

  const playerPos = movePlayer(next, input, dt);
  const px = playerPos.x;
  const py = playerPos.y;
  next.playerX = px;
  next.playerY = py;

  if (now - next.lastSpawnAt >= next.spawnInterval) {
    next = {
      ...next,
      bullets: [...next.bullets, spawnBullet(next)],
      nextBulletId: next.nextBulletId + 1,
      lastSpawnAt: now,
    };
    if (Math.random() < 0.12 + next.difficulty * 0.2) {
      next = {
        ...next,
        bullets: [...next.bullets, spawnBullet(next)],
        nextBulletId: next.nextBulletId + 1,
      };
    }
  }

  if (now - next.lastPowerUpAt >= POWERUP_SPAWN_MS) {
    next = {
      ...next,
      powerUps: [...next.powerUps, spawnPowerUp(next)],
      nextPowerUpId: next.nextPowerUpId + 1,
      lastPowerUpAt: now,
    };
  }

  const boundsMargin = 50;
  next = {
    ...next,
    bullets: next.bullets
      .map((b) => ({
        ...b,
        x: b.x + b.vx * dt,
        y: b.y + b.vy * dt,
      }))
      .filter((b) =>
        isInBounds(b.x, b.y, next.width, next.height, boundsMargin),
      ),
    powerUps: next.powerUps
      .map((p) => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
      }))
      .filter((p) =>
        isInBounds(p.x, p.y, next.width, next.height, boundsMargin),
      ),
    particles: next.particles
      .map((p) => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        vy: p.vy + 120 * dt,
        life: p.life - dt,
      }))
      .filter((p) => p.life > 0),
  };

  const ship = shipHitbox(px, py);
  const shieldActive = now < next.shieldUntil;

  for (const power of next.powerUps) {
    if (circleHit(ship.x, ship.y, ship.radius, power.x, power.y, power.radius)) {
      if (power.kind === 'shield') {
        next = { ...next, shieldUntil: now + SHIELD_DURATION_MS };
      } else {
        next = {
          ...next,
          bullets: [],
          particles: spawnBurst(next.particles, px, py, COLORS.powerClear, 24),
        };
      }
      next = {
        ...next,
        powerUps: next.powerUps.filter((p) => p.id !== power.id),
      };
      break;
    }
  }

  if (!shieldActive) {
    for (const bullet of next.bullets) {
      if (circleHit(ship.x, ship.y, ship.radius, bullet.x, bullet.y, bullet.radius)) {
        next = {
          ...next,
          phase: 'dead',
          particles: spawnBurst(next.particles, px, py, bullet.color, 28),
        };
        return next;
      }
    }
  }

  return next;
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shieldActive: boolean,
) {
  const w = PLAYER_WIDTH;
  const h = PLAYER_HEIGHT;

  ctx.save();
  ctx.translate(x, y);

  if (shieldActive) {
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.shieldGlow;
    ctx.fill();
    ctx.strokeStyle = COLORS.shield;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.shadowColor = COLORS.playerGlow;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.85);
  ctx.lineTo(w * 0.48, h * 0.42);
  ctx.lineTo(0, h * 0.12);
  ctx.lineTo(-w * 0.48, h * 0.42);
  ctx.closePath();
  ctx.fillStyle = COLORS.player;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.moveTo(0, -h * 0.5);
  ctx.lineTo(0, h * 0.05);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet) {
  const speed = Math.hypot(bullet.vx, bullet.vy) || 1;
  const tailX = bullet.x - (bullet.vx / speed) * bullet.radius * 1.6;
  const tailY = bullet.y - (bullet.vy / speed) * bullet.radius * 1.6;

  ctx.save();
  ctx.shadowColor = bullet.glow;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
  ctx.fillStyle = bullet.color;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.moveTo(bullet.x, bullet.y);
  ctx.lineTo(tailX, tailY);
  ctx.strokeStyle = bullet.glow;
  ctx.lineWidth = bullet.radius * 0.55;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

function drawPowerUp(ctx: CanvasRenderingContext2D, power: PowerUp) {
  const color =
    power.kind === 'shield' ? COLORS.powerShield : COLORS.powerClear;

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.translate(power.x, power.y);

  if (power.kind === 'shield') {
    ctx.beginPath();
    ctx.moveTo(0, -power.radius);
    ctx.lineTo(power.radius, 0);
    ctx.lineTo(0, power.radius);
    ctx.lineTo(-power.radius, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 5;
      const r = i % 2 === 0 ? power.radius : power.radius * 0.45;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  ctx.restore();
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  const alpha = Math.max(0, p.life / p.maxLife);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  world: GameWorld,
  now: number,
) {
  const { width, height } = world;
  ctx.clearRect(0, 0, width, height);

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#0f0c29');
  grad.addColorStop(1, '#07060f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  drawGrid(ctx, width, height);

  for (const bullet of world.bullets) drawBullet(ctx, bullet);
  for (const power of world.powerUps) drawPowerUp(ctx, power);
  for (const particle of world.particles) drawParticle(ctx, particle);

  drawShip(
    ctx,
    world.playerX,
    world.playerY,
    now < world.shieldUntil,
  );
}
