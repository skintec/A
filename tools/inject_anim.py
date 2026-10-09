"""Inserta la descarga animada en index.html (idempotente). Uso: python3 tools/inject_anim.py"""
import re
p = "index.html"; s = open(p, encoding="utf8").read()
js = "\n".join(open(f"tools/anim/{n}.js", encoding="utf8").read() for n in ("core","icons","walls","export","ui"))
# 1) botón en tarjetas de fondos, manejador y editor
a = '<button type="button" class="cp" data-k="svg">Copiar SVG</button></span></figcaption></figure>\''
if 'data-k="anim">Descargar animado</button></span></figcaption>' not in s:
    assert a in s; s = s.replace(a, '<button type="button" class="cp" data-k="svg">Copiar SVG</button><button type="button" class="cp" data-k="anim">Descargar animado</button></span></figcaption></figure>\'', 1)
old = "if(b.dataset.k==='ed')openEd(i);else copy(b,i,b.dataset.k)"
new = "if(b.dataset.k==='ed')openEd(i);else if(b.dataset.k==='anim')openWpAnim(WP[i],build(i,fmt),fmt);else copy(b,i,b.dataset.k)"
s = re.sub(r"else if\(b\.dataset\.k==='anim'\)MA\.wp\(.*?\);else copy\(b,i,b\.dataset\.k\)", "else if(b.dataset.k==='anim')openWpAnim(WP[i],build(i,fmt),fmt);else copy(b,i,b.dataset.k)", s, flags=re.S)
if "openWpAnim(WP[i]" not in s:
    assert old in s; s = s.replace(old, new, 1)
e = '<button type="button" class="btn2 dark" id="ed-svg">Copiar SVG</button>'
if 'id="ed-anim"' not in s:
    assert e in s; s = s.replace(e, e + '<button type="button" class="btn2 dark" id="ed-anim">Descargar animado</button>', 1)
# 1b) botón "Vista animada" en cada fondo
if 'data-k="live"' not in s:
    a2 = '<button type="button" class="cp" data-k="anim">Descargar animado</button></span></figcaption></figure>\''
    assert a2 in s; s = s.replace(a2, '<button type="button" class="cp" data-k="live">Vista animada</button><button type="button" class="cp" data-k="anim">Descargar animado</button></span></figcaption></figure>\'', 1)
    o2 = "else if(b.dataset.k==='anim')openWpAnim(WP[i],build(i,fmt),fmt);"
    assert o2 in s; s = s.replace(o2, "else if(b.dataset.k==='live')MA.live.toggle(f.querySelector('.th'),WP[i].slug,b);" + o2, 1)
# 2) script
s = re.sub(r'<script>/\*ANIM-JS\*/.*?/\*/ANIM-JS\*/</script>\n?', '', s, flags=re.S)
s = s.replace('</body>', '<script>/*ANIM-JS*/\n' + js + '\n/*/ANIM-JS*/</script>\n</body>')
open(p, "w", encoding="utf8").write(s); print("ok")
