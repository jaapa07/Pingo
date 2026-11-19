/**
 * build-ui — transforma as artes desenhadas à mão em grades de caracteres (assets-src/ui/*.ts)
 * nos PNGs de `public/assets/ui/` e no índice `src/ui/gerado/kit.json`.
 * PNG puro em Node (zlib), sem canvas. Uso: `npx tsx tools/build-ui.ts [--previa]`.
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PALETA, CORES_TEXTO, CORES_TIPO } from '../assets-src/ui/paleta';
import { FONTE8, FONTE12, type FonteSrc } from '../assets-src/ui/fontes';
import { MOLDURAS } from '../assets-src/ui/molduras';
import { ARTES, SIMBOLOS_TIPO, SIMBOLOS_STATUS, type Arte } from '../assets-src/ui/icones';
import { TOQUE } from '../assets-src/ui/toque';
import { CAMADAS, LOGO } from '../assets-src/ui/titulo';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(RAIZ, 'public/assets/ui');
const erros: string[] = [];

/* ------------------------------ imagem RGBA ------------------------------ */
type Cor = [number, number, number, number];
const hex = (h: string): Cor => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 255];
class Img {
  d: Uint8Array;
  constructor(public w: number, public h: number) { this.d = new Uint8Array(w * h * 4); }
  set(x: number, y: number, c: Cor) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d.set(c, (y * this.w + x) * 4); }
  get(x: number, y: number): Cor { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return [0, 0, 0, 0]; const i = (y * this.w + x) * 4; return [this.d[i], this.d[i + 1], this.d[i + 2], this.d[i + 3]]; }
  cheio(x: number, y: number) { return this.get(x, y)[3] > 0; }
  /** cola `o` em (x, y); pixels transparentes de `o` não apagam o destino */
  colar(o: Img, x: number, y: number) { for (let j = 0; j < o.h; j++) for (let i = 0; i < o.w; i++) { const c = o.get(i, j); if (c[3]) this.set(x + i, y + j, c); } return this; }
  recorte(x: number, y: number, w: number, h: number) { const r = new Img(w, h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) r.set(i, j, this.get(x + i, y + j)); return r; }
  preencher(c: Cor) { for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) this.set(x, y, c); return this; }
  ampliar(n: number) { const r = new Img(this.w * n, this.h * n); for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) r.set(x, y, this.get(Math.floor(x / n), Math.floor(y / n))); return r; }
  espelharX() { const r = new Img(this.w, this.h); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) r.set(this.w - 1 - x, y, this.get(x, y)); return r; }
  uniforme(): Cor | null { const c = this.get(0, 0); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const o = this.get(x, y); if (o[0] !== c[0] || o[1] !== c[1] || o[2] !== c[2] || o[3] !== c[3]) return null; } return c; }
  mapear(f: (c: Cor, x: number, y: number) => Cor) { const r = new Img(this.w, this.h); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) r.set(x, y, f(this.get(x, y), x, y)); return r; }
}

/* ------------------------------ PNG ------------------------------ */
const tabelaCrc = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b: Uint8Array) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = tabelaCrc[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function bloco(tipo: string, dados: Uint8Array) {
  const b = Buffer.alloc(12 + dados.length);
  b.writeUInt32BE(dados.length, 0); b.write(tipo, 4, 'latin1'); Buffer.from(dados).copy(b, 8);
  b.writeUInt32BE(crc32(b.subarray(4, 8 + dados.length)), 8 + dados.length);
  return b;
}
function png(img: Img): Buffer {
  const cab = Buffer.alloc(13); cab.writeUInt32BE(img.w, 0); cab.writeUInt32BE(img.h, 4); cab[8] = 8; cab[9] = 6;
  const cru = Buffer.alloc((img.w * 4 + 1) * img.h);
  for (let y = 0; y < img.h; y++) Buffer.from(img.d.buffer, y * img.w * 4, img.w * 4).copy(cru, y * (img.w * 4 + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco('IHDR', cab), bloco('IDAT', deflateSync(cru, { level: 9 })), bloco('IEND', new Uint8Array(0))]);
}
function gravar(nome: string, img: Img) { const p = join(SAIDA, nome); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, png(img)); }

