/**
 * Pincel de pixel art para os FX de batalha: cada quadro é desenhado em resolução nativa, pixel a pixel,
 * com formas inteiras (discos, losangos, polígonos, raios em zigue-zague) e contorno escuro de 1 px.
 * Roda só no build (tools/build-fx.ts); o jogo recebe um PNG pronto.
 */
export type Cor = string; // '#rrggbb' ou '#rrggbbaa'
export type Rampa = [Cor, Cor, Cor, Cor, Cor]; // contorno, sombra, base, luz, brilho
export type Pt = [number, number];

const cache = new Map<string, number>();
export function rgba(c: Cor): number {
  let v = cache.get(c);
  if (v === undefined) { const h = c.slice(1); const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255; v = ((parseInt(h.slice(0, 2), 16) << 24) | (parseInt(h.slice(2, 4), 16) << 16) | (parseInt(h.slice(4, 6), 16) << 8) | a) >>> 0; cache.set(c, v); }
  return v;
}
/** acaso determinístico por semente (os FX saem iguais em todo build) */
export function semente(s: number) { let c = (s * 2654435761) >>> 0 || 1; return () => { c = (Math.imul(c, 1103515245) + 12345) >>> 0; return ((c >>> 8) & 0xffff) / 65536; }; }
export const TAU = Math.PI * 2;
export const girar = (pts: Pt[], ang: number, cx = 0, cy = 0): Pt[] => { const s = Math.sin(ang), c = Math.cos(ang); return pts.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]); };

