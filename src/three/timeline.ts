// SceneDirector: مختصات جهانی سوژه‌ها و متن‌ها، کلیدفریم‌های دوربین و وضعیت صحنه.
//
// قرارداد زمانی: عدد صحیح i یعنی بخش sectionIds[i] در مرکز صفحه است.
// هر کلیدفریم در محدودهٔ ±0.5 همان بخش قرار دارد.
// subject: سوژهٔ سه‌بعدی (هسته، مکعب‌ها، پنل پروژه) که این مرحله به آن مربوط است.
// text: پنل متنی که در این مرحله نمایان است (اختیاری).
// look: نقطه‌ای که دوربین به آن نگاه می‌کند.
import type { ObjectMode } from './objectLayout';

export type Vec3 = [number, number, number];

// ---------- مختصات جهانی: سوژه‌ها و پنل‌های متن (ثابت) ----------
export const ANCHORS: Record<string, Vec3> = {
  // سوژه‌های هندسی
  'hero-core': [0, 0, 0],
  'about-structure': [2.6, 0.4, -1],
  'services-formation': [-2.2, -0.6, -2.5],
  'work-overview': [0, 0.5, 0],
  'work-serreshteh': [-2.4, 0.5, 0],
  'work-arya-safir': [2.4, 0.5, 0],
  'skills-structure': [0, 0.2, -3],
  'process-path': [0, -0.4, -4],
  'resume-anchor': [0, -0.5, -6],
  'identity-anchor': [0, 0, -8],
  'contact-core': [0, 0, -11],

  // پنل‌های متن (هر کدام مختصات جهانی مستقل دارد)
  'hero-text': [-2.6, 0.9, 0],
  'about-text': [-3.0, 0.6, -2.0],
  'services-text': [3.0, 1.2, -3.8],
  'work-text': [0, 2.6, 0.2],
  'work-serreshteh-text': [-2.4, -1.5, 0.6],
  'work-arya-safir-text': [2.4, -1.5, 0.6],
  'skills-text': [-3.2, 1.0, -5.2],
  'process-text': [3.2, 0.4, -6.4],
  'resume-text': [-3.0, -0.6, -7.6],
  'identity-text': [3.0, 0.2, -9.2],
  'contact-text': [-2.6, 0.4, -11.2],
};

// ترتیب واقعی بخش‌ها در App.tsx (از بالا به پایین)
export const sectionIds = [
  'hero',
  'about',
  'services',
  'work',
  'skills',
  'process',
  'resume',
  'identity',
  'contact',
];

// ---------- ویژگی‌های بصری هر بخش ----------
interface Visual {
  wave: number;
  curve: number;
  gridOpacity: number;
  particleSpeed: number;
  particleOpacity: number;
  objScale: number;
  glow: number;
  light: number;
}

const VISUAL: Record<string, Visual> = {
  hero: { wave: 0.6, curve: 0, gridOpacity: 0.45, particleSpeed: 0.02, particleOpacity: 0.55, objScale: 0.9, glow: 0.35, light: 1.2 },
  about: { wave: 0.4, curve: 0.2, gridOpacity: 0.35, particleSpeed: 0.01, particleOpacity: 0.45, objScale: 0.5, glow: 0.25, light: 1.0 },
  services: { wave: 0.6, curve: 0.4, gridOpacity: 0.4, particleSpeed: 0.015, particleOpacity: 0.5, objScale: 0.8, glow: 0.3, light: 1.1 },
  work: { wave: 0.3, curve: 0.2, gridOpacity: 0.3, particleSpeed: 0.01, particleOpacity: 0.4, objScale: 0.45, glow: 0.2, light: 0.9 },
  skills: { wave: 0.5, curve: 0.3, gridOpacity: 0.4, particleSpeed: 0.02, particleOpacity: 0.5, objScale: 0.9, glow: 0.4, light: 1.0 },
  process: { wave: 0.7, curve: 0.5, gridOpacity: 0.45, particleSpeed: 0.03, particleOpacity: 0.55, objScale: 0.9, glow: 0.55, light: 1.3 },
  resume: { wave: 0.4, curve: 0.1, gridOpacity: 0.35, particleSpeed: 0.01, particleOpacity: 0.45, objScale: 0.8, glow: 0.25, light: 0.9 },
  identity: { wave: 0.5, curve: 0.3, gridOpacity: 0.4, particleSpeed: 0.02, particleOpacity: 0.5, objScale: 1, glow: 0.45, light: 1.1 },
  contact: { wave: 0.3, curve: 0.1, gridOpacity: 0.3, particleSpeed: 0.005, particleOpacity: 0.35, objScale: 0.8, glow: 0.2, light: 0.8 },
};

