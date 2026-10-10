"""Genera la pestaña «Manual de marca» de index.html desde la carpeta manual/ (contenido del ZIP del manual).
Uso: python3 tools/build_manual_pane.py
Las páginas del PDF se rasterizan antes con pdftoppm en manual/paginas (pagina-NN.jpg y mini-NN.jpg)."""
import html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = "manual"
E = html.escape

PAGES = [
    ("Portada", "Manual de marca"), ("Contenido", "Índice"), ("01 · La marca", "Quiénes somos"),
    ("02 · Nombre", "Muralia"), ("03 · Logotipo", "El logo"), ("03 · Logotipo", "Resguardo y tamaño"),
    ("03 · Logotipo", "Versiones de color"), ("03 · Logotipo", "Usos incorrectos"), ("04 · Color", "Paleta"),
    ("05 · Tipografía", "Familias"), ("05 · Tipografía", "Jerarquía"), ("06 · Recursos gráficos", "Estampados"),
    ("06 · Recursos gráficos", "Elementos técnicos"), ("07 · Tono de voz", "Cómo hablamos"),
    ("08 · Aplicaciones", "Aplicaciones"), ("08 · Aplicaciones", "Reglas clave"),
]

# logo: (archivo svg, nombre, fondo de la vista previa, png base o None)
LOGOS = [
    ("muralia-logo-grafito", "Grafito · principal", "#FFFDF9", "muralia-logo-grafito"),
    ("muralia-logo-arcilla", "Arcilla", "#FFFDF9", "muralia-logo-arcilla"),
    ("muralia-logo-papel", "Papel", "#2B2A26", "muralia-logo-papel"),
    ("muralia-logo-negro", "Negro · monocromo", "#FFFDF9", "muralia-logo-negro"),
    ("muralia-logo-blanco", "Blanco · monocromo", "#3E4A3C", "muralia-logo-blanco"),
]
AVATARS = [
    ("muralia-logo-arcilla-sobre-papel", "Arcilla sobre papel", "muralia-avatar-arcilla-sobre-papel"),
    ("muralia-logo-papel-sobre-arcilla", "Papel sobre arcilla", "muralia-avatar-papel-sobre-arcilla"),
    ("muralia-logo-papel-sobre-grafito", "Papel sobre grafito", "muralia-avatar-papel-sobre-grafito"),
    ("muralia-logo-yeso-sobre-musgo", "Yeso sobre musgo", "muralia-avatar-yeso-sobre-musgo"),
]
FONTS = [
    ("Anton", "Anton", "Titulares", "Títulos, portadas y mensajes cortos. Siempre en mayúsculas, interlineado 1,0.",
     "TABIQUES QUE RESISTEN EL FUEGO", [("Regular", "Anton/Anton-Regular.ttf", 400)], "Anton/OFL.txt", True),
    ("Oswald", "Oswald", "Texto", "Párrafos, subtítulos, fichas técnicas y la web. Light para texto (interlineado 1,45), Regular para bajadas.",
     "Te asesoramos para elegir la solución según el uso del recinto y la ficha técnica de cada sistema.",
     [("Light", "Oswald/Oswald-300.ttf", 300), ("Regular", "Oswald/Oswald-400.ttf", 400), ("Medium", "Oswald/Oswald-500.ttf", 500),
      ("SemiBold", "Oswald/Oswald-600.ttf", 600), ("Bold", "Oswald/Oswald-700.ttf", 700)], "Oswald/OFL.txt", False),
    ("Big Shoulders Display", "BigShoulders", "Cifras y etiquetas", "Datos técnicos, cotas, rótulos y pies de página, con tracking amplio. 800 para etiquetas, 900 para cifras en arcilla.",
     "F-120 · 60 MM · λ 0,035", [("Regular", "Big_Shoulders_Display/BigShouldersDisplay-400.ttf", 400), ("SemiBold", "Big_Shoulders_Display/BigShouldersDisplay-600.ttf", 600),
      ("ExtraBold", "Big_Shoulders_Display/BigShouldersDisplay-800.ttf", 800), ("Black", "Big_Shoulders_Display/BigShouldersDisplay-900.ttf", 900)], "Big_Shoulders_Display/OFL.txt", False),
    ("Alfa Slab One", "AlfaSlab", "Acento", "Uso puntual: una palabra o cifra destacada por pieza. Nunca en párrafos.",
     "25+ años", [("Regular", "Alfa_Slab_One/AlfaSlabOne-Regular.ttf", 400)], "Alfa_Slab_One/OFL.txt", False),
]
GFONTS = [("Bebas Neue", "Usadas_en_elementos_graficos/BebasNeue-Regular.ttf", "Sello y marcadores"),
          ("Archivo 700", "Usadas_en_elementos_graficos/Archivo-700.ttf", "Cota y rótulos técnicos")]
