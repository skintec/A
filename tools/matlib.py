"""Primitivas para animar el funcionamiento de materiales (SVG + CSS puro, lienzo 1092x1092)."""
import sys, os, random, math
sys.path.insert(0, os.path.dirname(__file__))
from logolib import Doc, C, CD, M, G, PL, PA, T

SOUND = "M0 -44Q24 0 0 44M30 -44Q54 0 30 44M60 -44Q84 0 60 44"
FLAME = "M0 0C-42 -46 -14 -92 0 -150C14 -92 42 -46 0 0Z"
LINES = [330, 420, 510, 600, 690, 780]

def scene(label, cat):
    d = Doc(PA, label); d.cat = cat; return d

def base(d, split=440, split2=640):
    """Fondo común: zona expuesta (yeso), zona protegida (papel) y barra de categoría."""
    return (f'<rect x="0" y="0" width="{split2}" height="1092" fill="{PL}"/>'
            f'<rect x="0" y="0" width="1092" height="26" fill="{d.cat}"/>')

def mv(d, shape, pts, extra=""):
    """pts: [(t, x, y, sx, sy, o)] -> elemento dibujado en (0,0) que viaja por la ruta (opacidad 0 antes y después)."""
    f = []
    for (t, x, y, sx, sy, o) in pts:
        f.append((t, f"opacity:{o};transform:translate({x}px,{y}px) scale({sx},{sy})"))
    f0 = f[0]
    fr = [(0, f0[1].replace("opacity:1", "opacity:0"))] if f0[0] > 0 else []
    fr += f
    fr.append((pts[-1][0] + .01, fr[-1][1].replace("opacity:1", "opacity:0")))
    return d.el("g", extra, fr, "linear").replace("/>", f">{shape}</g>")

def P(t, x, y, s=1, o=1, sy=None): return (t, x, y, s, s if sy is None else sy, o)

def dot(col=C, r=11): return f'<circle r="{r}" fill="{col}"/>'
def ring(col=M, r=11): return f'<circle r="{r}" fill="none" stroke="{col}" stroke-width="4"/>'
def wave(col=G): return f'<path d="{SOUND}" fill="none" stroke="{col}" stroke-width="7" stroke-linecap="round"/>'

def zig(x0, y0, x1, y1, n, amp, t0, t1, s=1):
    out = []
    for k in range(n + 1):
        f = k / n; sign = 1 if k % 2 else -1
        yy = y0 + (y1 - y0) * f + (0 if k in (0, n) else sign * amp)
        out.append(P(t0 + (t1 - t0) * f, x0 + (x1 - x0) * f, yy, s))
    return out

def heat_in(d, y, t0, a, b, c, mode="absorb", col=C, tin=1.0, tz=2.6, amp=24, nz=6, r=11):
    """Partícula de calor: llega rápido al material y dentro avanza en zigzag lento."""
    pts = [P(t0, a, y, 1, 0), P(t0 + .08, a, y), P(t0 + tin, b, y)]
    mid = b + (c - b) * (.55 if mode == "absorb" else 1)
    pts += zig(b, y, mid, y, nz, amp, t0 + tin, t0 + tin + tz)[1:]
    if mode == "absorb": pts.append(P(t0 + tin + tz + .5, mid + 10, y, .3, 0))
    elif mode == "pass": pts.append(P(t0 + tin + tz + .8, c + 160, y, 1, 0))
    return mv(d, dot(col, r), pts)

def heat_bounce(d, y, t0, a, b, col=C, r=11, tin=1.0):
    pts = [P(t0, a, y, 1, 0), P(t0 + .08, a, y), P(t0 + tin, b, y), P(t0 + tin + .25, b - 16, y - 30), P(t0 + tin + 1.1, a, y - 150, .6, 0)]
    return mv(d, dot(col, r), pts)

def snd(d, y, t0, a, b, c, mode="absorb", col=G, tin=1.2):
    pts = [(t0, a, y, .9, .9, 0), (t0 + .1, a, y, 1, 1, 1), (t0 + tin, b, y, 1, 1, 1)]
    if mode == "absorb": pts += [(t0 + tin + 1.4, b + (c - b) * .75, y, .25, .25, 0)]
    elif mode == "reflect": pts += [(t0 + tin + .02, b, y, -.8, .8, 1), (t0 + tin + 1.3, a, y, -.5, .5, 0)]
    elif mode == "transmit": pts += [(t0 + tin + 1.4, c + 190, y, .5, .5, 0)]
    return mv(d, wave(col), pts)

def fibers(x, y, w, h, seed=1, n=70, col=G, dens=1.0, fill=PA, sw=4, op=.55):
    random.seed(seed); out = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{G}" stroke-width="{sw}"/>'
    for _ in range(int(n * dens)):
        cx, cy = random.uniform(x + 14, x + w - 14), random.uniform(y + 14, y + h - 14)
        a = random.uniform(0, math.pi); l = random.uniform(22, 46) * (0.8 if dens > 1.2 else 1)
        dx, dy = math.cos(a) * l / 2, math.sin(a) * l / 2
        out += f'<path d="M{cx-dx:.0f} {cy-dy:.0f}L{cx+dx:.0f} {cy+dy:.0f}" stroke="{col}" stroke-width="3" stroke-linecap="round" opacity="{op}"/>'
    return out

def slab(x, y, w, h, fill=PL, stroke=G, sw=4): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def thin(x, y, w, h, col): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{col}"/>'

def flame(d, x, y, t0=0, sc=1.0, col=C, hold=7.2):
    fr = [(0, f"transform:translate({x}px,{y}px) scale({sc*.4},{sc*.4});opacity:0"), (t0, f"transform:translate({x}px,{y}px) scale({sc*.4},{sc*.4});opacity:0")]
    t = t0 + .3; k = 0
    while t < hold:
        s = [1, .85, 1.12, .92][k % 4]; sx = [1, 1.1, .92, 1.05][k % 4]
        fr.append((t, f"opacity:1;transform:translate({x}px,{y}px) scale({sc*sx},{sc*s})")); t += .45; k += 1
    return d.el("path", f'd="{FLAME}" fill="{col}"', fr, "ease-in-out")

def speaker(x, y, col=G): return f'<g transform="translate({x} {y})"><rect x="-24" y="-18" width="26" height="36" fill="{col}"/><path d="M2 -18L38 -44V44L2 18Z" fill="{col}"/></g>'
def sun(x, y, col=C):
    rays = "".join(f'<path d="M0 -50L0 -72" stroke="{col}" stroke-width="7" stroke-linecap="round" transform="rotate({a})"/>' for a in range(0, 360, 45))
    return f'<g transform="translate({x} {y})"><circle r="30" fill="{col}"/>{rays}</g>'

def save(slug, d, body, defs=""): open(f"animations/mat-{slug}.svg", "w").write(d.svg(body, defs))