// ---------- کلیدفریم‌ها ----------
interface KfInput {
  pos: number;
  id: string;
  section: string;
  subject: string;
  text?: string;
  cam: Vec3;
  look: Vec3;
  mode: ObjectMode;
  fov?: number;
  explode?: number;
  spin?: number;
}

export interface Keyframe {
  pos: number;
  id: string;
  section: string;
  subject: string;
  text?: string;
  cam: Vec3;
  look: Vec3;
  mode: ObjectMode;
  fov: number;
  explode: number;
  spin: number;
}

const A = ANCHORS;
const RAW: KfInput[] = [
  // Hero: عنوان اصلی در عمق صحنه؛ دوربین به آن نزدیک می‌شود
  { pos: 0, id: 'hero-far', section: 'hero', subject: 'hero-core', cam: [0, 3.5, 13], look: A['hero-core'], mode: 'rise', fov: 50 },
  { pos: 0.2, id: 'hero-approach', section: 'hero', subject: 'hero-core', text: 'hero-text', cam: [-1.2, 1.6, 6.6], look: A['hero-text'], mode: 'rise', fov: 48, spin: 0.5 },
  { pos: 0.4, id: 'hero-focus', section: 'hero', subject: 'hero-core', text: 'hero-text', cam: [-2.2, 1.0, 3.8], look: A['hero-text'], mode: 'rise', fov: 48, explode: 0.15, spin: 0.8 },

  // About: متن از چپ، ساختار از راست
  { pos: 0.6, id: 'about-entry', section: 'about', subject: 'about-structure', text: 'about-text', cam: [-3.4, 1.2, 2.8], look: A['about-text'], mode: 'orbit', fov: 46, spin: 0.2 },
  { pos: 0.85, id: 'about-focus', section: 'about', subject: 'about-structure', text: 'about-text', cam: [-3.0, 0.9, 1.8], look: A['about-text'], mode: 'orbit', fov: 44 },
  { pos: 1.0, id: 'about-reveal', section: 'about', subject: 'about-structure', cam: [1.2, 1.8, 2.2], look: A['about-structure'], mode: 'orbit', fov: 46, explode: 1, spin: 0.4 },
  { pos: 1.2, id: 'about-orbit', section: 'about', subject: 'about-structure', cam: [3.8, 2.2, 0.2], look: A['about-structure'], mode: 'orbit', fov: 48, explode: 0.8, spin: 1.2 },
  { pos: 1.4, id: 'about-reform', section: 'about', subject: 'about-structure', cam: [0.6, 1.6, 0.4], look: A['about-structure'], mode: 'orbit', fov: 48, explode: 0.3, spin: 2 },

  // Services: متن در عمق راست
  { pos: 1.6, id: 'services-entry', section: 'services', subject: 'services-formation', text: 'services-text', cam: [4.2, 2.2, 0.0], look: A['services-text'], mode: 'drift', fov: 52 },
  { pos: 1.85, id: 'services-focus', section: 'services', subject: 'services-formation', text: 'services-text', cam: [3.6, 1.4, 0.2], look: A['services-text'], mode: 'board', fov: 50 },
  { pos: 2.0, id: 'services-cubes', section: 'services', subject: 'services-formation', cam: [0.8, 1.4, 0.6], look: A['services-formation'], mode: 'board', fov: 50 },
  { pos: 2.2, id: 'services-pass', section: 'services', subject: 'services-formation', cam: [-1.6, 1.2, 0.2], look: A['services-formation'], mode: 'board', fov: 50 },
  { pos: 2.4, id: 'services-exit', section: 'services', subject: 'services-formation', cam: [-3.4, 1.4, -1.0], look: A['skills-text'], mode: 'row', fov: 50 },

  // Work: عنوان بخش، سپس هر پروژه با پنل تصویری و پنل متن خودش
  { pos: 2.55, id: 'work-overview', section: 'work', subject: 'work-overview', text: 'work-text', cam: [0, 2.6, 9.0], look: A['work-text'], mode: 'orbit', fov: 48 },
  { pos: 2.7, id: 'work-serreshteh-enter', section: 'work', subject: 'work-serreshteh', cam: [-2.0, 0.8, 5.0], look: A['work-serreshteh'], mode: 'orbit', fov: 46 },
  { pos: 2.85, id: 'work-serreshteh-focus', section: 'work', subject: 'work-serreshteh', text: 'work-serreshteh-text', cam: [-2.4, -0.2, 4.4], look: A['work-serreshteh-text'], mode: 'orbit', fov: 44 },
  { pos: 2.95, id: 'work-serreshteh-exit', section: 'work', subject: 'work-serreshteh', cam: [-1.2, 0.8, 5.0], look: [0, 0.4, 0], mode: 'orbit', fov: 46 },
  { pos: 3.05, id: 'work-transit', section: 'work', subject: 'work-overview', cam: [0, 1.4, 7.4], look: [0, 0.5, 0], mode: 'orbit', fov: 48 },
  { pos: 3.15, id: 'work-arya-enter', section: 'work', subject: 'work-arya-safir', cam: [2.0, 0.8, 5.0], look: A['work-arya-safir'], mode: 'orbit', fov: 46 },
  { pos: 3.3, id: 'work-arya-focus', section: 'work', subject: 'work-arya-safir', text: 'work-arya-safir-text', cam: [2.4, -0.2, 4.4], look: A['work-arya-safir-text'], mode: 'orbit', fov: 44 },
  { pos: 3.42, id: 'work-arya-exit', section: 'work', subject: 'work-arya-safir', cam: [3.4, 1.0, 5.0], look: [2.4, 0.5, 0], mode: 'orbit', fov: 46 },

  // Skills: متن در عمق چپ
  { pos: 3.6, id: 'skills-enter', section: 'skills', subject: 'skills-structure', cam: [-1.2, 2.0, 0.4], look: A['skills-structure'], mode: 'stack', fov: 50 },
  { pos: 3.85, id: 'skills-focus', section: 'skills', subject: 'skills-structure', text: 'skills-text', cam: [-3.0, 1.2, -1.4], look: A['skills-text'], mode: 'board', fov: 50 },
  { pos: 4.0, id: 'skills-layers', section: 'skills', subject: 'skills-structure', cam: [-1.0, 1.0, -1.0], look: A['skills-structure'], mode: 'stack', fov: 50 },
  { pos: 4.2, id: 'skills-exit', section: 'skills', subject: 'skills-structure', cam: [0, 2.0, 1.6], look: [0, 0.2, -3], mode: 'row', fov: 50 },

  // Process (ایندکس ۵): ایستگاه متن در عمق راست
  { pos: 4.6, id: 'process-enter', section: 'process', subject: 'process-path', text: 'process-text', cam: [4.8, 2.2, -2.6], look: A['process-text'], mode: 'stream', fov: 52 },
  { pos: 4.85, id: 'process-focus', section: 'process', subject: 'process-path', text: 'process-text', cam: [4.2, 0.8, -2.4], look: A['process-text'], mode: 'stream', fov: 50 },
  { pos: 5.0, id: 'process-path', section: 'process', subject: 'process-path', cam: [-1.6, 1.6, -1.6], look: A['process-path'], mode: 'stream', fov: 50, spin: 0.4 },
  { pos: 5.2, id: 'process-exit', section: 'process', subject: 'process-path', cam: [-3.2, 1.0, -3.6], look: A['resume-text'], mode: 'stream', fov: 50 },

  // Resume (ایندکس ۶)
  { pos: 5.6, id: 'resume-main', section: 'resume', subject: 'resume-anchor', text: 'resume-text', cam: [-3.0, -0.2, -3.8], look: A['resume-text'], mode: 'row', fov: 49 },
  { pos: 5.9, id: 'resume-exit', section: 'resume', subject: 'resume-anchor', cam: [-2.0, 0.4, -4.6], look: A['resume-text'], mode: 'row', fov: 49 },

  // Identity (ایندکس ۷)
  { pos: 6.6, id: 'identity-main', section: 'identity', subject: 'identity-anchor', text: 'identity-text', cam: [2.6, 0.6, -5.4], look: A['identity-text'], mode: 'drift', fov: 48 },
  { pos: 7.0, id: 'identity-exit', section: 'identity', subject: 'identity-anchor', cam: [1.0, 1.0, -6.4], look: A['identity-anchor'], mode: 'drift', fov: 48 },

  // Contact (ایندکس ۸): هسته و متن تماس در انتهای مسیر
  { pos: 7.6, id: 'contact-main', section: 'contact', subject: 'contact-core', text: 'contact-text', cam: [-1.4, 1.0, -7.4], look: A['contact-text'], mode: 'settle', fov: 50, explode: 0.1 },
  { pos: 8.0, id: 'contact-final', section: 'contact', subject: 'contact-core', cam: [0, 1.2, -7.2], look: A['contact-core'], mode: 'settle', fov: 50, explode: 0.1 },
];

