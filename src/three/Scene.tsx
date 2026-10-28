import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { scrollState } from '../store/scroll';
import { hasWebGL, prefersReducedMotion } from '../utils/webgl';
import { sampleTimeline } from './timeline';
import FloatingObjects from './FloatingObjects';
import Core from './Core';
import ProjectExhibits from './ProjectExhibits';
import WorldTexts from './WorldText';

const COLORS = { accent: '#3D8BFF', ice: '#DCE6F8' };

const gridVertex = /* glsl */ `
  uniform float uTime;
  uniform float uWave;
  uniform float uCurve;
  varying vec2 vPos;
  varying float vWave;
  void main() {
    vec3 p = position;
    float h = sin(uTime * 0.9 + p.x * 0.22 + p.y * 0.18) * uWave;
    p.z += h;
    p.z += uCurve * (p.x * p.x + p.y * p.y) * 0.002;
    vPos = p.xy;
    vWave = h;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const gridFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform vec2 uMouse;
  varying vec2 vPos;
  varying float vWave;
  void main() {
    vec2 g = abs(fract(vPos - 0.5) - 0.5) / fwidth(vPos);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float fade = smoothstep(18.0, 2.0, length(vPos));
    float near = smoothstep(3.0, 0.0, distance(vPos, uMouse));
    float alpha = line * fade * uOpacity * (0.7 + vWave * 0.25 + near * 0.9);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const plainVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// پس‌زمینه شیدری: نویز ساده در دو مقیاس که شدت درخشش آن با تایم‌لاین تغییر می‌کند.
const backdropFragment = /* glsl */ `
  uniform float uTime;
  uniform float uGlow;
  uniform vec3 uBase;
  uniform vec3 uAccent;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  void main() {
    vec2 p = vUv * 3.0 + vec2(uTime * 0.02, uTime * 0.01);
    float n = noise(p) * 0.5 + noise(p * 2.0) * 0.25;
    vec3 col = mix(uBase, uAccent, n * uGlow);
    float v = smoothstep(1.2, 0.2, distance(vUv, vec2(0.7, 0.4)));
    gl_FragColor = vec4(col * (0.6 + 0.4 * v), 1.0);
  }
`;

function Backdrop() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uGlow: { value: 0.3 },
      uBase: { value: new THREE.Color('#040917') },
      uAccent: { value: new THREE.Color('#1B3A7A') },
    }),
    [],
  );

  useFrame((_, delta) => {
    const s = sampleTimeline(scrollState.sectionPos);
    if (!prefersReducedMotion()) uniforms.uTime.value += delta;
    uniforms.uGlow.value = s.glow;
  });

  return (
    <mesh position={[0, 0, -12]} renderOrder={-1}>
      <planeGeometry args={[90, 60]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={plainVertex}
        fragmentShader={backdropFragment}
        depthWrite={false}
      />
    </mesh>
  );
}

function WaveGrid() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWave: { value: 0.6 },
      uCurve: { value: 0 },
      uColor: { value: new THREE.Color(COLORS.accent) },
      uOpacity: { value: 0.45 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  // نشانگر ماوس: مختصات تقریبی روی سطح شبکه (تصویرسازی ساده، نه دقیق).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      scrollState.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    const s = sampleTimeline(scrollState.sectionPos);
    if (!prefersReducedMotion()) uniforms.uTime.value += delta;
    uniforms.uWave.value = s.wave;
    uniforms.uCurve.value = s.curve;
    uniforms.uOpacity.value = s.gridOpacity;
    uniforms.uMouse.value.set(scrollState.mouse.x * 8, -scrollState.mouse.y * 4);
  });

  return (
    <mesh rotation={[-Math.PI / 2.4, 0, 0]} position={[0, -2.2, 0]}>
      <planeGeometry args={[36, 36, 144, 144]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={gridVertex}
        fragmentShader={gridFragment}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

function Particles({ count = 1200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    const s = sampleTimeline(scrollState.sectionPos);
    if (ref.current && !prefersReducedMotion()) ref.current.rotation.y += delta * s.particleSpeed;
    if (matRef.current) matRef.current.opacity = s.particleOpacity;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.04}
        color={COLORS.ice}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function KeyLight() {
  const ref = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    const s = sampleTimeline(scrollState.sectionPos);
    if (ref.current) ref.current.intensity = s.light;
  });
  return <directionalLight ref={ref} position={[3, 5, 4]} intensity={1.2} />;
}

// دوربین مستقیماً از کلیدفریم‌های SceneDirector پیروی می‌کند و با میرایی کوتاه نرم می‌شود.
function CameraRig() {
  const target = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const lookCurrent = useMemo(() => new THREE.Vector3(), []);
  const ready = useRef(false);

  useFrame(({ camera }, delta) => {
    const s = sampleTimeline(scrollState.sectionPos);
    target.set(s.cam[0], s.cam[1], s.cam[2]);
    look.set(s.look[0], s.look[1], s.look[2]);

    if (camera instanceof THREE.PerspectiveCamera) {
      if (Math.abs(camera.fov - s.fov) > 0.01) {
      camera.fov = D(camera.fov, s.fov, 3, delta);
      camera.updateProjectionMatrix();
      }
    }

    const lambda = prefersReducedMotion() ? 20 : 10;
    const D = THREE.MathUtils.damp;
    camera.position.x = D(camera.position.x, target.x, lambda, delta);
    camera.position.y = D(camera.position.y, target.y, lambda, delta);
    camera.position.z = D(camera.position.z, target.z, lambda, delta);
    lookCurrent.x = D(lookCurrent.x, look.x, lambda, delta);
    lookCurrent.y = D(lookCurrent.y, look.y, lambda, delta);
    lookCurrent.z = D(lookCurrent.z, look.z, lambda, delta);
    camera.lookAt(lookCurrent);

    if (Math.abs(camera.fov - s.fov) > 0.01) {
      camera.fov = D(camera.fov, s.fov, 3, delta);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

export default function Scene() {
  if (!hasWebGL()) return null;

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 2.2, 9], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#040917']} />
        <ambientLight intensity={0.6} />
        <KeyLight />
        <Backdrop />
        <WaveGrid />
        <Particles />
        <FloatingObjects />
        <Core subject="hero-core" />
        <Core subject="about-structure" />
        <Core subject="contact-core" />
        <ProjectExhibits />
        <WorldTexts />
        <CameraRig />
      </Canvas>
    </div>
  );
}
