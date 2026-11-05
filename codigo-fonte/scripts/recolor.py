"""Builds the three VELOCITY colorways from the source diffuse texture."""
import sys, numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
mx, mn = a.max(2), a.min(2)
sat = (mx - mn) / (mx + 1e-5)
L = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
acc = ss(0.25, 0.45, sat) * ss(0.3, 0.5, a[..., 0])          # accent stripes
acc_shade = np.clip(a[..., 0] / 0.85, 0, 1.15)[..., None]
dark = 1 - ss(0.38, 0.6, L)                                   # knit / laces
dk = (L - 0.16)[..., None]                                    # knit detail
wl = (L / 0.86)[..., None]                                    # sole shading
C = lambda *v: np.array(v, np.float32)
variants = {
  'ember':    dict(dark=lambda: C(.085,.085,.09) + dk*0.9, white=lambda: C(.93,.92,.9)*wl,  acc=C(1.0,.25,.02)),
  'glacier':  dict(dark=lambda: C(.86,.875,.89) + dk*1.6,  white=lambda: C(.13,.13,.14)*wl, acc=C(.95,.16,.12)),
  'graphite': dict(dark=lambda: C(.30,.305,.315) + dk*1.3, white=lambda: C(.90,.90,.89)*wl, acc=C(1.0,.16,.06)),
}
for name, v in variants.items():
    base = dark[..., None] * v['dark']() + (1 - dark[..., None]) * v['white']()
    col = base * (1 - acc[..., None]) + v['acc'] * acc_shade * acc[..., None]
    img = Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8))
    img.save(f'{out}/diffuse-{name}.jpg', quality=88)
    img.resize((1024, 1024), Image.LANCZOS).save(f'{out}/diffuse-{name}-1k.jpg', quality=86)
    print(name)