export const keyframes: Keyframe[] = RAW.map((k) => ({
  pos: k.pos,
  id: k.id,
  section: k.section,
  subject: k.subject,
  text: k.text,
  cam: k.cam,
  look: k.look,
  mode: k.mode,
  fov: k.fov ?? 50,
  explode: k.explode ?? 0,
  spin: k.spin ?? 0,
})).sort((a, b) => a.pos - b.pos);

// ---------- بررسی سازگاری (خطاها در کنسول ثبت می‌شوند) ----------
export function checkTimeline(domIds?: string[]): string[] {
  const errors: string[] = [];

  for (let i = 1; i < keyframes.length; i++) {
    if (keyframes[i].pos <= keyframes[i - 1].pos) {
      errors.push(`کلیدفریم‌های ${keyframes[i - 1].id} و ${keyframes[i].id} ترتیب یا موقعیت یکتا ندارند`);
    }
  }

  for (const k of keyframes) {
    const idx = sectionIds.indexOf(k.section);
    if (idx < 0) {
      errors.push(`بخش ${k.section} در sectionIds نیست (${k.id})`);
    } else if (Math.abs(k.pos - idx) > 0.5) {
      errors.push(`کلیدفریم ${k.id} خارج از محدودهٔ بخش ${k.section} است`);
    }
    if (!ANCHORS[k.subject]) errors.push(`سوژهٔ ${k.subject} در ANCHORS تعریف نشده است (${k.id})`);
    if (k.text && !ANCHORS[k.text]) errors.push(`پنل متن ${k.text} در ANCHORS تعریف نشده است (${k.id})`);
  }

  if (domIds) {
    const same = domIds.length === sectionIds.length && domIds.every((id, i) => id === sectionIds[i]);
    if (!same) {
      errors.push(`ترتیب بخش‌های DOM (${domIds.join(' > ')}) با sectionIds هماهنگ نیست`);
    }
  }

  if (errors.length > 0) console.error('[SceneDirector]', errors.join(' | '));
  return errors;
}

