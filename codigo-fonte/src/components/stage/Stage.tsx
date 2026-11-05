'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { evaluatePose, stage, type Viewport } from '@/lib/stage';
import { useStore, type VariantId } from '@/lib/store';
import { annotations, techState } from './annotations';

const MODEL = 'models/velocity-x1.json';
const MAPS = ['models/tex/normal.jpg', 'models/tex/orm.jpg', 'models/tex/diffuse-ember.jpg'];

type ModelJSON = { position: string; normal: string; uv: string; index: string };
const decode = <T,>(b64: string, Ctor: new (b: ArrayBuffer) => T): T => {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Ctor(u8.buffer);
};
const LAYERS = [
  { lo: -1, hi: -0.215, dy: -0.3, dx: 0.05 }, // outsole
  { lo: -0.215, hi: -0.12, dy: -0.14, dx: 0.025 }, // midsole / Pulse Foam
  { lo: -0.12, hi: 0.06, dy: 0.13, dx: -0.02 }, // upper
  { lo: 0.06, hi: 1, dy: 0.32, dx: -0.05 }, // collar & lacing
];
const PLATE_Y = -0.12;

const texCache = new Map<VariantId, THREE.Texture>();
const loader = new THREE.TextureLoader();
function loadVariant(v: VariantId): Promise<THREE.Texture> {
  const hit = texCache.get(v);
  if (hit) return Promise.resolve(hit);
  const small = typeof window !== 'undefined' && window.innerWidth < 820;
  return loader.loadAsync(`models/tex/diffuse-${v}${small ? '-1k' : ''}.jpg`).then((t) => {
    t.flipY = false;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    texCache.set(v, t);
    return t;
  });
}

/** Back faces exposed by the section cuts are painted as glowing cross-sections. */
function withCap(m: THREE.MeshStandardMaterial, cap: { value: number }) {
  m.side = THREE.DoubleSide;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uCap = cap;
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', 'uniform float uCap;\nvoid main() {')
      .replace(
        '#include <dithering_fragment>',
        '#include <dithering_fragment>\nif (!gl_FrontFacing) { gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0, 0.36, 0.08), uCap); }',
      );
  };
  m.customProgramCacheKey = () => 'cap';
  return m;
}

function carbonTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#0b0b0c';
  g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const grad = g.createLinearGradient(x * 16, y * 16, x * 16 + 16, y * 16 + 16);
      const flip = (x + y) % 2 === 0;
      grad.addColorStop(0, flip ? '#2a2a2e' : '#111113');
      grad.addColorStop(1, flip ? '#141416' : '#2c2c30');
      g.fillStyle = grad;
      g.fillRect(x * 16 + 1, y * 16 + 1, 14, 14);
    }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 2);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function plateOutline() {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i < 96; i++) {
    const u = (i / 96) * Math.PI * 2;
    const x = 0.45 * Math.cos(u);
    const k = (x + 0.45) / 0.9; // heel 0 -> toe 1
    const w = 0.085 + 0.05 * Math.sin(Math.PI * Math.pow(k, 1.3)) - 0.02 * Math.exp(-Math.pow((k - 0.45) / 0.12, 2));
    pts.push(new THREE.Vector2(x, w * Math.sin(u)));
  }
  return pts;
}

