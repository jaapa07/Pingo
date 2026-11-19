/**
 * Núcleo do pintor de arenas: tela de pixels inteiros, ruído determinístico (sem sorteio de sistema),
 * paletas em rampas com variação noturna pré-calculada e gravação de PNG indexado sem perdas.
 */
import { deflateSync } from 'node:zlib';

export const W = 320, H = 180;
/** cor 0xRRGGBB; -1 = transparente */
export type Cor = number;
export type Rampa = Cor[];
export const VAZIO = -1;

export const hex = (s: string): Cor => parseInt(s.replace('#', ''), 16);
export const paraHex = (c: Cor) => '#' + c.toString(16).padStart(6, '0');

/** hash inteiro → [0,1) */
export function h(x: number, y: number, s = 0): number {
  let n = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul((s | 0) + 1013, 1274126177);
  n = Math.imul(n ^ (n >>> 13), 1103515245);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
const suave = (t: number) => t * t * (3 - 2 * t);
/** ruído de valor suave, período `esc` px */
export function ruido(x: number, y: number, esc: number, s = 0): number {
  const fx = x / esc, fy = y / esc, ix = Math.floor(fx), iy = Math.floor(fy);
  const tx = suave(fx - ix), ty = suave(fy - iy);
  const a = h(ix, iy, s), b = h(ix + 1, iy, s), c = h(ix, iy + 1, s), d = h(ix + 1, iy + 1, s);
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
}
export const fbm = (x: number, y: number, esc: number, s = 0) => ruido(x, y, esc, s) * 0.6 + ruido(x, y, esc / 2, s + 7) * 0.28 + ruido(x, y, esc / 4, s + 13) * 0.12;

/** sequência determinística (mulberry32) para espalhar peças */
export class Seq {
  private a: number;
  constructor(semente: number) { this.a = semente >>> 0; }
  n(): number {
    this.a = (this.a + 0x6d2b79f5) >>> 0;
    let t = this.a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  entre(a: number, b: number) { return a + (b - a) * this.n(); }
  int(a: number, b: number) { return Math.floor(this.entre(a, b + 1)); }
  de<T>(l: T[]): T { return l[Math.floor(this.n() * l.length)]; }
}

export class Tela {
  px: Int32Array;
  constructor(public w = W, public h = H) { this.px = new Int32Array(w * h).fill(VAZIO); }
  dentro(x: number, y: number) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  p(x: number, y: number, c: Cor) { x = Math.round(x); y = Math.round(y); if (c !== VAZIO && this.dentro(x, y)) this.px[y * this.w + x] = c; }
  g(x: number, y: number): Cor { x = Math.round(x); y = Math.round(y); return this.dentro(x, y) ? this.px[y * this.w + x] : VAZIO; }
  apagar(x: number, y: number) { if (this.dentro(x, y)) this.px[y * this.w + x] = VAZIO; }
  ret(x: number, y: number, w: number, hh: number, c: Cor) { for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) this.p(x + i, y + j, c); }
  hl(x0: number, x1: number, y: number, c: Cor) { for (let x = Math.round(x0); x <= Math.round(x1); x++) this.p(x, y, c); }
  vl(x: number, y0: number, y1: number, c: Cor) { for (let y = Math.round(y0); y <= Math.round(y1); y++) this.p(x, y, c); }
  linha(x0: number, y0: number, x1: number, y1: number, c: Cor, esp = 1) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n;
      if (esp <= 1) this.p(x, y, c); else this.ret(Math.round(x - (esp - 1) / 2), Math.round(y - (esp - 1) / 2), esp, esp, c);
    }
  }
  elipse(cx: number, cy: number, rx: number, ry: number, c: Cor | ((x: number, y: number, nx: number, ny: number) => Cor)) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const nx = (x - cx) / rx, ny = (y - cy) / ry;
      if (nx * nx + ny * ny <= 1) this.p(x, y, typeof c === 'number' ? c : c(x, y, nx, ny));
    }
  }
  /** preenche onde fn devolve cor (VAZIO = não pinta) */
  campo(x0: number, y0: number, x1: number, y1: number, fn: (x: number, y: number) => Cor) {
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(this.h - 1, Math.ceil(y1)); y++)
      for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(this.w - 1, Math.ceil(x1)); x++) { const c = fn(x, y); if (c !== VAZIO) this.px[y * this.w + x] = c; }
  }
  poli(pts: [number, number][], c: Cor) {
    let y0 = Infinity, y1 = -Infinity;
    for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (let y = Math.round(y0); y <= Math.round(y1); y++) {
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) this.hl(xs[i], xs[i + 1], y, c);
    }
  }
  colar(o: Tela, dx = 0, dy = 0) { for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) { const c = o.px[y * o.w + x]; if (c !== VAZIO) this.p(x + dx, y + dy, c); } }
  /** carimbo desenhado à mão: linhas de caracteres, '.' = transparente */
  carimbo(x: number, y: number, linhas: string[], mapa: Record<string, Cor>, espelhar = false) {
    for (let j = 0; j < linhas.length; j++) for (let i = 0; i < linhas[j].length; i++) {
      const ch = linhas[j][espelhar ? linhas[j].length - 1 - i : i];
      if (ch !== '.' && ch !== ' ' && mapa[ch] !== undefined) this.p(x + i, y + j, mapa[ch]);
    }
  }
  /** contorno de 1 px por fora da massa pintada (onde está vazio) */
  contornar(c: Cor, x0 = 0, y0 = 0, x1 = this.w - 1, y1 = this.h - 1, soBaixo = false) {
    const marca: number[] = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (this.g(x, y) !== VAZIO || !this.dentro(x, y)) continue;
      const viz = soBaixo ? this.g(x, y - 1) !== VAZIO : this.g(x - 1, y) !== VAZIO || this.g(x + 1, y) !== VAZIO || this.g(x, y - 1) !== VAZIO || this.g(x, y + 1) !== VAZIO;
      if (viz) marca.push(y * this.w + x);
    }
    for (const i of marca) this.px[i] = c;
  }
  cores(): Set<Cor> { const s = new Set<Cor>(); for (const c of this.px) if (c !== VAZIO) s.add(c); return s; }
  recorte(x: number, y: number, w: number, hh: number): Tela { const t = new Tela(w, hh); for (let j = 0; j < hh; j++) for (let i = 0; i < w; i++) t.px[j * w + i] = this.g(x + i, y + j); return t; }
  ampliar(k: number): Tela { const t = new Tela(this.w * k, this.h * k); for (let y = 0; y < t.h; y++) for (let x = 0; x < t.w; x++) t.px[y * t.w + x] = this.px[Math.floor(y / k) * this.w + Math.floor(x / k)]; return t; }
}

