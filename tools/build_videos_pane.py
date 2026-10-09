"""Regenera la pestaña Videos de index.html desde el manifiesto de abajo.
Cada video tiene 1 número global y puede tener varias versiones (se muestra la última; las anteriores se eligen en la tarjeta).
Uso: python3 tools/build_videos_pane.py"""
import html, json, re

def V(base, title, desc, v=1): return dict(v=v, base=base, title=title, desc=desc)
def vid(slug, *versions, svg=True, kind="video"): return dict(slug=slug, versions=list(versions), svg=svg, kind=kind)

LOGO = [
 vid("logo-escritura", V("logo-escritura", "Escritura", "El marco se dibuja y cada letra se escribe")),
 vid("logo-ladrillo", V("logo-ladrillo", "Ladrillo", "Un muro se levanta y se transforma en el logo")),
 vid("logo-capas", V("logo-capas", "Capas", "Capas de aislación forman el logo")),
 vid("logo-grillado", V("logo-grillado", "Grillado", "Una grilla de celdas se unifica en el logo")),
 vid("logo-niveles", V("logo-niveles", "Niveles", "El logo se llena por niveles")),
 vid("logo-plano", V("logo-plano", "Plano técnico", "Trazo de construcción que se rellena"),
     V("logo-plano-v2", "Plano técnico", "Trazo de construcción que se rellena y termina en el logo exacto, sin contornos", 2)),
 vid("logo-vigas", V("logo-vigas", "Vigas", "Las letras caen y se aplastan al apoyarse"),
     V("logo-vigas-v2", "Gelatina", "Marco y letras nacen de un punto y rebotan deformándose", 2)),
 vid("logo-ladrillo-letra", V("logo-ladrillo-letra", "Ladrillo a letra", "Cada ladrillo se estira hasta ser una letra"),
     V("logo-ladrillo-letra-v2", "Ladrillo a letra", "El muro se levanta rápido y sus ladrillos se deforman hasta formar las letras", 2)),
 vid("logo-elastico", V("logo-elastico", "Elástico", "Las letras deslizan y se estiran hasta su lugar"),
     V("logo-elastico-v2", "Acordeón", "La palabra se comprime y se expande como un fuelle hasta asentarse", 2)),
 vid("logo-despliegue", V("logo-despliegue", "Despliegue", "El marco se expande y las letras crecen desde la base")),
 vid("logo-flip", V("logo-flip", "Flip", "Las letras se voltean como paletas")),
 vid("logo-peldanos", V("logo-peldanos", "Peldaños", "Las letras suben escalón por escalón"),
     V("logo-peldanos-v2", "Persiana", "Las letras crecen desde la base en escalones", 2)),
 vid("logo-ensamblado", V("logo-ensamblado", "Ensamblado", "Piezas dispersas vuelan a su sitio"),
     V("logo-ensamblado-v2", "Torsión", "Las letras se retuercen y se enderezan", 2)),
 vid("logo-pendulo", V("logo-pendulo", "Péndulo", "Cuelgan del marco y se asientan oscilando"),
     V("logo-pendulo-v2", "Ola", "Las letras ondulan de altura como un ecualizador hasta asentarse", 2)),
 vid("logo-sello", V("logo-sello", "Sello", "Cada letra se estampa con onda de impacto")),
 vid("logo-montante", V("logo-montante", "Montante", "Un perfil vertical se ensancha hasta ser letra")),
]
STORIES = [
 vid("story-termica", V("story-termica", "Aislación térmica y acústica", "Story 1080 × 1920"), svg=False),
 vid("story-ppci", V("story-ppci", "Protección pasiva contra incendios", "Story 1080 × 1920"), svg=False),
 vid("story-tabiques", V("story-tabiques", "Tabiques y cielos", "Story 1080 × 1920"), svg=False),
]
WEB = [
 vid("grillado", V("grillado", "Grillado", "Composición en grilla que se arma en onda")),
 vid("capas", V("capas", "Sistema en capas", "Aislación capa por capa")),
 vid("web-marquesina", V("web-marquesina", "Marquesina de bloques", "Banner 1600 × 400 en movimiento continuo"), kind="img"),
 vid("web-separador", V("web-separador", "Separador de grilla", "Línea de cuadrados para dividir secciones"), kind="img"),
 vid("web-categorias", V("web-categorias", "Las tres categorías", "Térmica y acústica, protección contra incendios, tabiques y cielos"), kind="img"),
 vid("web-progreso", V("web-progreso", "Barra de progreso", "Barra hecha de capas, para formularios o scroll"), kind="img"),
 vid("web-cortina", V("web-cortina", "Cortina de transición", "Tablas que cubren y descubren la pantalla (1920 × 1080)"), kind="img"),
 vid("web-modular", V("web-modular", "Composición modular", "Post cuadrado: bloques que se arman por filas"), kind="img"),
 vid("loader", V("loader", "Cargador", "Grilla de 3 × 3 que pulsa"), kind="img"),
 vid("hero-grid", V("hero-grid", "Fondo técnico", "Grilla con cuadrados que derivan, para portadas"), kind="img"),
]
def mat(f, t, d): return vid("mat-" + f, V("mat-" + f, t, d), V("mat-" + f + "-v2", t, d, 2))  # v2: más dinámica y con trazo uniforme
MATS = [("Funcionamiento de los materiales · Aislación térmica y acústica", [
 mat("lana-vidrio-pp", "Lana de vidrio con polipropileno blanco", "Aísla bajo la cubierta del galpón: frena calor y ruido de lluvia, y la cara blanca refleja la luz."),
 mat("panel-velo-negro", "Panel velo negro", "Panel rígido detrás de fachadas con juntas abiertas: el velo negro no se nota y aísla térmica y acústicamente."),
 mat("lana-vidrio-libre", "Lana de vidrio libre", "Rellena entretechos y tabiques: el aire atrapado entre sus fibras frena el calor y absorbe el sonido."),
 mat("lana-vidrio-kraft", "Lana de vidrio con papel kraft", "El kraft actúa como barrera de vapor: se instala hacia el lado caliente para evitar condensación."),
 mat("lana-mineral", "Panel de lana mineral", "Más densa que la lana de vidrio: frena el calor industrial y el ruido exigente."),
 mat("frazada-lana-mineral", "Frazada de lana mineral", "La malla permite amarrar la frazada a cañerías y equipos curvos para retener el calor."),
 mat("colchoneta-lana-mineral", "Colchoneta de lana mineral", "Formato compacto que se inserta entre montantes para aislar y absorber ruido en el tabique."),
 mat("panel-ductos", "Panel para ductos (Climaver®)", "El ducto sale aislado y con barrera de aluminio: mantiene la temperatura del aire y atenúa el ruido."),
 mat("banda-elastoacustica", "Banda elastoacústica", "Entre soleras y losa corta el puente acústico: la vibración no pasa de un recinto al otro."),
 mat("fibra-ceramica", "Fibra cerámica", "Contiene el calor donde la lana mineral o de vidrio ya no dan abasto: hornos, calderas y ductos.")]),
 ("Protección pasiva contra incendios", [
 mat("placa-fibrosilicato", "Placa fibrosilicato (Promatect®)", "Protege vigas y pilares metálicos: la estructura desnuda se deforma con el fuego, la protegida se mantiene."),
 mat("pasta-juntas", "Pasta para juntas", "Sella la unión entre placas y deja una superficie continua que no deja pasar el humo."),
 mat("masilla-cortafuego", "Masilla cortafuego (Promaseal® A-S)", "Sella el contorno de cañerías y cables en muros cortafuego para mantener la sectorización."),
 mat("cinta-intumescente", "Cinta intumescente (Promaseal® L)", "Con el calor se expande varias veces su volumen y cierra la junta, deteniendo humo y llamas.")]),
 ("Tabiques y cielos", [
 mat("yeso-estandar", "Yeso cartón estándar (ST)", "Montantes y planchas de 1200 × 2400 mm arman el tabique de uso general."),
 mat("yeso-rf", "Yeso cartón resistente al fuego (RF)", "Su núcleo especial retarda la propagación del fuego; la plancha estándar cede antes."),
 mat("yeso-rh", "Yeso cartón resistente a la humedad (RH)", "Pensado para zonas húmedas: el agua escurre y la plancha mantiene su integridad en baños y cocinas."),
 mat("rayos-x", "Rayos X (Safeboard®)", "El blindaje radiológico detiene la radiación en salas de rayos X, sin plomo."),
 mat("yeso-impacto", "Yeso cartón resistente al impacto (Impact®)", "Mayor resistencia mecánica: absorbe los golpes en pasillos, gimnasios y colegios."),
 mat("yeso-cleaneo", "Yeso cartón con atenuación acústica (Cleaneo®)", "Las perforaciones y el material absorbente detrás reducen la reverberación."),
 mat("fibrocemento", "Planchas de fibrocemento", "Revestimiento rígido para fachadas ventiladas: resiste la lluvia mientras el aire circula por la cámara.")])]
