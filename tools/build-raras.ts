/**
 * PELAGEM RARA (spec 10A-5) — gera, no build, a variante de cor de cada criatura trocando a PALETA dos PNGs já
 * renderizados (sem canvas no runtime). Para cada pasta de public/assets/sprites/criatura/<id>/ lê `frente.png`,
 * `costas.png` e `mapa.png` e grava `frente-rara.png`, `costas-rara.png` e `mapa-rara.png` (mesma folha, mesmo
 * meta: o motor de sprite troca só a imagem). A lista de quem tem variante vai para public/assets/raras.json.
 *
 * Receita autoral por espécie (`RECEITAS`): giro de matiz (graus), fator de saturação e ajuste de luz, aplicados só
 * às cores com saturação (contorno escuro, olhos e brancos ficam como estão). Sem receita própria, vale a do tipo
 * principal (`POR_TIPO`), com um pequeno desvio fixo por número para irmãos de tipo não ficarem iguais.
 *
 *   npx tsx tools/build-raras.ts            # gera tudo
 *   npx tsx tools/build-raras.ts --previa   # e grava tools/.cache/raras-previa-<n>.png (normal × rara, 2×)
 *   npx tsx tools/build-raras.ts tamandui   # só estas espécies
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodificar, codificar, type Bitmap } from './pixel/png';
import { ESPECIES } from '../src/data/criaturas';
import type { TipoId } from '../src/core/tipos';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PASTA = join(RAIZ, 'public/assets/sprites/criatura');
const VISTAS = ['frente', 'costas', 'mapa'] as const;

/** h = giro de matiz em graus · s = fator de saturação · l = soma na luminosidade (−0,2..0,2) · alvo = pinta tudo numa matiz só (graus) */
interface Receita { h?: number; s?: number; l?: number; alvo?: number; mistura?: number; /** só gira as matizes dentro desta faixa [de, até] (graus) */ faixa?: [number, number]; /** matiz para tingir os cinzas e brancos (usada quando a criatura é quase sem cor) */ tingir?: number; /** receita para as cores que ficaram fora da `faixa` */ extra?: Receita }

/** padrão por tipo principal: a cor "rara" de cada família */
const POR_TIPO: Record<TipoId, Receita> = {
  comum: { h: 180, s: 0.85 }, // marrons viram azul-ardósia
  mata: { h: -75, s: 1.1 }, // verde vira ouro de folha seca
  brasa: { h: 190, s: 1.05 }, // laranja vira chama azul
  rio: { h: 150, s: 1.05 }, // azul vira coral
  trovao: { h: 120, s: 1.1 }, // amarelo vira violeta-elétrico
  geada: { h: 140, s: 1.15 }, // gelo azul vira rosado
  ginga: { h: 200, s: 1.1 },
  veneno: { h: -110, s: 1.1 }, // roxo vira verde-ácido
  terra: { h: 170, s: 1.0, l: 0.02 },
  vento: { h: 110, s: 1.05 },
  mente: { h: -90, s: 1.1 },
  inseto: { h: 160, s: 1.1 },
  pedra: { h: 200, s: 1.25, l: 0.03 },
  assombro: { h: 150, s: 1.15, l: 0.04 },
  lenda: { h: 180, s: 1.0 },
  ferro: { h: 40, s: 1.4, l: 0.03 },
  encanto: { h: 120, s: 1.05 },
};