/* ------------------------------ paleta ------------------------------ */
export interface PaletaDef {
  /** rampas do mais escuro ao mais claro (3–5 tons), hex escritos à mão */
  rampas: Record<string, string[]>;
  /** rampas que não escurecem à noite (fogo, janelas, brilhos) */
  emissivas?: string[];
  /** rampas com versão noturna escrita à mão */
  noite?: Record<string, string[]>;
  /** multiplicador e soma por canal da versão noturna calculada */
  mult?: [number, number, number];
  soma?: [number, number, number];
}
export type Pal = Record<string, Rampa>;
export function corNoite(c: Cor, mult: [number, number, number] = [0.34, 0.42, 0.66], soma: [number, number, number] = [10, 12, 34]): Cor {
  const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
  // puxa um pouco para o cinza antes de tingir: a noite dessatura
  const m = (r + g + b) / 3;
  const q = (v: number, i: number) => Math.max(0, Math.min(255, Math.round((v * 0.8 + m * 0.2) * mult[i] + soma[i])));
  return (q(r, 0) << 16) | (q(g, 1) << 8) | q(b, 2);
}
export function resolverPaleta(d: PaletaDef, noite: boolean): Pal {
  const o: Pal = {};
  for (const [k, v] of Object.entries(d.rampas)) {
    if (noite && d.noite?.[k]) o[k] = d.noite[k].map(hex);
    else if (noite && !d.emissivas?.includes(k)) o[k] = v.map((s) => corNoite(hex(s), d.mult, d.soma));
    else o[k] = v.map(hex);
  }
  return o;
}

