import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { projects, type Project } from '../data/projects';
import { scrollState } from '../store/scroll';
import { prefersReducedMotion } from '../utils/webgl';
import { ANCHORS, subjectState } from './timeline';

const PANEL_W = 2.6;
const PANEL_H = 1.6;
const HIDDEN_Y = -3.5;

function createPanelTexture(project: Project): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 316;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0a1630';
    ctx.fillRect(0, 0, 512, 316);
    ctx.strokeStyle = '#3D8BFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, 488, 292);
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';

    ctx.fillStyle = '#7FB2FF';
    ctx.font = '600 22px Tahoma, sans-serif';
    ctx.fillText(project.category, 476, 70);

    ctx.fillStyle = '#DCE6F8';
    ctx.font = 'bold 44px Tahoma, sans-serif';
    ctx.fillText(project.name, 476, 150);

    ctx.fillStyle = '#8A9BBE';
    ctx.font = '22px Tahoma, sans-serif';
    const info = project.url ? project.url.replace(/^https?:\/\//, '') : project.status ?? '';
    ctx.fillText(info, 476, 210);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// هر پروژه سوژهٔ مستقل `work-<id>` دارد. ورود، تمرکز و خروج پنل
// فقط از سهم همین سوژه در کلیدفریم‌ها خوانده می‌شود، نه از یک مقدار مشترک.
function ProjectPanel({ project }: { project: Project }) {
  const group = useRef<THREE.Group>(null);
  const texture = useMemo(() => createPanelTexture(project), [project]);
  const subject = `work-${project.id}`;
  const anchor = ANCHORS[subject] ?? [0, 0, 0];

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const reduce = prefersReducedMotion();
    const presence = Math.min(1, subjectState(scrollState.sectionPos, subject).share * 2.5);
    const k = reduce ? 1 : 1 - Math.exp(-delta * 5);
    const bob = reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.8) * 0.05 * presence;

    const ty = THREE.MathUtils.lerp(HIDDEN_Y, anchor[1], presence) + bob;
    const tz = THREE.MathUtils.lerp(anchor[2] - 4, anchor[2], presence);
    const trot = THREE.MathUtils.lerp(0.35, 0, presence);
    const tscale = THREE.MathUtils.lerp(0.5, 1, presence);

    g.position.y += (ty - g.position.y) * k;
    g.position.z += (tz - g.position.z) * k;
    g.rotation.y += (trot - g.rotation.y) * k;
    g.scale.setScalar(g.scale.x + (tscale - g.scale.x) * k);
    g.visible = presence > 0.02;
  });

  return (
    <group ref={group} position={[anchor[0], HIDDEN_Y, anchor[2] - 4]} visible={false}>
      <mesh>
        <boxGeometry args={[PANEL_W, PANEL_H, 0.08]} />
        <meshStandardMaterial color="#0a1630" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[PANEL_W * 0.96, PANEL_H * 0.96]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function ProjectExhibits() {
  return (
    <>
      {projects.map((p) => (
        <ProjectPanel key={p.id} project={p} />
      ))}
    </>
  );
}