/** receitas escritas à mão (iniciais, aves vistosas, peixes e as que o padrão deixava sem graça) */
const RECEITAS: Record<string, Receita> = {
  // iniciais: Mata → outono dourado; Brasa → fogo azul; Rio → boto lilás
  // iniciais da Mata: folhas de ouro e pelo prateado
  tamandui: { h: -80, s: 1.2, faixa: [60, 200], extra: { alvo: 215, s: 0.55, l: 0.04 } }, 'tamandua-copa': { h: -80, s: 1.2, faixa: [60, 200], extra: { alvo: 215, s: 0.55, l: 0.04 } }, bandeirao: { h: -80, s: 1.2, faixa: [60, 200], extra: { alvo: 215, s: 0.55, l: 0.04 } },
  guaraxim: { h: 200, s: 1.0 }, guaraflama: { h: 200, s: 1.0 }, 'lobo-fornalha': { h: 200, s: 1.0 },
  botinho: { h: 85, s: 1.05 }, botorosa: { h: -100, s: 1.15 }, iaraboto: { h: 85, s: 1.05 },
  // aves e pássaros
  pipirim: { h: 160 }, 'bem-te-vico': { h: 160 }, gaviaozao: { h: 160 },
  'beija-florzim': { h: -140, s: 1.1 }, 'beija-arco-iris': { h: -140, s: 1.1 },
  tucaninho: { h: 190, s: 1.1 }, tucanucu: { h: 190, s: 1.1 },
  ararinha: { h: 150, s: 1.05 }, araracanga: { h: 150, s: 1.05 },
  'gralha-azul': { h: 170, s: 1.1 }, gralhinha: { h: 170, s: 1.1 },
  corujinha: { alvo: 210, mistura: 0.75, s: 0.7, l: 0.05 }, 'corujao-orelha': { alvo: 210, mistura: 0.75, s: 0.7, l: 0.05 },
  urubuzim: { h: 30, s: 1.6, l: 0.04 }, 'urubu-rei': { h: 30, s: 1.4 },
  // felinos e canídeos: melanismo e pelagem clara
  oncinha: { alvo: 220, mistura: 0.6, s: 0.6, l: -0.12 }, pintada: { alvo: 220, mistura: 0.6, s: 0.6, l: -0.12 },
  jaguatirim: { alvo: 35, mistura: 0.6, s: 0.4, l: 0.12 }, jaguatiricao: { alvo: 35, mistura: 0.6, s: 0.4, l: 0.12 },
  'mico-leaozim': { h: -40, s: 0.9, l: 0.08 }, 'leao-dourado': { h: -40, s: 0.9, l: 0.08 },
  // água: peixes dourados, botos e baleias
  piabinha: { h: 170, s: 1.2 }, 'dourado-rei': { h: 120, s: 1.1 }, piranhinha: { h: 160, s: 1.1 }, piranhao: { h: 160, s: 1.1 },
  baleiazinha: { h: 120, s: 1.0, l: 0.05 }, jubartao: { h: 120, s: 1.0, l: 0.05 },
  manatim: { h: 110, s: 1.2 }, manatao: { h: 110, s: 1.2 },
  // lendários: cada um com a sua
  boitata: { h: 160, s: 1.1 }, boiuna: { h: -120, s: 1.1 }, mapinguari: { h: 140, s: 1.1 }, 'queixada-caipora': { h: 200 },
  uirapuru: { h: -60, s: 1.2 }, 'gaviao-tupa': { h: 60, s: 1.2 }, 'lobo-jaci': { h: 40, s: 1.3, l: 0.05 }, 'onca-guaraci': { h: 180, s: 1.1 },
};

