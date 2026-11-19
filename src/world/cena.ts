/**
 * Render do mapa em DOM: chunks do bake (chão, anim, alto) ou modo de depuração por caractere,
 * câmera em px inteiros, crossfade de período, clima em camadas repetidas e máscara de escuro/névoa
 * em blocos pontilhados (sem desfoque, sem translucidez).
 */
import type { Periodo, ClimaId } from '../core/tipos';
import { TILE, TELA_W, TELA_H } from '../core/tipos';
import { cosmetico } from '../core/rng';
import { precarregar } from '../core/assets';
import type { Ator } from './ator';
import { ZonaViva, objCat } from './zonas';
import { Pix, injetarEstilo, padrao, pixGrama, pixFolha, pixRespingo, pixPoeira, type Ret } from './pixel';

export interface BakeMeta { w: number; h: number; /** lado do chunk em px */ chunk: number; periodos: Periodo[]; chunks: Map<string, { alto: boolean; anim: boolean }>; quadros: number; animMs: number }
interface FolhaTiles { /** prefixo do tema de interior ('' nos exteriores) */ tema: string; src: string; periodos: Periodo[]; alturaPeriodo: number; pecas: Record<string, { x: number; y: number; w: number; h: number; quadros: number }> }
async function lerJson(url: string): Promise<any | null> {
  try { const r = await fetch(url); if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null; return await r.json(); } catch { return null; }
}
/** lê public/assets/zonas/<id>/zona.json (formato de tools/bake-maps.ts); null se o bake ainda não existe */
export async function lerBake(id: string): Promise<BakeMeta | null> {
  const j = await lerJson(`assets/zonas/${id}/zona.json`);
  if (!j) return null;
  const w = j.largura ?? j.w, h = j.altura ?? j.h, tile = j.tile ?? TILE;
  if (!w || !h) return null;
  const bruto = j.chunk ?? 10, chunk = bruto <= 40 ? bruto * tile : bruto;
  const chunks = new Map<string, { alto: boolean; anim: boolean }>();
  if (Array.isArray(j.chunks)) for (const c of j.chunks as any[]) {
    if (typeof c === 'string') chunks.set(c, { alto: true, anim: true });
    else chunks.set(`${c.cx ?? c.x}_${c.cy ?? c.y}`, { alto: !!c.alto, anim: !!c.anim });
  } else for (let cy = 0; cy * chunk < h * TILE; cy++) for (let cx = 0; cx * chunk < w * TILE; cx++) chunks.set(`${cx}_${cy}`, { alto: true, anim: true });
  return { w, h, chunk, periodos: j.periodos ?? ['dia'], chunks, quadros: j.quadros ?? 4, animMs: j.animMs ?? 1000 / (j.fps ?? 4) };
}
/** tema de interior da zona: pseudo-objeto `tema`, senão as regras `porZona`/`rodizio` do tilesheet (as mesmas do bake) */
function temaDaZona(z: { id: string; objetos?: { o: string; [k: string]: unknown }[] }, f: { porZona?: [string, string][]; rodizio?: string[] }): string {
  const o = z.objetos?.find((x) => x.o === 'tema');
  if (o && typeof o.tema === 'string') return o.tema;
  for (const [er, id] of f.porZona ?? []) if (new RegExp(er).test(z.id)) return id;
  if (!f.rodizio?.length) return '';
  let s = 0; for (const ch of z.id) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return f.rodizio[s % f.rodizio.length];
}
/** peça do tilesheet (public/assets/tiles/<tileset>.png): sprites que não vão no bake (obstáculos removíveis, grama de passagem) */
export class Peca {
  el = document.createElement('div');
  w: number; h: number; private q = 0; private per = 0;
  constructor(private f: FolhaTiles, private nome: string, pai: HTMLElement, periodo: Periodo) {
    const p = f.pecas[nome];
    this.w = p.w; this.h = p.h;
    this.el.className = 'chunk peca'; this.el.style.width = p.w + 'px'; this.el.style.height = p.h + 'px';
    this.el.style.backgroundImage = `url(${f.src})`;
    this.periodo(periodo);
    pai.append(this.el);
  }
  private pinta() { const p = this.f.pecas[this.nome]; this.el.style.backgroundPosition = `${-(p.x + (this.q % p.quadros) * p.w)}px ${-(p.y + this.per * this.f.alturaPeriodo)}px`; }
  periodo(p: Periodo) { this.per = Math.max(0, this.f.periodos.indexOf(p)); this.pinta(); }
  quadro(i: number): this { if (i !== this.q) { this.q = i; this.pinta(); } return this; }
  pos(x: number, y: number, z?: number): this { this.el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`; if (z !== undefined) this.el.style.zIndex = String(Math.round(z)); return this; }
  ver(b: boolean): this { this.el.style.display = b ? '' : 'none'; return this; }
  remover() { this.el.remove(); }
}
export type Prop = Pix | Peca;

const COR: Record<string, string> = { '.': '#7ec850', ',': '#93d864', ':': '#d9b97a', ';': '#ecd9a0', '"': '#4fa843', '%': '#74644f', '~': '#3f7fd9', d: '#1f3f99', w: '#9fd0ff', '=': '#a8763e', '#': '#5a5560', T: '#1f5a25', t: '#2f7a2a', b: '#4f8f3f', f: '#8a6a4a', e: '#7a8a4a', v: '#b89a5a', '<': '#b89a5a', '>': '#b89a5a', g: '#cfeeff', l: '#6a4a2a', x: '#a03fa0', o: '#15121a', '+': '#c8a070', M: '#7a4a2a', ' ': '#000000' };
const BORDA: Record<string, string> = { v: 'border-bottom:3px solid #6b5230', '<': 'border-left:3px solid #6b5230', '>': 'border-right:3px solid #6b5230', t: 'border:2px solid #7a4e2a', e: 'background-image:repeating-linear-gradient(0deg,#3f8f3a 0 2px,transparent 2px 5px)', '"': 'background-image:repeating-linear-gradient(90deg,#2f7d32 0 1px,transparent 1px 4px)', d: 'border:2px dotted #9fd0ff', w: 'background-image:repeating-linear-gradient(0deg,#ffffff 0 1px,transparent 1px 4px)', x: 'border:1px dashed #000' };

interface Conjunto { periodo: Periodo; eb: HTMLElement; ea: HTMLElement; chunks: Map<string, HTMLElement[]> }
interface Particula { p: Pix; x: number; y: number; vx: number; vy: number; t: number; vida: number; cada: number; z: number }
interface CamadaClima { el: HTMLElement; x: number; y: number; vx: number; vy: number; cada: number; w: number; h: number }

/** pontilhado ordenado 4×4: n = 1 (25%), 2 (50%), 3 (75%) */
const PONT = (n: number, cor: string): string => {
  const liga = (x: number, y: number) => (n === 1 ? x % 2 === 0 && y % 2 === 0 : n === 2 ? (x + y) % 2 === 0 : !(x % 2 === 1 && y % 2 === 1));
  const rs: Ret[] = [];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (liga(x, y)) rs.push([x, y, 1, 1, cor]);
  return padrao(4, 4, rs);
};

export class Cena {
  el = document.createElement('div');
  cam = document.createElement('div');
  baixo = document.createElement('div');
  sprites = document.createElement('div');
  alto = document.createElement('div');
  climaEl = document.createElement('div');
  escuroEl = document.createElement('div');
  sobre = document.createElement('div');
  flash = document.createElement('div');
  zv!: ZonaViva; bake: BakeMeta | null = null; debug = false;
  /** tilesheet do tileset da zona (só com bake) */
  folha: FolhaTiles | null = null;
  camX = 0; camY = 0;
  private conj?: Conjunto; private velho?: Conjunto; private trocaT = 0;
  private animQ = 0; private animT = 0;
  private props = new Map<string, Prop>();
  private parts: Particula[] = [];
  private gramas: Prop[] = [];
  private farfalho = new Map<number, number>();
  private clima: ClimaId = 'limpo'; private camadas: CamadaClima[] = []; private climaT = 0;
  private escuro: { raio: number; cor: string } | null = null; private buraco?: HTMLElement; private faixas: HTMLElement[] = [];
  private pan: { x0: number; y0: number; x1: number; y1: number; t: number; dur: number; fim?: () => void } | null = null;
  private camFixa: { x: number; y: number } | null = null;
  private tremorT = 0;
  private quadro = 0;

  constructor() {
    injetarEstilo();
    this.el.className = 'mundo tela-mundo';
    this.cam.className = 'cam'; this.baixo.className = 'baixo'; this.sprites.className = 'sprites'; this.alto.className = 'alto';
    this.climaEl.className = 'clima'; this.escuroEl.className = 'escuro'; this.sobre.className = 'sobre'; this.flash.className = 'flash';
    this.cam.append(this.baixo, this.sprites, this.alto);
    this.el.append(this.cam, this.climaEl, this.sobre, this.escuroEl, this.flash);
  }

  /* ------------------------------ zona ------------------------------ */
  async montar(zv: ZonaViva, periodo: Periodo, forcarDebug: boolean) {
    this.limpar();
    this.zv = zv;
    this.bake = forcarDebug ? null : await lerBake(zv.def.id);
    this.debug = !this.bake;
    this.folha = null;
    if (this.bake) { const f = await lerJson(`assets/tiles/${zv.def.tileset}.json`); if (f?.pecas) { this.folha = { tema: temaDaZona(zv.def, f), src: `assets/tiles/${zv.def.tileset}.png`, periodos: f.periodos ?? ['dia'], alturaPeriodo: f.alturaPeriodo ?? 0, pecas: f.pecas }; await precarregar(this.folha.src); } }
    this.el.dataset.modo = this.debug ? 'debug' : 'bake';
    this.conj = this.novoConjunto(this.periodoEfetivo(periodo));
  }
  limpar() {
    for (const c of [this.conj, this.velho]) if (c) { c.eb.remove(); c.ea.remove(); }
    this.conj = this.velho = undefined;
    for (const p of this.props.values()) p.remover(); this.props.clear();
    for (const p of this.parts) p.p.remover(); this.parts = [];
    for (const g of this.gramas) g.remover(); this.gramas = [];
    this.farfalho.clear(); this.pan = null; this.camFixa = null; this.tremorT = 0;
    this.sprites.replaceChildren();
  }
  private periodoEfetivo(p: Periodo): Periodo {
    if (this.bake) return this.bake.periodos.includes(p) ? p : this.bake.periodos.includes('dia') ? 'dia' : this.bake.periodos[0];
    return ['interior', 'caverna', 'ginasio', 'dungeon'].includes(this.zv.def.tipo) || this.zv.def.submerso ? 'dia' : p;
  }
  private novoConjunto(periodo: Periodo): Conjunto {
    const eb = document.createElement('div'), ea = document.createElement('div');
    eb.className = ea.className = 'conj per-' + periodo;
    this.baixo.append(eb); this.alto.append(ea);
    const c: Conjunto = { periodo, eb, ea, chunks: new Map() };
    if (this.debug) this.objetosDebug(c);
    return c;
  }
  /** troca de período com crossfade de 1 s entre os dois conjuntos de chunks */
  definirPeriodo(p: Periodo) {
    if (!this.conj) return;
    const ef = this.periodoEfetivo(p);
    if (ef === this.conj.periodo) return;
    if (this.velho) { this.velho.eb.remove(); this.velho.ea.remove(); }
    this.velho = this.conj;
    const novo = this.novoConjunto(ef);
    novo.eb.style.opacity = novo.ea.style.opacity = '0';
    this.conj = novo;
    this.sincronizar();
    void novo.eb.offsetWidth;
    novo.eb.style.opacity = novo.ea.style.opacity = '1';
    this.trocaT = 66;
    this.el.dataset.periodo = ef;
    for (const p of [...this.props.values(), ...this.gramas]) if (p instanceof Peca) p.periodo(ef);
  }
  get periodo() { return this.conj?.periodo; }
  private url(camada: string, per: Periodo, k: string) { return `assets/zonas/${this.zv.def.id}/${camada}-${per}-${k}.png`; }
  /** imagens dos chunks visíveis ao redor de um ponto (para pré-carga antes de abrir a cortina) */
  urlsVisiveis(cx: number, cy: number, per: Periodo): string[] {
    if (!this.bake) return [];
    const b = this.bake, ef = this.periodoEfetivo(per), out: string[] = [];
    for (let j = Math.floor((cy - 140) / b.chunk); j <= Math.floor((cy + 140) / b.chunk); j++) for (let i = Math.floor((cx - 210) / b.chunk); i <= Math.floor((cx + 210) / b.chunk); i++) {
      const m = b.chunks.get(`${i}_${j}`); if (!m) continue;
      out.push(this.url('chao', ef, `${i}_${j}`)); if (m.alto) out.push(this.url('alto', ef, `${i}_${j}`)); if (m.anim) out.push(this.url('anim', ef, `${i}_${j}`));
    }
    return out;
  }
  preCarregar(cx: number, cy: number, per: Periodo) { return Promise.all(this.urlsVisiveis(cx, cy, per).map(precarregar)); }

  private criarChunk(c: Conjunto, cx: number, cy: number): HTMLElement[] {
    const T = this.bake?.chunk ?? 160, k = `${cx}_${cy}`, els: HTMLElement[] = [];
    const div = (classe: string, pai: HTMLElement, img?: string) => { const d = document.createElement('div'); d.className = classe; d.style.width = d.style.height = T + 'px'; d.style.transform = `translate(${cx * T}px,${cy * T}px)`; if (img) d.style.backgroundImage = `url(${img})`; pai.append(d); els.push(d); return d; };
    if (this.bake) {
      const m = this.bake.chunks.get(k); if (!m) return els;
      div('chunk chao', c.eb, this.url('chao', c.periodo, k));
      if (m.anim) { const a = div('chunk anim', c.eb, this.url('anim', c.periodo, k)); a.style.backgroundSize = `${this.bake.quadros * T}px ${T}px`; a.style.backgroundPositionX = -this.animQ * T + 'px'; }
      if (m.alto) div('chunk alto', c.ea, this.url('alto', c.periodo, k));
    } else {
      const d = div('dbg', c.eb); const n = T / TILE; let h = '';
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        const x = cx * n + i, y = cy * n + j; if (!this.zv.dentro(x, y)) continue;
        const ch = this.zv.def.mapaChars[y][x] ?? ' ';
        const piso = 'cprC'.includes(ch) ? (this.zv.def.tipo === 'caverna' ? '%' : '.') : ch;
        h += `<b class="dbg-t" style="left:${i * TILE}px;top:${j * TILE}px;background-color:${COR[piso] ?? '#f0f'};${BORDA[ch] ?? ''}"></b>`;
      }
      d.innerHTML = h;
    }
    return els;
  }
  private objetosDebug(c: Conjunto) {
    for (const o of this.zv.def.objetos ?? []) {
      const cat = objCat(o.o) ?? { w: 1, h: 1, alto: 0, colisao: [[1]] };
      const cx = (x: number, y: number, w: number, h: number, css: string, pai: HTMLElement) => { const d = document.createElement('div'); d.className = 'dbg'; d.dataset.obj = o.o; d.style.cssText = `width:${w * TILE}px;height:${h * TILE}px;transform:translate(${x * TILE}px,${y * TILE}px);box-sizing:border-box;z-index:1;${css}`; pai.append(d); };
      cx(o.x, o.y - cat.h + 1, cat.w, cat.h, 'background:#9a6a4a;border:2px solid #3b2413', c.eb);
      if (cat.porta) cx(o.x + cat.porta.dx, o.y - cat.porta.dy, 1, 1, 'background:#2a1a0e', c.eb);
      if (cat.alto) cx(o.x, o.y - cat.h + 1 - cat.alto, cat.w, cat.alto, 'background:#c0553a;border:2px solid #3b2413', c.ea);
    }
  }
  /** cria os chunks que entraram na vista e solta os que saíram */
  private sincronizar() {
    const T = this.bake?.chunk ?? 160;
    const x0 = Math.floor((this.camX - 32) / T), x1 = Math.floor((this.camX + TELA_W + 32) / T), y0 = Math.floor((this.camY - 32) / T), y1 = Math.floor((this.camY + TELA_H + 32) / T);
    for (const c of [this.conj, this.velho]) {
      if (!c) continue;
      for (const [k, els] of c.chunks) { const [cx, cy] = k.split('_').map(Number); if (cx < x0 - 1 || cx > x1 + 1 || cy < y0 - 1 || cy > y1 + 1) { els.forEach((e) => e.remove()); c.chunks.delete(k); } }
      for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const k = `${cx}_${cy}`; if (cx < 0 || cy < 0 || c.chunks.has(k)) continue; c.chunks.set(k, this.criarChunk(c, cx, cy)); }
    }
  }

  /* ------------------------------ câmera ------------------------------ */
  private prender(cx: number, cy: number): [number, number] {
    const W = this.zv.w * TILE, H = this.zv.h * TILE;
    const x = W <= TELA_W ? -((TELA_W - W) >> 1) : Math.max(0, Math.min(W - TELA_W, Math.round(cx - TELA_W / 2)));
    const y = H <= TELA_H ? -((TELA_H - H) >> 1) : Math.max(0, Math.min(H - TELA_H, Math.round(cy - TELA_H / 2)));
    return [x, y];
  }
  /** leva a câmera até o tile (x, y) em `ms`; fica lá até `soltarCamera()` */
  panPara(tx: number, ty: number, ms: number): Promise<void> {
    const [x1, y1] = this.prender(tx * TILE + 8, ty * TILE + 8);
    return new Promise((fim) => { this.pan = { x0: this.camX, y0: this.camY, x1, y1, t: 0, dur: Math.max(1, Math.round(ms / (1000 / 60))), fim }; this.camFixa = { x: x1, y: y1 }; });
  }
  soltarCamera() { this.camFixa = null; this.pan = null; }
  tremer(quadros: number) { this.tremorT = Math.max(this.tremorT, quadros); }

  /* ------------------------------ props e partículas ------------------------------ */
  /** peça do tilesheet, se a zona tem bake e o tileset traz a peça; senão o desenho de reserva */
  peca(nome: string, reserva: (pai: HTMLElement) => Pix): (pai: HTMLElement) => Prop {
    return (pai) => {
      const f = this.folha, n = f ? [f.tema + '/' + nome, nome].find((k) => f.pecas[k]) : undefined;
      return f && n ? new Peca(f, n, pai, this.conj?.periodo ?? 'dia') : reserva(pai);
    };
  }
  prop(chave: string, fab: (pai: HTMLElement) => Prop, x: number, y: number): Prop {
    let p = this.props.get(chave);
    if (!p) { p = fab(this.sprites); this.props.set(chave, p); }
    return p.pos(x, y, y + p.h);
  }
  temProp(chave: string) { return this.props.has(chave); }
  tirarProp(chave: string) { this.props.get(chave)?.remover(); this.props.delete(chave); }
  particula(fab: (pai: HTMLElement) => Pix, x: number, y: number, vx: number, vy: number, vida: number, o: { tela?: boolean; cada?: number; z?: number } = {}) {
    const p = fab(o.tela ? this.sobre : this.sprites);
    this.parts.push({ p, x, y, vx, vy, t: 0, vida, cada: o.cada ?? 4, z: o.z ?? y + 40 });
    p.pos(x, y, o.z ?? y + 40);
  }
  /** a grama dobra e solta folhinhas quando alguém entra no tile */
  farfalhar(x: number, y: number) {
    this.farfalho.set(this.zv.i(x, y), 12);
    for (let k = 0; k < 2; k++) this.particula(pixFolha, x * TILE + 3 + k * 8, y * TILE + 8, k ? 0.4 : -0.4, -0.5, 14);
  }
  piscar(vezes: number): Promise<void> {
    return new Promise((res) => { let n = 0; const v = setInterval(() => { this.flash.style.display = n % 2 === 0 ? 'block' : 'none'; if (++n >= vezes * 2) { clearInterval(v); this.flash.style.display = 'none'; res(); } }, 70); });
  }

  /* ------------------------------ clima ------------------------------ */
  definirClima(c: ClimaId | undefined) {
    c ??= 'limpo';
    if (c === this.clima && this.camadas.length) return;
    this.clima = c; this.climaEl.replaceChildren(); this.camadas = []; this.el.dataset.clima = c;
    const camada = (w: number, h: number, rs: Ret[], vx: number, vy: number, cada = 1) => { const el = document.createElement('div'); el.style.backgroundImage = padrao(w, h, rs); el.style.backgroundSize = `${w}px ${h}px`; this.climaEl.append(el); this.camadas.push({ el, x: 0, y: 0, vx, vy, cada, w, h }); };
    const risco = (x: number, y: number, cor: string): Ret[] => [[x, y, 1, 2, cor], [x - 1, y + 2, 1, 2, cor]];
    if (c === 'chuva') {
      camada(32, 48, [[3, 2], [14, 30], [25, 12], [9, 20], [20, 40], [29, 26]].flatMap(([x, y]) => risco(x, y, '#7fa8d9')), -1, 4);
      camada(32, 48, [[6, 8], [17, 0], [27, 34], [12, 42], [22, 22], [1, 28], [31, 14]].flatMap(([x, y]) => risco(x, y, '#cfe6ff')), -2, 6);
    } else if (c === 'garoa') {
      camada(32, 32, [[2, 3], [11, 17], [19, 9], [27, 25], [7, 28], [23, 1]].map(([x, y]) => [x, y, 1, 2, '#cfe4f5'] as Ret), -1, 2);
      camada(32, 32, [[5, 12], [15, 26], [29, 6], [21, 19]].map(([x, y]) => [x, y, 1, 1, '#9fbfdc'] as Ret), 0, 1);
    } else if (c === 'nevoa') {
      camada(96, 48, [[0, 4, 40, 3], [50, 7, 30, 2], [20, 20, 60, 4], [70, 31, 26, 3], [4, 38, 34, 3]].map(([x, y, w, h]) => [x, y, w, h, '#eef4f7', 0.3] as Ret), 1, 0, 3);
      camada(96, 48, [[10, 0, 30, 2], [60, 13, 36, 3], [0, 27, 44, 3], [40, 43, 40, 3]].map(([x, y, w, h]) => [x, y, w, h, '#ffffff', 0.22] as Ret), -1, 0, 5);
    } else if (c === 'poeira') {
      camada(48, 48, [[3, 5, 2, 1], [20, 14, 1, 1], [35, 30, 2, 1], [11, 40, 1, 1], [42, 8, 1, 1], [28, 44, 2, 1]].map(([x, y, w, h]) => [x, y, w, h, '#e2cfa0'] as Ret), 3, 1);
      camada(48, 48, [[8, 22, 1, 1], [30, 3, 1, 1], [44, 36, 1, 1], [17, 33, 2, 1]].map(([x, y, w, h]) => [x, y, w, h, '#c9b384'] as Ret), 2, 0);
    }
  }
  private atualizarClima() {
    this.climaT++;
    for (const c of this.camadas) { if (this.climaT % c.cada) continue; c.x = (c.x + c.vx + c.w) % c.w; c.y = (c.y + c.vy + c.h) % c.h; c.el.style.backgroundPosition = `${c.x}px ${c.y}px`; }
    if (this.clima === 'chuva' && this.climaT % 3 === 0) this.particula(pixRespingo, Math.floor(cosmetico() * TELA_W), Math.floor(cosmetico() * TELA_H), 0, 0, 8, { tela: true });
    if (this.clima === 'poeira' && this.climaT % 20 === 0) this.particula(pixPoeira, -4, Math.floor(cosmetico() * TELA_H), 3, 0.2, 110, { tela: true, cada: 8 });
  }

  /* ------------------------------ escuro / névoa ------------------------------ */
  /** raio 0 = sem máscara */
  definirEscuro(raio: number, cor = '#0b0914') {
    if ((this.escuro?.raio ?? 0) === raio && (this.escuro?.cor ?? cor) === cor) return;
    this.escuroEl.replaceChildren(); this.faixas = []; this.buraco = undefined;
    this.escuro = raio ? { raio, cor } : null; this.el.dataset.escuro = String(raio);
    if (!raio) return;
    const B = 8, n = (raio * 2) / B, b = document.createElement('div');
    b.style.width = b.style.height = raio * 2 + 'px';
    const pont = [PONT(1, cor), PONT(2, cor), PONT(3, cor)];
    let h = '';
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const d = Math.hypot((i + 0.5) * B - raio, (j + 0.5) * B - raio) / raio;
      if (d < 0.5) continue;
      const nivel = d < 0.67 ? 0 : d < 0.83 ? 1 : d < 1 ? 2 : 3;
      h += `<div style="left:${i * B}px;top:${j * B}px;width:${B}px;height:${B}px;position:absolute;${nivel === 3 ? `background:${cor}` : `background-image:${pont[nivel].replace(/"/g, '&quot;')};background-size:4px 4px`}"></div>`;
    }
    b.innerHTML = h; this.buraco = b; this.escuroEl.append(b);
    for (let k = 0; k < 4; k++) { const f = document.createElement('div'); f.style.background = cor; this.escuroEl.append(f); this.faixas.push(f); }
  }
  private desenharEscuro(sx: number, sy: number) {
    if (!this.escuro || !this.buraco) return;
    const R = this.escuro.raio, x0 = sx - R, y0 = sy - R;
    this.buraco.style.transform = `translate(${x0}px,${y0}px)`;
    const ret = (f: HTMLElement, x: number, y: number, w: number, h: number) => { f.style.transform = `translate(${x}px,${y}px)`; f.style.width = Math.max(0, w) + 'px'; f.style.height = Math.max(0, h) + 'px'; };
    ret(this.faixas[0], 0, 0, TELA_W, y0); ret(this.faixas[1], 0, y0 + 2 * R, TELA_W, TELA_H - y0 - 2 * R);
    ret(this.faixas[2], 0, y0, x0, 2 * R); ret(this.faixas[3], x0 + 2 * R, y0, TELA_W - x0 - 2 * R, 2 * R);
  }

  /* ------------------------------ laço ------------------------------ */
  atualizar() {
    this.quadro++;
    if (this.bake && ++this.animT >= Math.max(1, Math.round(this.bake.animMs / (1000 / 60)))) {
      this.animT = 0; this.animQ = (this.animQ + 1) % this.bake.quadros;
      const px = -this.animQ * this.bake.chunk + 'px';
      for (const c of [this.conj, this.velho]) if (c) for (const els of c.chunks.values()) for (const e of els) if (e.classList.contains('anim')) e.style.backgroundPositionX = px;
    }
    if (this.velho) { if (--this.trocaT <= 0) { this.velho.eb.remove(); this.velho.ea.remove(); this.velho = undefined; } }
    if (this.pan) { const p = this.pan; p.t++; if (p.t >= p.dur) { this.pan = null; p.fim?.(); } }
    if (this.tremorT > 0) this.tremorT--;
    for (const [k, v] of this.farfalho) { if (v <= 1) this.farfalho.delete(k); else this.farfalho.set(k, v - 1); }
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i]; p.t++; p.x += p.vx; p.y += p.vy;
      if (p.t >= p.vida) { p.p.remover(); this.parts.splice(i, 1); continue; }
      p.p.quadro(Math.floor(p.t / p.cada)).pos(p.x, p.y, p.z);
    }
    this.atualizarClima();
  }
  /** `foco` = ator seguido pela câmera; `atores` = quem pode estar na grama alta */
  desenhar(foco: Ator, atores: Ator[]) {
    if (!this.zv) return;
    let cx: number, cy: number;
    if (this.pan) { const p = this.pan, k = p.t / p.dur; cx = Math.round(p.x0 + (p.x1 - p.x0) * k); cy = Math.round(p.y0 + (p.y1 - p.y0) * k); }
    else if (this.camFixa) { cx = this.camFixa.x; cy = this.camFixa.y; }
    else [cx, cy] = this.prender(foco.px + 8, foco.py + 8);
    if (this.tremorT > 0) { cx += this.tremorT % 4 < 2 ? 1 : -1; cy += this.tremorT % 6 < 3 ? 1 : -1; }
    if (cx !== this.camX || cy !== this.camY || !this.conj?.chunks.size) { this.camX = cx; this.camY = cy; this.cam.style.transform = `translate(${-cx}px,${-cy}px)`; this.sincronizar(); }
    this.desenharGrama(atores);
    this.desenharEscuro(foco.px + 8 - this.camX, foco.py + 6 - this.camY);
  }
  private desenharGrama(atores: Ator[]) {
    let n = 0;
    for (const a of atores) {
      if (!a.visivel || a.arco > 0) continue;
      const tx = Math.floor((a.px + 8) / TILE), ty = Math.floor((a.py + 10) / TILE);
      if (this.zv.ch(tx, ty) !== '"') continue;
      const g = (this.gramas[n] ??= this.peca('grama-passagem', pixGrama)(this.sprites));
      n++;
      const f = this.farfalho.get(this.zv.i(tx, ty)) ?? 0, dx = f ? (f % 6 < 3 ? 1 : -1) : 0;
      g.ver(true).quadro(f ? 1 : 0).pos(tx * TILE + dx, ty * TILE + TILE - g.h, a.py + 17);
    }
    for (let i = n; i < this.gramas.length; i++) this.gramas[i].ver(false);
  }
}
