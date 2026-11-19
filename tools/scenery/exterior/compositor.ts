/**
 * Compositor de zonas exteriores: transforma `mapaChars` + objetos em imagens da zona inteira
 * (4 quadros de chão, camada alta, máscara de luz noturna), nas cores do período `dia`.
 * Bordas (caminho/grama, areia, margem de água) são autotile orgânico calculado pelos vizinhos, com
 * ondulação fixa por posição; `#` vira paredão com topo, face e sombra. O bake recorta em chunks.
 */
import type { ZonaDef } from '../../../src/core/tipos';
import type { Arte, ArteTileset, LetraCor, TilesetExterior } from '../../../src/data/tilesets/tipos';
import { SOMBRA } from '../../../src/data/tilesets/tipos';
import { Img, VAZIO, hex, pix, ruido } from '../../pixel/tile';
import { ARVORES, type Cores } from './arvores';
import { pintarObjeto, type InfoObjeto } from './objetos';

export const T = 16;
export const QUADROS = 4;
export const PRETO = hex('#0b0a14');

type Classe = 'base' | 'alt' | 'caminho' | 'encontro' | 'piso' | 'lama' | 'gelo' | 'perigo' | 'agua' | 'parede';
const PRIORIDADE: Record<Classe, number> = { base: 0, alt: 1, caminho: 2, encontro: 3, piso: 4, lama: 5, gelo: 6, perigo: 7, agua: 8, parede: 9 };
const CLASSE_DO_CHAR: Record<string, Classe> = {
  '.': 'base', ',': 'base', '"': 'base', ':': 'caminho', ';': 'alt', '%': 'encontro', '+': 'piso',
  g: 'gelo', l: 'lama', x: 'perigo', '~': 'agua', d: 'agua', w: 'agua', '#': 'parede', ' ': 'parede', e: 'parede',
};
const MASSA = '# ew';
const AGUA = '~dw';
/** ondulação das bordas orgânicas (px para dentro), escrita à mão; indexada pela posição global */
const ONDA = [1, 1, 1, 2, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 3, 2, 2, 1, 1, 1, 0, 0, 0, 1, 1, 2, 2, 2, 1, 1, 1, 0, 1, 1, 2, 3, 3, 2, 1, 1, 0, 0, 1];

export interface ZonaPintada {
  larg: number; alt: number; // em tiles
  /** chão completo em cada quadro de animação (quadros[0] = chão parado) */
  quadros: Img[];
  alto: Img;
  /** 1 por tile que muda entre os quadros */
  animado: Uint8Array;
  /** por pixel: 0 = sem luz, 1 = penumbra, 2 = luz (só vale à noite) */
  luz: Uint8Array;
  gramaAlta: [number, number][];
  dinamicos: { c: string; x: number; y: number }[];
  luzes: [number, number, number][];
  /** cores emissivas: dia → noite acesa */
  acesas: Map<number, number>;
}

export function coresDoTileset(ts: TilesetExterior): Cores {
  const tab = new Map<string, number>();
  for (const [k, v] of Object.entries(ts.paleta)) tab.set(k, hex(v));
  return (k: string) => {
    if (k.startsWith('#')) return hex(k);
    const v = tab.get(k);
    if (v === undefined) throw new Error(`letra de cor desconhecida: ${k}`);
    return v;
  };
}
export function tabelaSombra(ts: TilesetExterior): Map<number, number> {
  const c = coresDoTileset(ts), m = new Map<number, number>();
  for (const [de, para] of Object.entries(SOMBRA)) if (!m.has(c(de))) m.set(c(de), c(para as string));
  return m;
}
/** desenha uma arte do tileset; `base` = cor do '.' (sem base, '.' é transparente) */
export function arteImg(ts: TilesetExterior, a: Arte, base?: LetraCor): Img {
  const cores: Record<string, string> = { ...ts.paleta };
  if (base) cores['.'] = ts.paleta[base];
  if (a.length % 1 !== 0 || a.some((l) => l.length !== a[0].length)) throw new Error(`arte irregular em ${ts.nome}`);
  return pix(a, cores);
}
function transposta(i: Img): Img { const r = new Img(i.h, i.w); for (let y = 0; y < i.h; y++) for (let x = 0; x < i.w; x++) r.set(y, x, i.get(x, y)); return r; }
/** desloca (com volta) as linhas de `de` a `ate` em dx px: balanço da grama */
function balancar(i: Img, linhas: number[], dx: number): Img {
  const r = i.copia();
  for (const y of linhas) for (let x = 0; x < i.w; x++) r.set(x, y, i.get(x - dx, y));
  return r;
}