/* ------------------------------ grades → imagem ------------------------------ */
const TRANSP: Cor = [0, 0, 0, 0];
function deGrade(nome: string, linhas: string[], cores: Record<string, string> = {}): Img {
  const w = linhas[0]?.length ?? 0;
  const img = new Img(w, linhas.length);
  linhas.forEach((l, y) => {
    if (l.length !== w) erros.push(`${nome}: linha ${y} tem ${l.length} colunas (esperado ${w}): "${l}"`);
    for (let x = 0; x < Math.min(w, l.length); x++) {
      const ch = l[x];
      if (ch === '.' || ch === ' ') continue;
      const c = cores[ch] ?? PALETA[ch];
      if (!c) { erros.push(`${nome}: caractere desconhecido '${ch}' em (${x}, ${y})`); continue; }
      img.set(x, y, hex(c));
    }
  });
  return img;
}
function deArte(a: Arte, cores: Record<string, string> = {}): Img {
  let img = deGrade(a.nome, a.linhas, { ...cores, ...(a.cores ?? {}) });
  if (a.espelhoX) { const r = new Img(img.w * 2, img.h); r.colar(img, 0, 0).colar(img.espelharX(), img.w, 0); img = r; }
  return img;
}

/* ------------------------------ fontes ------------------------------ */
interface Glifo { ch: string; w: number; pix: [number, number][] }
function lerGlifo(spec: string): { y0: number; linhas: string[] } {
  const m = /^(\d+):/.exec(spec);
  return { y0: m ? Number(m[1]) : 0, linhas: (m ? spec.slice(m[0].length) : spec).split('/') };
}
function glifosDe(f: FonteSrc): Glifo[] {
  const lista: Glifo[] = [];
  const base = new Map<string, Glifo & { topo: number }>();
  for (const [ch, spec] of Object.entries(f.glifos)) {
    const { y0, linhas } = lerGlifo(spec);
    const w = Math.max(...linhas.map((l) => l.length));
    const pix: [number, number][] = [];
    linhas.forEach((l, j) => { for (let i = 0; i < l.length; i++) { if (l[i] === '#') pix.push([i, y0 + j]); else if (l[i] !== '.') erros.push(`${f.nome} '${ch}': caractere inválido '${l[i]}'`); } });
    if (w > 8) erros.push(`${f.nome} '${ch}': largura ${w} > 8`);
    if (pix.some(([, y]) => y >= f.altura)) erros.push(`${f.nome} '${ch}': passa da altura ${f.altura}`);
    const g = { ch, w, pix, topo: Math.min(...pix.map((p) => p[1])) };
    base.set(ch, g); lista.push(g);
  }
  for (const [ch, [b, ac]] of Object.entries(f.compostos)) {
    const g = base.get(b); const a = lerGlifo(f.acentos[ac]);
    if (!g) { erros.push(`${f.nome}: base '${b}' ausente para '${ch}'`); continue; }
    const wa = Math.max(...a.linhas.map((l) => l.length));
    const dx = Math.floor((g.w - wa) / 2);
    const desloc = dx < 0 ? -dx : 0;
    const pix: [number, number][] = g.pix.map(([x, y]) => [x + desloc, y]);
    const yBase = g.topo - 1 - a.linhas.length; // uma linha de respiro entre o sinal e a letra
    a.linhas.forEach((l, j) => { for (let i = 0; i < l.length; i++) if (l[i] === '#') pix.push([i + dx + desloc, yBase + j]); });
    if (yBase < -f.topo) erros.push(`${f.nome} '${ch}': acento acima do topo`);
    lista.push({ ch, w: Math.max(g.w + desloc, wa), pix });
  }
  return lista.filter((g) => g.ch !== 'ı');
}
const COLS = 16, VCOLS = 6;
function folhaFonte(f: FonteSrc) {
  const gl = glifosDe(f);
  const cw = 9, ch = f.topo + f.altura + 1;
  const linhasG = Math.ceil(gl.length / COLS);
  const bw = COLS * cw, bh = linhasG * ch;
  const nomes = Object.keys(CORES_TEXTO);
  const nv = nomes.length * 2;
  const img = new Img(bw * VCOLS, bh * Math.ceil(nv / VCOLS));
  nomes.forEach((nome, ci) => {
    const [cor, sombra] = CORES_TEXTO[nome];
    for (const comSombra of [0, 1]) {
      const v = ci * 2 + comSombra;
      const ox = (v % VCOLS) * bw, oy = Math.floor(v / VCOLS) * bh;
      gl.forEach((g, i) => {
        const gx = ox + (i % COLS) * cw, gy = oy + Math.floor(i / COLS) * ch + f.topo;
        if (comSombra) for (const [x, y] of g.pix) img.set(gx + x + 1, gy + y + 1, hex(PALETA[sombra]));
        for (const [x, y] of g.pix) img.set(gx + x, gy + y, hex(PALETA[cor]));
      });
    }
  });
  gravar(f.nome + '.png', img);
  const glifos: Record<string, [number, number]> = {};
  gl.forEach((g, i) => { glifos[g.ch] = [i, g.w]; });
  return { meta: { src: `assets/ui/${f.nome}.png`, cw, ch, cols: COLS, topo: f.topo, altura: f.altura, entrelinha: f.entrelinha, espaco: f.espaco, bw, bh, vcols: VCOLS, iw: img.w, ih: img.h, cores: nomes, glifos }, gl };
}
/** escreve texto direto numa imagem (para artes que levam letras: botões de toque, etiquetas) */
function escrever(img: Img, gl: Glifo[], txt: string, x: number, y: number, cor: Cor, espaco = 3) {
  for (const ch of txt) {
    if (ch === ' ') { x += espaco + 1; continue; }
    const g = gl.find((q) => q.ch === ch); if (!g) { erros.push(`escrever: sem glifo '${ch}'`); continue; }
    for (const [px, py] of g.pix) img.set(x + px, y + py, cor);
    x += g.w + 1;
  }
  return x;
}
const larguraTxt = (gl: Glifo[], txt: string, espaco = 3) => [...txt].reduce((a, ch) => a + (ch === ' ' ? espaco : gl.find((q) => q.ch === ch)?.w ?? 0) + 1, -1);

