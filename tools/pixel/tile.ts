/**
 * Ferramentas de tile em pixel art: imagem de alfa binário, tiles desenhados à mão em grades de
 * caracteres (`pix`), composição de tilesheets e troca de paleta por período do dia.
 * Tudo determinístico (variações por posição usam `ruido`, nunca sorteio).
 */
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { codificar, decodificar } from './png';

export type Periodo = 'manha' | 'dia' | 'tarde' | 'noite';
export const PERIODOS: Periodo[] = ['manha', 'dia', 'tarde', 'noite'];
/** pixel transparente */
export const VAZIO = -1;

/** '#rrggbb' → 0xRRGGBB */
export function hex(s: string): number {
  if (!/^#[0-9a-fA-F]{6}$/.test(s)) throw new Error(`cor inválida: ${s}`);
  return parseInt(s.slice(1), 16);
}
export const paraHex = (c: number) => '#' + c.toString(16).padStart(6, '0');

/** Imagem de cor sólida por pixel (0xRRGGBB) com alfa binário (VAZIO = transparente). */
export class Img {
  readonly d: Int32Array;
  constructor(readonly w: number, readonly h: number, cor: number = VAZIO) {
    this.d = new Int32Array(w * h).fill(cor);
  }
  dentro(x: number, y: number) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x: number, y: number): number { return this.dentro(x, y) ? this.d[y * this.w + x] : VAZIO; }
  set(x: number, y: number, c: number) { if (this.dentro(x, y)) this.d[y * this.w + x] = c; }
  ret(x: number, y: number, w: number, h: number, c: number) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
  }
  /** cola `src` em (dx, dy); pixels transparentes da origem não mexem no destino */
  colar(src: Img, dx: number, dy: number, op: { espelhar?: boolean } = {}) {
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      const c = src.d[y * src.w + (op.espelhar ? src.w - 1 - x : x)];
      if (c !== VAZIO) this.set(dx + x, dy + y, c);
    }
  }
  recorte(x: number, y: number, w: number, h: number): Img {
    const r = new Img(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) r.d[j * w + i] = this.get(x + i, y + j);
    return r;
  }
  copia(): Img { const r = new Img(this.w, this.h); r.d.set(this.d); return r; }
  espelhada(): Img { const r = new Img(this.w, this.h); r.colar(this, 0, 0, { espelhar: true }); return r; }
  vazia(): boolean { for (let i = 0; i < this.d.length; i++) if (this.d[i] !== VAZIO) return false; return true; }
  /** troca cada cor pela tabela (cores fora da tabela ficam como estão) */
  trocar(tabela: Map<number, number>): Img {
    const r = new Img(this.w, this.h);
    for (let i = 0; i < this.d.length; i++) { const c = this.d[i]; r.d[i] = c === VAZIO ? VAZIO : tabela.get(c) ?? c; }
    return r;
  }
  cores(): Set<number> { const s = new Set<number>(); for (const c of this.d) if (c !== VAZIO) s.add(c); return s; }
  ampliada(n: number): Img {
    const r = new Img(this.w * n, this.h * n);
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) r.d[y * r.w + x] = this.d[((y / n) | 0) * this.w + ((x / n) | 0)];
    return r;
  }
  paraPng(): Buffer {
    const rgba = new Uint8Array(this.w * this.h * 4);
    for (let i = 0; i < this.d.length; i++) {
      const c = this.d[i];
      if (c === VAZIO) continue;
      rgba[i * 4] = (c >> 16) & 255; rgba[i * 4 + 1] = (c >> 8) & 255; rgba[i * 4 + 2] = c & 255; rgba[i * 4 + 3] = 255;
    }
    return codificar({ w: this.w, h: this.h, rgba });
  }
  salvar(arquivo: string) { mkdirSync(dirname(arquivo), { recursive: true }); writeFileSync(arquivo, this.paraPng()); }
  static ler(arquivo: string): Img {
    const bm = decodificar(readFileSync(arquivo));
    const r = new Img(bm.w, bm.h);
    for (let i = 0; i < r.d.length; i++) if (bm.rgba[i * 4 + 3] >= 128) r.d[i] = (bm.rgba[i * 4] << 16) | (bm.rgba[i * 4 + 1] << 8) | bm.rgba[i * 4 + 2];
    return r;
  }
}