/* ------------------------------ cor ------------------------------ */
function rgbParaHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslParaRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t: number) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)];
}
const lim = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
/** troca uma cor pela receita; cinzas (saturação baixa), quase-pretos e quase-brancos ficam */
export function trocarCor(r: number, g: number, b: number, rc: Receita): [number, number, number] {
  const [h, s, l] = rgbParaHsl(r, g, b);
  if (s < 0.12 || l < 0.08 || l > 0.94) return [r, g, b];
  if (rc.faixa && !(h >= rc.faixa[0] && h <= rc.faixa[1])) return rc.extra ? trocarCor(r, g, b, rc.extra) : [r, g, b];
  let nh = h + (rc.h ?? 0);
  if (rc.alvo !== undefined) { const m = rc.mistura ?? 1; let d = ((rc.alvo - h + 540) % 360) - 180; nh = h + d * m; }
  // peso pela saturação: cores quase cinzas giram menos (transição suave)
  const peso = lim((s - 0.12) / 0.18);
  const hf = h + (((nh - h + 540) % 360) - 180) * peso;
  return hslParaRgb(hf, lim(s * (1 + ((rc.s ?? 1) - 1) * peso)), lim(l + (rc.l ?? 0) * peso, 0.02, 0.97));
}
/** receita final: a escrita (ou a do tipo); se mudar menos de 30% da folha de frente, tinge também os cinzas */
function receitaDe(id: string): Receita {
  const r = receitaBase(id);
  if (r.tingir !== undefined) return r;
  const arq = join(PASTA, id, 'frente.png');
  if (!existsSync(arq)) return r;
  const bm = decodificar(readFileSync(arq));
  if (mudanca(bm, recolorir(bm, r)) >= 0.3) return r;
  const e = ESPECIES.find((x) => x.id === id);
  return { ...r, tingir: TINTA_TIPO[e?.tipos[0] ?? 'comum'] ?? 42 };
}
function receitaBase(id: string): Receita {
  if (RECEITAS[id]) return RECEITAS[id];
  const e = ESPECIES.find((x) => x.id === id);
  const base = POR_TIPO[e?.tipos[0] ?? 'comum'];
  const desvio = e ? ((e.num * 37) % 41) - 20 : 0; // −20..+20 graus, fixo por espécie
  return { ...base, h: (base.h ?? 0) + desvio };
}
/** tinge cinzas e brancos de uma matiz (criaturas quase sem cor: garças, emas, corujas, morcegos) */
function tingirCor(r: number, g: number, b: number, hue: number): [number, number, number] {
  const [, s, l] = rgbParaHsl(r, g, b);
  if (s >= 0.2 || l < 0.1 || l > 0.97) return [r, g, b];
  return hslParaRgb(hue, 0.28 + 0.3 * (1 - Math.abs(l - 0.55) * 1.6), l);
}
const TINTA_TIPO: Partial<Record<TipoId, number>> = { assombro: 275, geada: 195, mente: 300, rio: 190, veneno: 285 };
/** fração dos pixels visíveis cuja cor mudou de forma perceptível */
function mudanca(a: Bitmap, b: Bitmap): number {
  let n = 0, m = 0;
  for (let i = 0; i < a.w * a.h; i++) { const o = i * 4; if (!a.rgba[o + 3]) continue; n++; if (Math.abs(a.rgba[o] - b.rgba[o]) + Math.abs(a.rgba[o + 1] - b.rgba[o + 1]) + Math.abs(a.rgba[o + 2] - b.rgba[o + 2]) > 40) m++; }
  return n ? m / n : 1;
}
export function recolorir(bm: Bitmap, rc: Receita): Bitmap {
  const out = new Uint8Array(bm.rgba.length), cache = new Map<number, [number, number, number]>();
  for (let i = 0; i < bm.w * bm.h; i++) {
    const o = i * 4, a = bm.rgba[o + 3];
    if (!a) continue;
    const k = (bm.rgba[o] << 16) | (bm.rgba[o + 1] << 8) | bm.rgba[o + 2];
    let c = cache.get(k);
    if (!c) { c = trocarCor(bm.rgba[o], bm.rgba[o + 1], bm.rgba[o + 2], rc); if (rc.tingir !== undefined) c = tingirCor(c[0], c[1], c[2], rc.tingir); cache.set(k, c); }
    out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = a;
  }
  return { w: bm.w, h: bm.h, rgba: out };
}