PATTERNS = [("marco", "Marco", "Eco del recuadro del logo"), ("montantes", "Montantes", "Perfiles de tabiquería"),
            ("aparejo", "Aparejo", "Muro trabado"), ("achurado", "Achurado", "Corte de plano técnico"), ("lana", "Lana", "Bucle de la lana mineral")]
PCOL = [("arcilla", "Arcilla"), ("grafito", "Grafito"), ("yeso", "Yeso")]
ELEMS = [("sello", "Sello"), ("cota", "Cota"), ("esquineras", "Esquineras"), ("banda", "Banda")]
ECOL = [("arcilla", "Arcilla", "#FFFDF9"), ("grafito", "Grafito", "#FFFDF9"), ("papel", "Papel", "#2B2A26")]


def size(p):
    b = os.path.getsize(os.path.join(ROOT, p))
    return f"{b/1048576:.1f} MB".replace(".", ",") if b > 1048576 else f"{max(1, round(b/1024))} KB"


def dl(href, label, primary=False, name=None):
    cls = "mm-b pri" if primary else "mm-b"
    return f'<a class="{cls}" href="{E(href)}" download{"" if not name else "="+chr(34)+E(name)+chr(34)}>{E(label)}</a>'


def build():
    col = json.load(open(os.path.join(ROOT, M, "03_Color/muralia-colores.json"), encoding="utf-8"))
    pdf = f"{M}/01_Manual/Muralia_Manual_de_Marca.pdf"
    zp = f"{M}/Muralia_Manual_de_Marca.zip"
    h = []
    h.append('<div class="pane" id="pane-manual" role="tabpanel" aria-labelledby="tab-manual" hidden>')
    h.append('<div class="mm-head"><p>Manual de marca de Muralia, versión 1.0 (octubre 2026): la marca, el nombre, el logotipo, el color, la tipografía, '
             'los recursos gráficos, el tono de voz y las aplicaciones. Aquí puedes hojearlo y descargar cada archivo por separado.</p>'
             f'<div class="mm-acts">{dl(pdf, "Descargar PDF · " + size(pdf), True)}{dl(zp, "Todo el manual · ZIP " + size(zp))}</div></div>')
    h.append('<nav class="mm-nav" aria-label="Secciones del manual"><a href="#mm-paginas">Páginas</a><a href="#mm-logo">Logotipo</a>'
             '<a href="#mm-color">Color</a><a href="#mm-tipo">Tipografía</a><a href="#mm-recursos">Recursos gráficos</a></nav>')
    # páginas
    h.append('<section class="mm-sec" id="mm-paginas"><div class="mm-sh"><h2>Páginas</h2><p>16 láminas A4 horizontal. Usa las flechas o el teclado (← →) para recorrerlas.</p></div>')
    h.append('<div class="mm-view"><div class="mm-stage"><img id="mm-big" src="manual/paginas/pagina-01.jpg" alt="Página 1 del manual" width="1600" height="1131">'
             '<button type="button" class="mm-arr prev" aria-label="Página anterior">‹</button><button type="button" class="mm-arr next" aria-label="Página siguiente">›</button></div>'
             '<div class="mm-cap"><span id="mm-ch"></span><b id="mm-pt"></b><em id="mm-pn"></em></div></div><ol class="mm-thumbs">')
    for i, (ch, t) in enumerate(PAGES, 1):
        h.append(f'<li><button type="button" data-p="{i}" data-ch="{E(ch)}" data-t="{E(t)}" aria-pressed="{"true" if i == 1 else "false"}">'
                 f'<img src="manual/paginas/mini-{i:02d}.jpg" alt="" loading="lazy" width="320" height="226"><span><i>{i:02d}</i>{E(t)}</span></button></li>')
    h.append('</ol></section>')
    # logo
    h.append('<section class="mm-sec" id="mm-logo"><div class="mm-sh"><h2>Logotipo</h2><p>Un wordmark en dos líneas, MUR / ALIA, encerrado en un marco cuadrado. '
             'Es una sola pieza: marco y letras no se separan, no se reordenan y no se reescriben.</p></div>')
    h.append('<div class="mm-rules"><div><b>Resguardo</b><span>2X libre por lado (X = grosor del marco)</span></div><div><b>Mínimo impreso</b><span>15 mm</span></div>'
             '<div><b>Mínimo digital</b><span>48 px</span></div><div><b>Favicon</b><span>16 px, arcilla sobre transparente</span></div>'
             '<div class="no"><b>No</b><span>deformar, rotar, usar azul, celeste ni rojo, quitar el marco, agregar sombras o palabras</span></div></div>')
    h.append('<h3 class="mm-h3">Fondo transparente</h3><div class="mm-grid">')
    for f, n, bg, p in LOGOS:
        h.append(f'<figure class="mm-card"><div class="mm-pv" style="background:{bg}"><img src="{M}/02_Logo/SVG/{f}.svg" alt="Logo Muralia {E(n)}" loading="lazy"></div>'
                 f'<figcaption><b>{E(n)}</b><div class="mm-dl">{dl(f"{M}/02_Logo/SVG/{f}.svg", "SVG")}{dl(f"{M}/02_Logo/PNG/{p}-500px.png", "PNG 500")}'
                 f'{dl(f"{M}/02_Logo/PNG/{p}-2000px.png", "PNG 2000")}</div></figcaption></figure>')
    h.append('</div><h3 class="mm-h3">Con fondo · avatares y perfiles</h3><div class="mm-grid">')
    for f, n, a in AVATARS:
        h.append(f'<figure class="mm-card"><div class="mm-pv full"><img width="128" height="128" src="{M}/02_Logo/SVG/{f}.svg" alt="Logo Muralia {E(n)}" loading="lazy"></div>'
                 f'<figcaption><b>{E(n)}</b><div class="mm-dl">{dl(f"{M}/02_Logo/SVG/{f}.svg", "SVG")}{dl(f"{M}/02_Logo/PNG/{a}-1080px.png", "PNG 1080")}</div></figcaption></figure>')
    fv = f"{M}/02_Logo/Favicon"
    h.append(f'<figure class="mm-card"><div class="mm-pv" style="background:#FFFDF9"><img src="{fv}/favicon.svg" alt="Favicon" style="width:64px;height:64px" loading="lazy"></div>'
             f'<figcaption><b>Favicon</b><div class="mm-dl">{dl(fv + "/favicon.svg", "SVG")}{dl(fv + "/favicon.ico", "ICO")}{dl(fv + "/favicon-192.png", "192")}'
             f'{dl(fv + "/favicon-512.png", "512")}{dl(fv + "/apple-touch-icon.png", "Apple")}</div></figcaption></figure></div></section>')
    # color
    h.append('<section class="mm-sec" id="mm-color"><div class="mm-sh"><h2>Color</h2><p>Fondos claros de papel y yeso dominan; grafito y musgo dan peso; la arcilla es el acento. '
             'Azul, celeste y rojo no se usan en ningún punto de contacto. Toca un color para copiar su HEX.</p></div><div class="mm-pal">')
    tok = {"clay": "--clay", "clay-dark": "--clay-dark", "moss": "--moss", "graphite": "--graphite", "plaster": "--plaster", "paper": "--paper"}
    for k, c in col.items():
        if k.startswith("_"):
            continue
        light = sum(c["rgb"]) > 600
        h.append(f'<button type="button" class="mm-sw" data-hex="{c["hex"]}"><span class="chip" style="background:{c["hex"]};color:{"#2B2A26" if light else "#FFFDF9"}">'
                 f'<b>{E(c["nombre"])}</b><em>{c["hex"]}</em></span><span class="meta"><span>RGB {" ".join(map(str, c["rgb"]))}</span>'
                 f'<span>CMYK {" ".join(map(str, c["cmyk_aprox"]))}</span><code>{tok.get(k, "--" + k)}</code><small>{E(c.get("uso", ""))}</small></span></button>')
    h.append(f'</div><div class="mm-files">{dl(M + "/03_Color/muralia-colores.json", "Paleta JSON")}{dl(M + "/03_Color/muralia-tokens.css", "Tokens CSS")}'
             f'{dl(M + "/03_Color/muralia-paleta.png", "Lámina PNG")}</div></section>')
    # tipografía
    h.append('<section class="mm-sec" id="mm-tipo"><div class="mm-sh"><h2>Tipografía</h2><p>Cuatro familias de Google Fonts con licencia abierta (SIL OFL) y uso comercial libre.</p></div><div class="mm-fonts">')
    for name, fam, role, use, sample, ws, lic, up in FONTS:
        wbtn = "".join(dl(f"{M}/04_Tipografias/{p}", w) for w, p, _ in ws)
        h.append(f'<article class="mm-font"><header><span>{E(role)}</span><h3 style="font-family:\'mm{fam}\'">{E(name)}</h3></header>'
                 f'<p class="spec" style="font-family:\'mm{fam}\';font-weight:{ws[0][2] if fam != "Oswald" else 300}{";text-transform:uppercase" if up else ""}">{E(sample)}</p>'
                 f'<p class="abc" style="font-family:\'mm{fam}\'">ABCDEFGHIJKLMNÑOPQRSTUVWXYZ<br>abcdefghijklmnñopqrstuvwxyz 0123456789</p>'
                 f'<p class="use">{E(use)}</p><div class="mm-dl">{wbtn}{dl(f"{M}/04_Tipografias/{lic}", "Licencia")}</div></article>')
    h.append('</div><h3 class="mm-h3">Usadas en elementos gráficos</h3><div class="mm-files">')
    for n, p, u in GFONTS:
        h.append(dl(f"{M}/04_Tipografias/{p}", f"{n} · {u}"))
    h.append('</div></section>')
    # recursos
    h.append('<section class="mm-sec" id="mm-recursos"><div class="mm-sh"><h2>Recursos gráficos</h2><p>Estampados repetibles basados en grilla, para portadas, banners y stories '
             '(nunca detrás de textos largos), y elementos técnicos con fondo transparente.</p></div><h3 class="mm-h3">Estampados</h3><div class="mm-grid pat">')
    for s, n, d in PATTERNS:
        for c, cn in PCOL:
            b = f"{M}/05_Graficos/Estampados/muralia-{s}-{c}"
            h.append(f'<figure class="mm-card"><div class="mm-pv tile" style="background-image:url(\'{b}.svg\')" role="img" aria-label="Estampado {E(n)} {E(cn)}"></div>'
                     f'<figcaption><b>{E(n)} · {cn}</b><small>{E(d)}</small><div class="mm-dl">{dl(b + ".svg", "SVG")}{dl(b + "-1080px.png", "PNG 1080")}</div></figcaption></figure>')
    h.append('</div><h3 class="mm-h3">Elementos técnicos</h3><div class="mm-grid">')
    for s, n in ELEMS:
        for c, cn, bg in ECOL:
            b = f"{M}/05_Graficos/Elementos/muralia-{s}-{c}"
            h.append(f'<figure class="mm-card"><div class="mm-pv" style="background:{bg}"><img src="{b}.svg" alt="{E(n)} {E(cn)}" loading="lazy"></div>'
                     f'<figcaption><b>{E(n)} · {cn}</b><div class="mm-dl">{dl(b + ".svg", "SVG")}{dl(b + ".png", "PNG")}</div></figcaption></figure>')
    h.append('</div></section></div>')
    return "".join(h)