export class Quadro {
  d: Uint32Array;
  constructor(public w: number, public h: number) { this.d = new Uint32Array(w * h); }
  set(x: number, y: number, c: Cor) { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.w + x] = rgba(c); }
  apagar(x: number, y: number) { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.w + x] = 0; }
  cheio(x: number, y: number) { return x >= 0 && y >= 0 && x < this.w && y < this.h && this.d[y * this.w + x] !== 0; }
  ret(x: number, y: number, w: number, h: number, c: Cor) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); return this; }
  elipse(cx: number, cy: number, rx: number, ry: number, c: Cor) {
    if (rx <= 0 || ry <= 0) return this;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const a = (x - cx) / (rx + 0.35), b = (y - cy) / (ry + 0.35); if (a * a + b * b <= 1) this.set(x, y, c); }
    return this;
  }
  disco(cx: number, cy: number, r: number, c: Cor) { return this.elipse(cx, cy, r, r, c); }
  /** elipse inclinada (folhas, penas, pétalas) */
  elipseRot(cx: number, cy: number, rx: number, ry: number, ang: number, c: Cor) {
    const R = Math.max(rx, ry) + 1, s = Math.sin(-ang), k = Math.cos(-ang);
    for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) { const dx = x - cx, dy = y - cy, a = (dx * k - dy * s) / (rx + 0.3), b = (dx * s + dy * k) / (ry + 0.3); if (a * a + b * b <= 1) this.set(x, y, c); }
    return this;
  }
  /** anel (ou arco entre a0 e a1, em voltas 0..1) de espessura `e` */
  anel(cx: number, cy: number, rx: number, ry: number, e: number, c: Cor, a0 = 0, a1 = 1) {
    if (rx <= 0 || ry <= 0) return this;
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
      const a = (x - cx) / (rx + 0.35), b = (y - cy) / (ry + 0.35), d = a * a + b * b;
      const ai = (x - cx) / Math.max(0.01, rx - e + 0.35), bi = (y - cy) / Math.max(0.01, ry - e + 0.35);
      if (d > 1 || (rx > e && ry > e && ai * ai + bi * bi < 1)) continue;
      if (a0 !== 0 || a1 !== 1) { let t = Math.atan2(y - cy, x - cx) / TAU; t = ((t - a0) % 1 + 1) % 1; if (t > ((a1 - a0) % 1 + 1) % 1 && a1 - a0 < 1) continue; }
      this.set(x, y, c);
    }
    return this;
  }
  linha(x0: number, y0: number, x1: number, y1: number, c: Cor, e = 1) {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n, y = y0 + ((y1 - y0) * i) / n; if (e <= 1) this.set(x, y, c); else this.disco(x, y, (e - 1) / 2, c); }
    return this;
  }
  poli(pts: Pt[], c: Cor) {
    let y0 = Infinity, y1 = -Infinity; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.round(y0); y <= Math.round(y1); y++) {
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0])); }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x <= Math.round(xs[i + 1]); x++) this.set(x, y, c);
    }
    return this;
  }
  /** estrela de `n` pontas */
  estrela(cx: number, cy: number, R: number, r: number, n: number, ang: number, c: Cor) {
    const pts: Pt[] = []; for (let i = 0; i < n * 2; i++) { const a = ang + (i * Math.PI) / n, k = i % 2 ? r : R; pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k]); }
    return this.poli(pts, c);
  }
  /** brilho em cruz (4 pontas finas) */
  cintilar(cx: number, cy: number, r: number, c: Cor, miolo?: Cor) {
    for (let i = -r; i <= r; i++) { this.set(cx + i, cy, c); this.set(cx, cy + i, c); }
    if (r >= 3) { this.set(cx - 1, cy - 1, c); this.set(cx + 1, cy - 1, c); this.set(cx - 1, cy + 1, c); this.set(cx + 1, cy + 1, c); }
    if (miolo) { this.set(cx, cy, miolo); if (r >= 3) { this.set(cx - 1, cy, miolo); this.set(cx + 1, cy, miolo); this.set(cx, cy - 1, miolo); this.set(cx, cy + 1, miolo); } }
    return this;
  }
  /** bola sombreada em 3 tons com brilho pontual (luz de cima à esquerda) */
  bola(cx: number, cy: number, r: number, p: Rampa) {
    this.disco(cx, cy, r, p[1]); this.disco(cx - r * 0.12, cy - r * 0.15, r * 0.82, p[2]);
    if (r >= 3) this.disco(cx - r * 0.3, cy - r * 0.32, r * 0.45, p[3]);
    if (r >= 2) this.set(cx - r * 0.45, cy - r * 0.45, p[4]);
    return this;
  }
  /** raio em zigue-zague entre dois pontos */
  raio(x0: number, y0: number, x1: number, y1: number, rnd: () => number, desvio: number, c: Cor, e = 1, passos = 5) {
    let px = x0, py = y0; const nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1;
    for (let i = 1; i <= passos; i++) { const t = i / passos, k = i === passos ? 0 : (rnd() - 0.5) * 2 * desvio; const x = x0 + (x1 - x0) * t + (nx / L) * k, y = y0 + (y1 - y0) * t + (ny / L) * k; this.linha(px, py, x, y, c, e); px = x; py = y; }
    return this;
  }
  /** chama: perfil de gota com ondulação, em camadas da sombra ao brilho */
  chama(cx: number, base: number, larg: number, alt: number, fase: number, p: Rampa) {
    const camadas: [number, Cor][] = [[1, p[1]], [0.72, p[2]], [0.46, p[3]], [0.22, p[4]]];
    for (const [k, c] of camadas) {
      const h = alt * (0.55 + 0.45 * k), w = (larg / 2) * k;
      for (let j = 0; j < h; j++) { const t = j / h, perfil = Math.sin(Math.min(1, t * 1.25 + 0.18) * Math.PI) * (1 - t * 0.35), on = Math.sin(fase * TAU + t * 5) * t * larg * 0.16; const half = w * perfil; for (let x = Math.round(cx + on - half); x <= Math.round(cx + on + half); x++) if (half >= 0.4) this.set(x, base - j, c); }
    }
    return this;
  }
  /** nuvem de bolotas (fumaça, veneno, poeira) */
  nuvem(cx: number, cy: number, r: number, n: number, rnd: () => number, fase: number, p: Rampa) {
    const bs: [number, number, number][] = [];
    for (let i = 0; i < n; i++) { const a = rnd() * TAU + fase * 0.6, d = rnd() * r * 0.6; bs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, r * (0.35 + rnd() * 0.3)]); }
    for (const [x, y, k] of bs) this.disco(x, y + 1, k, p[1]);
    for (const [x, y, k] of bs) this.disco(x, y, k * 0.85, p[2]);
    for (const [x, y, k] of bs) this.disco(x - k * 0.25, y - k * 0.3, k * 0.45, p[3]);
    return this;
  }
  /** contorno externo de 1 px (4 vizinhos) na cor dada */
  contorno(c: Cor, diagonal = false) {
    const add: number[] = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.d[y * this.w + x]) continue;
      if (this.cheio(x - 1, y) || this.cheio(x + 1, y) || this.cheio(x, y - 1) || this.cheio(x, y + 1) || (diagonal && (this.cheio(x - 1, y - 1) || this.cheio(x + 1, y - 1) || this.cheio(x - 1, y + 1) || this.cheio(x + 1, y + 1)))) add.push(y * this.w + x);
    }
    const v = rgba(c); for (const i of add) this.d[i] = v;
    return this;
  }
  /** remove pixels soltos (sem nenhum vizinho) */
  limpar() { for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.cheio(x, y) && !this.cheio(x - 1, y) && !this.cheio(x + 1, y) && !this.cheio(x, y - 1) && !this.cheio(x, y + 1) && !this.cheio(x - 1, y - 1) && !this.cheio(x + 1, y + 1) && !this.cheio(x - 1, y + 1) && !this.cheio(x + 1, y - 1)) this.d[y * this.w + x] = 0; return this; }
  /** desenha uma grade de caracteres ('.' = vazio) com o mapa de cores dado */
  grade(linhas: string[], cores: Record<string, Cor>, ox = 0, oy = 0) { linhas.forEach((l, j) => { for (let i = 0; i < l.length; i++) { const c = cores[l[i]]; if (c) this.set(ox + i, oy + j, c); } }); return this; }
}

export interface FxDef {
  id: string; w: number; h: number; n: number; fps: number;
  /** desenha o quadro `i` (f = i / n, de 0 a quase 1) */
  desenhar(q: Quadro, i: number, f: number): void;
}