SECTIONS = [
 ("Logo animado", "Todas las ideas del logo oficial en una sola categoría. Cada tarjeta muestra la última versión; con los botones v1, v2… se ven las anteriores.", LOGO, "sq"),
 ("Stories de Instagram", "Una por categoría, misma estructura. 1080 × 1920, 8 s en bucle.", STORIES, "st"),
 ("Piezas para web y redes", "Banners, separadores, transiciones, cargadores, fondos y posts. Los SVG se ven animados aquí mismo y se pueden usar directo en el sitio.", WEB, "sq")]
for k, (t, items) in enumerate(MATS):
    SECTIONS.append((t, "Una animación por producto del catálogo de muralia.cl: cómo frena el calor, absorbe o bloquea el sonido, detiene el fuego o resiste el entorno." if k == 0 else "", items, "sq"))

def ver(item, v):
    b = v["base"]; folder = "animations" if item["kind"] == "img" else "media"
    ext = "svg" if item["kind"] == "img" else "mp4"
    return dict(v=v["v"], src=f"{folder}/{b}.{ext}", mp4=f"media/{b}.mp4" if item["kind"] == "video" else "", gif=f"media/{b}.gif" if item["kind"] == "video" else "",
                svg=f"animations/{b}.svg" if item["svg"] else "", title=v["title"], desc=v["desc"])