def fontfaces():
    out = []
    for name, fam, role, use, sample, ws, lic, up in FONTS:
        for w, p, wt in ws:
            out.append(f"@font-face{{font-family:'mm{fam}';src:url('{M}/04_Tipografias/{p}') format('truetype');font-weight:{wt};font-display:swap}}")
    return "".join(out)


CSS = r"""
#pane-manual{padding-bottom:40px}
.mm-head{display:flex;flex-wrap:wrap;gap:16px 32px;align-items:flex-end;justify-content:space-between;margin:28px 0 18px}
.mm-head p{max-width:640px;margin:0;color:var(--muted)}
.mm-acts,.mm-dl,.mm-files{display:flex;flex-wrap:wrap;gap:6px}
.mm-b{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:1px solid var(--line);background:var(--paper);color:var(--graphite);font:600 12px 'Archivo',sans-serif;text-decoration:none;border-radius:2px;white-space:nowrap}
.mm-b::before{content:"";width:12px;height:12px;background:currentColor;-webkit-mask:var(--mm-dl) center/contain no-repeat;mask:var(--mm-dl) center/contain no-repeat}
.mm-b:hover{border-color:var(--clay);color:var(--clay-dark)}
.mm-b.pri{background:var(--graphite);border-color:var(--graphite);color:var(--paper)}
.mm-b.pri:hover{background:var(--clay-dark);border-color:var(--clay-dark);color:var(--paper)}
.mm-dl .mm-b{height:28px;padding:0 9px;font-size:11px}
.mm-nav{position:sticky;top:calc(var(--barh,0px) + var(--tabh,0px));z-index:3;display:flex;gap:0;overflow-x:auto;scrollbar-width:none;background:var(--plaster);border-bottom:1px solid var(--line);margin-bottom:8px}
.mm-nav a{padding:12px 14px 10px;font:600 12.5px 'Archivo',sans-serif;color:#55544c;text-decoration:none;border-bottom:2px solid transparent;white-space:nowrap}
.mm-nav a:first-child{padding-left:0}
.mm-nav a:hover,.mm-nav a.on{color:var(--graphite);border-bottom-color:var(--clay)}
.mm-sec{padding:32px 0 16px;scroll-margin-top:calc(var(--barh,0px) + var(--tabh,0px) + 48px)}
.mm-sh{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 24px;margin-bottom:18px}
.mm-sh h2{font:400 40px/1 'Bebas Neue','Oswald',sans-serif;margin:0;letter-spacing:.3px}
.mm-sh p{margin:0;max-width:720px;color:var(--muted)}
.mm-h3{font:700 11px 'Archivo',sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:var(--clay-dark);margin:26px 0 10px}
.mm-view{background:var(--paper);border:1px solid var(--line)}
.mm-stage{position:relative;background:#E6DDCD;padding:24px;display:grid;place-items:center}
.mm-stage img{display:block;width:100%;max-width:1040px;height:auto;box-shadow:0 10px 30px -14px rgba(43,42,38,.45)}
.mm-arr{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:56px;border:1px solid var(--line);background:var(--paper);font:400 30px/1 'Archivo';color:var(--graphite);cursor:pointer;border-radius:2px}
.mm-arr:hover{border-color:var(--clay);color:var(--clay-dark)}
.mm-arr.prev{left:12px}.mm-arr.next{right:12px}
.mm-cap{display:flex;gap:6px 16px;align-items:baseline;flex-wrap:wrap;padding:12px 16px;border-top:1px solid var(--line)}
.mm-cap span{font:700 11px 'Archivo';letter-spacing:1.3px;text-transform:uppercase;color:var(--clay-dark)}
.mm-cap b{font:600 15px 'Archivo'}
.mm-cap em{margin-left:auto;font:700 12px 'Archivo';font-style:normal;color:var(--muted)}
.mm-thumbs{list-style:none;margin:12px 0 0;padding:0;display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px}
.mm-thumbs button{appearance:none;display:block;width:100%;padding:0;border:1px solid var(--line);background:var(--paper);cursor:pointer;text-align:left;border-radius:2px;overflow:hidden}
.mm-thumbs img{display:block;width:100%;height:auto;aspect-ratio:1600/1131;object-fit:cover}
.mm-thumbs span{display:flex;gap:6px;padding:6px 8px;font:600 11px/1.3 'Archivo';color:#55544c;min-height:30px}
.mm-thumbs i{font-style:normal;font-weight:700;color:var(--clay-dark)}
.mm-thumbs button:hover{border-color:var(--clay)}
.mm-thumbs button[aria-pressed="true"]{border-color:var(--graphite);box-shadow:0 0 0 1px var(--graphite)}
.mm-rules{display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) 2fr;border:1px solid var(--line);background:var(--paper)}
.mm-rules div{padding:12px 14px;border-left:1px solid var(--line);display:grid;gap:2px}
.mm-rules div:first-child{border-left:0}
.mm-rules b{font:700 10.5px 'Archivo';letter-spacing:1.3px;text-transform:uppercase;color:var(--clay-dark)}
.mm-rules span{font-size:13px}
.mm-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--line);border-left:1px solid var(--line)}
.mm-grid.pat{grid-template-columns:repeat(6,minmax(0,1fr))}
.mm-card{margin:0;background:var(--paper);border-right:1px solid var(--line);border-bottom:1px solid var(--line);display:flex;flex-direction:column;min-width:0}
.mm-pv{height:176px;display:grid;place-items:center;padding:28px;box-sizing:border-box;border-bottom:1px solid var(--line);overflow:hidden;flex:none}
.mm-pv img{display:block;max-width:100%;max-height:100%;width:auto;height:112px;object-fit:contain}
.mm-pv.full{background:var(--plaster)}.mm-pv.full img{width:128px;height:128px;max-height:none;object-fit:contain;box-shadow:0 8px 20px -12px rgba(43,42,38,.5)}
.mm-pv.tile{background-size:80px 80px;background-repeat:repeat;padding:0}
.mm-card figcaption{padding:12px 12px 14px;display:grid;grid-template-columns:minmax(0,1fr)!important;gap:8px;align-content:start;flex:1;border-top:0;font-size:13px}
.mm-card figcaption b{font:600 13px 'Archivo'}
.mm-card figcaption small{color:var(--muted);font-size:12px;margin-top:-6px}
.mm-pal{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));border:1px solid var(--line);background:var(--paper)}
.mm-sw{appearance:none;border:0;border-left:1px solid var(--line);background:none;padding:0;text-align:left;cursor:pointer;display:flex;flex-direction:column;font:inherit;color:inherit}
.mm-sw:first-child{border-left:0}
.mm-sw .chip{height:136px;padding:14px;display:flex;flex-direction:column;justify-content:flex-end;gap:2px;border-bottom:1px solid var(--line)}
.mm-sw .chip b{font:400 24px/1 'Bebas Neue','Oswald',sans-serif;letter-spacing:.4px}
.mm-sw .chip em{font:700 12px 'Archivo';font-style:normal;opacity:.85}
.mm-sw .meta{padding:12px 14px 14px;display:grid;gap:3px;font-size:12px;color:var(--muted)}
.mm-sw code{font:700 11.5px ui-monospace,monospace;color:var(--graphite)}
.mm-sw small{margin-top:4px;font-size:12px;line-height:1.4}
.mm-sw:hover .chip{box-shadow:inset 0 0 0 3px rgba(255,253,249,.35)}
.mm-sw.ok .chip em::after{content:" · copiado"}
.mm-files{margin-top:12px}
.mm-fonts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border-top:1px solid var(--line);border-left:1px solid var(--line)}
.mm-font{background:var(--paper);border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:20px 20px 18px;display:grid;gap:12px;align-content:start;min-width:0}
.mm-font header{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
.mm-font header span{font:700 10.5px 'Archivo';letter-spacing:1.3px;text-transform:uppercase;color:var(--clay-dark)}
.mm-font h3{margin:0;font-size:26px;font-weight:400;order:-1}
.mm-font .spec{margin:0;font-size:34px;line-height:1.05;color:var(--graphite);overflow-wrap:anywhere}
.mm-font .abc{margin:0;font-size:16px;line-height:1.4;color:var(--muted);overflow-wrap:anywhere}
.mm-font .use{margin:0;font-size:13px;color:var(--muted)}
@media (max-width:1000px){.mm-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.mm-grid.pat{grid-template-columns:repeat(3,minmax(0,1fr))}.mm-pal{grid-template-columns:repeat(3,minmax(0,1fr))}
  .mm-sw:nth-child(4){border-left:0}.mm-sw:nth-child(n+4){border-top:1px solid var(--line)}.mm-thumbs{grid-template-columns:repeat(4,minmax(0,1fr))}
  .mm-rules{grid-template-columns:repeat(2,minmax(0,1fr))}.mm-rules div:nth-child(odd){border-left:0}.mm-rules div:nth-child(n+3){border-top:1px solid var(--line)}.mm-rules .no{grid-column:1/-1}}
@media (max-width:640px){.mm-fonts{grid-template-columns:1fr}.mm-pal{grid-template-columns:repeat(2,minmax(0,1fr))}.mm-sw:nth-child(odd){border-left:0}.mm-sw:nth-child(4){border-left:1px solid var(--line)}
  .mm-sw:nth-child(n+3){border-top:1px solid var(--line)}.mm-thumbs{grid-template-columns:repeat(3,minmax(0,1fr))}.mm-stage{padding:10px}.mm-arr{width:32px;height:44px;font-size:24px}
  .mm-arr.prev{left:4px}.mm-arr.next{right:4px}.mm-pv{height:140px;padding:20px}.mm-pv img{height:88px}.mm-pv.full img{width:96px;height:96px}.mm-font .spec{font-size:26px}.mm-sh h2{font-size:34px}}
"""

