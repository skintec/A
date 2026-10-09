"""Genera 6 animaciones del logo con letras recortadas por máscara. Uso: python3 tools/build_logos.py"""
import sys, os; sys.path.insert(0, os.path.dirname(__file__))
from logolib import *

# 1 · Escritura: el cuadrado se dibuja y cada letra se escribe
d = Doc(PA, "Muralia: el marco se dibuja y cada letra se escribe")
b = d.el("rect", f'x="91" y="86" width="909" height="919" fill="none" stroke="{C}" stroke-width="60" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"',
    [(0, "stroke-dashoffset:1"), (.2, "stroke-dashoffset:1"), (1.8, "stroke-dashoffset:0")], "cubic-bezier(.6,0,.3,1)")
b += letters_draw(d, 1.7, .5, C, C)
open("animations/logo-escritura.svg", "w").write(d.svg(b))

# 2 · Ladrillo: un muro se levanta ladrillo a ladrillo y se transforma en el logo
d = Doc(PA, "Muralia: un muro de ladrillos se transforma en el logo")
bw, bh, x0, y0, cols, rows = 142, 71, 120, 120, 6, 12
b = ""
for r in range(rows):
    off = 0 if r % 2 == 0 else bw / 2
    for c in range(-1, cols + 1):
        x, w = x0 + c * bw + off, bw
        xa, xb = max(x, x0), min(x + w, x0 + cols * bw)
        if xb - xa < 20: continue
        y = y0 + (rows - 1 - r) * bh
        t = .3 + r * .22 + (c % 3) * .05
        b += d.el("rect", f'x="{xa+3:.1f}" y="{y+3}" width="{xb-xa-6:.1f}" height="{bh-6}" fill="{C}"',
            [(0, "opacity:0;transform:translateY(-700px)"), (t, "opacity:0;transform:translateY(-700px)"), (t + .45, "opacity:1;transform:none"), (4.3, "opacity:1"), (5.1, "opacity:0")], "cubic-bezier(.5,0,.7,1.3)")
b += d.el("rect", f'x="91" y="86" width="909" height="919" fill="none" stroke="{C}" stroke-width="60" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"',
    [(0, "stroke-dashoffset:1"), (3.4, "stroke-dashoffset:1"), (4.4, "stroke-dashoffset:0")])
for i, l in enumerate(LET):
    s = 3.6 + i * .12
    b += d.el("path", f'd="{l}" fill-rule="evenodd" class="b" fill="{PA}"',
        [(0, f"opacity:0;fill:{PA};transform:scale(.6)"), (s, f"opacity:0;fill:{PA};transform:scale(.6)"), (s + .4, f"opacity:1;fill:{PA};transform:none"), (4.6, f"opacity:1;fill:{PA}"), (5.3, f"opacity:1;fill:{C}")])
open("animations/logo-ladrillo.svg", "w").write(d.svg(b))

# 3 · Capas: bandas de aislación llenan el logo y se funden en terracota
d = Doc(PA, "Muralia: capas de aislación que forman el logo")
cols_b = [C, M, G, C, M, G, C, M]
b = ""
for i, c in enumerate(cols_b):
    dx = -1200 if i % 2 == 0 else 1200
    t = .3 + i * .22
    b += d.el("rect", f'x="40" y="{50+i*124}" width="1012" height="126" fill="{c}"',
        [(0, f"transform:translateX({dx}px)"), (t, f"transform:translateX({dx}px)"), (t + .9, "transform:none;fill:" + c), (4.4, f"fill:{c}"), (5.4, f"fill:{C}")])
b = f'<g clip-path="url(#lg)">{b}</g>'
open("animations/logo-capas.svg", "w").write(d.svg(b, clipdef()))

# 4 · Grillado: una grilla de celdas se enciende en onda y se unifica
random.seed(5)
d = Doc(PA, "Muralia: una grilla de celdas que forma el logo")
b, n, s = "", 12, 91
for r in range(n):
    for c in range(n):
        col = random.choice([C, C, CD, M, G]); t = .3 + (r + c) * .13
        b += d.el("rect", f'x="{c*s+3}" y="{r*s+3}" width="{s-6}" height="{s-6}" class="b" fill="{col}"',
            [(0, f"opacity:0;transform:scale(0);fill:{col}"), (t, f"opacity:0;transform:scale(0);fill:{col}"), (t + .5, f"opacity:1;transform:none;fill:{col}"), (4.2, f"fill:{col};transform:none"), (5.0, f"fill:{C};transform:scale(1.12)")])