/**
 * Tile desenhado à mão: cada linha é uma fileira de pixels e cada caractere uma cor de `cores`
 * (hex '#rrggbb' ou número). Caracteres fora de `cores` (use espaço) ficam transparentes.
 */
export function pix(linhas: string[], cores: Record<string, string | number>): Img {
  const w = Math.max(...linhas.map((l) => l.length));
  const img = new Img(w, linhas.length);
  const tab: Record<string, number> = {};
  for (const [k, v] of Object.entries(cores)) tab[k] = typeof v === 'number' ? v : hex(v);
  linhas.forEach((l, y) => { for (let x = 0; x < l.length; x++) { const c = tab[l[x]]; if (c !== undefined) img.d[y * w + x] = c; } });
  return img;
}

/** Monta um tilesheet em grade: `cols` células de cw×ch por linha. */
export function folha(tiles: Img[], cols: number, cw = 16, ch = 16): Img {
  const img = new Img(cols * cw, Math.max(1, Math.ceil(tiles.length / cols)) * ch);
  tiles.forEach((t, i) => img.colar(t, (i % cols) * cw, ((i / cols) | 0) * ch));
  return img;
}

/** Ruído inteiro determinístico por posição (0..2^32−1). Substitui qualquer sorteio. */
export function ruido(x: number, y: number, semente = 0): number {
  let h = (Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ Math.imul(semente | 0, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/* ============================== períodos do dia ============================== */
interface Banho { mult: [number, number, number]; para: [number, number, number]; mistura: number; dessat: number }
/** A paleta do período é calculada cor a cor (troca de paleta, não filtro por cima da tela). */
const BANHOS: Record<Periodo, Banho> = {
  manha: { mult: [1.0, 0.95, 0.92], para: [255, 205, 170], mistura: 0.14, dessat: 0.06 },
  dia: { mult: [1, 1, 1], para: [0, 0, 0], mistura: 0, dessat: 0 },
  tarde: { mult: [1.0, 0.8, 0.66], para: [240, 120, 70], mistura: 0.16, dessat: 0 },
  noite: { mult: [0.42, 0.5, 0.82], para: [28, 32, 88], mistura: 0.24, dessat: 0.2 },
};
export function corNoPeriodo(c: number, p: Periodo): number {
  if (p === 'dia') return c;
  const b = BANHOS[p];
  let r = (c >> 16) & 255, g = (c >> 8) & 255, bl = c & 255;
  const cinza = r * 0.3 + g * 0.55 + bl * 0.15;
  r += (cinza - r) * b.dessat; g += (cinza - g) * b.dessat; bl += (cinza - bl) * b.dessat;
  r = r * b.mult[0]; g = g * b.mult[1]; bl = bl * b.mult[2];
  r += (b.para[0] - r) * b.mistura; g += (b.para[1] - g) * b.mistura; bl += (b.para[2] - bl) * b.mistura;
  const q = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (q(r) << 16) | (q(g) << 8) | q(bl);
}
/**
 * Tabela de troca dia → período para um conjunto de cores. `acesas` fixa a cor de noite das cores
 * emissivas (vidro de janela, lâmpada, brasa): à noite elas acendem em vez de escurecer.
 */
export function tabelaPeriodo(cores: Iterable<number>, p: Periodo, acesas?: Map<number, number>): Map<number, number> {
  const t = new Map<number, number>();
  for (const c of cores) t.set(c, p === 'noite' && acesas?.has(c) ? acesas.get(c)! : corNoPeriodo(c, p));
  return t;
}
