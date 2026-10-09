"""Utilidades compartidas para animar el logo Muralia (SVG + CSS puro) desde brand/logo/logo-paths.json"""
import json, random
C, CD, M, G, PL, PA = "#C2551F", "#9C4318", "#3E4A3C", "#2B2A26", "#EFE7DA", "#FFFDF9"
P = json.load(open("brand/logo/logo-paths.json"))
FRAME, LET = P["frame"], [l["d"] for l in P["letters"]]
T = 8.0
EASE = "cubic-bezier(.3,.7,.2,1)"
RM = "@media (prefers-reduced-motion:reduce){*{animation:none!important}}"

class Doc:
    def __init__(s, bg, label):
        s.css, s.n, s.bg, s.label = [], 0, bg, label
    def kf(s, frames, ease=EASE):
        """frames: [(t, 'css'), ...] en segundos absolutos -> nombre de animación"""
        s.n += 1; k = f"k{s.n}"
        fr = [(0.0, f[1]) if i == 0 and f[0] > 0 else f for i, f in enumerate(frames)]
        if frames[0][0] > 0: fr = [(0, frames[0][1])] + list(frames)
        if fr[-1][0] < T: fr = fr + [(T, fr[-1][1])]
        body = "".join(f"{t/T*100:.3f}%{{{c}}}" for t, c in fr)
        s.css.append(f"@keyframes {k}{{{body}}}.{k}{{animation:{k} {T}s {ease} infinite}}")
        return k
    def el(s, tag, attrs, frames, ease=EASE, extra=""):
        k = s.kf(frames, ease)
        if 'class="b"' in attrs: attrs, extra = attrs.replace('class="b"', ''), "b"
        return f'<{tag} class="{k} {extra}" {attrs}/>'
    def svg(s, body, defs=""):
        fade = s.kf([(0, "opacity:1"), (7.2, "opacity:1"), (7.9, "opacity:0")], "linear")
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1092 1092" role="img" aria-label="{s.label}">'
                f'<style>.b{{transform-box:fill-box;transform-origin:center}}{"".join(s.css)}{RM}</style>'
                f'<defs>{defs}</defs><rect width="1092" height="1092" fill="{s.bg}"/><g class="{fade}">{body}</g></svg>')

def clipdef(i="lg"):
    return f'<clipPath id="{i}"><path clip-rule="evenodd" d="{FRAME}"/>' + "".join(f'<path clip-rule="evenodd" d="{d}"/>' for d in LET) + '</clipPath>'

def letters_draw(d, start, step, stroke, fill, dur=.7, sw=4):
    out = ""
    for i, l in enumerate(LET):
        s = start + i * step
        out += d.el("path", f'd="{l}" pathLength="1" fill="{fill}" fill-rule="evenodd" stroke="{stroke}" stroke-width="{sw}" stroke-dasharray="1 1" stroke-linejoin="round"',
            [(0, "stroke-dashoffset:1;fill-opacity:0"), (s, "stroke-dashoffset:1;fill-opacity:0"), (s + dur, "stroke-dashoffset:0;fill-opacity:0"), (s + dur + .45, "stroke-dashoffset:0;fill-opacity:1")])
    return out

