"""Piezas animadas para web y redes en distintos formatos. Uso: python3 tools/build_web.py -> animations/web-*.svg"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from logolib import Doc, C, CD, M, G, PL, PA, T, RM

class W(Doc):
    def out(self, name, w, h, body, bg=PA):
        fade = self.kf([(0, "opacity:1"), (7.2, "opacity:1"), (7.9, "opacity:0")], "linear")
        open(f"animations/web-{name}.svg", "w").write(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{self.label}">'
            f'<style>.b{{transform-box:fill-box;transform-origin:center}}{"".join(self.css)}{RM}</style>'
            f'<rect width="{w}" height="{h}" fill="{bg}"/><g class="{fade}">{body}</g></svg>')

# 1 Marquesina de bloques (banner 1600x400)
d = W(PA, "Marquesina de bloques de colores de marca"); tile = [(C, 120), (PL, 80), (M, 160), (G, 60), (C, 200), (PL, 100), (M, 80), (G, 140), (PL, 60)]
tw = sum(w for _, w in tile)
def row(y, h, rev):
    s, x = "", 0
    for rep in range(3):
        for col, w in tile:
            s += f'<rect x="{x}" y="{y}" width="{w-8}" height="{h}" fill="{col}"' + (f' stroke="{G}" stroke-width="3"' if col == PL else '') + '/>'; x += w
    k = d.kf([(0, "transform:translateX(0)"), (7.99, f"transform:translateX({-tw if not rev else tw}px)")] if not rev else [(0, f"transform:translateX({-tw}px)"), (7.99, "transform:translateX(0)")], "linear")
    return f'<g class="{k}">{s}</g>'
b = f'<g transform="translate(0 0)">{row(40,100,False)}{row(150,100,True)}{row(260,100,False)}</g>'
d.out("marquesina", 1600, 400, b)

# 2 Separador de grilla (1600x100)
d = W(PA, "Separador: una línea de cuadrados que se enciende en onda"); b = ""
for k in range(32):
    t = .2 + k * .12; col = C if k % 4 else M
    b += d.el("rect", f'x="{k*50+6}" y="30" width="38" height="38" fill="{col}" class="b"', [(0, "opacity:0;transform:scale(0)"), (t, "opacity:0;transform:scale(0)"), (t + .4, "opacity:1;transform:scale(1.15)"), (t + .8, "transform:scale(1)"), (t + 2.6, "opacity:1;transform:scale(1)"), (t + 3.0, "opacity:.25;transform:scale(.7)"), (t + 3.4, "opacity:1;transform:scale(1)")], "ease-out")
d.out("separador", 1600, 100, b)

# 3 Iconos de las tres categorías (1500x500)
d = W(PA, "Tres categorías: térmica y acústica, protección contra incendios, tabiques y cielos"); b = ""
from matlib import mv, P, dot, wave, FLAME
b += f'<rect x="0" y="0" width="500" height="500" fill="{PL}"/><rect x="1000" y="0" width="500" height="500" fill="{PL}"/>'
# térmica/acústica
b += f'<rect x="230" y="110" width="40" height="280" fill="{PA}" stroke="{G}" stroke-width="5"/><rect x="226" y="110" width="12" height="280" fill="{C}"/>'
for k in range(4): b += mv(d, dot(C, 9), [P(.3 + k * .7, 80, 160 + k * 60, 1, 0), P(.4 + k * .7, 80, 160 + k * 60), P(1.4 + k * .7, 215, 160 + k * 60), P(2.2 + k * .7, 260, 160 + k * 60, .3, 0)])
for k in range(2): b += mv(d, wave(), [(3.4 + k * 1.2, 80, 250, 1, 1, 0), (3.5 + k * 1.2, 80, 250, 1, 1, 1), (4.5 + k * 1.2, 210, 250, 1, 1, 1), (5.4 + k * 1.2, 300, 250, .25, .25, 0)])
# PPCI
b += f'<rect x="680" y="100" width="140" height="300" fill="{PA}" stroke="{G}" stroke-width="5" transform="translate(0 0)"/>'
fl = lambda x, t: d.el("path", f'd="{FLAME}" fill="{C}"', [(0, f"opacity:0;transform:translate({x}px,400px) scale(.4)"), (t, f"opacity:0;transform:translate({x}px,400px) scale(.4)"), (t + .4, f"opacity:1;transform:translate({x}px,400px) scale(.9,1)"), (t + 1.0, f"transform:translate({x}px,400px) scale(1,.8)"), (t + 1.6, f"transform:translate({x}px,400px) scale(.9,1.05)"), (t + 2.2, f"transform:translate({x}px,400px) scale(1,.85)"), (7.0, f"transform:translate({x}px,400px) scale(.95,.95)")], "ease-in-out")
b += fl(610, .4) + fl(560, .8)
b += d.el("rect", f'x="680" y="100" width="140" height="300" fill="{G}" opacity=".0"', [(0, "opacity:0"), (3, "opacity:0"), (3.4, "opacity:.08")])
# tabiques y cielos
for k in range(4): b += d.el("rect", f'x="{1090+k*80}" y="110" width="26" height="290" fill="{G}"', [(0, "transform:scaleY(0)"), (.2 + k * .25, "transform:scaleY(0)"), (.9 + k * .25, "transform:scaleY(1)")], "ease-out").replace("/>", ' style="transform-box:fill-box;transform-origin:50% 100%"/>')
b += f'<rect x="1070" y="86" width="290" height="24" fill="{G}"/><rect x="1070" y="400" width="290" height="24" fill="{G}"/>'
for k in range(3): b += d.el("rect", f'x="{1100+k*80}" y="120" width="64" height="270" fill="{PA}" stroke="{G}" stroke-width="4"', [(0, "opacity:0;transform:translateY(-400px)"), (2.2 + k * .5, "opacity:0;transform:translateY(-400px)"), (2.3 + k * .5, "opacity:1;transform:translateY(-400px)"), (3.0 + k * .5, "opacity:1;transform:none")], "cubic-bezier(.3,.8,.3,1)")
b += f'<rect x="498" y="0" width="4" height="500" fill="{G}" opacity="0"/>'
d.out("categorias", 1500, 500, b)

# 4 Barra de progreso por capas (1200x120)
d = W(PA, "Barra de progreso hecha de capas"); b = f'<rect x="30" y="35" width="1140" height="50" fill="{PL}" stroke="{G}" stroke-width="4"/>'
cols = [C, M, G, C, M, G, C, M, G, C]
for k, c in enumerate(cols):
    t = .4 + k * .55
    b += d.el("rect", f'x="{34+k*113.2:.1f}" y="39" width="113" height="42" fill="{c}"', [(0, "transform:scaleX(0)"), (t, "transform:scaleX(0)"), (t + .5, "transform:scaleX(1)")], "ease-out").replace("/>", ' style="transform-box:fill-box;transform-origin:0 50%"/>')
d.out("progreso", 1200, 120, b)

# 5 Cortina de transición (1920x1080) con tablas que bajan y suben
d = W(PA, "Transición: tablas que cubren y descubren la pantalla"); b = ""; cs = [C, M, G, C, M, G, C, M]
for k, c in enumerate(cs):
    t = .2 + k * .18
    b += d.el("rect", f'x="{k*240}" y="0" width="241" height="1080" fill="{c}"', [(0, "transform:translateY(-1080px)"), (t, "transform:translateY(-1080px)"), (t + .8, "transform:none"), (3.8, "transform:none"), (4.0 + k * .15, "transform:none"), (4.9 + k * .15, "transform:translateY(1080px)")], "cubic-bezier(.7,0,.2,1)")
d.out("cortina", 1920, 1080, b, PL)

# 6 Composición modular (post 1080x1080): bloques que deslizan en filas alternadas
d = W(PA, "Composición modular de bloques que se arma por filas"); import random; random.seed(3); b = ""
y = 60
for r in range(6):
    x = 60; dirn = 1 if r % 2 == 0 else -1
    while x < 1020:
        w = random.choice([120, 180, 240, 300]); w = min(w, 1020 - x)
        if w < 80: break
        col = random.choice([C, M, G, PL, C]); t = .2 + r * .35 + (x / 1020) * .4
        b += d.el("rect", f'x="{x}" y="{y}" width="{w-10}" height="{140}" fill="{col}"' + (f' stroke="{G}" stroke-width="4"' if col == PL else ''), [(0, f"transform:translateX({dirn*-1100}px)"), (t, f"transform:translateX({dirn*-1100}px)"), (t + .9, "transform:none"), (6.6, "transform:none"), (7.1, f"transform:translateX({dirn*1100}px)")], "cubic-bezier(.2,.9,.2,1)")
        x += w
    y += 155
d.out("modular", 1080, 1080, b)
print("ok")
