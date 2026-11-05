# VELOCITY X1 — cinematic scroll e-commerce

A concept e-commerce site for a fictional performance running brand. The scroll drives the whole story: one persistent 3D shoe moves through seven chapters, and each chapter hands it to the next without a cut.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out (relative paths, works on any host/sub-path)
```

Stack: Next.js 15 (App Router, static export), TypeScript, GSAP + ScrollTrigger, Lenis, React Three Fiber + drei, Framer Motion, Zustand.

## How it is built

- **One stage, many sections.** `src/components/stage/Stage.tsx` is a single fixed WebGL canvas. Each section registers a *scroll segment* (`registerSegment` in `src/lib/stage.ts`) with keyframed poses (position, scale, rotation, explode, rim light, shadow). The pose is a pure function of scroll position, so anchor jumps, refreshes and resizes always land on the right shot. Shared hand-off poses live in `src/lib/poses.ts`.
- **Layering.** Sections (z 1) < 3D canvas (z 2) < `.front` overlays (z 3). Text can sit behind the shoe (inside the section) or in front of it (in a `.front` overlay, e.g. the difference-blended FORM / FOLLOWS / SPEED words and the exploded-view annotations).
- **Pinning** uses CSS `position: sticky`. GSAP timelines are `scrub`bed against each section's pinned range (`src/lib/useScene.ts`).

| # | Chapter | Signature move |
|---|---|---|
| 01 | Hero | Headline tears apart, the shoe dollies through the camera, an ice-white iris opens |
| 02 | Design | Live 270° turntable with a degree counter, clip-path detail reveals on separate planes, front text inverting over the shoe |
| 03 | Technology | Real exploded view: the mesh is sliced with clipping planes, cut faces glow as cross-sections, a carbon plate slides in, annotations track 3D anchors |
| 04 | Performance | The shoe sprints across while the world changes: window → full-bleed, slanted brand-slash wipe, "LIMITLESS" text mask scales until it *is* the image |
| 05 | Gallery | Horizontal track with a curved 3D lens; the last frame expands to fill the viewport |
| 06 | Product | Drag-to-rotate 3D viewer, live colorway swap, size validation, add-to-cart feedback, cart drawer |
| 07 | Epilogue | THE FUTURE DOESN'T WAIT. — the shoe launches out of frame |

Accessibility and fallbacks: `prefers-reduced-motion` turns off Lenis, scrubbed timelines and long pins (content is shown in its final state). Without WebGL, studio photos replace the live model. Touch devices use native scrolling and drop the custom cursor and mouse parallax.

## Assets

The environment this was built in could not reach stock-photo hosts, so every image was made from a single source so the product stays the same throughout:

- **3D model**: "Materials Variants Shoe" © 2021 Shopify, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). It was recolored into three brand colorways (`scripts/recolor.py`), repacked into an intermediate GLB (`scripts/build-glb.mjs` → `scripts/studio/velocity-x1.glb`) and exported to web-served files: `public/models/velocity-x1.json` (base64 geometry) plus JPG textures (`scripts/export-geometry.mjs`). Attribution is in the footer.
- **Studio stills** (`public/images/g-*`, `d-*`, `t-*`): rendered offline from that model with consistent studio lighting (`scripts/render-stills.mjs`, `scripts/shots.mjs`).
- **Performance plates** (`env-track`, `env-city`, `env-tunnel`): procedural long-exposure scenes (`scripts/scenes.py`).

To use real campaign photography (athletes, locations), replace the files in `public/images/` and keep the same names, or edit the `FRAMES` / `ITEMS` arrays in `src/components/sections/Performance.tsx` and `Gallery.tsx`.

`npm run build:preview` writes a self-contained single-HTML build (JS and CSS inlined) to `artifact-dist/` for hosts that only serve static files. `scripts/snap.mjs` takes QA screenshots through the scroll narrative (`node scripts/snap.mjs <outDir> [w] [h]`).
