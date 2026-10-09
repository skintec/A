"""Genera mosaic.svg: un muro de teselas que se pinta solo (python3 gen_mosaic.py)."""
import random, math
random.seed(7)
cols, rows, s = 16, 8, 50
pal = ["#FF3D57", "#FFB703", "#00B4D8", "#7B2CBF", "#2B2D42", "#F8F4EC"]
out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {cols*s} {rows*s}" role="img" aria-label="Mural en mosaico">',
       '<style>.t{transform-box:fill-box;transform-origin:center;animation:pop 8s ease-in-out infinite}'
       '@keyframes pop{0%{opacity:0;transform:scale(0) rotate(-90deg)}15%,80%{opacity:1;transform:none}95%,100%{opacity:0;transform:scale(.4)}}</style>',
       f'<rect width="{cols*s}" height="{rows*s}" fill="#F8F4EC"/>']
for r in range(rows):
    for c in range(cols):
        d = (c + r) * 0.09 + random.random() * 0.3  # onda diagonal
        col = random.choice(pal)
        shape = random.choice(["rect", "circle"])
        x, y = c*s, r*s
        if shape == "rect":
            out.append(f'<rect class="t" x="{x+3}" y="{y+3}" width="{s-6}" height="{s-6}" rx="8" fill="{col}" style="animation-delay:-{8-d:.2f}s"/>')
        else:
            out.append(f'<circle class="t" cx="{x+s/2}" cy="{y+s/2}" r="{s/2-3}" fill="{col}" style="animation-delay:-{8-d:.2f}s"/>')
out.append('</svg>')
open("mosaic.svg", "w").write("\n".join(out))
