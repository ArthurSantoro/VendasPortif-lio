/** Leader-line annotations for the exploded view, positioned from 3D anchors every frame. */
export type Annotation = {
  layer: number; // 0 outsole, 1 midsole, 2 plate, 3 upper, 4 collar
  anchor: [number, number, number];
  side: -1 | 1;
  slot: [number, number]; // label position as viewport fractions
  threshold: number;
  label: HTMLElement | null;
  dot: HTMLElement | null;
  line: SVGLineElement | null;
};

export const annotations: Annotation[] = [
  { layer: 4, anchor: [-0.3, 0.17, 0.07], side: -1, slot: [0.06, 0.4], threshold: 0.78, label: null, dot: null, line: null },
  { layer: 3, anchor: [0.12, -0.01, 0.17], side: 1, slot: [0.76, 0.24], threshold: 0.62, label: null, dot: null, line: null },
  { layer: 2, anchor: [0.2, -0.115, 0.05], side: 1, slot: [0.76, 0.46], threshold: 0.45, label: null, dot: null, line: null },
  { layer: 1, anchor: [-0.24, -0.17, 0.16], side: -1, slot: [0.06, 0.62], threshold: 0.25, label: null, dot: null, line: null },
  { layer: 0, anchor: [0.3, -0.235, 0.1], side: 1, slot: [0.76, 0.68], threshold: 0.08, label: null, dot: null, line: null },
];

export const techState = { active: 0 };
