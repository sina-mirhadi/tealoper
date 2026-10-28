import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { scrollState } from '../store/scroll';
import { prefersReducedMotion } from '../utils/webgl';
import { targetFor } from './objectLayout';
import { ANCHORS, activeWeights, sampleTimeline } from './timeline';

const COUNT = 12;
const PALETTE = ['#2F74FF', '#3D8BFF', '#DCE6F8', '#1B3A7A'];

// هر مکعب شناسهٔ ثابت دارد. مقصد آن از ترکیب وزن‌دار آرایش هر کلیدفریم فعال
// به‌دست می‌آید؛ هر آرایش حول سوژهٔ همان کلیدفریم با مختصات جهانی ثابت محاسبه می‌شود.
function Tile({ index, geometry }: { index: number; geometry: THREE.BufferGeometry }) {
  const ref = useRef<THREE.Mesh>(null);
  const color = PALETTE[index % PALETTE.length];

  const qT = useMemo(() => new THREE.Quaternion(), []);
  const eT = useMemo(() => new THREE.Euler(), []);

  useFrame((state, delta) => {
    const m = ref.current;
    if (!m) return;

    const reduce = prefersReducedMotion();
    const pos = scrollState.sectionPos;
    const t = reduce ? 0 : state.clock.elapsedTime;

    let x = 0;
    let y = 0;
    let z = 0;
    let rx = 0;
    let ry = 0;
    let rz = 0;
    let s = 0;

    for (const { k, w } of activeWeights(pos)) {
      const T = targetFor(k.mode, index, COUNT, t);
      const a = ANCHORS[k.subject];
      x += w * (a[0] + T.x);
      y += w * (a[1] + T.y);
      z += w * (a[2] + T.z);
      rx += w * T.rx;
      ry += w * T.ry;
      rz += w * T.rz;
      s += w * T.s;
    }

    const k = reduce ? 1 : 1 - Math.exp(-delta * 4);
    m.position.x += (x - m.position.x) * k;
    m.position.y += (y - m.position.y) * k;
    m.position.z += (z - m.position.z) * k;

    eT.set(rx, ry, rz);
    qT.setFromEuler(eT);
    m.quaternion.slerp(qT, k);

    const sc = s * sampleTimeline(pos).objScale;
    m.scale.setScalar(m.scale.x + (sc - m.scale.x) * k);
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
    </mesh>
  );
}

export default function FloatingObjects() {
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 0.25, 4, 0.08), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => (
        <Tile key={i} index={i} geometry={geometry} />
      ))}
    </>
  );
}
