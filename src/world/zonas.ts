/** Carregador de zonas, grade viva (mutável durante a visita) e colisão pela legenda global de docs/ZONAS.md. */
import type { ZonaDef, ObjetoSpawn, Dir, Warp, Portao } from '../core/tipos';
import { cond } from '../core/estado';
import { catalogoBruto } from './deps';

const mods = import.meta.glob('../data/zonas/*.ts', { eager: true }) as Record<string, { default?: ZonaDef }>;
let _zonas: Map<string, ZonaDef> | undefined;
function zonas() {
  if (_zonas) return _zonas;
  _zonas = new Map();
  for (const m of Object.values(mods)) for (const v of Object.values(m)) if (v && typeof v === 'object' && Array.isArray((v as ZonaDef).mapaChars)) _zonas.set((v as ZonaDef).id, v as ZonaDef);
  return _zonas;
}
export const zonaDef = (id: string): ZonaDef | undefined => zonas().get(id);
export const listaZonas = (): ZonaDef[] => [...zonas().values()];

export const DX: Record<Dir, number> = { n: 0, s: 0, l: 1, o: -1 };
export const DY: Record<Dir, number> = { n: -1, s: 1, l: 0, o: 0 };
export const OPOSTO: Record<Dir, Dir> = { n: 's', s: 'n', l: 'o', o: 'l' };
export const dirPara = (dx: number, dy: number): Dir => (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'l' : 'o') : dy > 0 ? 's' : 'n');

const LIVRES = new Set('.,:;"%=glxo+');
const AGUAS = new Set('~dw');
export const ehLivre = (c: string) => LIVRES.has(c);
export const ehAgua = (c: string) => AGUAS.has(c);
export const SALIENCIA: Record<string, Dir> = { v: 's', '<': 'o', '>': 'l' };

/* ------------------------------ catálogo de objetos ------------------------------ */
/** célula de colisão: 0 livre · 1 bloqueia · 2 passarela (a pé passa mesmo sobre água; de barco não) */
export interface ObjCat { w: number; h: number; alto: number; /** [linha, de cima para baixo][coluna] */ colisao: number[][]; porta?: { dx: number; dy: number } }
const cacheCat = new Map<string, ObjCat | null>();
/** lê uma entrada do catálogo com tolerância de formato (ver relatório do motor / docs/ZONAS.md) */
export function objCat(nome: string): ObjCat | undefined {
  if (cacheCat.has(nome)) return cacheCat.get(nome) ?? undefined;
  const b = catalogoBruto()[nome];
  let r: ObjCat | null = null;
  if (b) {
    // pseudo-objetos (w ou h = 0, ex.: `tema`) não ocupam tiles
    const w = Math.max(0, b.w ?? 1), h = Math.max(0, b.h ?? 1);
    const col: number[][] = [];
    for (let j = 0; j < h; j++) {
      const linha: number[] = [];
      for (let i = 0; i < w; i++) {
        const c = b.colisao;
        let v = 1;
        if (c === false) v = 0;
        else if (Array.isArray(c) && c[j] !== undefined) { const l = c[j]; v = typeof l === 'string' ? ((l[i] ?? '#') === '~' ? 2 : '#x1X'.includes(l[i] ?? '#') ? 1 : 0) : l[i] ? 1 : 0; }
        linha.push(v);
      }
      col.push(linha);
    }
    let porta: ObjCat['porta'];
    const p = b.porta;
    if (Array.isArray(p)) porta = { dx: p[0], dy: p[1] ?? 0 };
    else if (typeof p === 'number') porta = { dx: p, dy: 0 };
    else if (p && typeof p === 'object') porta = { dx: p.dx ?? p.x ?? 0, dy: p.dy ?? p.y ?? 0 };
    if (porta && col[h - 1 - porta.dy]) col[h - 1 - porta.dy][porta.dx] = 0;
    r = { w, h, alto: b.alto ?? 0, colisao: col, porta };
  }
  cacheCat.set(nome, r);
  return r ?? undefined;
}

/* ------------------------------ zona viva ------------------------------ */
export class ZonaViva {
  w: number; h: number;
  g: string[];
  /** 1 = tile bloqueado por objeto do catálogo · 2 = passarela (píer, barco atracado) */
  private ob: Uint8Array;
  private objEm = new Map<number, ObjetoSpawn>();
  private warpEm = new Map<number, Warp>();
  constructor(public def: ZonaDef) {
    this.h = def.mapaChars.length; this.w = def.mapaChars.reduce((a, l) => Math.max(a, l.length), 0);
    this.g = []; for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) this.g.push(def.mapaChars[y][x] ?? ' ');
    this.ob = new Uint8Array(this.w * this.h);
    for (const o of def.objetos ?? []) {
      const c = objCat(o.o) ?? { w: 1, h: 1, alto: 0, colisao: [[1]] };
      for (let j = 0; j < c.h; j++) for (let i = 0; i < c.w; i++) {
        const x = o.x + i, y = o.y - (c.h - 1) + j;
        if (!this.dentro(x, y)) continue;
        if (c.colisao[j][i]) this.ob[this.i(x, y)] = c.colisao[j][i];
        if (c.colisao[j][i] || o.script || o.texto || o.tela) this.objEm.set(this.i(x, y), o);
      }
    }
    for (const w of def.warps) this.warpEm.set(this.i(w.x, w.y), w);
  }
  i(x: number, y: number) { return y * this.w + x; }
  dentro(x: number, y: number) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  ch(x: number, y: number): string { return this.dentro(x, y) ? this.g[this.i(x, y)] : ' '; }
  set(x: number, y: number, c: string) { if (this.dentro(x, y)) this.g[this.i(x, y)] = c; }
  objeto(x: number, y: number): ObjetoSpawn | undefined { return this.dentro(x, y) ? this.objEm.get(this.i(x, y)) : undefined; }
  temObjeto(x: number, y: number) { return this.dentro(x, y) && this.ob[this.i(x, y)] === 1; }
  /** bloqueio extra dinâmico (mecânicas de ginásio) */
  bloquear(x: number, y: number, b: boolean) { if (this.dentro(x, y)) this.ob[this.i(x, y)] = b ? 1 : 0; }
  warp(x: number, y: number): Warp | undefined { return this.dentro(x, y) ? this.warpEm.get(this.i(x, y)) : undefined; }
  portao(x: number, y: number): Portao | undefined { return this.def.portoes?.find((p) => x >= p.x && y >= p.y && x < p.x + (p.w ?? 1) && y < p.y + (p.h ?? 1) && !cond(p.requer)); }
  /** chão andável a pé (sem contar atores) */
  chao(x: number, y: number) {
    if (!this.dentro(x, y) || this.portao(x, y)) return false;
    const o = this.ob[this.i(x, y)];
    return o === 2 || (o === 0 && ehLivre(this.ch(x, y)));
  }
  agua(x: number, y: number) { return this.dentro(x, y) && ehAgua(this.ch(x, y)) && this.ob[this.i(x, y)] === 0; }
  correnteza(x: number, y: number): Dir | undefined { return this.def.correnteza?.find((c) => x >= c.x && y >= c.y && x < c.x + c.w && y < c.y + c.h)?.dir; }
}