checkTimeline();

// ---------- وزن کلیدفریم‌ها (هموار و پیوسته) ----------
const SIGMA = 0.2;
const CUT = 0.8;

export function activeWeights(pos: number): { k: Keyframe; w: number }[] {
  const last = keyframes[keyframes.length - 1].pos;
  const p = Math.min(Math.max(pos, 0), last);
  const out: { k: Keyframe; w: number }[] = [];
  let sum = 0;
  for (const k of keyframes) {
    const d = p - k.pos;
    if (Math.abs(d) > CUT) continue;
    const w = Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
    out.push({ k, w });
    sum += w;
  }
  if (sum <= 0) {
    let best = keyframes[0];
    for (const k of keyframes) if (Math.abs(p - k.pos) < Math.abs(p - best.pos)) best = k;
    return [{ k: best, w: 1 }];
  }
  for (const o of out) o.w /= sum;
  return out;
}

// ---------- وضعیت یک سوژهٔ هندسی (هسته یا پنل پروژه) ----------
export interface SubjectState {
  share: number;
  explode: number;
  spin: number;
}

export function subjectState(pos: number, subject: string): SubjectState {
  let share = 0;
  let ex = 0;
  let sp = 0;
  for (const { k, w } of activeWeights(pos)) {
    if (k.subject === subject) {
      share += w;
      ex += w * k.explode;
      sp += w * k.spin;
    }
  }
  return {
    share,
    explode: share > 0 ? ex / share : 0,
    spin: share > 0 ? sp / share : 0,
  };
}