/* ------------------------------ prévia ------------------------------ */
function quadro(bm: Bitmap, cw: number, ch: number, cols: number, f: number): Bitmap {
  const out = new Uint8Array(cw * ch * 4), x0 = (f % cols) * cw, y0 = Math.floor(f / cols) * ch;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { const s = ((y0 + y) * bm.w + x0 + x) * 4, d = (y * cw + x) * 4; for (let k = 0; k < 4; k++) out[d + k] = bm.rgba[s + k] ?? 0; }
  return { w: cw, h: ch, rgba: out };
}
function colar(dst: Bitmap, src: Bitmap, x0: number, y0: number, esc = 1) {
  for (let y = 0; y < src.h * esc; y++) for (let x = 0; x < src.w * esc; x++) {
    const s = (Math.floor(y / esc) * src.w + Math.floor(x / esc)) * 4; if (!src.rgba[s + 3]) continue;
    const dx = x0 + x, dy = y0 + y; if (dx >= dst.w || dy >= dst.h) continue;
    const d = (dy * dst.w + dx) * 4; for (let k = 0; k < 4; k++) dst.rgba[d + k] = src.rgba[s + k];
  }
}

/* ------------------------------ principal ------------------------------ */
const args = process.argv.slice(2), previa = args.includes('--previa'), so = args.filter((a) => !a.startsWith('--'));
const ids = readdirSync(PASTA).filter((d) => existsSync(join(PASTA, d, 'frente.png'))).sort();
const feitos: string[] = [];
const pares: [Bitmap, Bitmap][] = [];
for (const id of ids) {
  const rc = receitaDe(id);
  let ok = true;
  for (const v of VISTAS) {
    const arq = join(PASTA, id, v + '.png');
    if (!existsSync(arq)) { ok = false; continue; }
    if (so.length && !so.includes(id)) continue;
    const bm = decodificar(readFileSync(arq)), rara = recolorir(bm, rc);
    writeFileSync(join(PASTA, id, v + '-rara.png'), codificar(rara));
    if (previa && v === 'frente') {
      const meta = JSON.parse(readFileSync(join(PASTA, id, 'meta.json'), 'utf8')).vistas.frente;
      const f = meta.anims.idle?.i ?? 0;
      pares.push([quadro(bm, meta.cw, meta.ch, meta.cols, f), quadro(rara, meta.cw, meta.ch, meta.cols, f)]);
    }
  }
  if (ok && VISTAS.every((v) => existsSync(join(PASTA, id, v + '-rara.png')))) feitos.push(id);
}
writeFileSync(join(RAIZ, 'public/assets/raras.json'), JSON.stringify({ ids: feitos }));
console.log(`pelagem rara: ${feitos.length} criaturas com variante (public/assets/raras.json)`);
if (previa) {
  mkdirSync(join(RAIZ, 'tools/.cache'), { recursive: true });
  const porPag = 24, colsP = 6, esc = 2, cel = 64 * esc;
  for (let p = 0; p * porPag < pares.length; p++) {
    const fatia = pares.slice(p * porPag, (p + 1) * porPag), linhas = Math.ceil(fatia.length / colsP);
    const W = colsP * (cel * 2 + 8), H = linhas * (cel + 4), rgba = new Uint8Array(W * H * 4);
    for (let i = 0; i < W * H; i++) { rgba[i * 4] = 0x2a; rgba[i * 4 + 1] = 0x33; rgba[i * 4 + 2] = 0x3d; rgba[i * 4 + 3] = 255; }
    const folha: Bitmap = { w: W, h: H, rgba };
    fatia.forEach(([a, b], i) => { const x = (i % colsP) * (cel * 2 + 8), y = Math.floor(i / colsP) * (cel + 4); colar(folha, a, x, y, esc); colar(folha, b, x + cel, y, esc); });
    writeFileSync(join(RAIZ, `tools/.cache/raras-previa-${p}.png`), codificar(folha));
  }
  console.log(`prévias: tools/.cache/raras-previa-0..${Math.ceil(pares.length / porPag) - 1}.png`);
}
