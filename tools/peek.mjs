// Uso: node tools/peek.mjs <svg> <salida.png> <t1,t2,...>  -> contacto con fotogramas a esos segundos
import { createRequire } from 'module'; import path from 'path';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');
const [f, out, ts] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const pg = await b.newPage({ viewport: { width: 400, height: 400 } });
await pg.goto('file://' + path.resolve(f));
const times = ts.split(',').map(Number);
const html = [];
for (const t of times) {
  await pg.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000; }), t);
  html.push((await pg.screenshot()).toString('base64'));
}
const pg2 = await b.newPage({ viewport: { width: 400 * times.length, height: 400 } });
await pg2.setContent(`<body style="margin:0;display:flex">${html.map(h => `<img src="data:image/png;base64,${h}">`).join('')}`);
await pg2.screenshot({ path: out }); await b.close();
