/**
 * The "stage" is the single persistent 3D shoe that travels through every
 * section. Sections register scroll segments; each segment maps its own
 * scroll progress to a sequence of poses. The pose is a pure function of the
 * scroll position, so jumping anywhere on the page (anchors, refresh, resize)
 * always lands on the correct composition.
 */
import { ScrollTrigger } from '@/lib/gsap';

export type Pose = {
  x: number; // viewport fraction, -0.5 (left) .. 0.5 (right)
  y: number; // viewport fraction, -0.5 (bottom) .. 0.5 (top)
  z: number; // world-unit dolly toward the camera
  s: number; // shoe length as a fraction of the viewport width
  rx: number;
  ry: number;
  rz: number;
  explode: number; // 0..1 exploded technical view
  vis: number; // 0..1 visibility
  rim: number; // 0..1 orange rim light
  shadow: number; // 0..1 contact shadow
  drag: number; // 0..1 user drag rotation allowed
};

export type Viewport = { w: number; h: number; aspect: number; mobile: boolean };
export type PoseLike = Partial<Pose> | ((v: Viewport, t: number) => Partial<Pose>);
export type Key = { t: number; pose: PoseLike };

export const BASE: Pose = { x: 0, y: 0, z: 0, s: 0.4, rx: 0, ry: 0, rz: 0, explode: 0, vis: 1, rim: 0, shadow: 0, drag: 0 };

type Segment = { st: ScrollTrigger; keys: Key[]; order: number };
const segments: Segment[] = [];

export const stage = {
  intro: 0, // 0..1 entrance after the preloader
  spin: 0, // extra rotation for colorway swaps
  dragRy: 0,
  pointer: { x: 0, y: 0 },
  current: { ...BASE } as Pose,
};

export function registerSegment(trigger: Element, start: string, end: string, keys: Key[], order: number) {
  const st = ScrollTrigger.create({ trigger, start, end });
  const seg = { st, keys, order };
  segments.push(seg);
  segments.sort((a, b) => a.order - b.order);
  return () => {
    st.kill();
    const i = segments.indexOf(seg);
    if (i >= 0) segments.splice(i, 1);
  };
}

const ease = (t: number) => t * t * (3 - 2 * t);
const resolve = (p: PoseLike, v: Viewport, t: number): Pose => ({ ...BASE, ...(typeof p === 'function' ? p(v, t) : p) });

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const o = {} as Pose;
  (Object.keys(BASE) as (keyof Pose)[]).forEach((k) => (o[k] = a[k] + (b[k] - a[k]) * t));
  return o;
}

function sample(keys: Key[], t: number, v: Viewport): Pose {
  if (t <= keys[0].t) return resolve(keys[0].pose, v, t);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b.t) {
      const local = ease((t - a.t) / Math.max(1e-6, b.t - a.t));
      return lerpPose(resolve(a.pose, v, t), resolve(b.pose, v, t), local);
    }
  }
  return resolve(keys[keys.length - 1].pose, v, t);
}

export function evaluatePose(scroll: number, v: Viewport): Pose {
  if (!segments.length) return { ...BASE, vis: 0 };
  let seg = segments[0];
  for (const s of segments) if (s.st.start <= scroll) seg = s;
  const span = Math.max(1, seg.st.end - seg.st.start);
  const t = Math.min(1, Math.max(0, (scroll - seg.st.start) / span));
  return sample(seg.keys, t, v);
}

/** Pose that frames the shoe inside a DOM element (used by the product stage). */
export function anchorPose(el: HTMLElement | null, fill = 0.86): Partial<Pose> {
  if (!el) return { vis: 0 };
  const r = el.getBoundingClientRect();
  const w = window.innerWidth, h = window.innerHeight;
  const sByW = (r.width * fill) / w;
  const sByH = (r.height * 0.92 * 1.75) / w; // shoe is ~0.51 as tall as long; leave room
  return { x: (r.left + r.width / 2) / w - 0.5, y: 0.5 - (r.top + r.height / 2) / h, s: Math.min(sByW, sByH) };
}

if (typeof window !== 'undefined') (window as unknown as { __stage: typeof stage }).__stage = stage;
