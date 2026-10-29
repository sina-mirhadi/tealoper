import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollState } from '../store/scroll';
import { prefersReducedMotion } from '../utils/webgl';

// فونت پیکسلی ۵×۵ برای لوگوتایپ TeaLoper. # یعنی پیکسل روشن.
const GLYPHS: Record<string, string[]> = {
  T: ['#####', '..#..', '..#..', '..#..', '..#..'],
  e: ['.###.', '#...#', '#####', '#....', '.###.'],
  a: ['.###.', '....#', '.####', '#...#', '.####'],
  L: ['#....', '#....', '#....', '#....', '#####'],
  o: ['.....', '.###.', '#...#', '#...#', '.###.'],
  p: ['####.', '#...#', '####.', '#....', '#....'],
  r: ['#.##.', '##..#', '#....', '#....', '#....'],
};
const WORD = 'TeaLoper';
const SPACING = 0.2;
// مرکز لوگوتایپ همان نقطه‌ای است که دوربین در کلیدفریم hero-far به آن نگاه می‌کند.
export const LOGO_CENTER: [number, number, number] = [0, 2.6, -1];
const CENTER = LOGO_CENTER;
// مرحلهٔ جدا شدن: با اسکرول از بخش اول (hero) مربع‌ها از شکل کلمه جدا می‌شوند.
const SCATTER_END = 0.35;

// تبدیل کلمه به فهرست پیکسل‌های روشن، با مختصات نرمال‌شده حول مرکز.
function buildPixels(): [number, number][] {
  const raw: [number, number][] = [];
  let x0 = 0;
  for (const ch of WORD) {
    const glyph = GLYPHS[ch];
    if (!glyph) {
      x0 += 6;
      continue;
    }
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (glyph[row][col] === '#') raw.push([x0 + col, row]);
      }
    }
    x0 += 6;
  }
  const width = x0 - 1;
  const cx = (width - 1) / 2;
  const cy = 2;
  return raw.map(([x, y]) => [x - cx, -(y - cy)]);
}

const PIXELS = buildPixels();
const COUNT = PIXELS.length;

// موقعیت پراکنده برای هر مربع: ثابت و قطعی (بدون Math.random در هر فریم)
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const SCATTER = Array.from({ length: COUNT }, (_, i) => ({
  x: (hash(i * 3 + 1) - 0.5) * 12,
  y: (hash(i * 3 + 2) - 0.5) * 7,
  z: (hash(i * 3 + 3) - 0.5) * 8 - 2,
}));

// لوگوتایپ TeaLoper: یک InstancedMesh که در حالت اولیه کلمه را می‌سازد
// و با پیشرفت اسکرول به‌تدریج پراکنده و ناپدید می‌شود.
export default function LogoIntro() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;

    const p = Math.min(1, Math.max(0, scrollState.sectionPos / SCATTER_END));
    m.visible = p < 1;
    if (!m.visible) return;

    const e = p * p * (3 - 2 * p);
    const t = prefersReducedMotion() ? 0 : state.clock.elapsedTime;

    for (let i = 0; i < COUNT; i++) {
      const [px, py] = PIXELS[i];
      const s = SCATTER[i];
      dummy.position.set(
        CENTER[0] + px * SPACING * (1 - e) + s.x * e,
        CENTER[1] + py * SPACING * (1 - e) + s.y * e + Math.sin(t + i) * 0.015 * (1 - e),
        CENTER[2] + s.z * e,
      );
      dummy.rotation.set(e * (i % 3), e * i * 0.3, 0);
      dummy.scale.setScalar(1 - e * 0.5);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
      <boxGeometry args={[0.16, 0.16, 0.16]} />
      <meshStandardMaterial color="#3D8BFF" emissive="#1B3A7A" emissiveIntensity={0.4} metalness={0.4} roughness={0.35} />
    </instancedMesh>
  );
}
