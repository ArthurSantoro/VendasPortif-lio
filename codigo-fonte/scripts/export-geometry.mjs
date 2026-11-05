// Packs the scan into web-served formats: geometry JSON (base64 typed arrays) + JPG textures.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'node:fs';
const [src, out] = process.argv.slice(2);
const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(src);
const node = doc.getRoot().listNodes().find((n) => n.getMesh());
const m = node.getWorldMatrix();
const prim = node.getMesh().listPrimitives()[0];
const pos = prim.getAttribute('POSITION').getArray().slice();
const nrm = prim.getAttribute('NORMAL').getArray().slice();
for (let i = 0; i < pos.length; i += 3) {
  const [x, y, z] = [pos[i], pos[i + 1], pos[i + 2]];
  pos[i] = m[0] * x + m[4] * y + m[8] * z + m[12];
  pos[i + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
  pos[i + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
}
const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
const json = {
  note: 'Materials Variants Shoe (c) 2021 Shopify, CC BY 4.0 - repacked for VELOCITY',
  count: pos.length / 3,
  position: b64(new Float32Array(pos)),
  normal: b64(new Float32Array(nrm)),
  uv: b64(new Float32Array(prim.getAttribute('TEXCOORD_0').getArray())),
  index: b64(new Uint32Array(prim.getIndices().getArray())),
};
fs.writeFileSync(out, JSON.stringify(json));
console.log('wrote', out, (fs.statSync(out).size / 1e6).toFixed(2), 'MB');
