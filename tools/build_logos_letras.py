"""10 animaciones del logo donde cada letra es un elemento completo (sin máscaras): se deforma, cae, gira o se transforma.
Uso: python3 tools/build_logos_letras.py -> animations/logo-*.svg"""
import sys, os, random, math
sys.path.insert(0, os.path.dirname(__file__))
from logolib import *

LB = P["letters"]
def geo(i):
    x0, y0, x1, y1 = LB[i]["bbox"]
    return dict(d=LET[i], cx=(x0+x1)/2, cy=(y0+y1)/2, w=x1-x0, h=y1-y0, top=y0, bot=y1)
G_ = [geo(i) for i in range(7)]
SPR = "cubic-bezier(.34,1.56,.64,1)"
def letter(d, i, fill, frames, ease=EASE, attrs=""):
    g = G_[i]
    return d.el("path", f'd="{g["d"]}" fill-rule="evenodd" fill="{fill}" class="b" {attrs}', frames, ease)
def hide(t0, css):  # estado oculto hasta t0
    return [(0, css), (t0, css)]
def frame_stroke(d, col, t0, t1, bgcol=None):
    return d.el("rect", f'x="91" y="86" width="909" height="919" fill="none" stroke="{col}" stroke-width="60" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"',
        [(0, "stroke-dashoffset:1"), (t0, "stroke-dashoffset:1"), (t1, "stroke-dashoffset:0")], "cubic-bezier(.6,0,.3,1)")
def save(n, d, body): open(f"animations/logo-{n}.svg", "w").write(d.svg(body))
O = "transform-origin:50% 100%"

# 1 · Vigas: las letras caen y se aplastan al apoyarse
d = Doc(PA, "Muralia: las letras caen como vigas y se apoyan"); b = frame_stroke(d, C, .2, 1.4)
for i in range(7):
    s = 1.3 + i * .38
    b += letter(d, i, C, hide(s, "opacity:0;transform:translateY(-1200px)") + [
        (s + .01, "opacity:1;transform:translateY(-1200px);animation-timing-function:cubic-bezier(.6,0,.9,.6)"),
        (s + .45, "transform:translateY(0) scale(1,1);animation-timing-function:ease-out"),
        (s + .55, "transform:translateY(0) scale(1.14,.8);animation-timing-function:ease-out"),
        (s + .95, "transform:translateY(0) scale(.97,1.05)"), (s + 1.25, "transform:none")], "linear", f'style="{O}"')
save("vigas", d, b)

# 2 · Del ladrillo a la letra
d = Doc(PA, "Muralia: cada ladrillo se estira hasta ser una letra"); b = ""
for i in range(7):
    g = G_[i]; s = .4 + i * .42; bw, bh = 150, 75
    b += d.el("rect", f'x="{g["cx"]-bw/2}" y="{g["cy"]-bh/2}" width="{bw}" height="{bh}" fill="{C}" class="b"',
        hide(s, "opacity:0;transform:translateY(-500px)") + [(s + .4, "opacity:1;transform:none"), (s + 1.0, "opacity:1;transform:none"), (s + 1.2, "opacity:0;transform:scale(1.1)")], "cubic-bezier(.5,0,.7,1.4)")
    sx, sy = bw / g["w"], bh / g["h"]
    b += letter(d, i, C, hide(s + 1.0, f"opacity:0;transform:scale({sx:.3f},{sy:.3f})") + [
        (s + 1.01, f"opacity:1;transform:scale({sx:.3f},{sy:.3f});animation-timing-function:{SPR}"), (s + 1.9, "transform:none")], "linear")
b += frame_stroke(d, C, 4.6, 5.8)
save("ladrillo-letra", d, b)