/* ------------------------------ atlas ------------------------------ */
const pecas: { nome: string; img: Img }[] = [];
const add = (nome: string, img: Img) => { if (pecas.some((p) => p.nome === nome)) erros.push('sprite duplicado: ' + nome); pecas.push({ nome, img }); };
function empacotar(largura = 256) {
  const ord = [...pecas].sort((a, b) => b.img.h - a.img.h || b.img.w - a.img.w);
  const pos: Record<string, [number, number, number, number]> = {};
  let x = 0, y = 0, hLinha = 0;
  for (const p of ord) {
    if (p.img.w > largura) erros.push(`sprite ${p.nome} mais largo que o atlas`);
    if (x + p.img.w > largura) { x = 0; y += hLinha + 1; hLinha = 0; }
    pos[p.nome] = [x, y, p.img.w, p.img.h]; x += p.img.w + 1; hLinha = Math.max(hLinha, p.img.h);
  }
  const atlas = new Img(largura, y + hLinha);
  for (const p of ord) atlas.colar(p.img, pos[p.nome][0], pos[p.nome][1]);
  return { atlas, pos };
}

/* ------------------------------ efeitos de build ------------------------------ */
const escurecer = (c: Cor, k: number): Cor => [Math.round(c[0] * k), Math.round(c[1] * k), Math.round(c[2] * k), c[3]];
/** silhueta (insígnia ainda não conquistada) */
function silhueta(img: Img) {
  const borda = hex(PALETA['1']), miolo = hex(PALETA['p']);
  return img.mapear((c, x, y) => (c[3] ? ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !img.cheio(x + dx, y + dy)) ? borda : miolo) : c));
}
/** contorno externo de 1 px */
function contornar(img: Img, cor: Cor, diagonais = false) {
  const r = new Img(img.w + 2, img.h + 2);
  const viz = diagonais ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) if (!img.cheio(x - 1, y - 1) && viz.some(([dx, dy]) => img.cheio(x - 1 + dx, y - 1 + dy))) r.set(x, y, cor);
  return r.colar(img, 1, 1);
}

