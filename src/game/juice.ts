export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  drip: boolean;
};

export type Juice = {
  trauma: number;
  hitstop: number;
  flash: number;
  punch: number;
  particles: Particle[];
};

const POOL = 160;

export function createJuice(): Juice {
  return { trauma: 0, hitstop: 0, flash: 0, punch: 0, particles: [] };
}

export function addTrauma(j: Juice, amount: number) {
  j.trauma = Math.min(1, j.trauma + amount);
}

export function addHitstop(j: Juice, seconds: number) {
  j.hitstop = Math.max(j.hitstop, seconds);
}

export function burst(
  j: Juice,
  x: number,
  y: number,
  color: string,
  count: number,
  power: number,
) {
  const n = Math.min(count, POOL - j.particles.length);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = (0.35 + Math.random()) * power;
    j.particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - power * 0.25,
      life: 0.35 + Math.random() * 0.45,
      max: 0.8,
      size: 2 + Math.random() * 5,
      color,
      drip: Math.random() < 0.35,
    });
  }
}

export function tickJuice(j: Juice, dt: number, reduced: boolean) {
  if (j.hitstop > 0) {
    j.hitstop -= dt;
    if (j.hitstop < 0) j.hitstop = 0;
  }
  const decay = reduced ? 6 : 2.4;
  j.trauma = Math.max(0, j.trauma - decay * dt);
  j.flash = Math.max(0, j.flash - dt * 4);
  j.punch = Math.max(0, j.punch - dt * 5);
  for (let i = j.particles.length - 1; i >= 0; i--) {
    const p = j.particles[i];
    p.life -= dt;
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.vy += (p.drip ? 28 : 12) * dt;
    p.vx *= 0.98;
    if (p.life <= 0) j.particles.splice(i, 1);
  }
}

export function shakeOffset(j: Juice, t: number, reduced: boolean) {
  if (reduced || j.trauma <= 0) return { x: 0, y: 0, r: 0 };
  const mag = j.trauma * j.trauma;
  return {
    x: mag * 14 * Math.sin(t * 47.1),
    y: mag * 10 * Math.cos(t * 41.7),
    r: mag * 0.03 * Math.sin(t * 23),
  };
}