JS = r"""
(function(){
  const pane=document.getElementById('pane-manual');if(!pane)return;
  const dlI='url("data:image/svg+xml,'+encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path d='M8 2.5v7.5M4.8 7 8 10.2 11.2 7M3 13.2h10' fill='none' stroke='black' stroke-width='1.6'/></svg>")+'")';
  pane.style.setProperty('--mm-dl',dlI);
  const btns=[...pane.querySelectorAll('.mm-thumbs button')],big=document.getElementById('mm-big'),N=btns.length;let cur=1;
  function go(p){cur=(p-1+N)%N+1;const b=btns[cur-1];big.src='manual/paginas/pagina-'+String(cur).padStart(2,'0')+'.jpg';big.alt='Página '+cur+' del manual: '+b.dataset.t;
    document.getElementById('mm-ch').textContent=b.dataset.ch;document.getElementById('mm-pt').textContent=b.dataset.t;document.getElementById('mm-pn').textContent=cur+' / '+N;
    btns.forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));
    for(const k of [cur+1,cur-1]){if(k>=1&&k<=N){const im=new Image();im.src='manual/paginas/pagina-'+String(k).padStart(2,'0')+'.jpg'}}}
  btns.forEach(b=>b.addEventListener('click',()=>{go(+b.dataset.p);const v=pane.querySelector('.mm-view');const r=v.getBoundingClientRect();if(r.top<0||r.top>innerHeight*.5)v.scrollIntoView({behavior:'smooth',block:'center'})}));
  pane.querySelector('.mm-arr.prev').addEventListener('click',()=>go(cur-1));
  pane.querySelector('.mm-arr.next').addEventListener('click',()=>go(cur+1));
  addEventListener('keydown',e=>{if(pane.hidden||/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;if(e.key==='ArrowRight')go(cur+1);if(e.key==='ArrowLeft')go(cur-1)});
  let sx=null;const st=pane.querySelector('.mm-stage');st.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  st.addEventListener('touchend',e=>{if(sx===null)return;const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>40)go(cur+(d<0?1:-1));sx=null});
  go(1);
  pane.querySelectorAll('.mm-sw').forEach(b=>b.addEventListener('click',()=>{const hx=b.dataset.hex;
    (navigator.clipboard?navigator.clipboard.writeText(hx):Promise.reject()).catch(()=>{}).finally(()=>{b.classList.add('ok');setTimeout(()=>b.classList.remove('ok'),1400)})}));
  const links=[...pane.querySelectorAll('.mm-nav a')];
  addEventListener('scroll',()=>{if(pane.hidden)return;const y=(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--barh'))||0)+(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tabh'))||0)+60;let on=null;
    links.forEach(a=>{const s=document.querySelector(a.getAttribute('href'));if(s&&s.getBoundingClientRect().top-y<=0)on=a});links.forEach(a=>a.classList.toggle('on',a===on))},{passive:true});
})();
"""


