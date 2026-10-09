"""Versión 2 de animaciones del logo: juegan con la deformación (escala, estiramiento, torsión) y cierran con el logo exacto.
Uso: python3 tools/build_logos_v2.py -> animations/logo-*-v2.svg"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from logolib import *

SPR = "cubic-bezier(.34,1.56,.64,1)"
O = "transform-origin:50% 100%"
def letter(d, i, fill, frames, ease=EASE, style=""):
    g = geo(i); st = f' style="{style}"' if style else ""
    return d.el("path", f'd="{g["d"]}" fill-rule="evenodd" fill="{fill}" class="b"{st}', frames, ease)
def hid(s, css): return [(0, css), (s, css)]
def frame_path(d, col, frames, ease=EASE):
    return d.el("path", f'd="{FRAME}" fill-rule="evenodd" fill="{col}" class="b"', frames, ease)
def frame_stroke(d, col, t0, t1):
    return d.el("rect", f'x="91" y="86" width="909" height="919" fill="none" stroke="{col}" stroke-width="60" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"',
        [(0, "stroke-dashoffset:1"), (t0, "stroke-dashoffset:1"), (t1, "stroke-dashoffset:0")], "cubic-bezier(.6,0,.3,1)")
def save(n, d, body): open(f"animations/logo-{n}-v2.svg", "w").write(d.svg(body))

# 1 · Gelatina: cada pieza nace de un punto y rebota deformándose
d = Doc(PA, "Muralia: marco y letras nacen de un punto y rebotan como gelatina")
J = lambda s: hid(s, "opacity:0;transform:scale(0)") + [(s + .01, "opacity:1;transform:scale(0)"), (s + .25, "transform:scale(1.35,.7)"), (s + .45, "transform:scale(.84,1.24)"), (s + .65, "transform:scale(1.1,.94)"), (s + .85, "transform:scale(.97,1.03)"), (s + 1.05, "transform:none")]
b = frame_path(d, C, J(.2), "ease-out")
for i in range(7): b += letter(d, i, C, J(1.3 + i * .28), "ease-out")
save("vigas", d, exact(d, b))

# 2 · Del ladrillo a la letra, con el muro: se levanta rápido y se deforma en letras
d = Doc(PA, "Muralia: un muro de ladrillos se deforma hasta formar las letras"); b = ""
bw, bh, x0, y0, cols, rows = 142, 71, 120, 120, 6, 12
for r in range(rows):
    off = 0 if r % 2 == 0 else bw / 2
    for c in range(-1, cols + 1):
        x = x0 + c * bw + off; xa, xb = max(x, x0), min(x + bw, x0 + cols * bw)
        if xb - xa < 20: continue
        y = y0 + (rows - 1 - r) * bh; t = .15 + r * .11 + (c % 3) * .03; fo = 2.9 + (rows - 1 - r) * .05 + (c % 3) * .03
        b += d.el("rect", f'x="{xa+3:.1f}" y="{y+3}" width="{xb-xa-6:.1f}" height="{bh-6}" fill="{C}" class="b"',
            [(0, "opacity:0;transform:translateY(-700px)"), (t, "opacity:0;transform:translateY(-700px)"), (t + .35, "opacity:1;transform:none"), (fo, "opacity:1;transform:scale(1)"), (fo + .5, "opacity:0;transform:scale(.3,.1)")], "cubic-bezier(.5,0,.7,1.3)")
for i in range(7):
    g = geo(i); s = 2.0 + i * .1; sx, sy = 150 / g["w"], 75 / g["h"]
    b += letter(d, i, C, hid(s, f"opacity:0;fill:{PA};transform:scale({sx:.3f},{sy:.3f})") + [(s + .01, f"opacity:1;fill:{PA};transform:scale({sx:.3f},{sy:.3f});animation-timing-function:{SPR}"), (s + .7, f"opacity:1;fill:{PA};transform:none"), (3.2, f"fill:{PA}"), (3.8, f"fill:{C}")], "linear")
b += frame_stroke(d, C, 3.0, 4.0)
save("ladrillo-letra", d, exact(d, b, t0=5.4, t1=5.9))

# 3 · Acordeón: la palabra se comprime y se expande como un fuelle
d = Doc(PL, "Muralia: las letras se comprimen y expanden como un acordeón")
ACC = lambda s: hid(s, "opacity:0;transform:scale(.04,1.15)") + [(s + .01, "opacity:1;transform:scale(.04,1.15)"), (s + .3, "transform:scale(1.3,.92)"), (s + .6, "transform:scale(.55,1.08)"), (s + .9, "transform:scale(1.15,.97)"), (s + 1.2, "transform:scale(.8,1.04)"), (s + 1.5, "transform:scale(1.05,.99)"), (s + 1.8, "transform:none")]
b = frame_path(d, C, ACC(.1), "ease-in-out")
for i in range(7): b += letter(d, i, C, ACC((1.6 if i < 3 else 2.4) + (i % 4) * .05), "ease-in-out")
save("elastico", d, exact(d, b, t0=5.8, t1=6.3))

# 4 · Persiana: las letras crecen desde la base en escalones
d = Doc(PA, "Muralia: las letras crecen desde la base por escalones")
b = frame_stroke(d, C, .1, 1.2)
for i in range(7):
    s = 1.0 + i * .3
    b += letter(d, i, C, hid(s, "transform:scaleY(0)") + [(s + 1.0, "transform:scaleY(1)")], "steps(6,end)", O)
save("peldanos", d, exact(d, b, t0=4.8, t1=5.3))

# 5 · Torsión: las letras se retuercen y se enderezan
d = Doc(G, "Muralia: las letras se retuercen y se enderezan"); b = frame_stroke(d, PA, .1, 1.2)
for i in range(7):
    s = 1.0 + i * .26; ax = "skewX" if i < 3 else "skewY"; m = 1 if i % 2 == 0 else -1
    b += letter(d, i, PA, hid(s, f"opacity:0;transform:{ax}({60*m}deg) scale(.25,1.2)") + [(s + .01, f"opacity:1;transform:{ax}({60*m}deg) scale(.25,1.2)"), (s + .4, f"transform:{ax}({-28*m}deg) scale(1.15,.95)"), (s + .7, f"transform:{ax}({14*m}deg) scale(.96,1.03)"), (s + 1.0, f"transform:{ax}({-6*m}deg)"), (s + 1.3, f"transform:{ax}({2*m}deg)"), (s + 1.6, "transform:none")], "ease-out")
save("ensamblado", d, exact(d, b, "papel", 5.4, 5.9))

# 6 · Ola: las letras suben y bajan de altura como un ecualizador hasta asentarse
d = Doc(PA, "Muralia: las letras ondulan de altura como un ecualizador"); b = frame_stroke(d, C, .1, 1.1)
for i in range(7):
    s = .9 + i * .14
    b += letter(d, i, C, hid(s, "transform:scaleY(0)") + [(s + .3, "transform:scaleY(1.45)"), (s + .6, "transform:scaleY(.55)"), (s + .9, "transform:scaleY(1.25)"), (s + 1.2, "transform:scaleY(.78)"), (s + 1.5, "transform:scaleY(1.1)"), (s + 1.8, "transform:scaleY(.95)"), (s + 2.1, "transform:none")], "ease-in-out", O)
save("pendulo", d, exact(d, b, t0=4.6, t1=5.1))

# 7 · Plano técnico (v2): al terminar queda el logo exacto, sin contornos
d = Doc(PL, "Muralia: plano técnico que se rellena y termina en el logo exacto"); b = ""
for k in range(0, 1093, 91):
    for (x1, y1, x2, y2) in [(k, 0, k, 1092), (0, k, 1092, k)]:
        b += d.el("path", f'd="M{x1} {y1}L{x2} {y2}" stroke="{G}" stroke-width="1.5"', [(0, "opacity:0"), (.1 + k / 1092 * .8, "opacity:0"), (1.2 + k / 1092 * .8, "opacity:.14"), (4.6, "opacity:.14"), (5.4, "opacity:0")])
b += d.el("path", f'd="{FRAME}" fill="{C}" fill-rule="evenodd" stroke="{G}" stroke-width="3" pathLength="1" stroke-dasharray="1 1" stroke-linejoin="round"',
    [(0, "stroke-dashoffset:1;fill-opacity:0"), (.6, "stroke-dashoffset:1;fill-opacity:0"), (2.4, "stroke-dashoffset:0;fill-opacity:0"), (4.0, "stroke-dashoffset:0;fill-opacity:0"), (4.8, "stroke-dashoffset:0;fill-opacity:1")], "ease-in-out")
for i, l in enumerate(LET):
    s = 2.0 + i * .22
    b += d.el("path", f'd="{l}" fill="{C}" fill-rule="evenodd" stroke="{G}" stroke-width="3" pathLength="1" stroke-dasharray="1 1" stroke-linejoin="round"',
        [(0, "stroke-dashoffset:1;fill-opacity:0"), (s, "stroke-dashoffset:1;fill-opacity:0"), (s + .8, "stroke-dashoffset:0;fill-opacity:0"), (4.0, "stroke-dashoffset:0;fill-opacity:0"), (4.8, "stroke-dashoffset:0;fill-opacity:1")], "ease-in-out")
for (x1, y1, x2, y2) in [(61, 1062, 1030, 1062), (61, 1048, 61, 1076), (1030, 1048, 1030, 1076), (28, 56, 28, 1035), (14, 56, 42, 56), (14, 1035, 42, 1035)]:
    b += d.el("path", f'd="M{x1} {y1}L{x2} {y2}" stroke="{G}" stroke-width="3"', [(0, "opacity:0"), (3.0, "opacity:0"), (3.6, "opacity:1"), (4.6, "opacity:1"), (5.4, "opacity:0")])
save("plano", d, exact(d, b, t0=5.2, t1=5.8))
print("ok")
