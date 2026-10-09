"""Genera las 3 stories (1080x1920) de Muralia: python3 build_stories.py
Misma estructura en las tres: logo, grilla animada, titulo, bajada, contacto."""
C, CD, M, G, PL, PA = "#C2551F", "#9C4318", "#3E4A3C", "#2B2A26", "#EFE7DA", "#FFFDF9"
T = 8  # segundos por ciclo

def pat_termica():
    cols = [(PL, 110), (C, 60), (M, 150), (PL, 90), (G, 70), (C, 110), (PL, 80)]
    out, y = [], 0
    for i, (c, h) in enumerate(cols):
        b = f"border:3px solid {G};" if c == PL else ""
        out.append(f'<div class="a slide" style="left:0;top:{y}px;width:880px;height:{h-10}px;background:{c};{b}animation-delay:-{T-0.3-i*.28:.2f}s"></div>')
        y += h
    return "".join(out)

def pat_ppci():
    out, s = [], 110
    for r in range(7):
        for c in range(8):
            fill = r >= 4  # abajo fuego contenido, arriba protegido
            d = 0.3 + (6 - r) * .18 + c * .05
            if fill:
                out.append(f'<div class="a pop" style="left:{c*s}px;top:{r*s}px;width:{s-10}px;height:{s-10}px;background:{C};animation-delay:-{T-d:.2f}s"></div>')
            else:
                out.append(f'<div style="position:absolute;left:{c*s}px;top:{r*s}px;width:{s-16}px;height:{s-16}px;border:3px solid {PA};opacity:.35"></div>')
    out.append(f'<div class="a bar" style="left:0;top:{4*s-22}px;width:880px;height:18px;background:{PA};animation-delay:-{T-1.9:.2f}s"></div>')
    return "".join(out)

def pat_tabiques():
    out = [f'<div class="a slide" style="left:0;top:0;width:880px;height:60px;background:{C};animation-delay:-{T-.3:.2f}s"></div>']
    for i in range(6):
        out.append(f'<div class="a grow" style="left:{40+i*150}px;top:60px;width:30px;height:640px;background:{PA};animation-delay:-{T-.7-i*.15:.2f}s"></div>')
    for i in range(5):
        for j in range(3):
            out.append(f'<div class="a pop" style="left:{80+i*150}px;top:{110+j*190}px;width:110px;height:170px;border:3px solid {PA};background:{M if (i+j)%2 else "#4d5b4a"};animation-delay:-{T-1.8-(i+j)*.18:.2f}s"></div>')
    out.append(f'<div class="a slide" style="left:0;top:700px;width:880px;height:50px;background:{PA};animation-delay:-{T-1.2:.2f}s"></div>')
    return "".join(out)

STORIES = [
 ("termica", PA, G, C, "terracota", "01 / 03", ["AISLACIÓN", "TÉRMICA Y", "ACÚSTICA"], "Confort y eficiencia para minería, celulosa y edificios.", pat_termica),
 ("ppci", G, PA, C, "papel", "02 / 03", ["PROTECCIÓN", "PASIVA CONTRA", "INCENDIOS"], "Sistemas que contienen el fuego y protegen la estructura.", pat_ppci),
 ("tabiques", M, PA, PL, "papel", "03 / 03", ["TABIQUES", "Y CIELOS"], "Tabiquería y cielos para colegios y edificios.", pat_tabiques),
]

CSS = f"""
@font-face{{font-family:Anton;src:url(fonts/anton.ttf)}}
@font-face{{font-family:Oswald;font-weight:400;src:url(fonts/oswald-400.ttf)}}
@font-face{{font-family:Oswald;font-weight:500;src:url(fonts/oswald-500.ttf)}}
*{{box-sizing:border-box;margin:0}}
html,body{{width:1080px;height:1920px;overflow:hidden}}
.s{{position:relative;width:1080px;height:1920px;font-family:Oswald,sans-serif}}
.p{{position:absolute;left:100px;top:400px;width:880px;height:760px;overflow:hidden;transform:scale(.84);transform-origin:top left}}
.logo{{position:absolute;left:100px;top:210px;width:150px;height:150px}}
.n{{position:absolute;right:100px;top:270px;font:500 40px Oswald;letter-spacing:6px}}
h1{{position:absolute;left:100px;top:1090px;font:400 100px/1.02 Anton;text-transform:uppercase}}
.sub{{position:absolute;left:100px;width:820px;font:400 44px/1.25 Oswald}}
.f{{position:absolute;left:100px;right:100px;top:1590px;padding-top:24px;font:500 36px Oswald;letter-spacing:2px;display:flex;justify-content:space-between}}
.a{{position:absolute;animation-duration:{T}s;animation-iteration-count:infinite;animation-timing-function:cubic-bezier(.2,.8,.2,1)}}
.slide{{animation-name:slide}}.pop{{animation-name:pop}}.grow{{animation-name:grow;transform-origin:top}}.bar{{animation-name:bar;transform-origin:left}}
@keyframes slide{{0%{{opacity:0;transform:translateX(-300px)}}8%,86%{{opacity:1;transform:none}}96%,100%{{opacity:0;transform:translateX(300px)}}}}
@keyframes pop{{0%{{opacity:0;transform:scale(0)}}8%,86%{{opacity:1;transform:none}}96%,100%{{opacity:0;transform:scale(.5)}}}}
@keyframes grow{{0%{{transform:scaleY(0)}}10%,86%{{transform:none}}96%,100%{{transform:scaleY(0)}}}}
@keyframes bar{{0%{{transform:scaleX(0)}}10%,86%{{transform:none}}96%,100%{{transform:scaleX(0)}}}}
.t{{opacity:1;animation:txt {T}s infinite}}@keyframes txt{{0%{{opacity:0;transform:translateY(30px)}}10%,88%{{opacity:1;transform:none}}97%,100%{{opacity:0}}}}
@media (prefers-reduced-motion:reduce){{.a,.t{{animation:none!important}}}}
"""

for slug, bg, fg, accent, logo, num, title, sub, pat in STORIES:
    subtop = 1090 + int(len(title) * 102) + 28
    html = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=1080">
<title>Muralia — {' '.join(title).title()}</title><style>{CSS}</style></head>
<body style="background:{bg}"><div class="s" style="background:{bg};color:{fg}">
<img class="logo" src="../brand/logo/muralia-logo-{logo}-transparente.png" alt="Muralia">
<div class="n" style="color:{accent if bg!=PA else CD}">{num}</div>
<div class="p">{pat()}</div>
<h1 class="t" style="color:{fg};animation-delay:-{T-1:.1f}s">{'<br>'.join(title)}</h1>
<p class="sub t" style="top:{subtop}px;animation-delay:-{T-1.4:.1f}s">{sub}</p>
<div class="f" style="border-top:4px solid {accent}"><span>ventas@muralia.cl</span><span>muralia.cl</span></div>
</div></body></html>"""
    open(f"story-{slug}.html", "w").write(html)