/* ============================== montagem ============================== */
const f8 = folhaFonte(FONTE8), f12 = folhaFonte(FONTE12);

// molduras 9-slice: cantos no atlas; bordas e miolo (que precisam repetir) embutidos no índice como data URI
const uri = (img: Img) => 'data:image/png;base64,' + png(img).toString('base64');
const molduras: Record<string, { fatia: number; centro: string | null; h: string; v: string; c?: string }> = {};
for (const m of MOLDURAS) {
  const s = m.fatia, img = deGrade('moldura ' + m.nome, m.linhas);
  if (img.w !== s * 3 || img.h !== s * 3) erros.push(`moldura ${m.nome}: esperado ${s * 3}×${s * 3}, veio ${img.w}×${img.h}`);
  add(`mol-${m.nome}-nw`, img.recorte(0, 0, s, s)); add(`mol-${m.nome}-ne`, img.recorte(2 * s, 0, s, s));
  add(`mol-${m.nome}-sw`, img.recorte(0, 2 * s, s, s)); add(`mol-${m.nome}-se`, img.recorte(2 * s, 2 * s, s, s));
  const h = new Img(s, 2 * s).colar(img.recorte(s, 0, s, s), 0, 0).colar(img.recorte(s, 2 * s, s, s), 0, s);
  const v = new Img(2 * s, s).colar(img.recorte(0, s, s, s), 0, 0).colar(img.recorte(2 * s, s, s, s), s, 0);
  const centro = img.recorte(s, s, s, s), u = centro.uniforme();
  molduras[m.nome] = { fatia: s, centro: u ? (u[3] ? '#' + [u[0], u[1], u[2]].map((n) => n.toString(16).padStart(2, '0')).join('') : null) : null, h: uri(h), v: uri(v), ...(u ? {} : { c: uri(centro) }) };
}

// artes avulsas
for (const a of ARTES) add(a.nome, deArte(a));
for (const a of ARTES.filter((q) => q.nome.startsWith('insignia-'))) add(a.nome + '-vazia', silhueta(deArte(a)));

// ícones de tipo 12×12: placa na cor do tipo + símbolo desenhado à mão
for (const [tipo, linhas] of Object.entries(SIMBOLOS_TIPO)) {
  const [base, escura, clara] = CORES_TIPO[tipo] ?? (erros.push('tipo sem cor: ' + tipo), ['#000000', '#000000', '#000000']);
  const placa = deGrade('placa-tipo', [
    '.YYYYYYYYYY.', 'YZZZZZZZZZZY', 'YXXXXXXXXXXY', 'YXXXXXXXXXXY', 'YXXXXXXXXXXY', 'YXXXXXXXXXXY',
    'YXXXXXXXXXXY', 'YXXXXXXXXXXY', 'YXXXXXXXXXXY', 'YXXXXXXXXXXY', 'YXXXXXXXXXXY', '.YYYYYYYYYY.',
  ], { X: base, Y: escura, Z: clara });
  if (linhas.length !== 10) erros.push(`símbolo de tipo ${tipo}: esperado 10 linhas`);
  placa.colar(deGrade('tipo ' + tipo, linhas, { '#': PALETA['7'], '+': clara, '-': escura }), 1, 1);
  add('tipo-' + tipo, placa);
}

