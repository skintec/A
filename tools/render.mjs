// Uso: node tools/render.mjs <archivo.html|svg> <salida-sin-ext> <ancho> <alto> <segundos> [fps]
// Renderiza cuadro a cuadro moviendo la línea de tiempo de las animaciones (determinista) y codifica MP4 + GIF.
import { createRequire } from 'module';
import { execSync } from 'child_process';
import fs from 'fs'; import path from 'path'; import os from 'os';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const [file, out, W, H, secs, fps = '30'] = process.argv.slice(2);
const w = +W, h = +H, F = +fps, n = Math.round(+secs * F);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'frames-'));
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const pg = await b.newPage({ viewport: { width: w, height: h } });
await pg.goto('file://' + path.resolve(file)); await pg.evaluate(() => document.fonts.ready);
await pg.waitForTimeout(300);
const hasSvg = file.endsWith('.svg');
for (let i = 0; i < n; i++) {
  const t = (i / F) * 1000;
  await pg.evaluate((t) => {
    const root = document.documentElement;
    const as = root.getAnimations ? document.getAnimations() : [];
    as.forEach(a => { a.pause(); a.currentTime = t; });
    if (root.pauseAnimations) root.setCurrentTime(t / 1000);
  }, t);
  await pg.screenshot({ path: path.join(tmp, String(i).padStart(4, '0') + '.png') });
}
await b.close();
fs.mkdirSync(path.dirname(out), { recursive: true });
execSync(`ffmpeg -y -loglevel error -framerate ${F} -i ${tmp}/%04d.png -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart ${out}.mp4`);
const gw = Math.min(480, w);
execSync(`ffmpeg -y -loglevel error -framerate ${F} -i ${tmp}/%04d.png -vf "fps=15,scale=${gw}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=none" -loop 0 ${out}.gif`);
fs.rmSync(tmp, { recursive: true });
console.log('ok', out);