# 3 · Deslizamiento elástico sobre grafito
d = Doc(G, "Muralia: las letras deslizan y se estiran hasta su lugar"); b = ""
for i in range(7):
    g = G_[i]; s = .3 + i * .33; k = 1 if i % 2 == 0 else -1
    if i < 4: a, a2 = f"translateX({-1300*k}px) scale(2.6,1)", f"translateX({22*k}px) scale(.94,1.03)"
    else:     a, a2 = f"translateY(900px) scale(1,2.4)", "translateY(-16px) scale(1.03,.95)"
    b += letter(d, i, PA, hide(s, f"opacity:1;transform:{a}") + [(s + .55, f"transform:{a2};animation-timing-function:ease-in-out"), (s + .95, "transform:none")], "cubic-bezier(.1,.8,.2,1)")
b += frame_stroke(d, PA, 3.4, 4.6)
save("elastico", d, b)

# 4 · Despliegue: el cuadrado se expande y las letras crecen desde la línea base
d = Doc(PL, "Muralia: el marco se expande y las letras se despliegan"); 
b = d.el("path", f'd="{FRAME}" fill-rule="evenodd" fill="{C}" class="b"', [(0, "opacity:0;transform:scale(0)"), (.2, "opacity:1;transform:scale(0)"), (1.5, "transform:scale(1.05)"), (1.9, "transform:none")], "cubic-bezier(.3,1.3,.5,1)")
for i in range(7):
    s = 1.8 + i * .3
    b += letter(d, i, C, hide(s, "transform:scaleY(0)") + [(s + .45, "transform:scaleY(1.1)"), (s + .75, "transform:scaleY(.97)"), (s + 1.0, "transform:none")], "ease-out", f'style="{O}"')
save("despliegue", d, b)

# 5 · Flip: las letras se voltean como paletas
d = Doc(M, "Muralia: las letras se voltean como paletas"); b = frame_stroke(d, PL, .2, 1.6)
for i in range(7):
    s = 1.5 + i * .3; ax = "scaleX" if i < 4 else "scaleY"
    b += letter(d, i, PL, hide(s, f"opacity:0;transform:{ax}(0)") + [(s + .01, f"opacity:1;transform:{ax}(0)"), (s + .55, f"transform:{ax}(1.12)"), (s + .8, f"transform:{ax}(.97)"), (s + 1.0, "transform:none")], "ease-out")
save("flip", d, b)

# 6 · Peldaños: las letras suben por escalones, piso por piso
d = Doc(PA, "Muralia: las letras suben escalón por escalón"); b = ""
for r, ids in enumerate([[0, 1, 2], [3, 4, 5, 6]]):
    y = 530 if r == 0 else 940
    b += d.el("rect", f'x="150" y="{y}" width="792" height="14" fill="{G}" style="transform-box:fill-box;transform-origin:0 50%"', [(0, "transform:scaleX(0)"), (.2 + r * .3, "transform:scaleX(0)"), (1.0 + r * .3, "transform:none")], "ease-out")
for i in range(7):
    s = 1.0 + i * .3
    b += letter(d, i, C, hide(s, "transform:translateY(560px)") + [(s + 1.2, "transform:translateY(0)")], "steps(6,end)")
b += frame_stroke(d, C, 4.0, 5.2)
save("peldanos", d, b)

# 7 · Ensamblado: piezas dispersas que vuelan a su sitio, sobre arcilla
random.seed(21)
d = Doc(C, "Muralia: letras dispersas se ensamblan"); b = ""
for i in range(7):
    s = .3 + i * .22; rx, ry = random.choice([-1, 1]) * random.randint(350, 700), random.choice([-1, 1]) * random.randint(300, 700)
    rot = random.choice([-1, 1]) * random.randint(70, 180); sc = random.uniform(.5, 1.8)
    st = f"opacity:0;transform:translate({rx}px,{ry}px) rotate({rot}deg) scale({sc:.2f})"
    b += letter(d, i, PA, hide(s, st) + [(s + .3, f"opacity:1;transform:translate({rx}px,{ry}px) rotate({rot}deg) scale({sc:.2f});animation-timing-function:cubic-bezier(.2,.9,.25,1)"), (s + 1.6, "transform:translate(8px,-6px) rotate(2deg)"), (s + 2.0, "transform:none")], "linear")