def links(x): return "".join(f'<a href="{x[k]}" download>{k.upper()}</a>' for k in ("mp4", "gif", "svg") if x[k])

n = 0
out = ""
for title, intro, items, cls in SECTIONS:
    cards = ""
    for it in items:
        n += 1; vs = [ver(it, v) for v in it["versions"]]; last = vs[-1]
        media = (f'<video class="md" src="{last["src"]}" autoplay muted loop playsinline controls preload="metadata"></video>' if it["kind"] == "video"
                 else f'<img class="md{" cover" if it["slug"]=="hero-grid" else ""}" src="{last["src"]}" alt="{html.escape(last["title"])}" loading="lazy">')
        vbtn = ""
        if len(vs) > 1:
            vbtn = '<div class="vv" role="group" aria-label="Versiones">' + "".join(f'<button type="button" data-i="{i}" aria-pressed="{str(i==len(vs)-1).lower()}">v{x["v"]}</button>' for i, x in enumerate(vs)) + '<em>última: v%d</em></div>' % last["v"]
        name = " ".join((x["title"] + " " + x["desc"]).lower() for x in vs) + " " + title.lower()
        cards += (f'<figure class="vd" data-name="{html.escape(name)}" data-versions="{html.escape(json.dumps(vs, ensure_ascii=False))}">{media}'
                  f'<figcaption><b><span class="vn">{n:02d}</span> <span class="t">{html.escape(last["title"])}</span></b><span class="d">{html.escape(last["desc"])}</span>'
                  f'<div class="vl">{links(last)}</div>{vbtn}</figcaption></figure>')
    out += f'<section class="vsec"><div class="wp-head"><div><h2>{html.escape(title)}</h2>' + (f'<p>{html.escape(intro)}</p>' if intro else '') + f'</div></div><div class="vgrid {cls}">{cards}</div></section>'
TOTAL = n