// ícones de status: mini (9×9) e etiqueta com a sigla
for (const [id, s] of Object.entries(SIMBOLOS_STATUS)) {
  const cores = { X: s.cor[0], Y: s.cor[1], '#': s.cor[2], '+': s.cor[3] ?? s.cor[2] };
  const simb = deGrade('status ' + id, s.linhas, cores);
  const mini = deGrade('status-mini', ['.YYYYYYY.', ...Array.from({ length: 7 }, () => 'YXXXXXXXY'), '.YYYYYYY.'], cores).colar(simb, 1, 1);
  add(`status-${id}-mini`, mini);
  const wt = larguraTxt(f8.gl, s.sigla);
  const et = new Img(9 + wt + 3, 9);
  for (let y = 0; y < 9; y++) for (let x = 0; x < et.w; x++) { const canto = (x === 0 || x === et.w - 1) && (y === 0 || y === 8); if (!canto) et.set(x, y, hex(x === 0 || y === 0 || x === et.w - 1 || y === 8 ? cores.Y : cores.X)); }
  et.colar(simb, 1, 1); escrever(et, f8.gl, s.sigla, 9, 1, hex(cores['#']));
  add(`status-${id}`, et);
}

// controles de toque: cada botão ganha a versão apertada (1 px mais baixa e mais escura)
for (const a of TOQUE.artes) {
  const img = deArte(a);
  if (a.rotulo) { const w = larguraTxt(a.rotulo.fonte === 12 ? f12.gl : f8.gl, a.rotulo.txt); const gl = a.rotulo.fonte === 12 ? f12.gl : f8.gl; const x = Math.floor((img.w - w) / 2); escrever(img, gl, a.rotulo.txt, x + 1, a.rotulo.y + 1, hex(PALETA[a.rotulo.sombra])); escrever(img, gl, a.rotulo.txt, x, a.rotulo.y, hex(PALETA[a.rotulo.cor])); }
  add(a.nome, img);
  if (a.apertavel) { const ap = new Img(img.w, img.h); ap.colar(img.mapear((c) => escurecer(c, 0.78)), 0, 1); add(a.nome + '-ap', ap.recorte(0, 0, img.w, img.h)); }
}

// título: camadas repetíveis em PNGs próprios e logo entalhado
for (const a of CAMADAS) gravar(`camadas/${a.nome}.png`, deArte(a));
const camadasTitulo = Object.fromEntries(CAMADAS.map((a) => { const i = deArte(a); return [a.nome, [i.w, i.h]]; }));
{
  // "PINGO": máscaras desenhadas à mão → madeira dourada entalhada (faixas de cor por linha, brilho em cima/esquerda, sombra embaixo/direita)
  const faixas = ['k', 'k', 'j', 'j', 'j', 'j', 'i', 'j', 'j', 'i', 'i', 'i', 'v', 'i', 'i', 'v', 'v', 'v', '3', 'v', 'v', '3', '3', '3', '3', '2', '3', '3', '2', '2'];
  let x = 0; const letras = LOGO.pingo.map((l) => deGrade('logo', l, { '#': '#ffffff' }));
  const alt = letras[0].h, larg = letras.reduce((a, l) => a + l.w + 2, -2);
  const corpo = new Img(larg, alt);
  for (const l of letras) {
    for (let j = 0; j < l.h; j++) for (let i = 0; i < l.w; i++) if (l.cheio(i, j)) {
      let c = faixas[Math.min(faixas.length - 1, Math.floor((j / l.h) * faixas.length))];
      if (!l.cheio(i, j - 1) || !l.cheio(i - 1, j)) c = '7';
      else if (!l.cheio(i, j + 1) || !l.cheio(i + 1, j)) c = '2';
      else if (!l.cheio(i - 1, j - 1)) c = 'k';
      corpo.set(x + i, j, hex(PALETA[c]));
    }
    x += l.w + 2;
  }
  const comContorno = contornar(contornar(corpo, hex(PALETA['1']), true), hex(PALETA['0']), true);
  const logo = new Img(comContorno.w + 2, comContorno.h + 3);
  logo.colar(comContorno.mapear((c) => (c[3] ? hex(PALETA['0']) : c)), 2, 3).colar(comContorno.mapear((c) => (c[3] ? hex(PALETA['c']) : c)), 1, 2).colar(comContorno, 0, 0);
  gravar('camadas/logo-pingo.png', logo); camadasTitulo['logo-pingo'] = [logo.w, logo.h];
  // "ADVENTURES OF": fonte grande em creme com contorno
  const t = 'ADVENTURES OF'; const w = larguraTxt(f12.gl, t, 4);
  const faixa = new Img(w, 12); escrever(faixa, f12.gl, t, 0, 0, hex(PALETA['7']), 4);
  const sub = contornar(faixa.recorte(0, 2, w, 8).mapear((c, _x, y) => (c[3] ? hex(PALETA[y < 3 ? '7' : y < 6 ? '6' : '5']) : c)), hex(PALETA['0']), true);
  const subS = new Img(sub.w, sub.h + 1); subS.colar(sub.mapear((c) => (c[3] ? hex(PALETA['0']) : c)), 0, 1).colar(sub, 0, 0);
  gravar('camadas/logo-sub.png', subS); camadasTitulo['logo-sub'] = [subS.w, subS.h];
}