export class Compositor {
  readonly W: number; readonly H: number;
  readonly c: Cores;
  private tex = new Map<string, Img[]>();
  private sombraTab: Map<number, number>;
  private solos: Classe[];
  private aberto: Uint8Array;
  constructor(readonly zona: ZonaDef, readonly ts: TilesetExterior, readonly catalogo: Record<string, InfoObjeto>) {
    this.H = zona.mapaChars.length; this.W = Math.max(...zona.mapaChars.map((l) => l.length));
    this.c = coresDoTileset(ts);
    this.sombraTab = tabelaSombra(ts);
    const a = ts.arte, b = ts.base;
    const cheias: [string, Arte[], LetraCor][] = [
      ['base', a.chao, b.chao], ['caminho', a.caminho, b.caminho], ['alt', a.alt, b.alt], ['encontro', a.encontro, b.encontro],
      ['piso', a.piso, b.piso], ['gelo', a.gelo, b.gelo], ['lama', a.lama, b.lama], ['perigo', a.perigo, b.perigo],
      ['agua', a.agua, b.agua], ['cascata', a.cascata, b.agua], ['topo', a.paredeTopo, b.paredeTopo], ['face', a.paredeFace, 'R'],
    ];
    for (const [nome, artes, base] of cheias) this.tex.set(nome, artes.map((x) => arteImg(ts, x, base)));
    const sprites: (keyof ArteTileset)[] = ['funda', 'decor', 'gramaAlta', 'gramaPassagem', 'arbusto', 'flor'];
    for (const nome of sprites) this.tex.set(nome, (a[nome] as Arte[]).map((x) => arteImg(ts, x)));
    for (const nome of ['cercaPoste', 'cercaH', 'cercaV', 'cipo', 'pedregulho', 'rachada', 'trepadeira', 'salienciaV', 'salienciaE', 'ponte', 'canteiro', 'buraco', 'movel'] as (keyof ArteTileset)[])
      this.tex.set(nome, [arteImg(ts, a[nome] as Arte)]);
    this.solos = new Array(this.W * this.H);
    for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++) this.solos[y * this.W + x] = this.calcSolo(x, y);
    this.aberto = new Uint8Array(this.W * this.H);
    for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++) {
      let so = true;
      for (let j = -2; j <= 2 && so; j++) for (let i = -2; i <= 2; i++) { const k = this.solo(x + i, y + j); if (k !== 'agua' && k !== 'parede') { so = false; break; } }
      this.aberto[y * this.W + x] = so ? 1 : 0;
    }
  }
  img(nome: string, i = 0): Img { const l = this.tex.get(nome)!; return l[((i % l.length) + l.length) % l.length]; }
  ch(x: number, y: number): string {
    const yy = Math.max(0, Math.min(this.H - 1, y)), l = this.zona.mapaChars[yy];
    return l[Math.max(0, Math.min(this.W - 1, x))] ?? ' ';
  }
  private sobreAgua(x: number, y: number) { return AGUA.includes(this.ch(x - 1, y)) || AGUA.includes(this.ch(x + 1, y)) || AGUA.includes(this.ch(x, y - 1)) || AGUA.includes(this.ch(x, y + 1)); }
  private calcSolo(x: number, y: number): Classe {
    const c = this.ch(x, y), direto = CLASSE_DO_CHAR[c];
    if (direto) return direto;
    if (c === '=' && this.sobreAgua(x, y)) return 'agua';
    // objeto de 1 tile: herda o chão mais comum em volta
    const conta: Partial<Record<Classe, number>> = {};
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      if (!i && !j) continue;
      const k = CLASSE_DO_CHAR[this.ch(x + i, y + j)];
      if (k && PRIORIDADE[k] <= PRIORIDADE.piso) conta[k] = (conta[k] ?? 0) + (i && j ? 1 : 2);
    }
    let melhor: Classe = 'base', n = 0;
    for (const k of ['base', 'alt', 'caminho', 'encontro', 'piso'] as Classe[]) if ((conta[k] ?? 0) > n) { n = conta[k]!; melhor = k; }
    return melhor;
  }
  solo(x: number, y: number): Classe { return this.solos[Math.max(0, Math.min(this.H - 1, y)) * this.W + Math.max(0, Math.min(this.W - 1, x))]; }

  /** cor da textura de uma classe num pixel global */
  private texel(k: Classe, gx: number, gy: number, f: number): number {
    const tx = gx >> 4, ty = gy >> 4;
    let px = gx & 15, py = gy & 15;
    if (k === 'agua') {
      if ((tx + ty) & 1) { px = (px + 5) & 15; py = (py + 8) & 15; }
      const cor = this.img('agua', f).get(px, py);
      // mar aberto: as cristas claras viram ondas escuras, longe da margem
      if (this.aberto[Math.min(this.H - 1, ty) * this.W + Math.min(this.W - 1, tx)]) return cor === this.c('e') ? this.c('a') : cor === this.c('E') ? this.c('e') : cor;
      return cor;
    }
    if (k === 'perigo') { if ((tx + ty) & 1) { px = (px + 7) & 15; py = (py + 6) & 15; } return this.img('perigo', f + (tx & 1) * 2).get(px, py); }
    if (k === 'parede') return this.img('topo', ruido(tx, ty, 3)).get(px, py);
    const h = ruido(tx, ty, 1);
    let v = h % 97;
    if (k === 'base') {
      // manchas de capim mais denso (variantes 2 e 4) em escala de ~3 tiles, para não repetir
      const denso = ruido((tx + (ty >> 1)) >> 2, ty >> 1, 9) % 3 === 0;
      const lista = this.tex.get('base')!;
      v = lista.length >= 5 ? (denso ? [2, 4, 2, 0][h % 4] : [0, 1, 3, 3, 1, 0, 2][h % 7]) : h % lista.length;
    }
    if ((h >> 8) & 1 && k !== 'piso') px = 15 - px;
    return this.img(k, v).get(px, py);
  }

  private borda(k: Classe): { onda: number; raio: number; aro: LetraCor | null } {
    switch (k) {
      case 'caminho': return this.ts.bordaCaminho === 'reta' ? { onda: 0, raio: 0, aro: 't' } : { onda: 1, raio: 5, aro: 't' };
      case 'alt': return { onda: 1, raio: 5, aro: 's' };
      case 'encontro': return { onda: 1, raio: 4, aro: null };
      case 'piso': return { onda: 0, raio: 0, aro: 'r' };
      case 'lama': return { onda: 1, raio: 5, aro: 'k' };
      case 'gelo': return { onda: 1, raio: 4, aro: 'e' };
      case 'perigo': return { onda: 1, raio: 4, aro: 'k' };
      default: return { onda: 1, raio: 5, aro: null };
    }
  }

  /** pinta o chão de um tile (classe em camadas, com borda orgânica) nos quadros */
  private pintarSolo(q: Img[], x: number, y: number) {
    const k = this.solo(x, y);
    if (k === 'parede') return;
    const anim = k === 'agua' || k === 'perigo';
    const nq = anim ? QUADROS : 1;
    const pk = PRIORIDADE[k];
    const igual = (i: number, j: number) => { const o = this.solo(x + i, y + j); return o === k || PRIORIDADE[o] >= pk; };
    const n = igual(0, -1), s = igual(0, 1), o = igual(-1, 0), l = igual(1, 0);
    const no = igual(-1, -1), ne = igual(1, -1), so = igual(-1, 1), se = igual(1, 1);
    const bd = this.borda(k);
    const c = this.c;
    const viz = (lado: string): Classe => {
      const v = lado === 'n' ? this.solo(x, y - 1) : lado === 's' ? this.solo(x, y + 1) : lado === 'o' ? this.solo(x - 1, y) : lado === 'l' ? this.solo(x + 1, y)
        : lado === 'no' ? this.solo(x - 1, y - 1) : lado === 'ne' ? this.solo(x + 1, y - 1) : lado === 'so' ? this.solo(x - 1, y + 1) : this.solo(x + 1, y + 1);
      return PRIORIDADE[v] < pk ? v : 'base';
    };
    for (let py = 0; py < T; py++) for (let px = 0; px < T; px++) {
      const gx = x * T + px, gy = y * T + py;
      let d = 99, lado = '';
      if (k !== 'base') {
        const on = (i: number, sem: number) => bd.onda ? ONDA[(i + sem * 17) % ONDA.length] : 0;
        const tenta = (v: number, qual: string) => { if (v < d) { d = v; lado = qual; } };
        if (!n) tenta(py - on(gx, y), 'n');
        if (!s) tenta(15 - py - on(gx + 7, y + 1), 's');
        if (!o) tenta(px - on(gy + 3, x), 'o');
        if (!l) tenta(15 - px - on(gy + 11, x + 1), 'l');
        const r = bd.raio;
        if (r) {
          const canto = (livreA: boolean, livreB: boolean, diag: boolean, cxp: number, cyp: number, qual: string) => {
            if (!livreA && !livreB) { if (cxp < r && cyp < r) tenta(r - Math.hypot(r - cxp - 0.5, r - cyp - 0.5), qual); }
            else if (livreA && livreB && !diag) tenta(Math.hypot(cxp + 0.5, cyp + 0.5) - 2.6, qual);
          };
          canto(n, o, no, px, py, 'no'); canto(n, l, ne, 15 - px, py, 'ne'); canto(s, o, so, px, 15 - py, 'so'); canto(s, l, se, 15 - px, 15 - py, 'se');
        } else {
          if (n && o && !no && px === 0 && py === 0) tenta(0, 'no');
          if (n && l && !ne && px === 15 && py === 0) tenta(0, 'ne');
          if (s && o && !so && px === 0 && py === 15) tenta(0, 'so');
          if (s && l && !se && px === 15 && py === 15) tenta(0, 'se');
        }
      }
      for (let f = 0; f < nq; f++) {
        let cor: number;
        if (d < 0) {
          const sob = viz(lado);
          cor = this.texel(sob, gx, gy, f);
          if (d >= -1 && sob === 'base' && bd.onda && (gx * 3 + gy) % 4 < 2) cor = c('g');
        } else if (k === 'agua') {
          const sob = viz(lado);
          const barranco = sob === 'base' ? c('t') : sob === 'alt' ? c('s') : c('t');
          const onda = (gx + gy * 3 + f * 2) % 8;
          if (lado.includes('n') && d < 2) cor = d < 1 ? barranco : c('m');
          else if (lado.includes('n') && d < 3) cor = c('a');
          else if (lado.includes('n') && d < 4) cor = onda < 5 ? c('e') : c('A');
          else if (d < 1) cor = lado === 's' || lado.startsWith('s') ? (onda < 6 ? c('E') : c('e')) : onda < 5 ? c('E') : c('e');
          else if (d < 2 && !lado.includes('n')) cor = onda < 3 ? c('e') : this.texel('agua', gx, gy, f);
          else cor = this.texel('agua', gx, gy, f);
        } else if (d < 1 && bd.aro) cor = c(bd.aro);
        else cor = this.texel(k, gx, gy, f);
        q[f].set(gx, gy, cor);
      }
      if (!anim) for (let f = 1; f < QUADROS; f++) q[f].set(gx, gy, q[0].get(gx, gy));
    }
  }

  private massa(x: number, y: number) { return MASSA.includes(this.ch(x, y)); }
  private pintarParede(q: Img[], x: number, y: number) {
    const c = this.c, ch = this.ch(x, y);
    const t = new Img(T, T);
    if (ch === ' ') { t.ret(0, 0, T, T, PRETO); for (const f of q) f.colar(t, x * T, y * T); return; }
    const livreN = !this.massa(x, y - 1), livreS = !this.massa(x, y + 1), livreO = !this.massa(x - 1, y), livreL = !this.massa(x + 1, y);
    const vazioPerto = (i: number, j: number) => this.ch(x + i, y + j) === ' ';
    if (ch === 'e' || livreS) {
      const face = this.img('face', ruido(x, y, 4));
      t.colar(face, 0, 0);
      const continuaCima = ch === 'e' && (this.ch(x, y - 1) === 'e');
      if (continuaCima) for (let py = 0; py < 2; py++) for (let px = 0; px < T; px++) t.set(px, py, face.get(px, py + 5));
      if (ch === 'e' && !livreS) for (let py = 13; py < T; py++) for (let px = 0; px < T; px++) t.set(px, py, face.get(px, py - 8));
      if (livreN && !continuaCima) t.ret(0, 0, T, 1, c('k'));
      if (livreO) { t.ret(0, 0, 1, T, c('k')); t.ret(1, 1, 1, T - 2, c('q')); }
      if (livreL) { t.ret(T - 1, 0, 1, T, c('k')); t.ret(T - 2, 1, 1, T - 2, c('r')); }
      if (ch === 'e') t.colar(this.img('trepadeira'), 0, 0);
    } else {
      for (let py = 0; py < T; py++) for (let px = 0; px < T; px++) t.set(px, py, this.texel('parede', x * T + px, y * T + py, 0));
      if (livreN) { t.ret(0, 0, T, 1, c('k')); t.ret(0, 1, T, 1, c('Q')); for (let px = 0; px < T; px++) if (ONDA[(x * T + px) % ONDA.length] > 1) t.set(px, 2, c('q')); }
      if (livreO) { t.ret(0, 0, 1, T, c('k')); t.ret(1, livreN ? 1 : 0, 1, T, c('Q')); }
      if (livreL) { t.ret(T - 1, 0, 1, T, c('k')); t.ret(T - 2, livreN ? 1 : 0, 1, T, c('r')); }
      if (!livreN && !livreO && !this.massa(x - 1, y - 1)) t.set(0, 0, c('k'));
      if (!livreN && !livreL && !this.massa(x + 1, y - 1)) t.set(T - 1, 0, c('k'));
      // beirada de baixo: a linha de cima da face do tile de baixo já dá o brilho
      if (!livreO && !this.massa(x - 1, y + 1)) t.ret(0, T - 1, 1, 1, c('k'));
      if (!livreL && !this.massa(x + 1, y + 1)) t.ret(T - 1, T - 1, 1, 1, c('k'));
      // some no escuro perto do vazio fora do mapa
      if (vazioPerto(0, -1)) t.ret(0, 0, T, 3, PRETO);
      if (vazioPerto(-1, 0)) t.ret(0, 0, 3, T, PRETO);
      if (vazioPerto(1, 0)) t.ret(T - 3, 0, 3, T, PRETO);
      if (vazioPerto(0, 1)) t.ret(0, T - 3, T, 3, PRETO);
    }
    for (const f of q) f.colar(t, x * T, y * T);
  }

  private pintarCascata(q: Img[], x: number, y: number) {
    const c = this.c, base = this.img('cascata');
    const topo = this.ch(x, y - 1) !== 'w', pe = this.ch(x, y + 1) !== 'w';
    for (let f = 0; f < QUADROS; f++) for (let py = 0; py < T; py++) for (let px = 0; px < T; px++) {
      let cor = base.get(px, (py - f * 4 + 64) & 15);
      if (px === 0 && this.ch(x - 1, y) !== 'w') cor = c('k');
      if (px === T - 1 && this.ch(x + 1, y) !== 'w') cor = c('a');
      if (topo && py < 2) cor = py === 0 ? c('E') : (px + f) % 3 ? c('e') : c('E');
      if (pe && py >= 12) { const h = (px * 5 + f * 3 + py) % 7; cor = py >= 14 ? (h < 5 ? c('E') : c('e')) : h < 2 ? c('E') : cor; }
      q[f].set(x * T + px, y * T + py, cor);
    }
  }

  private pintarPonte(q: Img[], x: number, y: number) {
    const c = this.c, tabuas = this.img('ponte');
    const pt = (i: number, j: number) => this.ch(x + i, y + j) === '=';
    const ag = (i: number, j: number) => AGUA.includes(this.ch(x + i, y + j)) || this.massa(x + i, y + j);
    const vertical = (pt(0, -1) || pt(0, 1)) && !(pt(-1, 0) && pt(1, 0)) ? true : !pt(-1, 0) && !pt(1, 0) && ag(-1, 0) && ag(1, 0);
    const t = new Img(T, T);
    for (let py = 0; py < T; py++) for (let px = 0; px < T; px++) t.set(px, py, vertical ? tabuas.get(py, 3 + (px % 10)) : tabuas.get(px, 3 + (py % 10)));
    const cs = [c('k'), c('n'), c('m')];
    const guarda = (lado: 'n' | 's' | 'o' | 'l') => {
      for (let i = 0; i < T; i++) for (let j = 0; j < 3; j++) {
        if (lado === 'n') t.set(i, j, cs[j]); else if (lado === 's') t.set(i, T - 1 - j, cs[j === 0 ? 0 : 3 - j]);
        else if (lado === 'o') t.set(j, i, cs[j]); else t.set(T - 1 - j, i, cs[j === 0 ? 0 : 3 - j]);
      }
    };
    const borda = (i: number, j: number) => !pt(i, j) && ag(i, j);
    if (borda(0, -1)) guarda('n'); if (borda(0, 1)) guarda('s'); if (borda(-1, 0)) guarda('o'); if (borda(1, 0)) guarda('l');
    for (const f of q) f.colar(t, x * T, y * T);
  }

  /** junta tudo: chão em camadas → sombras → sprites por linha → camada alta */
  pintar(): ZonaPintada {
    const { W, H, c, zona, ts } = this;
    const q = Array.from({ length: QUADROS }, () => new Img(W * T, H * T));
    const alto = new Img(W * T, H * T);
    const animado = new Uint8Array(W * H);
    const sombra = new Uint8Array(W * T * H * T);
    const gramaAlta: [number, number][] = [];
    const dinamicos: { c: string; x: number; y: number }[] = [];
    const luzes: [number, number, number][] = [];
    const marcaSombra = (gx: number, gy: number) => { if (gx >= 0 && gy >= 0 && gx < W * T && gy < H * T && !this.massa(gx >> 4, gy >> 4)) sombra[gy * W * T + gx] = 1; };
    const elipseSombra = (cx: number, cy: number, rx: number, ry: number) => {
      for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) if ((xx * xx) / (rx * rx) + (yy * yy) / (ry * ry) <= 1) marcaSombra(cx + xx, cy + yy);
    };
    // 1) chão
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const ch = this.ch(x, y), k = this.solo(x, y);
      if (k === 'parede') this.pintarParede(q, x, y); else this.pintarSolo(q, x, y);
      if (k === 'agua' || k === 'perigo') animado[y * W + x] = 1;
      if (ch === 'w') this.pintarCascata(q, x, y);
      if (ch === 'd') for (let f = 0; f < QUADROS; f++) q[f].colar(this.img('funda', f >> 1), x * T, y * T);
      if (ch === '=') {
        this.pintarPonte(q, x, y);
        if (AGUA.includes(this.ch(x, y + 1))) for (let i = 0; i < T; i++) { marcaSombra(x * T + i, (y + 1) * T); marcaSombra(x * T + i, (y + 1) * T + 1); }
      }
      // sombra dos paredões sobre o chão vizinho (luz de cima-esquerda)
      if (k !== 'parede') {
        if (this.ch(x, y - 1) === '#' || this.ch(x, y - 1) === 'e') for (let i = 0; i < T; i++) for (let j = 0; j < 3 + (ONDA[(x * T + i) % ONDA.length] > 1 ? 1 : 0); j++) marcaSombra(x * T + i, y * T + j);
        if (this.ch(x - 1, y) === '#') for (let j = 0; j < T; j++) for (let i = 0; i < 3; i++) marcaSombra(x * T + i, y * T + j);
      }
    }
    // 2) sombras de árvores, moitas, pedras e objetos
    const objetos = (zona.objetos ?? []).map((sp) => {
      const info = this.catalogo[sp.o];
      if (!info) throw new Error(`zona ${zona.id}: objeto "${sp.o}" não está no catálogo`);
      return { sp, info, arte: pintarObjeto(sp.o, { c, ts, spawn: sp, info }) };
    });
    const arvores = new Map<number, ReturnType<(typeof ARVORES)[string]>>();
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const ch = this.ch(x, y);
      if (ch === 'T' || ch === 't') {
        const especie = ch === 't' ? ts.arvoreSacudivel : ts.arvore[ruido(x, y, 21) % 5 < 4 ? 0 : Math.min(1, ts.arvore.length - 1)];
        const pintor = ARVORES[especie];
        if (!pintor) throw new Error(`tileset ${ts.nome}: árvore "${especie}" não existe`);
        const a = pintor(c, ruido(x, y, 6) % 4);
        arvores.set(y * W + x, a);
        elipseSombra(x * T + 10, y * T + 13, a.sombra[0], a.sombra[1]);
      } else if (ch === 'b' || ch === 'M') elipseSombra(x * T + 9, y * T + 14, 8, 2);
      else if (ch === 'v') for (let i = 0; i < T; i++) { marcaSombra(x * T + i, y * T + 13); if (ONDA[(x * T + i) % ONDA.length]) marcaSombra(x * T + i, y * T + 14); }
      else if (ch === '<') for (let j = 0; j < T; j++) marcaSombra(x * T + 3, y * T + j);
      else if (ch === 'f') for (let i = 3; i < 13; i++) marcaSombra(x * T + i + 2, y * T + 15);
    }
    for (const { sp, info, arte } of objetos) {
      const x0 = sp.x * T, yBase = (sp.y + 1) * T, larg = info.w * T, altura = info.h * T;
      const tipo = arte.sombra ?? 'caixa';
      if (tipo === 'caixa') {
        for (let j = 5; j < altura + 3; j++) for (let i = 0; i < 5; i++) if (j - i > 2) marcaSombra(x0 + larg + i, yBase - altura + j);
        for (let i = 4; i < larg + 4; i++) for (let j = 0; j < 3; j++) marcaSombra(x0 + i, yBase + j);
      } else if (tipo === 'elipse') elipseSombra(x0 + (larg >> 1) + 2, yBase - 2, Math.max(6, (larg >> 1) + 1), 3);
      for (const [lx, ly, r] of arte.luzes ?? []) luzes.push([x0 - ((arte.img.w - larg) >> 1) + lx, yBase - arte.img.h + ly, r]);
    }
    for (const f of q) for (let i = 0; i < sombra.length; i++) if (sombra[i]) { const s = this.sombraTab.get(f.d[i]); if (s !== undefined) f.d[i] = s; }

    // 3) sprites, de cima para baixo (quem está mais ao sul cobre quem está ao norte)
    const todos = (fn: (f: Img, i: number) => void) => q.forEach(fn);
    /** cola com a base alinhada ao pé do tile; o que passa do topo do tile vai para a camada alta */
    const erguer = (img: Img, x: number, y: number, linhasAltas: number) => {
      const dx = x * T + 8 - (img.w >> 1), dy = (y + 1) * T - img.h;
      const corte = img.h - T - 0;
      if (corte > 0 && linhasAltas !== 0) { alto.colar(img.recorte(0, 0, img.w, corte), dx, dy); const base = img.recorte(0, corte, img.w, T); todos((f) => f.colar(base, dx, dy + corte)); }
      else todos((f) => f.colar(img, dx, dy));
    };
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const ch = this.ch(x, y), X = x * T, Y = y * T, h = ruido(x, y, 2);
        switch (ch) {
          case ',': {
            todos((f) => f.colar(this.img('decor', h), X, Y, { espelhar: ((h >> 5) & 1) === 1 }));
            if (h % 3 === 0) { animado[y * W + x] = 1; todos((f, i) => f.colar(this.img('flor', ((i + (h >> 3)) % 4) >> 1), X + ((h >> 6) % 7) - 3, Y + ((h >> 9) % 5) - 1)); }
            break;
          }
          case '"': {
            const g = this.img('gramaAlta', h);
            const qs = [g, balancar(g, [0, 1, 2, 3, 8, 9, 10], 1), g, balancar(g, [0, 1, 2, 8, 9], -1)];
            animado[y * W + x] = 1; gramaAlta.push([x, y]);
            todos((f, i) => f.colar(qs[(i + (x + y)) % 4], X, Y));
            break;
          }
          case 'T': case 't': erguer(arvores.get(y * W + x)!.img, x, y, 1); break;
          case 'b': todos((f) => f.colar(this.img('arbusto', h), X, Y - 1)); break;
          case 'f': {
            const liga = (i: number, j: number) => this.ch(x + i, y + j) === 'f';
            const hh = this.img('cercaH'), vv = this.img('cercaV');
            todos((f) => {
              if (liga(0, -1)) f.colar(vv.recorte(0, 0, T, 8), X, Y);
              if (liga(-1, 0)) f.colar(hh.recorte(0, 0, 8, T), X, Y);
              if (liga(1, 0)) f.colar(hh.recorte(8, 0, 8, T), X + 8, Y);
              f.colar(this.img('cercaPoste'), X, Y);
              if (liga(0, 1)) f.colar(vv.recorte(0, 8, T, 8), X, Y + 8);
            });
            break;
          }
          case 'c': case 'p': case 'r': dinamicos.push({ c: ch, x, y }); break;
          case 'v': todos((f) => f.colar(this.img('salienciaV'), X, Y)); break;
          case '<': todos((f) => f.colar(this.img('salienciaE'), X, Y)); break;
          case '>': todos((f) => f.colar(this.img('salienciaE'), X, Y, { espelhar: true })); break;
          case 'C': todos((f) => f.colar(this.img('canteiro'), X, Y)); break;
          case 'o': todos((f) => f.colar(this.img('buraco'), X, Y)); break;
          case 'M': todos((f) => f.colar(this.img('movel'), X, Y - 1)); break;
        }
      }
      for (const { sp, info, arte } of objetos) {
        if (sp.y !== y) continue;
        const x0 = sp.x * T - ((arte.img.w - info.w * T) >> 1), y0 = (sp.y + 1) * T - arte.img.h, corte = arte.img.h - info.h * T;
        if (corte > 0) alto.colar(arte.img.recorte(0, 0, arte.img.w, corte), x0, y0);
        const quadrosObj = arte.quadros ?? [arte.img];
        todos((f, i) => { const im = quadrosObj[i % quadrosObj.length]; f.colar(im.recorte(0, Math.max(0, corte), im.w, im.h - Math.max(0, corte)), x0, y0 + Math.max(0, corte)); });
        if (arte.quadros) for (let j = 0; j < info.h; j++) for (let i = 0; i < info.w; i++) if (sp.x + i < W && sp.y - j >= 0) animado[(sp.y - j) * W + sp.x + i] = 1;
      }
    }
    // 4) máscara de luz noturna
    const luz = new Uint8Array(W * T * H * T);
    for (const [lx, ly, r] of luzes) for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) {
      const gx = lx + xx, gy = ly + yy;
      if (gx < 0 || gy < 0 || gx >= W * T || gy >= H * T) continue;
      const d = Math.hypot(xx, yy * 1.25) / r + (((gx + gy) & 1) ? 0.04 : 0);
      const nivel = d <= 0.62 ? 2 : d <= 1 ? 1 : 0;
      if (nivel > luz[gy * W * T + gx]) luz[gy * W * T + gx] = nivel;
    }
    const cn = ts.construcao;
    const acesas = new Map<number, number>([[hex(cn.vidro), hex(cn.vidroNoite)], [hex(cn.luz), hex(cn.luzNoite)]]);
    for (const l of ts.acesas ?? []) acesas.set(c(l), c(l));
    return { larg: W, alt: H, quadros: q, alto, animado, luz, gramaAlta, dinamicos, luzes, acesas };
  }
}
export { VAZIO };