CSS = """
/*VIDEOS-CSS*/
.vsec{padding-bottom:22px}.vgrid{display:grid;gap:1px;background:var(--line);border:1px solid var(--line)}
.vgrid.sq{grid-template-columns:repeat(auto-fill,minmax(165px,1fr))}.vgrid.st{grid-template-columns:repeat(auto-fill,minmax(115px,1fr))}
.vd{background:var(--paper);display:flex;flex-direction:column;min-width:0}
.vd .md{display:block;width:100%;aspect-ratio:1/1;object-fit:contain;background:var(--graphite)}
.vd img.md{background:var(--paper)}.vd img.md.cover{object-fit:cover}
.vgrid.st .md{aspect-ratio:9/16;object-fit:cover}
.vd figcaption{padding:8px 10px 10px;display:flex!important;flex-direction:column;gap:3px}
.vd figcaption b{font-size:13px;line-height:1.25}.vn{font:400 20px/1 'Bebas Neue',sans-serif;color:var(--clay-dark);margin-right:2px}
.vd figcaption .d{font-size:11.5px;line-height:1.35;color:var(--muted);display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.vl{display:flex;gap:5px;margin-top:5px;flex-wrap:wrap}.vl a{font:600 11px 'Archivo';color:var(--graphite);border:1px solid var(--line);padding:3px 7px;text-decoration:none}.vl a:hover{border-color:var(--clay);color:var(--clay-dark)}
.vv{display:flex;gap:4px;align-items:center;margin-top:6px}.vv button{appearance:none;border:1px solid var(--line);background:var(--paper);font:700 11px 'Archivo';padding:2px 8px;cursor:pointer;color:var(--graphite)}
.vv button[aria-pressed="true"]{background:var(--graphite);color:var(--paper);border-color:var(--graphite)}.vv em{font:11px 'Archivo';color:var(--muted);margin-left:4px}
/*/VIDEOS-CSS*/
"""
JS = """
<script>/*VIDEOS-JS*/
(function(){
  const lk=x=>['mp4','gif','svg'].filter(k=>x[k]).map(k=>'<a href="'+x[k]+'" download>'+k.toUpperCase()+'</a>').join('');
  document.querySelectorAll('#pane-videos .vd[data-versions]').forEach(f=>{
    const vs=JSON.parse(f.dataset.versions);const m=f.querySelector('.md');const bs=f.querySelectorAll('.vv button');
    bs.forEach(b=>b.addEventListener('click',()=>{const x=vs[+b.dataset.i];
      m.src=x.src;if(m.tagName==='VIDEO'){m.load();m.play().catch(()=>{})}else m.alt=x.title;
      f.querySelector('.t').textContent=x.title;f.querySelector('.d').textContent=x.desc;f.querySelector('.vl').innerHTML=lk(x);
      bs.forEach(o=>o.setAttribute('aria-pressed',String(o===b)))}));
  });
})();
/*/VIDEOS-JS*/</script>
"""
p = "index.html"; s = open(p, encoding="utf8").read()
# pane
a = s.index('<div class="pane" id="pane-videos"'); a_end = s.index('>', a) + 1
z = s.index('</div></main>')
s = s[:a_end] + out + s[z:]
# css
s = re.sub(r'\n/\*VIDEOS-CSS\*/.*?/\*/VIDEOS-CSS\*/\n', '\n', s, flags=re.S)
old = s.index('.vsec{padding-bottom:28px}') if '.vsec{padding-bottom:28px}' in s else -1
if old >= 0:
    e = s.index('</style>', old); s = s[:old] + s[e:]
s = s.replace('</style>', CSS + '</style>', 1) if '/*VIDEOS-CSS*/' not in s else s
# js
s = re.sub(r'<script>/\*VIDEOS-JS\*/.*?/\*/VIDEOS-JS\*/</script>\n?', '', s, flags=re.S)
s = s.replace('</body>', JS + '</body>')
s = re.sub(r'Videos<span>\d+</span>', f'Videos<span>{TOTAL}</span>', s)
s = re.sub(r'y \d+ (animaciones|videos animados)', f'y {TOTAL} animaciones', s)
open(p, "w", encoding="utf8").write(s)
print("videos:", TOTAL)
