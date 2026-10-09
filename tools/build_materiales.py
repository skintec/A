"""21 animaciones de funcionamiento, una por producto de muralia.cl. Uso: python3 tools/build_materiales.py -> animations/mat-*.svg"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from matlib import *
X0, X1 = 440, 640   # bloque central
TOP, BOT = 250, 840
TERM, PPCI, TAB = C, G, M

def block_scene(label, cat): d = scene(label, cat); return d, base(d)

# ---------- AISLACIÓN TÉRMICA Y ACÚSTICA ----------
# 1 Lana de vidrio con polipropileno blanco (galpón)
d, b = block_scene("Lana de vidrio con polipropileno blanco: aísla bajo la cubierta y refleja la luz", TERM)
b += sun(150, 160) + speaker(110, 545)
b += thin(416, TOP, 24, BOT - TOP, G) + fibers(440, TOP, 180, BOT - TOP, 1) + f'<rect x="618" y="{TOP}" width="24" height="{BOT-TOP}" fill="{PA}" stroke="{G}" stroke-width="4"/>'
for i, y in enumerate([330, 480, 630]): b += heat_in(d, y, .4 + i * .5, 230, 440, 620, "absorb")
for i, y in enumerate([400, 700]): b += snd(d, y, 3.6 + i * .7, 200, 410, 620, "absorb")
for i, y in enumerate([330, 600]): b += mv(d, dot(CD, 8), [P(4.2 + i * .9, 960, y, 1, 0), P(4.3 + i * .9, 960, y), P(5.0 + i * .9, 650, 545), P(5.8 + i * .9, 960, 760 - i * 360, .8, 0)])
save("lana-vidrio-pp", d, b)

# 2 Panel velo negro: fachada ventilada con juntas abiertas
d, b = block_scene("Panel velo negro: aísla detrás de la fachada con juntas abiertas", TERM)
b += sun(150, 160) + speaker(110, 545)
for k in range(6): b += thin(330, TOP + k * 100, 24, 84, G)
b += fibers(440, TOP, 170, BOT - TOP, 2) + thin(440, TOP, 24, BOT - TOP, G)
for i, y in enumerate([300, 420, 540, 660]): b += heat_in(d, y + 2, .4 + i * .45, 200, 440, 610, "absorb")
for i, y in enumerate([380, 620]): b += snd(d, y, 3.2 + i * .8, 200, 390, 620, "absorb")
save("panel-velo-negro", d, b)

# 3 Lana de vidrio libre: relleno de tabique
d, b = block_scene("Lana de vidrio libre: rellena el tabique y absorbe el sonido", TERM)
b += speaker(110, 545)
b += slab(400, TOP, 40, BOT - TOP, PL) + slab(640, TOP, 40, BOT - TOP, PL) + fibers(440, TOP, 200, BOT - TOP, 3, 90)
b += thin(430, TOP - 24, 220, 24, G) + thin(430, BOT, 220, 24, G)
for i, y in enumerate([340, 460, 580, 700]): b += snd(d, y, .4 + i * .9, 200, 400, 640, "absorb" if i % 2 == 0 else "transmit")
for i, y in enumerate([380, 650]): b += heat_in(d, y, 4.4 + i * .5, 200, 440, 640, "absorb")
save("lana-vidrio-libre", d, b)

# 4 Lana de vidrio con papel kraft: barrera de vapor
d, b = block_scene("Lana de vidrio con papel kraft: la barrera de vapor detiene la humedad", TERM)
b += fibers(440, TOP, 200, BOT - TOP, 4) + thin(616, TOP, 24, BOT - TOP, CD)
for i, y in enumerate([340, 460, 580, 700]):  # vapor desde lado caliente (derecha) rebota en el kraft
    t = .3 + i * .7
    b += mv(d, ring(M, 12), [P(t, 980, y, 1, 0), P(t + .1, 980, y), P(t + 1.2, 665, y), P(t + 1.4, 690, y - 40), P(t + 2.2, 960, y - 150, .6, 0)])
for i, y in enumerate([420, 640]): b += heat_in(d, y, 3.8 + i * .6, 840, 640, 440, "absorb", tin=.9)
b = b.replace(base(d), base(d) + "")  # (fondo común)
save("lana-vidrio-kraft", d, b)

# 5 Panel de lana mineral: mayor densidad
d, b = block_scene("Panel de lana mineral: más densidad, frena el calor y el ruido industrial", TERM)
b += sun(150, 160) + speaker(110, 545) + fibers(440, TOP, 200, BOT - TOP, 5, 70, G, 2.2, PA, 4, .7)
for i, y in enumerate([300, 380, 460, 540, 620, 700, 780]): b += heat_in(d, y, .3 + i * .4, 200, 440, 640, "absorb", amp=14, nz=8, tz=3.0)
for i, y in enumerate([430, 660]): b += snd(d, y, 3.8 + i * .8, 200, 400, 640, "absorb")
save("lana-mineral", d, b)

# 6 Frazada de lana mineral con malla: envuelve una cañería
d = scene("Frazada de lana mineral con malla: envuelve la cañería y retiene el calor", TERM)
b = f'<rect width="1092" height="26" fill="{TERM}"/><circle cx="546" cy="546" r="260" fill="{PL}"/>'
b += d.el("circle", f'cx="546" cy="546" r="170" fill="none" stroke="{G}" stroke-width="4" class="b"', [(0, "opacity:0"), (.5, "opacity:0"), (.6, "opacity:1"), (7.2, "opacity:1")])
b += d.el("circle", f'cx="546" cy="546" r="215" fill="none" stroke="{PL}" stroke-width="86" pathLength="1" stroke-dasharray="1 1" transform="rotate(-90 546 546)"', [(0, "stroke-dashoffset:1"), (.6, "stroke-dashoffset:1"), (2.4, "stroke-dashoffset:0")], "ease-in-out")
b += d.el("circle", f'cx="546" cy="546" r="258" fill="none" stroke="{G}" stroke-width="4" stroke-dasharray="12 10" pathLength="1" transform="rotate(-90 546 546)"', [(0, "opacity:0"), (2.2, "opacity:0"), (2.6, "opacity:1")])
b += d.el("circle", 'cx="546" cy="546" r="150"', [(0, f"fill:{C}"), (3.0, f"fill:{C}"), (3.2, f"fill:{C}")], "ease-in-out")
import math as _m
for k in range(12):
    ang = k * 30 + 7; rx, ry = _m.cos(_m.radians(ang)), _m.sin(_m.radians(ang)); t = 2.9 + (k % 4) * .35
    b += mv(d, dot(C, 10), [P(t, 546 + rx * 150, 546 + ry * 150, 1, 0), P(t + .1, 546 + rx * 150, 546 + ry * 150), P(t + 2.2, 546 + rx * 205, 546 + ry * 205), P(t + 2.7, 546 + rx * 215, 546 + ry * 215, .3, 0)])
save("frazada-lana-mineral", d, b)

# 7 Colchoneta de lana mineral: se instala entre montantes
d, b = block_scene("Colchoneta de lana mineral: se inserta entre montantes y aísla el tabique", TERM)
b += speaker(110, 545) + slab(400, TOP, 40, BOT - TOP, PL) + slab(640, TOP, 40, BOT - TOP, PL)
b += d.el("g", "", [(0, "transform:translateY(-700px)"), (.4, "transform:translateY(-700px)"), (1.8, "transform:none")], "cubic-bezier(.3,.8,.3,1)").replace("/>", f">{fibers(440, TOP, 200, BOT - TOP, 7, 70)}{thin(438, TOP, 8, BOT - TOP, CD)}</g>")
for i, y in enumerate([350, 480, 610, 740]): b += snd(d, y, 2.4 + i * .7, 200, 400, 640, "absorb")
for i, y in enumerate([420, 690]): b += heat_in(d, y, 4.6 + i * .5, 200, 440, 640, "absorb")
save("colchoneta-lana-mineral", d, b)

# 8 Panel para ductos (Climaver): el ducto sale aislado
d = scene("Panel para ductos Climaver: el aire viaja aislado y el ruido se atenúa", TERM)
b = f'<rect width="1092" height="26" fill="{TERM}"/><rect x="0" y="26" width="1092" height="190" fill="{PL}"/><rect x="0" y="876" width="1092" height="216" fill="{PL}"/>'
b += fibers(120, 330, 860, 70, 8, 40, G, 1, PL) + fibers(120, 690, 860, 70, 9, 40, G, 1, PL) + thin(120, 400, 860, 8, G) + thin(120, 682, 860, 8, G)
for i, y in enumerate([440, 500, 560, 620]): b += mv(d, f'<path d="M0 0H70" stroke="{G}" stroke-width="7" stroke-linecap="round"/>', [P(.3 + i * .4, 140, y, 1, 0), P(.4 + i * .4, 140, y), P(3.4 + i * .4, 900, y), P(3.5 + i * .4, 960, y, 1, 0)])
for i, x in enumerate([180, 330]): b += mv(d, wave(), [(4.0 + i * .5, x, 545, .9, .9, 0), (4.1 + i * .5, x, 545, 1, 1, 1), (7.0 + i * .5 - 1, x + 600, 545, .3, .3, 0)]) if False else ""
for i in range(3): b += mv(d, wave(), [(.4 + i * 1.6, 140, 545, 1.5, 1.5, 0), (.5 + i * 1.6, 140, 545, 1.5, 1.5, 1), (2.6 + i * 1.6, 800, 545, .5, .5, 0)])
for i, x in enumerate([300, 520, 740]): b += heat_bounce(d, 250, 3.4 + i * .5, x, 300, C) if False else mv(d, dot(C, 11), [P(3.2 + i * .7, x, 130, 1, 0), P(3.3 + i * .7, x, 130), P(4.0 + i * .7, x, 305), P(4.2 + i * .7, x + 40, 250), P(4.8 + i * .7, x + 90, 120, .5, 0)])
save("panel-ductos", d, b)

# 9 Banda elastoacústica: corta el puente acústico
d = scene("Banda elastoacústica: corta la vibración entre tabique y losa", TERM)
b = f'<rect width="1092" height="26" fill="{TERM}"/><rect x="0" y="26" width="1092" height="1066" fill="{PL}"/>'
b += slab(0, 700, 1092, 300, PA) + fibers(0, 690, 0, 0, 0, 0) if False else slab(0, 700, 1092, 300, PA)
b += thin(430, 680, 232, 20, C) + thin(446, 260, 200, 420, G) + f'<rect x="446" y="260" width="200" height="420" fill="{PA}" stroke="{G}" stroke-width="4"/>'
b += thin(436, 686, 220, 14, CD)
for i in range(4):
    t = .5 + i * 1.6
    b += mv(d, f'<path d="M0 -30L0 30" stroke="{G}" stroke-width="7" stroke-linecap="round"/><path d="M-28 -12L-28 12M28 -12L28 12" stroke="{G}" stroke-width="7" stroke-linecap="round"/>', [P(t, 120, 800, 1, 0), P(t + .1, 120, 800), P(t + 1.2, 400, 800), P(t + 1.4, 425, 800, .5, 0)])
    b += mv(d, f'<path d="M0 -30L0 30" stroke="{G}" stroke-width="4" stroke-linecap="round" opacity=".5"/>', [P(t + 1.2, 405, 790, .6, 0), P(t + 1.3, 405, 790, .6), P(t + 2.3, 420, 700, .2, 0)])
b += d.el("g", "", [(0, "transform:translateX(0)")] + [(.5 + i * 1.6 + 1.3, "transform:translateX(0)") for i in range(0)], "linear").replace("/>", ">" + "</g>")
for i in range(3): b += snd(d, 480, 4.3 + i * .6, 100, 400, 640, "transmit") if False else ""
b += d.el("g", "", [(0, "transform:translateX(0)"), (1.4, "transform:translateX(0)"), (1.5, "transform:translateX(-5px)"), (1.6, "transform:translateX(5px)"), (1.7, "transform:translateX(-3px)"), (1.8, "transform:translateX(0)")], "linear").replace("/>", ">" + "</g>")
save("banda-elastoacustica", d, b)

# 10 Fibra cerámica: horno de alta temperatura
d = scene("Fibra cerámica: contiene el calor extremo dentro del horno", TERM)
b = f'<rect width="1092" height="26" fill="{TERM}"/><rect x="0" y="26" width="1092" height="1066" fill="{PA}"/>'
b += f'<rect x="250" y="250" width="592" height="592" fill="{G}"/>' + fibers(300, 300, 492, 492, 10, 160, G, 1, PL, 4, .6) + f'<rect x="380" y="380" width="332" height="332" fill="{C}"/>'
for k, (x, y) in enumerate([(420, 420), (546, 450), (650, 420), (440, 560), (600, 580), (500, 660), (660, 650)]):
    b += mv(d, dot(PA, 10), [P(.2 + k * .15, x, y, 1, 0), P(.3 + k * .15, x, y), P(1.5 + k * .15, x + 30, y - 20), P(2.7 + k * .15, x - 20, y + 10), P(3.9 + k * .15, x + 10, y - 10), P(5.0 + k * .15, x, y, 1, 0)]) if False else ""
for k, a in enumerate([20, 70, 120, 160, 200, 250, 300, 340]):
    rx, ry = math.cos(math.radians(a)), math.sin(math.radians(a))
    t = .4 + k * .5
    b += mv(d, dot(C, 10), [P(t, 546 + rx * 120, 546 + ry * 120, 1, 0), P(t + .1, 546 + rx * 120, 546 + ry * 120), P(t + 1.0, 546 + rx * 175, 546 + ry * 175), P(t + 2.6, 546 + rx * 205, 546 + ry * 205, .4, 0)])
b += d.el("rect", f'x="380" y="380" width="332" height="332" fill="{PA}" opacity="0"', [(0, "opacity:0"), (1.0, "opacity:.25"), (2.0, "opacity:0"), (3.0, "opacity:.25"), (4.0, "opacity:0"), (5.0, "opacity:.25"), (6.0, "opacity:0")], "ease-in-out")
b += sun(930, 160) if False else ""
b += d.el("rect", f'x="250" y="250" width="592" height="592" fill="none" stroke="{G}" stroke-width="24"', [(0, "opacity:1")])
save("fibra-ceramica", d, b)

# ---------- PROTECCIÓN PASIVA CONTRA INCENDIOS ----------
# 11 Placa fibrosilicato: protege la estructura metálica
d = scene("Placa fibrosilicato Promatect: la viga protegida resiste, la desnuda se deforma", PPCI)
b = f'<rect width="1092" height="26" fill="{PPCI}"/><rect x="0" y="26" width="1092" height="1066" fill="{PL}"/>'
for k, x in enumerate([160, 260, 360]): b += flame(d, x, 470, .3 + k * .3, .9)
for k, x in enumerate([160, 260, 360]): b += flame(d, x, 940, .5 + k * .3, .9)
b += d.el("path", f'd="M120 150H1000V215H120Z" fill="{G}" class="b" style="transform-origin:120px 182px"', [(0, "transform:none"), (1.4, "transform:none"), (3.8, "transform:skewY(5deg) translateY(30px)"), (6.5, "transform:skewY(7deg) translateY(55px)")], "ease-in")
b += d.el("rect", f'x="120" y="150" width="880" height="65" fill="{C}" opacity="0"', [(0, "opacity:0"), (1.4, "opacity:0"), (3.5, "opacity:.55")])
b += thin(120, 590, 880, 65, G) + f'<rect x="100" y="570" width="920" height="105" fill="none" stroke="{M}" stroke-width="14"/><rect x="100" y="570" width="920" height="105" fill="{PA}" opacity=".0"/>'
b += f'<rect x="88" y="560" width="944" height="125" fill="none" stroke="{G}" stroke-width="4"/>'
for k in range(10): b += heat_bounce(d, 700 + (k % 3) * 0, .4 + k * .6, 230 + k * 70, 685, C, 9) if False else ""
for k in range(7): b += mv(d, dot(C, 10), [P(.4 + k * .9, 140 + k * 125, 790, 1, 0), P(.5 + k * .9, 140 + k * 125, 790), P(1.2 + k * .9, 140 + k * 125, 700), P(1.45 + k * .9, 150 + k * 125, 680), P(2.1 + k * .9, 190 + k * 125, 790, .6, 0)])
save("placa-fibrosilicato", d, b)

# 12 Pasta para juntas: junta continua
d = scene("Pasta para juntas: sella la unión entre placas y deja una superficie continua", PPCI)
b = f'<rect width="1092" height="26" fill="{PPCI}"/><rect x="0" y="26" width="546" height="1066" fill="{PL}"/>'
b += slab(250, 220, 270, 650, PA) + slab(572, 220, 270, 650, PA) + f'<rect x="520" y="220" width="52" height="650" fill="{PL}"/>'
for k in range(6): b += mv(d, dot(G, 9), [P(.2 + k * .35, 546, 780 - k * 100, 1, 0), P(.3 + k * .35, 546, 780 - k * 100), P(1.2 + k * .35, 546 + 120, 780 - k * 100 - 40), P(2.2 + k * .35, 546 + 260, 780 - k * 100 - 80, .5, 0)])
b += d.el("rect", f'x="520" y="220" width="52" height="650" fill="{CD}"', [(0, "transform:scaleY(0)"), (2.6, "transform:scaleY(0)"), (4.4, "transform:scaleY(1)")], "ease-in-out", ) .replace('/>', ' style="transform-box:fill-box;transform-origin:50% 0"/>')
b += d.el("g", "", [(0, "opacity:0;transform:translate(546px,200px)"), (2.5, "opacity:1;transform:translate(546px,230px)"), (4.5, "opacity:1;transform:translate(546px,860px)"), (4.8, "opacity:0;transform:translate(546px,860px)")], "ease-in-out").replace("/>", f'><path d="M-80 0L80 0L60 -26L-60 -26Z" fill="{G}"/><rect x="-6" y="-120" width="12" height="96" fill="{G}"/></g>')
for k in range(5): b += mv(d, dot(G, 9), [P(5.2 + k * .4, 460, 760 - k * 120, 1, 0), P(5.3 + k * .4, 460, 760 - k * 120), P(5.9 + k * .4, 505, 760 - k * 120), P(6.2 + k * .4, 480, 740 - k * 120), P(6.8 + k * .4, 400, 700 - k * 120, .5, 0)])
save("pasta-juntas", d, b)

# 13 Masilla cortafuego: sella pasada de cañería
d = scene("Masilla cortafuego: sella el contorno de la cañería y mantiene el muro cortafuego", PPCI)
b = f'<rect width="1092" height="26" fill="{PPCI}"/><rect x="0" y="26" width="546" height="1066" fill="{PL}"/>'
b += slab(500, 120, 92, 380, PA) + slab(500, 590, 92, 380, PA) + thin(100, 525, 900, 40, G) + f'<rect x="500" y="500" width="92" height="90" fill="{PL}"/>'
b += d.el("rect", f'x="500" y="500" width="92" height="22" fill="{CD}"', [(0, "opacity:0"), (1.4, "opacity:0"), (2.2, "opacity:1")]) + d.el("rect", f'x="500" y="568" width="92" height="22" fill="{CD}"', [(0, "opacity:0"), (2.2, "opacity:0"), (3.0, "opacity:1")])
b += d.el("g", "", [(0, "opacity:0;transform:translate(780px,420px)"), (1.2, "opacity:1;transform:translate(660px,470px)"), (2.0, "opacity:1;transform:translate(600px,500px)"), (3.2, "opacity:1;transform:translate(600px,600px)"), (3.6, "opacity:0;transform:translate(600px,600px)")], "ease-in-out").replace("/>", f'><rect x="0" y="-18" width="150" height="36" fill="{G}"/><path d="M0 -10L-40 0L0 10Z" fill="{CD}"/></g>')
b += flame(d, 200, 940, 3.4, 1.1) + flame(d, 320, 940, 3.7, 1.0)
for k in range(6): b += mv(d, dot(C, 10), [P(3.6 + k * .5, 280, 760 - k * 40, 1, 0), P(3.7 + k * .5, 280, 760 - k * 40), P(4.4 + k * .5, 470, 640 - k * 20), P(4.7 + k * .5, 455, 610), P(5.3 + k * .5, 330, 680, .4, 0)])
save("masilla-cortafuego", d, b)

# 14 Cinta intumescente: se expande con el calor
d = scene("Cinta intumescente: se expande con el calor y cierra la junta", PPCI)
b = f'<rect width="1092" height="26" fill="{PPCI}"/><rect x="0" y="26" width="546" height="1066" fill="{PL}"/>'
b += slab(380, 120, 150, 850, PA) + slab(590, 120, 150, 850, PA) + f'<rect x="530" y="120" width="60" height="850" fill="{PL}"/>'
b += d.el("rect", f'x="540" y="500" width="40" height="150" fill="{CD}" class="b"', [(0, "transform:scale(1,1)"), (3.0, "transform:scale(1,1)"), (3.6, "transform:scale(1.5,1.08)"), (4.4, "transform:scale(1.55,5.4)")], "ease-in")
b += d.el("rect", f'x="540" y="500" width="40" height="150" fill="none" stroke="{G}" stroke-width="4" class="b"', [(0, "transform:scale(1,1)"), (3.0, "transform:scale(1,1)"), (3.6, "transform:scale(1.5,1.08)"), (4.4, "transform:scale(1.55,5.4)")], "ease-in")
b += flame(d, 200, 940, .3, 1.1) + flame(d, 300, 940, .5, 1.0)
for k in range(9): b += mv(d, dot(G, 10), [P(.3 + k * .4, 300, 880 - (k % 4) * 90, 1, .0), P(.4 + k * .4, 300, 880 - (k % 4) * 90, 1, .7), P(1.3 + k * .4, 540, 600 - (k % 3) * 25), P(2.4 + k * .4 if k < 5 else 4.6 + (k - 5) * .3, 760 if k < 5 else 500, 560 - (k % 3) * 40, .7, 0) if k < 5 else P(5.0 + (k - 5) * .3, 500, 560, .5, 0)])
save("cinta-intumescente", d, b)

# ---------- TABIQUES Y CIELOS ----------
def partition(d, y0=250, h=590, x=400): return slab(x, y0, 40, h, PA) + slab(x + 240, y0, 40, h, PA)
# 15 Yeso cartón estándar: se arma el tabique
d = scene("Yeso cartón estándar ST: el tabique se arma con montantes y planchas", TAB)
b = f'<rect width="1092" height="26" fill="{TAB}"/><rect x="0" y="26" width="1092" height="1066" fill="{PL}"/>'
b += thin(180, 830, 730, 26, G) + thin(180, 220, 730, 26, G)
for k in range(6): b += d.el("rect", f'x="{210+k*130}" y="246" width="28" height="584" fill="{G}"', [(0, "transform:scaleY(0)"), (.3 + k * .25, "transform:scaleY(0)"), (1.0 + k * .25, "transform:scaleY(1)")], "ease-out").replace("/>", ' style="transform-box:fill-box;transform-origin:50% 100%"/>')
for k in range(3): b += d.el("rect", f'x="{190+k*240}" y="246" width="230" height="584" fill="{PA}" stroke="{G}" stroke-width="4"', [(0, "transform:translateX(0);opacity:0"), (2.6 + k * .9, "transform:translateX(-500px);opacity:0"), (2.7 + k * .9, "transform:translateX(-500px);opacity:1"), (3.5 + k * .9, "transform:none;opacity:1")], "cubic-bezier(.2,.9,.3,1)")
for k in range(12): b += d.el("circle", f'cx="{200 + (k%3)*240 + 18}" cy="{300 + (k//3)*150}" r="7" fill="{G}"', [(0, "opacity:0"), (3.8 + (k % 3) * .9 + (k // 3) * .12, "opacity:0"), (3.9 + (k % 3) * .9 + (k // 3) * .12, "opacity:1")])
save("yeso-estandar", d, b)

# 16 Yeso cartón RF: comparación frente al fuego
d = scene("Yeso cartón RF: el núcleo especial retarda el fuego, el estándar cede", TAB)
b = f'<rect width="1092" height="26" fill="{TAB}"/><rect x="0" y="26" width="1092" height="1066" fill="{PL}"/>'
b += f'<rect x="545" y="26" width="4" height="1066" fill="{G}"/>'
for side, x in ((0, 120), (1, 640)):
    b += flame(d, x + 70, 960, .2, 1.0) + flame(d, x + 200, 960, .4, .9)
    b += slab(x, 300, 300, 40, PA) if False else ""
    if side == 0:
        b += d.el("rect", f'x="{x}" y="300" width="320" height="520" fill="{PA}" stroke="{G}" stroke-width="4" class="b"', [(0, "transform:none;opacity:1"), (3.4, "transform:none;opacity:1"), (4.2, "transform:rotate(4deg) translateY(30px);opacity:1"), (5.6, "transform:rotate(14deg) translateY(300px);opacity:0")], "ease-in", ) .replace('/>', ' style="transform-origin:50% 100%"/>')
        b += d.el("path", f'd="M{x+60} 300L{x+130} 470L{x+90} 560M{x+240} 300L{x+210} 430" fill="none" stroke="{G}" stroke-width="4"', [(0, "opacity:0"), (2.4, "opacity:0"), (3.2, "opacity:1")])
    else:
        b += f'<rect x="{x}" y="300" width="320" height="520" fill="{PA}" stroke="{G}" stroke-width="4"/>' + thin(x + 20, 320, 280, 480, PL)
        b += d.el("rect", f'x="{x}" y="300" width="320" height="520" fill="{C}" opacity="0"', [(0, "opacity:0"), (6.0, "opacity:.18")])
for k in range(6): b += mv(d, dot(C, 10), [P(.5 + k * .55, 640 + 40 + k * 45, 900, 1, 0), P(.6 + k * .55, 640 + 40 + k * 45, 900), P(1.3 + k * .55, 640 + 40 + k * 45, 840), P(1.6 + k * .55, 650 + 40 + k * 45, 850, .5, 0)])
for k in range(3): b += mv(d, dot(C, 10), [P(3.6 + k * .5, 140 + k * 90, 900, 1, 0), P(3.7 + k * .5, 140 + k * 90, 900), P(4.4 + k * .5, 200 + k * 90, 500), P(5.2 + k * .5, 230 + k * 90, 150, .8, 0)])
save("yeso-rf", d, b)

# 17 Yeso cartón RH: baño
d, b = block_scene("Yeso cartón RH: resiste la humedad en baños y cocinas", TAB)
b += slab(500, 150, 90, 700, PA) + thin(430, 150, 70, 700, M) if False else slab(520, 150, 90, 700, PA) + thin(480, 150, 40, 700, M)
for k in range(10):
    y = 220 + (k % 5) * 130; t = .2 + k * .7
    b += mv(d, f'<path d="M0 -16C12 -2 14 8 0 16C-14 8 -12 -2 0 -16Z" fill="{M}"/>', [P(t, 330 + (k % 3) * 40, y - 90, 1, 0), P(t + .1, 330 + (k % 3) * 40, y - 90), P(t + .8, 470, y), P(t + 1.0, 462, y + 6, 1.2, .8), P(t + 2.2, 456, y + 150, .8, 0)])
for k in range(6): b += mv(d, ring(M, 9), [P(2.0 + k * .8, 820, 250 + k * 90, 1, 0), P(2.1 + k * .8, 820, 250 + k * 90), P(3.0 + k * .8, 650, 250 + k * 90), P(3.2 + k * .8, 700, 235 + k * 90, 1, 0)])
save("yeso-rh", d, b)

# 18 Rayos X Safeboard
d = scene("Rayos X Safeboard: la plancha con blindaje detiene la radiación", TAB)
b = f'<rect width="1092" height="26" fill="{TAB}"/><rect x="0" y="26" width="620" height="1066" fill="{PL}"/>'
b += f'<rect x="90" y="470" width="110" height="150" fill="{G}"/><path d="M200 500L330 380V710L200 590Z" fill="{G}"/>' + slab(620, 150, 70, 790, PA) + thin(690, 150, 12, 790, G)
for k in range(9):
    yy = 380 + k * 40; t = .3 + k * .33
    b += mv(d, f'<path d="M0 0H46" stroke="{C}" stroke-width="7" stroke-linecap="round"/>', [P(t, 330, 545 + (yy - 545) * .3, 1, 0), P(t + .1, 330, 545 + (yy - 545) * .3), P(t + 1.1, 600, yy), P(t + 1.3, 612, yy, .5, 0)])
for k in range(2): b += mv(d, f'<path d="M0 0H46" stroke="{C}" stroke-width="7" stroke-linecap="round" opacity=".35"/>', [P(2.0 + k * 1.6, 330, 545, 1, 0), P(2.1 + k * 1.6, 330, 545, 1, .35), P(3.2 + k * 1.6, 640, 545, .5, 0)])
b += d.el("rect", f'x="950" y="440" width="50" height="210" fill="{PL}" stroke="{G}" stroke-width="4"', [(0, "opacity:1")])
save("rayos-x", d, b)

# 19 Yeso cartón Impact
d, b = block_scene("Yeso cartón Impact: absorbe los golpes y no se daña", TAB)
b += d.el("rect", f'x="560" y="170" width="90" height="680" fill="{PA}" stroke="{G}" stroke-width="4" class="b"', [(0, "transform:none")] + sum([[(1.0 + k * 1.7, "transform:none"), (1.12 + k * 1.7, "transform:scale(.94,1.0) translateX(-6px)"), (1.4 + k * 1.7, "transform:none")] for k in range(4)], []), "ease-out")
for k, y in enumerate([300, 450, 600, 740]):
    t = .2 + k * 1.7
    b += mv(d, f'<circle r="34" fill="{C}"/><path d="M-20 -8Q0 -24 20 -8" stroke="{PA}" stroke-width="4" fill="none"/>', [P(t, 120, y - 40, 1, 0), P(t + .1, 120, y - 40), P(t + .9, 500, y, 1, 1), P(t + 1.0, 500, y, 1.0, 1, 1), P(t + 1.12, 506, y, .85, 1.1), P(t + 1.9, 150, y + 80, 1, 0)])
    b += d.el("circle", f'cx="560" cy="{y}" r="20" fill="none" stroke="{G}" stroke-width="4" class="b"', [(0, "opacity:0;transform:scale(.3)"), (t + 1.0, "opacity:0;transform:scale(.3)"), (t + 1.1, "opacity:.8;transform:scale(1)"), (t + 1.6, "opacity:0;transform:scale(3)")], "ease-out")
save("yeso-impacto", d, b)

# 20 Cleaneo: cielo perforado
d = scene("Yeso cartón Cleaneo: las perforaciones absorben el sonido y reducen la reverberación", TAB)
b = f'<rect width="1092" height="26" fill="{TAB}"/><rect x="0" y="26" width="1092" height="1066" fill="{PL}"/><rect x="545" y="26" width="4" height="1066" fill="{G}"/>'
b += slab(60, 180, 440, 36, PA) + fibers(60, 120, 0, 0, 0, 0) if False else slab(60, 180, 440, 36, PA)
b += slab(590, 180, 440, 36, PA) + fibers(590, 100, 440, 80, 20, 60, G, 1, PA, 4, .6) + "".join(f'<rect x="{610+k*54}" y="180" width="20" height="36" fill="{PL}"/>' for k in range(8))
for side, x0 in ((0, 280), (1, 810)):
    for k in range(3):
        t = .3 + k * 2.4
        mode = [(t, x0, 760, 1, 1, 0), (t + .1, x0, 760, 1, 1, 1)]
        if side == 0:
            mode += [(t + 1.4, x0, 250, 1, 1, 1), (t + 1.45, x0, 250, 1, -1, 1), (t + 2.6, x0, 700, 1, -1, 0)]
        else:
            mode += [(t + 1.3, x0, 235, 1, 1, 1), (t + 1.9, x0, 150, .35, .35, 0)]
        b += mv(d, f'<g transform="rotate(-90)">{wave()}</g>', mode)
b += speaker(280, 900) + speaker(810, 900)
save("yeso-cleaneo", d, b)

# 21 Fibrocemento: fachada ventilada
d = scene("Planchas de fibrocemento: la fachada resiste la lluvia y ventila", TAB)
b = f'<rect width="1092" height="26" fill="{TAB}"/><rect x="0" y="26" width="1092" height="1066" fill="{PL}"/>'
b += "".join(f'<rect x="560" y="{150+k*190}" width="70" height="178" fill="{PA}" stroke="{G}" stroke-width="4"/>' for k in range(4)) + thin(700, 150, 24, 760, G) + thin(750, 150, 220, 760, PA) + fibers(750, 150, 220, 760, 30, 80, G, 1, PA, 4, .5)
for k in range(10):
    x = 300 + (k % 5) * 50; t = .1 + k * .7
    b += mv(d, f'<path d="M0 -16C12 -2 14 8 0 16C-14 8 -12 -2 0 -16Z" fill="{M}"/>', [P(t, x, 120, 1, 0), P(t + .1, x, 120), P(t + 1.2, 540 - (k % 3) * 8, 300 + (k % 4) * 150), P(t + 1.4, 540, 300 + (k % 4) * 150 + 10, .9, 0.0)])
    b += mv(d, f'<path d="M0 -16C12 -2 14 8 0 16C-14 8 -12 -2 0 -16Z" fill="{M}"/>', [P(t + 1.3, 548, 300 + (k % 4) * 150 + 10, .9, .7), P(t + 2.3, 550, 520 + (k % 4) * 100, .6, 0)])
for k in range(5): b += mv(d, f'<path d="M0 0V-60" stroke="{M}" stroke-width="7" stroke-linecap="round"/><path d="M-12 -44L0 -62L12 -44" fill="none" stroke="{M}" stroke-width="7" stroke-linecap="round"/>', [P(.4 + k * 1.4, 665, 880, 1, 0), P(.5 + k * 1.4, 665, 880), P(2.2 + k * 1.4, 665, 200), P(2.3 + k * 1.4, 665, 180, 1, 0)])
b += sun(900, 90) if False else ""
save("fibrocemento", d, b)
print("ok")
