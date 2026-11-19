/**
 * build-fx — desenha os FX de batalha (assets-src/fx/*.ts, quadros feitos com o pincel de pixel art)
 * e empacota tudo num atlas: `public/assets/fx/fx.png` + índice `src/battle/anims/gerado/fx.json`.
 * Cada FX ocupa uma tira horizontal de quadros. PNG puro em Node (zlib), sem elemento de desenho.
 * Uso: `npx tsx tools/build-fx.ts [--previa]` (`--previa` grava folhas ampliadas em tools/.cache/fx-previa-*.png).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { codificarRGBA } from './pixel/png';
import { Quadro, type FxDef } from '../assets-src/fx/pincel';
import { FX_TIPOS } from '../assets-src/fx/fx-tipos';
import { FX_GERAIS } from '../assets-src/fx/fx-gerais';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const LISTA_FX: FxDef[] = [...FX_TIPOS, ...FX_GERAIS];
const LARGURA = 512;

interface Tira { def: FxDef; quadros: Quadro[]; x: number; y: number }
const erros: string[] = [];
const vistos = new Set<string>();
const tiras: Tira[] = LISTA_FX.map((def) => {
  if (vistos.has(def.id)) erros.push(`FX repetido: ${def.id}`);
  vistos.add(def.id);
  const quadros: Quadro[] = [];
  for (let i = 0; i < def.n; i++) { const q = new Quadro(def.w, def.h); def.desenhar(q, i, i / def.n); quadros.push(q); }
  if (quadros.every((q) => q.d.every((v) => v === 0))) erros.push(`FX vazio: ${def.id}`);
  if (def.w * def.n > LARGURA) erros.push(`FX largo demais para o atlas: ${def.id}`);
  return { def, quadros, x: 0, y: 0 };
});

// empacotamento em prateleiras (as tiras mais altas primeiro)
const ordem = [...tiras].sort((a, b) => b.def.h - a.def.h || b.def.w * b.def.n - a.def.w * a.def.n);
let x = 0, y = 0, alt = 0;
for (const t of ordem) {
  const w = t.def.w * t.def.n;
  if (x + w > LARGURA) { x = 0; y += alt + 1; alt = 0; }
  t.x = x; t.y = y; x += w + 1; alt = Math.max(alt, t.def.h);
}
const ALTURA = y + alt;
const rgba = new Uint8Array(LARGURA * ALTURA * 4);
const por = (dst: Uint8Array, W: number, q: Quadro, ox: number, oy: number, escala = 1) => {
  for (let j = 0; j < q.h; j++) for (let i = 0; i < q.w; i++) {
    const v = q.d[j * q.w + i]; if (!v) continue;
    for (let b = 0; b < escala; b++) for (let a = 0; a < escala; a++) { const k = ((oy + j * escala + b) * W + ox + i * escala + a) * 4; dst[k] = v >>> 24; dst[k + 1] = (v >>> 16) & 255; dst[k + 2] = (v >>> 8) & 255; dst[k + 3] = v & 255; }
  }
};
for (const t of tiras) t.quadros.forEach((q, i) => por(rgba, LARGURA, q, t.x + i * t.def.w, t.y));

const indice = { src: 'assets/fx/fx.png', w: LARGURA, h: ALTURA, fx: Object.fromEntries(tiras.map((t) => [t.def.id, [t.x, t.y, t.def.w, t.def.h, t.def.n, t.def.fps]])) };
const gravar = (p: string, dados: Buffer | string) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, dados); };
gravar(join(RAIZ, 'public/assets/fx/fx.png'), codificarRGBA({ w: LARGURA, h: ALTURA, rgba }));
gravar(join(RAIZ, 'src/battle/anims/gerado/fx.json'), JSON.stringify(indice));

if (process.argv.includes('--previa')) {
  // folhas de conferência ×4 sobre fundo verde-mata, ~30 FX por folha
  const E = 4, POR = 30, W = 1400;
  for (let f = 0; f * POR < tiras.length; f++) {
    const grupo = tiras.slice(f * POR, (f + 1) * POR);
    const pos: [number, number][] = []; let px = 4, py = 4, linha = 0;
    for (const t of grupo) { const w = t.def.w * t.def.n * E + 8; if (px + w > W) { px = 4; py += linha + 8; linha = 0; } pos.push([px, py]); px += w; linha = Math.max(linha, t.def.h * E); }
    const H = py + linha + 4, img = new Uint8Array(W * H * 4);
    for (let k = 0; k < W * H; k++) { const escuro = Math.floor(k / W / 32) % 2 === 0; img[k * 4] = escuro ? 0x2c : 0x1d; img[k * 4 + 1] = escuro ? 0x75 : 0x30; img[k * 4 + 2] = escuro ? 0x50 : 0x46; img[k * 4 + 3] = 255; }
    grupo.forEach((t, n) => t.quadros.forEach((q, i) => por(img, W, q, pos[n][0] + i * t.def.w * E, pos[n][1], E)));
    gravar(join(RAIZ, `tools/.cache/fx-previa-${f}.png`), codificarRGBA({ w: W, h: H, rgba: img }));
    console.log(`previa ${f}: ${grupo.map((t) => t.def.id).join(' ')}`);
  }
}
const porGrupo = new Map<string, number>();
for (const t of tiras) { const g = t.def.id.split('-')[0]; porGrupo.set(g, (porGrupo.get(g) ?? 0) + 1); }
console.log(`build-fx: ${tiras.length} FX, atlas ${LARGURA}×${ALTURA} — ${[...porGrupo].map(([g, n]) => `${g} ${n}`).join(', ')}`);
if (erros.length) { console.error(erros.join('\n')); process.exit(1); }
