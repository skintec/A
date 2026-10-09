# A
## Animaciones Muralia
- `animations/` SVG animados (web) · `stories/` stories 1080×1920 (HTML + `build_stories.py`) · `media/` MP4 y GIF exportados.
- Exportar: `node tools/render.mjs <archivo> <salida> <ancho> <alto> <segundos> [fps]` (requiere playwright y ffmpeg).
- Previsualización: `index.html` en la raíz (GitHub Pages sirve el repositorio directamente).
- Motor de animación de la biblioteca: `tools/anim/*.js` (core, icons, walls, export, ui). Se inserta en `index.html` con `python3 tools/inject_anim.py`.
