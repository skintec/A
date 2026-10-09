"""Vectoriza el logo oficial (PNG) en trazados SVG por letra + marco -> brand/logo/logo-paths.json"""
import json, numpy as np, potrace
from PIL import Image
from scipy import ndimage
a = np.array(Image.open("brand/logo/muralia-logo-terracota-transparente.png"))[:, :, 3] > 128
lab, n = ndimage.label(a)
parts = []
for i in range(1, n + 1):
    m = lab == i
    if m.sum() < 200: continue
    ys, xs = np.where(m)
    parts.append((i, xs.min(), ys.min(), xs.max(), ys.max(), m))
def path(m):
    bm = potrace.Bitmap(~m)
    pl = bm.trace(turdsize=4, alphamax=0.6, opttolerance=0.4)
    d = []
    for c in pl:
        s = c.start_point; d.append(f"M{s.x:.1f} {s.y:.1f}")
        for seg in c.segments:
            if seg.is_corner: d.append(f"L{seg.c.x:.1f} {seg.c.y:.1f}L{seg.end_point.x:.1f} {seg.end_point.y:.1f}")
            else: d.append(f"C{seg.c1.x:.1f} {seg.c1.y:.1f} {seg.c2.x:.1f} {seg.c2.y:.1f} {seg.end_point.x:.1f} {seg.end_point.y:.1f}")
        d.append("Z")
    return "".join(d)
frame = max(parts, key=lambda p: (p[3]-p[1]))
letters = sorted([p for p in parts if p is not frame], key=lambda p: (p[2] > 540, p[1]))
out = {"frame": path(frame[5]), "letters": [{"d": path(p[5]), "bbox": [int(p[1]), int(p[2]), int(p[3]), int(p[4])]} for p in letters]}
json.dump(out, open("brand/logo/logo-paths.json", "w"))
print(len(letters), [l["bbox"] for l in out["letters"]])
