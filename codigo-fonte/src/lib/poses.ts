import type { Pose, Viewport } from './stage';

/** Hand-off poses shared between adjacent sections so every cut is continuous. */
export const TAU = Math.PI * 2;
type P = (v: Viewport) => Partial<Pose>;

export const HERO: P = (v) => ({
  x: v.mobile ? 0 : 0.03, y: v.mobile ? -0.02 : -0.06, s: v.mobile ? 0.86 : 0.47,
  ry: -0.34, rx: 0.18, rz: 0.07, shadow: 1, rim: 0.45,
});
export const HERO_MID: P = (v) => ({
  x: 0, y: -0.02, z: 1.3, s: v.mobile ? 0.95 : 0.55, ry: -1.0, rx: 0.26, rz: -0.04, shadow: 0.4, rim: 0.9,
});
export const HERO_END: P = (v) => ({
  x: 0, y: 0.04, z: 3.75, s: v.mobile ? 0.95 : 0.55, ry: -1.57, rx: 0.08, rz: 0, shadow: 0, rim: 0.2,
});
export const DESIGN_IN: P = (v) => ({ x: 0, y: -0.02, s: v.mobile ? 0.74 : 0.36, ry: -2.35, rx: 0.14, shadow: 0.9 });
export const TECH_START: P = (v) => ({ x: 0, y: -0.02, s: v.mobile ? 0.84 : 0.46, ry: -TAU, rx: 0.1, shadow: 0.7 });
export const TECH_EXIT: P = (v) => ({
  x: -0.82, y: -0.06, s: v.mobile ? 0.6 : 0.3, ry: -TAU - 0.12, rx: 0.12, rz: 0.12, shadow: 0, rim: 1,
});