def main():
    p = os.path.join(ROOT, "index.html")
    s = open(p, encoding="utf-8").read()
    pane = "<!--MANUAL-->" + build() + "<!--/MANUAL-->"
    if "<!--MANUAL-->" in s:
        s = re.sub(r"<!--MANUAL-->.*?<!--/MANUAL-->", lambda m: pane, s, flags=re.S)
    else:
        s = s.replace("</main>", pane + "</main>", 1)
    css = "<style>/*MANUAL-CSS*/" + fontfaces() + CSS + "/*/MANUAL-CSS*/</style>"
    if "/*MANUAL-CSS*/" in s:
        s = re.sub(r"<style>/\*MANUAL-CSS\*/.*?/\*/MANUAL-CSS\*/</style>", lambda m: css, s, flags=re.S)
    else:
        s = s.replace("</head>", css + "\n</head>", 1)
    js = "<script>/*MANUAL-JS*/" + JS + "/*/MANUAL-JS*/</script>"
    if "/*MANUAL-JS*/" in s:
        s = re.sub(r"<script>/\*MANUAL-JS\*/.*?/\*/MANUAL-JS\*/</script>", lambda m: js, s, flags=re.S)
    else:
        s = s.replace("</body>", js + "\n</body>", 1)
    # pestaña y conmutación
    if 'id="tab-manual"' not in s:
        s = s.replace('aria-selected="false">Videos<span>', 'aria-selected="false">Videos<span>', 1)
        s = re.sub(r'(<button type="button" role="tab" id="tab-videos"[^>]*>.*?</button>)',
                   lambda m: m.group(1) + '\n<button type="button" role="tab" id="tab-manual" aria-controls="pane-manual" aria-selected="false">Manual de marca<span>v1.0</span></button>', s, count=1, flags=re.S)
        s = s.replace("videos:document.getElementById('tab-videos')}", "videos:document.getElementById('tab-videos'),manual:document.getElementById('tab-manual')}", 1)
        s = s.replace("videos:document.getElementById('pane-videos')}", "videos:document.getElementById('pane-videos'),manual:document.getElementById('pane-manual')}", 1)
        s = s.replace("sw.hidden=k!=='el';cats.hidden=k!=='el';", "sw.hidden=k!=='el';cats.hidden=k!=='el';document.querySelector('.bar').hidden=k==='manual';if(history.replaceState)history.replaceState(null,'',k==='el'?location.pathname:'#'+k);", 1)
        s = s.replace("tabs.videos.addEventListener('click',()=>show('videos'));", "tabs.videos.addEventListener('click',()=>show('videos'));\n  tabs.manual.addEventListener('click',()=>show('manual'));", 1)
        s = s.replace("if(location.hash==='#videos')show('videos');", "if(location.hash==='#videos')show('videos');if(location.hash==='#manual')show('manual');", 1)
    open(p, "w", encoding="utf-8").write(s)
    print("ok", len(s) // 1024, "KB")


if __name__ == "__main__":
    main()
