// هفت حالت حرکتی اشیا. هر حالت برای هر شیء یک موقعیت، چرخش و مقیاس هدف می‌دهد.
export type ObjectMode = 'orbit' | 'drift' | 'settle' | 'board' | 'stream' | 'rise' | 'stack' | 'row';

export interface Target {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  s: number;
}

// تابع شبه‌تصادفی قطعی: برای هر شیء همیشه یک عدد ثابت می‌دهد.
const hash = (n: number): number => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function targetFor(mode: ObjectMode, i: number, n: number, t: number): Target {
  const h1 = hash(i + 1);
  const h2 = hash(i + 17);
  const h3 = hash(i + 31);

  switch (mode) {
    case 'orbit': {
      const ang = (i / n) * Math.PI * 2 + t * 0.15;
      return {
        x: Math.cos(ang) * 5,
        y: Math.sin(ang * 2) * 0.6,
        z: Math.sin(ang) * 2.5 - 1,
        rx: t * 0.2 + i,
        ry: t * 0.3,
        rz: 0,
        s: 0.9,
      };
    }
    case 'drift':
      return {
        x: (h1 - 0.5) * 12 + Math.sin(t * 0.3 + i) * 0.4,
        y: (h2 - 0.5) * 6 + Math.cos(t * 0.25 + i) * 0.4,
        z: (h3 - 0.5) * 6 - 1,
        rx: t * 0.1 + h1 * 3,
        ry: t * 0.15 + h2 * 3,
        rz: h3,
        s: 0.9,
      };
    case 'settle': {
      const c = i % 4;
      const r = Math.floor(i / 4);
      return { x: (c - 1.5) * 1.3, y: 1 - r * 1.3, z: -1.5, rx: 0, ry: 0, rz: 0, s: 0.9 };
    }
    case 'board': {
      const c = i % 4;
      const r = Math.floor(i / 4);
      return { x: (c - 1.5) * 1.7, y: 1.2 - r * 1.7, z: -2.5, rx: 0, ry: 0, rz: 0, s: 1 };
    }
    case 'stream': {
      const u = (((i / n) * 16 + t * 0.6) % 16) - 8;
      const edge = clamp01((8 - Math.abs(u)) / 1.5);
      return {
        x: u,
        y: Math.sin(u * 0.5 + i) * 0.8,
        z: -2 + h1,
        rx: 0,
        ry: Math.sin(t + i) * 0.2,
        rz: 0,
        s: 0.8 * edge,
      };
    }
    case 'rise': {
      const y = (((i / n) * 7 + t * 0.4) % 7) - 3.5;
      const edge = clamp01((3.5 - Math.abs(y)) / 1);
      return {
        x: (h1 - 0.5) * 8,
        y,
        z: -2,
        rx: 0,
        ry: t * 0.2,
        rz: 0,
        s: 0.8 * edge,
      };
    }
    case 'stack':
      return {
        x: 0.3 * Math.sin(i),
        y: i * 0.36 - 2,
        z: 0.5,
        rx: -0.2,
        ry: 0.1 * i,
        rz: 0,
        s: 1.1,
      };
    case 'row':
      return { x: (i - (n - 1) / 2) * 1.0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 0.9 };
  }
}