b += frame_stroke(d, PA, 3.8, 5.0)
save("ensamblado", d, b)

# 8 · Péndulo: las letras cuelgan del marco y se asientan
d = Doc(PA, "Muralia: las letras cuelgan y se asientan oscilando"); b = frame_stroke(d, C, .1, 1.1)
for i in range(7):
    g = G_[i]; s = 1.0 + i * .22; py = 125 if i < 3 else 548
    sw = [-42, 30, -19, 10, -5, 2, 0]
    fr = hide(s, "opacity:0;transform:rotate(-55deg)") + [(s + .01, "opacity:1;transform:rotate(-55deg)")]
    for k, a in enumerate(sw): fr.append((s + .5 * (k + 1), f"transform:rotate({a}deg)"))
    gx = f'style="transform-box:view-box;transform-origin:{g["cx"]}px {py}px"'
    rope = d.el("line", f'x1="{g["cx"]}" y1="{py}" x2="{g["cx"]}" y2="{g["top"]}" stroke="{G}" stroke-width="6"', [(0, "opacity:1"), (s + 3.6, "opacity:1"), (s + 4.2, "opacity:0")])
    lt = letter(d, i, C, [(0, "opacity:1")], EASE)
    # la cuerda y la letra giran juntas dentro de un grupo
    gk = d.kf(fr, "ease-in-out")
    b += f'<g class="{gk}" {gx}>{rope}{lt}</g>'
save("pendulo", d, b)

# 9 · Sello: las letras se estampan con onda de impacto
d = Doc(PL, "Muralia: las letras se estampan una a una"); b = ""
for i in range(7):
    g = G_[i]; s = .5 + i * .45
    b += d.el("circle", f'cx="{g["cx"]}" cy="{g["cy"]}" r="40" fill="none" stroke="{C}" stroke-width="6" class="b"', [(0, "opacity:0;transform:scale(.3)"), (s + .23, "opacity:0;transform:scale(.3)"), (s + .24, "opacity:.7;transform:scale(.3)"), (s + .9, "opacity:0;transform:scale(5)")], "ease-out")
    b += letter(d, i, C, hide(s, "opacity:0;transform:scale(2.2)") + [(s + .12, "opacity:1;transform:scale(1.6);animation-timing-function:cubic-bezier(.7,0,1,.6)"), (s + .24, "opacity:1;transform:scale(.9);animation-timing-function:ease-out"), (s + .5, "transform:scale(1.04)"), (s + .7, "transform:none")], "linear")
b += d.el("path", f'd="{FRAME}" fill-rule="evenodd" fill="{C}" class="b"', [(0, "opacity:0;transform:scale(1.5)"), (4.0, "opacity:0;transform:scale(1.5);animation-timing-function:cubic-bezier(.7,0,1,.6)"), (4.3, "opacity:1;transform:scale(.97);animation-timing-function:ease-out"), (4.7, "transform:none")], "linear")
save("sello", d, b)

# 10 · Montante a letra: perfiles verticales que se ensanchan hasta ser letras
d = Doc(G, "Muralia: un montante se ensancha hasta ser letra"); b = frame_stroke(d, PA, .1, 1.3)
for i in range(7):
    g = G_[i]; s = 1.0 + i * .38; sw_ = 30
    b += d.el("rect", f'x="{g["cx"]-sw_/2}" y="{g["top"]}" width="{sw_}" height="{g["h"]}" fill="{PA}" class="b" style="{O}"',
        [(0, "transform:scaleY(0)"), (s, "transform:scaleY(0)"), (s + .5, "transform:scaleY(1);opacity:1"), (s + 1.0, "opacity:1"), (s + 1.15, "opacity:0")], "ease-out")
    k = sw_ / g["w"]
    b += letter(d, i, PA, hide(s + 1.0, f"opacity:0;transform:scaleX({k:.3f})") + [(s + 1.01, f"opacity:1;transform:scaleX({k:.3f});animation-timing-function:{SPR}"), (s + 1.8, "transform:none")], "linear")
save("montante", d, b)
print("ok")