b = f'<g clip-path="url(#lg)">{b}</g>'
open("animations/logo-grillado.svg", "w").write(d.svg(b, clipdef()))

# 5 · Relleno por niveles: el logo se llena de terracota en pasos, como una cámara aislada
d = Doc(G, "Muralia: el logo se llena por niveles")
base = (f'<path d="{FRAME}" fill-rule="evenodd" fill="none" stroke="{PA}" stroke-width="4" stroke-opacity=".55"/>'
        + "".join(f'<path d="{l}" fill-rule="evenodd" fill="none" stroke="{PA}" stroke-width="4" stroke-opacity=".55"/>' for l in LET))
base = d.el("g", "", [(0, "opacity:0"), (.2, "opacity:0"), (1.0, "opacity:1")]).replace("/>", f">{base}</g>")
level = d.el("rect", 'x="0" y="0" width="1092" height="1092"', [(0, "transform:translateY(1092px)"), (1.2, "transform:translateY(1092px)"), (4.4, "transform:translateY(0)")], "steps(14,end)")
level = level.replace('<rect', f'<rect fill="{C}"')
b = base + f'<g clip-path="url(#lg)">{level}</g>'
b += d.el("rect", f'x="0" y="0" width="1092" height="14" fill="{PA}"', [(0, "opacity:0"), (4.4, "opacity:0"), (4.8, "opacity:.9"), (5.4, "opacity:0")])
open("animations/logo-niveles.svg", "w").write(d.svg(b, clipdef()))

# 6 · Plano técnico: trazo de construcción que se rellena
d = Doc(PL, "Muralia: plano técnico que se rellena")
b = ""
for k in range(0, 1093, 91):
    for (x1, y1, x2, y2) in [(k, 0, k, 1092), (0, k, 1092, k)]:
        b += d.el("path", f'd="M{x1} {y1}L{x2} {y2}" stroke="{G}" stroke-width="1.5"', [(0, "opacity:0"), (.1 + k / 1092 * .8, "opacity:0"), (1.2 + k / 1092 * .8, "opacity:.14"), (5.0, "opacity:.14"), (5.8, "opacity:0")])
b += d.el("path", f'd="{FRAME}" fill="{C}" fill-rule="evenodd" stroke="{G}" stroke-width="3" pathLength="1" stroke-dasharray="1 1" stroke-linejoin="round"',
    [(0, "stroke-dashoffset:1;fill-opacity:0"), (.6, "stroke-dashoffset:1;fill-opacity:0"), (2.4, "stroke-dashoffset:0;fill-opacity:0"), (4.4, "stroke-dashoffset:0;fill-opacity:0"), (5.2, "stroke-dashoffset:0;fill-opacity:1")], "ease-in-out")
for i, l in enumerate(LET):
    s = 2.0 + i * .22
    b += d.el("path", f'd="{l}" fill="{C}" fill-rule="evenodd" stroke="{G}" stroke-width="3" pathLength="1" stroke-dasharray="1 1" stroke-linejoin="round"',
        [(0, "stroke-dashoffset:1;fill-opacity:0"), (s, "stroke-dashoffset:1;fill-opacity:0"), (s + .8, "stroke-dashoffset:0;fill-opacity:0"), (4.4, "stroke-dashoffset:0;fill-opacity:0"), (5.2, "stroke-dashoffset:0;fill-opacity:1")], "ease-in-out")
dim = ""  # cotas
for (x1, y1, x2, y2) in [(61, 1062, 1030, 1062), (61, 1048, 61, 1076), (1030, 1048, 1030, 1076), (28, 56, 28, 1035), (14, 56, 42, 56), (14, 1035, 42, 1035)]:
    dim += d.el("path", f'd="M{x1} {y1}L{x2} {y2}" stroke="{G}" stroke-width="3"', [(0, "opacity:0"), (3.0, "opacity:0"), (3.6, "opacity:1"), (5.0, "opacity:1"), (5.8, "opacity:0")])
open("animations/logo-plano.svg", "w").write(d.svg(b + dim))
print("ok")