/* ------------------------------ PNG indexado ------------------------------ */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc(b: Buffer) { let c = 0xffffffff; for (const v of b) c = CRC[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function bloco(tipo: string, dados: Buffer) {
  const len = Buffer.alloc(4); len.writeUInt32BE(dados.length);
  const td = Buffer.concat([Buffer.from(tipo, 'ascii'), dados]);
  const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, cr]);
}
/** PNG de 8 bits com paleta (índice 0 = transparente quando houver pixels vazios). */
export function png(t: Tela): Buffer {
  const lista = [...t.cores()].sort((a, b) => a - b);
  const temVazio = t.px.includes(VAZIO);
  const idx = new Map<Cor, number>();
  const base = temVazio ? 1 : 0;
  lista.forEach((c, i) => idx.set(c, i + base));
  if (lista.length + base > 256) throw new Error(`cores demais para PNG indexado: ${lista.length}`);
  const plte = Buffer.alloc((lista.length + base) * 3);
  lista.forEach((c, i) => { plte[(i + base) * 3] = (c >> 16) & 255; plte[(i + base) * 3 + 1] = (c >> 8) & 255; plte[(i + base) * 3 + 2] = c & 255; });
  const cru = Buffer.alloc((t.w + 1) * t.h);
  for (let y = 0; y < t.h; y++) for (let x = 0; x < t.w; x++) { const c = t.px[y * t.w + x]; cru[y * (t.w + 1) + 1 + x] = c === VAZIO ? 0 : idx.get(c)!; }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(t.w, 0); ihdr.writeUInt32BE(t.h, 4); ihdr[8] = 8; ihdr[9] = 3;
  const partes = [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloco('IHDR', ihdr), bloco('PLTE', plte)];
  if (temVazio) partes.push(bloco('tRNS', Buffer.from([0])));
  partes.push(bloco('IDAT', deflateSync(cru, { level: 9 })), bloco('IEND', Buffer.alloc(0)));
  return Buffer.concat(partes);
}

/* ------------------------------ contrato da arena ------------------------------ */
export interface Ctx { fundo: Tela; cenario: Tela; chao: Tela; P: Pal; noite: boolean }
export interface AnimDef {
  id: string; x: number; y: number; w: number; h: number;
  /** camada sobre a qual a tira é desenhada ('frente' = por cima das criaturas) */
  sobre: 'fundo' | 'cenario' | 'chao' | 'frente';
  fps: number;
  /** só existe neste período (ex.: vaga-lumes à noite) */
  so?: 'dia' | 'noite';
  pintar(t: Tela, q: number, c: Ctx): void;
}
export interface ArenaDef {
  id: string; nome: string; interna?: boolean;
  /** tom de luz sugerido para tingir as sombras elípticas das criaturas */
  paleta: PaletaDef;
  /** rampa (nome) cujo tom mais escuro vira a sombra elíptica das criaturas */
  sombra: string;
  /** raio do apoio (elipse) desenhado no chão: [rx, ry] inimigo e jogador */
  apoio?: { inimigo: [number, number]; jogador: [number, number] };
  pintar(c: Ctx): void;
  anims: AnimDef[];
}
export const APOIO = { inimigo: { x: 232, y: 84 }, jogador: { x: 84, y: 136 } };
