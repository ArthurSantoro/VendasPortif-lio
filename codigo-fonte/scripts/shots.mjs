// Studio stills — one art direction, one product, many angles.
const W = 2000, H = 1250;
const dark = { bg: '#060606', shadow: 0.0, ground: false, env: 0.35 };
export default [
  // Gallery — editorial macro & studio shots
  { name: 'g-knit', w: 1600, h: 2000, ...dark, fov: 14, cam: [0.06, 0.3, 0.75], target: [0.06, 0.2, 0.1], key: [-0.6, 1.4, -0.1], keyI: 30, keyAngle: 0.3, rimI: 30, rim: [0.8, 0.6, -0.6], rimC: '#ff5a1f' },
  { name: 'g-laces', w: 2000, h: 1500, ...dark, fov: 18, cam: [0.55, 0.75, 0.35], target: [0.08, 0.3, 0], key: [-0.4, 1.8, 0.8], keyI: 45, rimI: 40, rim: [1.2, 0.4, -0.8], rimC: '#ff4a12' },
  { name: 'g-side', w: W, h: H, bg: '#141416', ground: true, shadow: 0.7, env: 0.5, fov: 15, cam: [0, 0.2, 2.6], target: [0, 0.2, 0], key: [-0.6, 2.4, 1.6], keyI: 36, rimI: 60, rim: [0.9, 0.9, -1.6], rimC: '#ff5a1f', rim2I: 30, rim2: [-1.4, 0.6, -1.2] },
  { name: 'g-top', w: 1600, h: 2000, bg: '#e9e7e2', ground: true, shadow: 0.45, env: 0.7, fov: 21, cam: [0, 2.9, 0.001], target: [0, 0, 0], rot: [0, Math.PI / 2, 0], key: [-0.7, 2.8, 0.5], keyI: 30 },
  { name: 'g-hero', w: W, h: H, ...dark, fov: 15, cam: [1.45, 0.1, 1.75], target: [0.05, 0.2, 0], key: [-0.2, 2.2, 1.6], keyI: 34, keyAngle: 0.35, rimI: 90, rim: [0.2, 0.7, -1.8], rimC: '#ff4a12', rim2I: 40, rim2: [-1.6, 0.4, -0.6] },
  { name: 'g-heel', w: 1600, h: 2000, ...dark, fov: 18, cam: [-1.3, 0.38, 0.55], target: [-0.32, 0.22, 0], key: [-1.2, 1.6, 1.2], keyI: 40, rimI: 50, rim: [-0.2, 0.9, -1.4], rimC: '#ff5a1f' },
  // Section 02 detail cards
  { name: 'd-toe', w: 1400, h: 1750, ...dark, fov: 16, cam: [1.25, 0.25, 0.55], target: [0.36, 0.12, 0], key: [1.4, 1.6, 0.8], keyI: 38, rimI: 50, rim: [0.2, 0.6, -1.2], rimC: '#ff4a12' },
  { name: 'd-tab', w: 1400, h: 1750, ...dark, fov: 14, cam: [-0.95, 0.75, 0.75], target: [-0.36, 0.38, 0], key: [-0.9, 2.0, 1.0], keyI: 44, rimI: 40, rim: [0.4, 0.8, -1.0], rimC: '#ff5a1f' },
  { name: 'd-stripe', w: 1400, h: 1750, ...dark, fov: 15, cam: [0.3, 0.32, 0.95], target: [0.02, 0.18, 0.1], key: [-1.2, 1.4, 0.2], keyI: 18, rimI: 30, rim: [1, 0.6, -0.5], rimC: '#ff4a12' },
  // Cart thumbnails (transparent)
  ...['ember', 'glacier', 'graphite'].map((v) => ({ name: `t-${v}`, variant: v, w: 900, h: 600, ground: true, shadow: 0.35, env: 0.7, fov: 24, cam: [0.5, 0.45, 2.4], target: [0, 0.2, 0], key: [-0.6, 2.4, 1.6], keyI: 30 })),
];
