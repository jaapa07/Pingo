/**
 * Renderiza modelos 3D autorais em spritesheets de PIXEL ART (PNG sem perdas) + atlas.
 * Uso: tsx tools/render-sprites.ts [id|prefixo* ...] [--cat=criatura] [--vista=frente,costas]
 * Seguro em paralelo: cada modelo grava o próprio meta.json; o atlas é a união de todos.
 */
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { openRenderPage, writeDataUrl, readJson, ROOT } from './lib/renderhost';

const args = process.argv.slice(2);
const ids = args.filter((a) => !a.startsWith('--'));
const opt = (k: string) => args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1]?.split(',');
const SPR = resolve(ROOT, 'public/assets/sprites');

const { browser, page } = await openRenderPage();
await page.evaluate('window.__name = (f) => f');
const modelos = (await page.evaluate(() => window.listar())) as { id: string; categoria: string }[];
const cats = opt('cat');
const casa = (id: string) => !ids.length || ids.some((p) => (p.endsWith('*') ? id.startsWith(p.slice(0, -1)) : p === id));
const lista = modelos.filter((m) => casa(m.id) && (!cats || cats.includes(m.categoria)));
if (!lista.length) { console.error('nenhum modelo encontrado'); process.exit(1); }
const t0 = Date.now();
let erros = 0;
for (const m of lista) {
  try {
    const r = (await page.evaluate(([id, v]: unknown[]) => window.renderPix(id as string, v as string[]), [m.id, opt('vista') ?? []])) as any;
    const dir = resolve(SPR, m.categoria, m.id);
    mkdirSync(dir, { recursive: true });
    const meta = readJson<any>(resolve(dir, 'meta.json'), { id: m.id, categoria: m.categoria, vistas: {} });
    meta.malhas = r.malhas;
    for (const [vn, v] of Object.entries<any>(r.vistas)) {
      writeDataUrl(resolve(dir, `${vn}.png`), v.png);
      meta.vistas[vn] = { src: `assets/sprites/${m.categoria}/${m.id}/${vn}.png`, cw: v.cw, ch: v.ch, cols: v.cols, px: v.px, py: v.py, anims: v.anims, cores: v.cores };
    }
    writeFileSync(resolve(dir, 'meta.json'), JSON.stringify(meta));
    console.log(`✔ ${m.id} (${m.categoria}) ${r.malhas} malhas · ${Object.entries<any>(r.vistas).map(([k, v]) => `${k}:${v.cores}c`).join(' ')}`);
  } catch (e) { erros++; console.error(`✘ ${m.id}: ${String((e as Error).message).split('\n')[0]}`); }
}
await browser.close();
// atlas = união de todos os meta.json
const atlas: Record<string, unknown> = {};
if (existsSync(SPR)) for (const cat of readdirSync(SPR)) for (const id of readdirSync(resolve(SPR, cat))) {
  const f = resolve(SPR, cat, id, 'meta.json');
  if (existsSync(f)) atlas[id] = readJson(f, {});
}
writeFileSync(resolve(ROOT, 'public/assets/atlas.json'), JSON.stringify(atlas));
console.log(`${lista.length - erros} modelos em ${((Date.now() - t0) / 1000).toFixed(1)}s${erros ? ` · ${erros} com erro` : ''}`);
if (erros) process.exitCode = 1;
