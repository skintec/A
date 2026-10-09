# A
## Animaciones Muralia
- `animations/` SVG animados (web) · `stories/` stories 1080×1920 (HTML + `build_stories.py`) · `media/` MP4 y GIF exportados.
- Exportar: `node tools/render.mjs <archivo> <salida> <ancho> <alto> <segundos> [fps]` (requiere playwright y ffmpeg).
- Previsualizar en local: `sh build-site.sh && npx http-server _site`. Se publica en GitHub Pages con `.github/workflows/pages.yml`.
