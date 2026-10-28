import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { scrollState } from '../store/scroll';
import { prefersReducedMotion } from '../utils/webgl';
import { ANCHORS, subjectState } from './timeline';

const NORMALS = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
];
const FORWARD = new THREE.Vector3(0, 0, 1);
const REST = 0.7;
const OPEN = 1.6;

interface Props {
  subject: string; // شناسهٔ سوژه در ANCHORS؛ موقعیت هسته ثابت است
}

// هستهٔ مستقل: مکانش در فضای جهانی ثابت است. حضور، جداشدن و چرخش آن
// فقط از کلیدفریم‌های همین سوژه خوانده می‌شود.
export default function Core({ subject }: Props) {
  const group = useRef<THREE.Group>(null);
  const faceRefs = useRef<(THREE.Mesh | null)[]>([]);
  const innerRef = useRef<THREE.Mesh>(null);
  const anchor = ANCHORS[subject];

  const faceGeo = useMemo(() => new RoundedBoxGeometry(1.3, 1.3, 0.12, 3, 0.04), []);
  const innerGeo = useMemo(() => new THREE.IcosahedronGeometry(0.42, 1), []);
  const quats = useMemo(
    () => NORMALS.map((n) => new THREE.Quaternion().setFromUnitVectors(FORWARD, n)),
    [],
  );
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(
    () => () => {
      faceGeo.dispose();
      innerGeo.dispose();
    },
    [faceGeo, innerGeo],
  );

  useFrame((state) => {
    const st = subjectState(scrollState.sectionPos, subject);
    const t = prefersReducedMotion() ? 0 : state.clock.elapsedTime;
    const presence = Math.min(1, st.share * 2.5);

    if (group.current) {
      group.current.visible = presence > 0.01;
      group.current.scale.setScalar(Math.max(presence, 0.001));
      group.current.rotation.y = st.spin + t * 0.1;
    }

    const offset = REST + (OPEN - REST) * st.explode;
    NORMALS.forEach((n, i) => {
      const m = faceRefs.current[i];
      if (!m) return;
      m.position.copy(tmp.copy(n).multiplyScalar(offset));
    });

    if (innerRef.current) {
      innerRef.current.rotation.x = t * 0.4;
      innerRef.current.rotation.y = t * 0.3;
      innerRef.current.scale.setScalar(1 - st.explode * 0.25);
    }
  });

  return (
    <group ref={group} position={anchor}>
      {NORMALS.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            faceRefs.current[i] = el;
          }}
          geometry={faceGeo}
          quaternion={quats[i]}
        >
          <meshStandardMaterial color="#2F74FF" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh ref={innerRef} geometry={innerGeo}>
        <meshStandardMaterial color="#DCE6F8" emissive="#3D8BFF" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}