const { atlas, pos } = empacotar();
gravar('ui.png', atlas);

const kit = {
  fontes: { '8': f8.meta, '12': f12.meta },
  atlas: { src: 'assets/ui/ui.png', w: atlas.w, h: atlas.h },
  sprites: pos, molduras, camadas: camadasTitulo, toque: TOQUE.medidas,
  coresTipo: CORES_TIPO, paleta: PALETA,
  coresTexto: Object.fromEntries(Object.entries(CORES_TEXTO).map(([k, [c]]) => [k, PALETA[c]])),
};
mkdirSync(join(RAIZ, 'src/ui/gerado'), { recursive: true });
writeFileSync(join(RAIZ, 'src/ui/gerado/kit.json'), JSON.stringify(kit));

/* ------------------------------ prévia para revisão da arte ------------------------------ */
if (process.argv.includes('--previa')) {
  const pv = new Img(330, 470).preencher(hex('#5a8a6a'));
  const amostra = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ ÇÁÀÂÃÉÊÍÓÔÕÚÜ', 'abcdefghijklmnopqrstuvwxyz çáàâãéêíóôõúü', '0123456789 .,;:!?\'"-–—()/+=%*#&@_<>[]|…ºª$~^°×·•', '♂♀←→↑↓▶◀▲▼♥★♪ Um Tamanduí selvagem apareceu!', 'A Profª Ipê pesquisa a fauna de Pindorama. Você já', 'viu um quati, não é? "Coração" de mãe não se engana.'];
  let y = 4;
  for (const [f, gl] of [[FONTE8, f8.gl], [FONTE12, f12.gl]] as const) for (const l of amostra) { escrever(pv, gl, l, 5, y + f.topo + 1, hex(PALETA['0']), f.espaco); escrever(pv, gl, l, 4, y + f.topo, hex(PALETA['7']), f.espaco); y += f.entrelinha + 1; }
  pv.colar(atlas, 4, y + 4);
  mkdirSync(join(RAIZ, 'tools/.cache'), { recursive: true });
  writeFileSync(join(RAIZ, 'tools/.cache/ui-previa.png'), png(pv.ampliar(3)));
  // molduras montadas em 56×40
  const pm = new Img(330, 150).preencher(hex('#5a8a6a')); let mx = 4, my = 4;
  for (const m of MOLDURAS) {
    const s = m.fatia, g = deGrade('m', m.linhas), W = 56, H = 40;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const sx = i < s ? i : i >= W - s ? 2 * s + (i - (W - s)) : s + ((i - s) % s);
      const sy = j < s ? j : j >= H - s ? 2 * s + (j - (H - s)) : s + ((j - s) % s);
      const c = g.get(sx, sy); if (c[3]) pm.set(mx + i, my + j, c);
    }
    mx += W + 6; if (mx + W > pm.w) { mx = 4; my += H + 6; }
  }
  writeFileSync(join(RAIZ, 'tools/.cache/ui-previa-molduras.png'), png(pm.ampliar(3)));
}

if (erros.length) { console.error('build-ui: ' + erros.length + ' erro(s)\n' + erros.slice(0, 60).join('\n')); process.exit(1); }
console.log(`build-ui: ${pecas.length} sprites no atlas ${atlas.w}×${atlas.h}, ${Object.keys(f8.meta.glifos).length}+${Object.keys(f12.meta.glifos).length} glifos, ${MOLDURAS.length} molduras.`);
