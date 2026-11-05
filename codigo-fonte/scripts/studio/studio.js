import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
const shoe = new THREE.Group(); scene.add(shoe);
const key = new THREE.SpotLight(0xffffff, 60, 0, 0.5, 0.8, 2); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 12; key.shadow.blurSamples = 25; key.shadow.bias = -0.0004;
scene.add(key, key.target);
const rim = new THREE.SpotLight(0xffffff, 0, 0, 0.6, 0.9, 2); scene.add(rim, rim.target);
const rim2 = new THREE.SpotLight(0xffffff, 0, 0, 0.6, 0.9, 2); scene.add(rim2, rim2.target);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.5 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
let mat, size = new THREE.Vector3();
const texLoader = new THREE.TextureLoader();
const texCache = {};
window.ready = new Promise((res) => {
  new GLTFLoader().load('/scripts/studio/velocity-x1.glb', (g) => {
    const m = g.scene;
    m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; mat = o.material; } });
    // normalize: length of shoe = 1 unit, sitting on y = 0
    const box = new THREE.Box3().setFromObject(m); box.getSize(size);
    const c = box.getCenter(new THREE.Vector3());
    const s = 1 / Math.max(size.x, size.z);
    m.scale.setScalar(s); m.position.set(-c.x * s, -box.min.y * s, -c.z * s);
    shoe.add(m); size.multiplyScalar(s);
    res({ size: size.toArray() });
  });
});
const setVariant = async (v) => {
  if (!texCache[v]) texCache[v] = await texLoader.loadAsync(`/public/models/tex/diffuse-${v}.jpg`);
  const t = texCache[v]; t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  mat.map = t; mat.needsUpdate = true;
};
window.shot = async (o) => {
  await window.ready;
  await setVariant(o.variant || 'ember');
  renderer.setPixelRatio(1); renderer.setSize(o.w, o.h, false);
  camera.aspect = o.w / o.h; camera.fov = o.fov ?? 30; camera.updateProjectionMatrix();
  camera.position.fromArray(o.cam); camera.lookAt(new THREE.Vector3().fromArray(o.target ?? [0, 0.15, 0]));
  if (o.roll) camera.rotateZ(o.roll);
  shoe.rotation.set(...(o.rot ?? [0, 0, 0]));
  shoe.position.fromArray(o.pos ?? [0, 0, 0]);
  scene.environmentIntensity = o.env ?? 0.6;
  key.position.fromArray(o.key ?? [-1.2, 2.6, 1.4]); key.intensity = o.keyI ?? 40; key.angle = o.keyAngle ?? 0.5;
  rim.position.fromArray(o.rim ?? [1.5, 0.8, -1.8]); rim.intensity = o.rimI ?? 0; rim.color.set(o.rimC ?? '#ffffff');
  rim2.position.fromArray(o.rim2 ?? [-1.8, 0.5, -1.2]); rim2.intensity = o.rim2I ?? 0; rim2.color.set(o.rim2C ?? '#ffffff');
  ground.visible = o.ground !== false; ground.material.opacity = o.shadow ?? 0.55;
  scene.background = o.bg ? new THREE.Color(o.bg) : null;
  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
};
