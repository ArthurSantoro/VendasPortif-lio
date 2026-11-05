"""Procedural cinematic environment plates for the Performance section.

Three long-exposure "night run" plates, painted in linear light and
finished with depth of field, zoom blur, bloom, grain and vignette:
  track   - low camera on a running track under floodlights
  city    - wet asphalt with tail-light / head-light trails
  tunnel  - concrete tunnel, rhythmic ceiling lights, radial speed
Usage: python3 scenes.py <out_dir>
"""
import sys, numpy as np, cv2

W, H = 2400, 1350
rng = np.random.default_rng(7)
OUT = sys.argv[1]


def noise(scale, shape=(H, W)):
    n = rng.standard_normal((shape[0] // scale + 2, shape[1] // scale + 2)).astype(np.float32)
    return cv2.resize(n, (shape[1], shape[0]), interpolation=cv2.INTER_CUBIC)


def zoom_blur(img, cx, cy, strength=0.08, n=24):
    acc = np.zeros_like(img)
    for i in range(n):
        s = 1 + strength * i / (n - 1)
        M = np.float32([[s, 0, cx * (1 - s)], [0, s, cy * (1 - s)]])
        acc += cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return acc / n


def bloom(img, thr=0.9, k=(9, 31, 91), w=(0.35, 0.3, 0.35)):
    hi = np.clip(img - thr, 0, None)
    out = img.copy()
    for kk, ww in zip(k, w):
        out += cv2.GaussianBlur(hi, (0, 0), kk) * ww * 1.6
    return out


def finish(img, name, exposure=1.0, grain=0.035, vig=0.55):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    img = img * (1 - vig * np.clip(r - 0.35, 0, 1) ** 1.6)[..., None]
    x = img * exposure  # ACES-ish filmic curve
    x = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14)
    x = np.clip(x, 0, 1) ** (1 / 2.2)
    g = rng.standard_normal((H, W)).astype(np.float32)
    g = cv2.GaussianBlur(g, (0, 0), 0.7) * grain
    x = np.clip(x + g[..., None] * (0.6 + 0.4 * (1 - x)), 0, 1)
    bgr = (x[..., ::-1] * 255).astype(np.uint8)
    cv2.imwrite(f'{OUT}/{name}.png', bgr)
    print('wrote', name)


def disc(img, x, y, r, col, soft=0.25):
    """Additive soft bokeh disc."""
    x0, x1 = int(max(0, x - r - 3)), int(min(W, x + r + 3))
    y0, y1 = int(max(0, y - r - 3)), int(min(H, y + r + 3))
    if x1 <= x0 or y1 <= y0:
        return
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    d = np.sqrt((xx - x) ** 2 + (yy - y) ** 2) / r
    a = np.clip((1 - d) / soft, 0, 1) * (0.75 + 0.25 * d)
    img[y0:y1, x0:x1] += a[..., None] * np.array(col, np.float32)


# ------------------------------------------------------------------ TRACK
def track():
    img = np.zeros((H, W, 3), np.float32)
    hy, cx, f, cam_h = H * 0.36, W * 0.56, W * 0.9, 0.32
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dy = (yy - hy) / f
    ground = dy > 0.0015
    z = np.where(ground, cam_h / np.maximum(dy, 1e-4), 1e4)
    xw = (xx - cx) / f * z + 0.35           # camera sits just inside lane 4
    # tartan: terracotta rubber with fine aggregate grain
    grain = noise(2) * 0.5 + noise(5) * 0.35 + noise(14) * 0.25
    base = np.array([0.42, 0.075, 0.035], np.float32)
    col = base[None, None] * (1 + 0.28 * grain[..., None])
    lane = 1.22
    u = np.mod(xw, lane)
    lw = 0.05
    pix = np.maximum(z / f, 1e-5)
    dist = np.minimum(u, lane - u)
    line = np.clip((lw / 2 - dist) / pix + 0.5, 0, 1)
    line *= 0.85 + 0.15 * noise(3)
    col = col * (1 - line[..., None]) + np.array([0.82, 0.8, 0.76], np.float32) * line[..., None]
    # floodlight sheen across the surface + distance fog
    sheen = np.exp(-((xx - W * 0.72) / (W * 0.35)) ** 2) * np.exp(-((z - 9) / 10) ** 2) * 0.55
    col = col * (0.45 + sheen[..., None] * 2.2)
    fog = np.clip(1 - np.exp(-z / 38), 0, 1)
    fogc = np.array([0.05, 0.03, 0.03], np.float32)
    col = col * (1 - fog[..., None]) + fogc * fog[..., None]
    img[ground] = col[ground]
    # sky / stadium darkness with warm haze at the horizon
    sky = ~ground
    t = np.clip((hy - yy) / hy, 0, 1)
    skyc = np.array([0.08, 0.035, 0.03], np.float32)[None, None] * (np.exp(-t * 5)[..., None]) + 0.004
    img[sky] = skyc[sky]
    # stands silhouette band with tiny lights
    band = (yy > hy - 90) & (yy < hy)
    img[band] *= 0.4
    for _ in range(260):
        x = rng.uniform(0, W); y = rng.uniform(hy - 85, hy - 4)
        disc(img, x, y, rng.uniform(1.2, 2.5), np.array([1, .7, .45]) * rng.uniform(0.2, 0.9), 0.6)
    # floodlight towers: large bokeh clusters
    for tx, ty in [(W * 0.12, H * 0.08), (W * 0.83, H * 0.04), (W * 0.48, H * 0.15)]:
        for i in range(4):
            for j in range(3):
                disc(img, tx + i * 24 + rng.normal(0, 2), ty + j * 22, 9, (9, 8, 7), 0.2)
    # depth of field: background soft, foreground crisp
    far = cv2.GaussianBlur(img, (0, 0), 6)
    wdof = np.clip((hy + 110 - yy) / 160, 0, 1)[..., None]
    img = img * (1 - wdof) + far * wdof
    img = zoom_blur(img, cx, hy, 0.045, 20) * 0.65 + img * 0.35
    img = bloom(img, 0.85)
    finish(img, "env-track", exposure=0.95)


# ------------------------------------------------------------------- CITY
def city():
    img = np.zeros((H, W, 3), np.float32)
    hy, cx, f, cam_h = H * 0.44, W * 0.5, W * 0.8, 1.1
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dy = (yy - hy) / f
    ground = dy > 0.001
    z = np.where(ground, cam_h / np.maximum(dy, 1e-4), 1e4)
    xw = (xx - cx) / f * z
    asphalt = 0.025 * (1 + 0.5 * noise(2) + 0.3 * noise(6))
    img[ground] = asphalt[ground][..., None] * np.array([1, 1, 1.05])
    # lane dashes
    dash = (np.abs(np.abs(xw) - 1.75) < 0.07) & (np.mod(z, 9) < 4)
    img[ground & dash] += 0.08
    # buildings: two receding walls with lit windows
    sky = ~ground
    img[sky] = (np.array([0.02, 0.018, 0.03]) * (1 + np.clip((hy - yy[sky]) / hy, 0, 1) * 0)[..., None])
    for side in (-1, 1):
        for _ in range(900):
            zz = rng.uniform(8, 160); xw0 = side * rng.uniform(9, 14); yw = rng.uniform(2, 40)
            sx = cx + xw0 / zz * f; sy = hy - (yw - cam_h) / zz * f
            if 0 < sx < W and 0 < sy < hy + 20:
                c = np.array([1.0, 0.75, 0.45]) if rng.random() < 0.7 else np.array([0.7, 0.8, 1.0])
                disc(img, sx, sy, max(1.2, 60 / zz), c * rng.uniform(0.15, 0.6) * (30 / (zz + 20)), 0.5)
    # light trails (vehicle lights at 0.7 m), mirrored for wet reflections
    trails = np.zeros_like(img)
    refl = np.zeros_like(img)
    zs = np.geomspace(2.2, 260, 500)
    lanes = [(-5.2, (1.4, 1.25, 1.1)), (-4.6, (1.2, 1.1, 1.0)), (-1.9, (1.5, 1.35, 1.15)), (-1.3, (1.3, 1.2, 1.0)),
             (1.3, (1.6, 0.18, 0.04)), (1.9, (1.6, 0.25, 0.03)), (4.6, (1.7, 0.42, 0.06)), (5.2, (1.4, 0.12, 0.05))]
    for xw0, c in lanes:
        for k in range(3):
            off = rng.normal(0, 0.05)
            for (yw, tgt, gain) in [(0.72 + k * 0.05, trails, 1.0), (-0.72 - k * 0.05, refl, 0.5)]:
                sx = cx + (xw0 + off) / zs * f
                sy = hy - (yw - cam_h) / zs * f
                pts = np.stack([sx, sy], 1)
                for i in range(len(zs) - 1):
                    th = max(1, int(16 / zs[i] * 3))
                    cv2.line(tgt, tuple((pts[i] * 4).astype(int)), tuple((pts[i + 1] * 4).astype(int)),
                             tuple(float(v) * gain * (0.5 + 0.5 * rng.random()) for v in c), th, cv2.LINE_AA, 2)
    refl = cv2.GaussianBlur(refl, (0, 0), 3)
    refl = cv2.blur(refl, (3, 45))
    img += trails + refl * ground[..., None]
    img = zoom_blur(img, cx, hy, 0.03, 14) * 0.5 + img * 0.5
    img = bloom(img, 0.7, (6, 24, 80), (0.4, 0.35, 0.4))
    finish(img, 'env-city', exposure=1.1)


# ----------------------------------------------------------------- TUNNEL
def tunnel():
    img = np.zeros((H, W, 3), np.float32)
    cx, cy, f = W * 0.47, H * 0.5, W * 0.75
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # rectangular tunnel cross-section: half width 4.5, floor -1.6, ceiling 3.2
    hw, fl, ce = 4.5, -1.6, 3.2
    dx, dyv = (xx - cx) / f, (cy - yy) / f
    with np.errstate(divide='ignore', invalid='ignore'):
        zw = np.where(np.abs(dx) > 1e-5, hw / np.abs(dx), 1e4)
        zf = np.where(dyv < -1e-5, fl / dyv, 1e4)
        zc = np.where(dyv > 1e-5, ce / dyv, 1e4)
    z = np.minimum(np.minimum(zw, zf), zc)
    surf = np.argmin(np.stack([zw, zf, zc]), 0)
    conc = 0.05 * (1 + 0.35 * noise(3) + 0.25 * noise(12))
    shade = np.where(surf == 0, 1.0, np.where(surf == 1, 0.7, 0.55))
    fog = np.exp(-z / 70)
    col = (conc * shade * fog)[..., None] * np.array([1.0, 0.97, 0.95])
    # lighting pools under each ceiling lamp
    pool = 0.5 + 0.5 * np.cos(2 * np.pi * z / 6)
    col *= (0.6 + 1.4 * pool ** 6 * fog)[..., None]
    img += col
    zs = np.arange(3, 300, 6.0)
    for lx in (-1.6, 1.6):           # ceiling light bars
        for zz in zs:
            p0 = (cx + lx / zz * f, cy - ce / zz * f)
            p1 = (cx + lx / (zz + 2.2) * f, cy - ce / (zz + 2.2) * f)
            th = max(1, int(40 / zz * 4))
            cv2.line(img, (int(p0[0] * 4), int(p0[1] * 4)), (int(p1[0] * 4), int(p1[1] * 4)),
                     (3.2, 3.0, 2.7), th, cv2.LINE_AA, 2)
    for side in (-1, 1):             # orange guide strip along the walls
        pts = [(cx + side * hw / zz * f, cy - 0.2 / zz * f) for zz in np.geomspace(2, 300, 200)]
        for a, b in zip(pts[:-1], pts[1:]):
            cv2.line(img, (int(a[0] * 4), int(a[1] * 4)), (int(b[0] * 4), int(b[1] * 4)), (2.4, 0.4, 0.05), 6, cv2.LINE_AA, 2)
    img = zoom_blur(img, cx, cy, 0.12, 28) * 0.8 + img * 0.2
    img = bloom(img, 0.8)
    finish(img, 'env-tunnel', exposure=1.15)


track(); city(); tunnel()