// سهم یک پنل متن از کل صحنه (بین ۰ و ۱)
export function textPresence(pos: number, textId: string): number {
  let s = 0;
  for (const { k, w } of activeWeights(pos)) {
    if (k.text === textId) s += w;
  }
  return s;
}

// ---------- نمونه‌گیری دوربین و صحنه ----------
export interface Sample {
  cam: Vec3;
  look: Vec3;
  fov: number;
  wave: number;
  curve: number;
  gridOpacity: number;
  particleSpeed: number;
  particleOpacity: number;
  objScale: number;
  glow: number;
  light: number;
}

// دوربین بین دو کلیدفریم مجاور با smoothstep درون‌یابی می‌شود (پیوسته و قابل برگشت).
export function sampleTimeline(pos: number): Sample {
  const K = keyframes;
  const n = K.length;
  const p = Math.min(Math.max(pos, K[0].pos), K[n - 1].pos);
  let i = 0;
  while (i < n - 1 && K[i + 1].pos <= p) i++;
  const A = K[i];
  const B = K[Math.min(i + 1, n - 1)];
  const span = B.pos - A.pos;
  const f = span > 0 ? Math.min(Math.max((p - A.pos) / span, 0), 1) : 0;
  const e = f * f * (3 - 2 * f);
  const L = (a: number, b: number) => a + (b - a) * e;
  const V1 = VISUAL[A.section];
  const V2 = VISUAL[B.section];
  const V = (key: keyof Visual) => L(V1[key], V2[key]);

  return {
    cam: [L(A.cam[0], B.cam[0]), L(A.cam[1], B.cam[1]), L(A.cam[2], B.cam[2])],
    look: [L(A.look[0], B.look[0]), L(A.look[1], B.look[1]), L(A.look[2], B.look[2])],
    fov: L(A.fov, B.fov),
    wave: V('wave'),
    curve: V('curve'),
    gridOpacity: V('gridOpacity'),
    particleSpeed: V('particleSpeed'),
    particleOpacity: V('particleOpacity'),
    objScale: V('objScale'),
    glow: V('glow'),
    light: V('light'),
  };
}

// ---------- موقعیت پیوسته بخش‌ها از روی مراکز DOM ----------
export function isIncreasing(values: number[]): boolean {
  for (let i = 1; i < values.length; i++) if (values[i] <= values[i - 1]) return false;
  return true;
}

export function computeSectionPos(centers: number[], mid: number): number {
  if (centers.length === 0) return 0;
  if (mid <= centers[0]) return 0;
  if (mid >= centers[centers.length - 1]) return centers.length - 1;
  for (let i = 0; i < centers.length - 1; i++) {
    const a = centers[i];
    const b = centers[i + 1];
    if (mid >= a && mid <= b) return i + (mid - a) / (b - a);
  }
  return 0;
}