function Shoe() {
  const raw = useLoader(THREE.FileLoader, MODEL) as string;
  const [normalMap, orm, ember] = useLoader(THREE.TextureLoader, MAPS);
  const variant = useStore((s) => s.variant);
  const { size } = useThree();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const pos = useRef<THREE.Group>(null!);
  const rot = useRef<THREE.Group>(null!);
  const yaw = useRef<THREE.Group>(null!);
  const plate = useRef<THREE.Group>(null!);
  const rimLight = useRef<THREE.DirectionalLight>(null!);
  const cur = useRef({ ...stage.current, init: false });

  const built = useMemo(() => {
    const data = JSON.parse(raw) as ModelJSON;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(decode(data.position, Float32Array), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(decode(data.normal, Float32Array), 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(decode(data.uv, Float32Array), 2));
    geo.setIndex(new THREE.BufferAttribute(decode(data.index, Uint32Array), 1));
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const c = bb.getCenter(new THREE.Vector3());
    const len = bb.max.x - bb.min.x;
    geo.translate(-c.x, -c.y, -c.z);
    geo.scale(1 / len, 1 / len, 1 / len);
    geo.computeBoundingBox();
    // glTF PBR conventions: ORM = occlusion (R), roughness (G), metalness (B); UVs not flipped
    [normalMap, orm, ember].forEach((t) => ((t.flipY = false), (t.anisotropy = 8)));
    ember.colorSpace = THREE.SRGBColorSpace;
    texCache.set('ember', ember);
    const baseMat = new THREE.MeshStandardMaterial({ map: ember, normalMap, aoMap: orm, roughnessMap: orm, metalnessMap: orm, roughness: 1, metalness: 1 });
    baseMat.envMapIntensity = 1;
    const cap = { value: 0 };
    const sliceMats = LAYERS.map(() => withCap(baseMat.clone(), cap));
    sliceMats.forEach((m) => (m.clippingPlanes = [new THREE.Plane(), new THREE.Plane()]));
    const shadowTex = (() => {
      const cv = document.createElement('canvas');
      cv.width = 256;
      cv.height = 128;
      const g = cv.getContext('2d')!;
      const gr = g.createRadialGradient(128, 64, 0, 128, 64, 128);
      gr.addColorStop(0, 'rgba(0,0,0,0.85)');
      gr.addColorStop(0.45, 'rgba(0,0,0,0.35)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 256, 128);
      return new THREE.CanvasTexture(cv);
    })();
    const outline = plateOutline();
    const shape = new THREE.Shape(outline);
    const plateGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.014, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2 });
    plateGeo.rotateX(Math.PI / 2);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(outline.map((p) => new THREE.Vector3(p.x, 0.004, p.y)));
    return { geo, baseMat, sliceMats, cap, shadowTex, plateGeo, lineGeo, carbon: carbonTexture() };
  }, [raw, normalMap, orm, ember]);

  // Colorway swaps: quick spin, texture swapped at the midpoint.
  const first = useRef(true);
  useEffect(() => {
    let cancelled = false;
    loadVariant(variant).then((t) => {
      if (cancelled) return;
      const apply = () => {
        [built.baseMat, ...built.sliceMats].forEach((m) => {
          m.map = t;
          m.needsUpdate = true;
        });
      };
      if (first.current) {
        first.current = false;
        apply();
        return;
      }
      import('@/lib/gsap').then(({ gsap }) => {
        let swapped = false;
        gsap.fromTo(
          stage,
          { spin: 0 },
          {
            spin: Math.PI * 2,
            duration: 1.1,
            ease: 'expo.inOut',
            onUpdate() {
              if (!swapped && stage.spin > Math.PI) {
                swapped = true;
                apply();
              }
            },
            onComplete: () => void (stage.spin = 0),
          },
        );
      });
    });
    // warm the cache for the other colorways
    (['ember', 'glacier', 'graphite'] as VariantId[]).forEach((v) => v !== variant && setTimeout(() => loadVariant(v), 2500));
    return () => {
      cancelled = true;
    };
  }, [variant, built]);

  const tmp = useMemo(() => ({ v: new THREE.Vector3(), ray: new THREE.Ray(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), p: new THREE.Plane() }), []);
  const toWorld = (nx: number, ny: number, out: THREE.Vector3) => {
    tmp.v.set(nx * 2, ny * 2, 0.5).unproject(camera);
    tmp.ray.origin.copy(camera.position);
    tmp.ray.direction.copy(tmp.v.sub(camera.position).normalize());
    return tmp.ray.intersectPlane(tmp.plane, out) ?? out.set(0, 0, 0);
  };
  const worldA = useMemo(() => new THREE.Vector3(), []);
  const worldB = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const w = window.innerWidth, h = window.innerHeight;
    const vp: Viewport = { w, h, aspect: w / h, mobile: w < 820 };
    const target = evaluatePose(window.scrollY, vp);
    const c = cur.current;
    const k = c.init ? 1 - Math.exp(-Math.min(dt, 0.05) * 7.5) : 1;
    c.init = true;
    (Object.keys(target) as (keyof typeof target)[]).forEach((key) => {
      c[key] += (target[key] - c[key]) * k;
      stage.current[key] = c[key];
    });
    // intro entrance (after the preloader)
    const ie = 1 - Math.pow(1 - stage.intro, 3);
    const t = state.clock.elapsedTime;
    const float = Math.sin(t * 1.1) * 0.006 * (1 - c.explode);
    const vis = c.vis * Math.min(1, stage.intro * 3);
    pos.current.visible = vis > 0.01;
    if (!pos.current.visible) {
      annotations.forEach((a) => a.label && (a.label.style.opacity = '0'));
      return;
    }

    toWorld(c.x, c.y + float - (1 - ie) * 0.5, worldA);
    toWorld(-0.5, 0, worldB);
    const vwWorld = Math.abs(worldB.x) * 2;
    const sc = c.s * vwWorld * (0.75 + 0.25 * ie) * Math.max(0.0001, Math.min(1, vis * 1.4));
    pos.current.position.set(worldA.x, worldA.y, c.z);
    pos.current.scale.setScalar(sc);
    const px = stage.pointer.x * (1 - c.explode) * 0.14;
    const py = stage.pointer.y * (1 - c.explode) * 0.07;
    rot.current.rotation.set(c.rx + py, c.ry + px + stage.spin + c.drag * stage.dragRy - (1 - ie) * 2.2, c.rz);
    yaw.current.rotation.y = rot.current.rotation.y;
    const shadowMat = (yaw.current.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
    shadowMat.opacity = c.shadow * (1 - c.explode) * vis * 0.8;
    rimLight.current.intensity = 0.4 + c.rim * 5.5;

    // exploded view
    const ex = Math.max(0, Math.min(1, c.explode));
    const exploded = ex > 0.002;
    built.cap.value = Math.min(1, ex * 4);
    const main = rot.current.children[0] as THREE.Mesh;
    main.visible = !exploded;
    const slices = rot.current.children.slice(1, 1 + LAYERS.length) as THREE.Mesh[];
    slices.forEach((m, i) => {
      m.visible = exploded;
      const L = LAYERS[i];
      const e = ex * ex * (3 - 2 * ex);
      m.position.set(L.dx * e, L.dy * e, 0);
    });
    plate.current.visible = exploded;
    plate.current.scale.setScalar(Math.max(0.001, Math.min(1, (ex - 0.2) * 2.2)));
    plate.current.position.set(0.0, PLATE_Y - 0.005 + ex * -0.005, 0);
    plate.current.rotation.y = (1 - Math.min(1, ex * 1.5)) * 0.6;
    pos.current.updateMatrixWorld(true);
    if (exploded)
      slices.forEach((m, i) => {
        const L = LAYERS[i];
        const [a, b] = (m.material as THREE.Material).clippingPlanes as THREE.Plane[];
        a.set(new THREE.Vector3(0, 1, 0), -L.lo).applyMatrix4(m.matrixWorld);
        b.set(new THREE.Vector3(0, -1, 0), L.hi).applyMatrix4(m.matrixWorld);
      });

    // annotation overlay
    const active = techState.active;
    for (const a of annotations) {
      if (!a.label || !a.dot || !a.line) continue;
      const op = exploded ? Math.max(0, Math.min(1, (ex - a.threshold) * 8)) * active : 0;
      a.label.style.opacity = String(op);
      a.dot.style.opacity = String(op);
      a.line.style.opacity = String(op);
      if (op <= 0) continue;
      const host = a.layer === 2 ? plate.current : a.layer > 2 ? slices[a.layer - 1] : slices[a.layer];
      if (a.layer === 2) tmp.v.set(a.anchor[0], 0.01, a.anchor[2]);
      else tmp.v.set(a.anchor[0], a.anchor[1], a.anchor[2]);
      tmp.v.applyMatrix4(host.matrixWorld);
      tmp.v.project(camera);
      const sx = (tmp.v.x * 0.5 + 0.5) * size.width;
      const sy = (-tmp.v.y * 0.5 + 0.5) * size.height;
      const lw = a.label.offsetWidth;
      const mob = size.width < 820;
      let lx = mob ? (a.side > 0 ? size.width - lw - 16 : 16) : a.slot[0] * size.width;
      if (!mob && a.side > 0) lx = Math.min(lx, size.width - lw - 24);
      const ly = (mob ? 0.16 + a.slot[1] * 0.78 : a.slot[1]) * size.height;
      a.dot.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
      a.label.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
      const ex2 = a.side > 0 ? lx : lx + lw;
      a.line.setAttribute('x1', String(sx));
      a.line.setAttribute('y1', String(sy));
      a.line.setAttribute('x2', String(ex2));
      a.line.setAttribute('y2', String(ly));
    }
  });

  return (
    <>
      <directionalLight ref={rimLight} position={[0.6, 1.2, -3]} color="#ff4a12" intensity={0.4} />
      <group ref={pos}>
        <group ref={yaw} position={[0, -0.262, 0]}>
          <mesh rotation-x={-Math.PI / 2} scale={[1.15, 0.5, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={built.shadowTex} transparent depthWrite={false} opacity={0} toneMapped={false} />
          </mesh>
        </group>
        <group ref={rot}>
          <mesh geometry={built.geo} material={built.baseMat} />
          {built.sliceMats.map((m, i) => (
            <mesh key={i} geometry={built.geo} material={m} visible={false} />
          ))}
          <group ref={plate} visible={false}>
            <mesh geometry={built.plateGeo}>
              <meshPhysicalMaterial map={built.carbon} roughness={0.32} metalness={0.2} clearcoat={1} clearcoatRoughness={0.15} color="#ffffff" />
            </mesh>
            <lineLoop geometry={built.lineGeo}>
              <lineBasicMaterial color="#ff5a1f" toneMapped={false} />
            </lineLoop>
          </group>
        </group>
      </group>
    </>
  );
}

function Pointer() {
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const on = (e: PointerEvent) => {
      stage.pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      stage.pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', on);
    return () => window.removeEventListener('pointermove', on);
  }, []);
  return null;
}

class Boundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Stage() {
  const setWebgl = useStore((s) => s.setWebgl);
  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      if (!(c.getContext('webgl2') || c.getContext('webgl'))) setWebgl(false);
    } catch {
      setWebgl(false);
    }
  }, [setWebgl]);
  return (
    <div className="stage" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        style={{ pointerEvents: "none" }}
        camera={{ position: [0, 0.55, 5], fov: 30, near: 0.05, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', localClippingEnabled: true } as never}
        onCreated={({ gl, camera }) => {
          gl.localClippingEnabled = true;
          gl.setClearColor(0x000000, 0);
          camera.lookAt(0, 0, 0);
        }}
      >
        <Pointer />
        <ambientLight intensity={0.15} />
        <directionalLight position={[-3, 5, 4]} intensity={1.6} />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={2.2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 4, 1]} />
          <Lightformer form="rect" intensity={1.4} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 1.2, 1]} />
          <Lightformer form="rect" intensity={1.0} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[6, 1.2, 1]} />
          <Lightformer form="rect" intensity={0.7} position={[0, 0.5, 6]} scale={[6, 2, 1]} />
          <Lightformer form="rect" color="#ff5a1f" intensity={1.6} position={[0, 0.8, -5]} scale={[8, 0.5, 1]} />
        </Environment>
        <Boundary onError={() => setWebgl(false)}>
          <Suspense fallback={null}>
            <Shoe />
          </Suspense>
        </Boundary>
      </Canvas>
    </div>
  );
}
