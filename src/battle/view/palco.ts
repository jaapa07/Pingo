/**
 * Palco da batalha: arena em camadas (fundo, cenário, chão e animações do arena.json, dia/noite),
 * sombras elípticas em pixel, atores (criaturas e treinadores) e camadas de clima.
 */
import type { ClimaId } from '../../core/tipos';
import { vista, precarregar, precarregarModelo } from '../../core/assets';
import { periodo } from '../../core/estado';
import { Sprite } from '../../render/sprite';
import { iconeTipo } from '../../ui/kit';
import { especie, temEspecie } from '../criatura';
import { Cena, Fx, type Pt } from './cena';

export interface ArenaDef {
  id: string; periodos: string[];
  camadas: { id: string; parallax: number; arquivos: Record<string, string> }[];
  apoios: Record<'inimigo' | 'jogador', { x: number; y: number; rx: number; ry: number }>;
  sombra: Record<string, string>;
  anims?: { id: string; arquivos: Record<string, string>; x: number; y: number; w: number; h: number; quadros: number; fps: number; sobre: string }[];
}
const RESERVA: ArenaDef = { id: '', periodos: ['dia'], camadas: [], apoios: { inimigo: { x: 232, y: 84, rx: 30, ry: 8 }, jogador: { x: 84, y: 136, rx: 40, ry: 11 } }, sombra: { dia: '#14463a' } };
const cacheArena = new Map<string, Promise<ArenaDef | null>>();
const lerArena = (id: string) => { let p = cacheArena.get(id); if (!p) { p = fetch(`assets/arenas/${id}/arena.json`).then((r) => (r.ok ? (r.json() as Promise<ArenaDef>) : null)).catch(() => null); cacheArena.set(id, p); } return p; };
export const div = (classe: string, pai?: HTMLElement): HTMLElement => { const d = document.createElement('div'); d.className = classe; pai?.append(d); return d; };

/** elipse em pixel art: uma faixa por linha (sem suavização) */
export function elipsePx(rx: number, ry: number, cor: string): HTMLElement {
  const el = div('bt-elipse'); el.style.width = rx * 2 + 'px'; el.style.height = ry * 2 + 'px';
  for (let j = 0; j < ry * 2; j++) { const t = (j + 0.5 - ry) / ry, w = Math.round(rx * Math.sqrt(Math.max(0, 1 - t * t))); if (w <= 0) continue; const f = document.createElement('i'); f.style.cssText = `left:${rx - w}px;top:${j}px;width:${w * 2}px;background:${cor}`; el.append(f); }
  return el;
}

/** criatura ou treinador em cena */
export class Ator {
  spr: Sprite | null = null; private vulto: Fx | null = null; private selo: HTMLElement | null = null;
  sombra: HTMLElement | null = null;
  x = 0; y = 0; dx = 0; dy = 0; visivel = false; opacidade = 1; branco = false; escuro = false;
  /** altura aproximada do corpo e meia-largura (para mirar os efeitos) */
  alt = 40; larg = 20; especie = 0; modelo = '';
  private animBase = 'idle';
  constructor(readonly lado: 0 | 1, readonly pos: number, private camada: HTMLElement, private camadaSombras: HTMLElement, private corSombra: string) {}
  private limpar() { this.spr?.remover(); this.spr = null; this.vulto?.remover(); this.vulto = null; this.selo?.remove(); this.selo = null; this.sombra?.remove(); this.sombra = null; }
  private montar(modelo: string, vistaNome: string, comSombra: boolean) {
    this.limpar(); this.modelo = modelo; this.dx = this.dy = 0; this.opacidade = 1; this.branco = this.escuro = false; this.animBase = 'idle';
    const m = vista(modelo, vistaNome);
    if (m) {
      this.spr = new Sprite(modelo, vistaNome, this.camada, 'bt-ator'); this.spr.tocar('idle');
      this.alt = Math.round(m.py * 0.74); this.larg = Math.round(m.cw * 0.3);
    } else {
      this.vulto = new Fx('ui-vulto', 0, 0, { loop: true, base: true, espelho: this.lado === 0 }); this.vulto.el.classList.add('bt-ator'); this.camada.append(this.vulto.el);
      this.alt = 36; this.larg = 18;
    }
    if (comSombra) { const rx = Math.max(10, Math.round(this.larg * 0.95)); this.sombra = elipsePx(rx, Math.max(3, Math.round(rx / 3.4)), this.corSombra); this.camadaSombras.append(this.sombra); }
  }
  definirCriatura(num: number) {
    this.especie = num;
    const e = temEspecie(num) ? especie(num) : null;
    this.montar(e?.id ?? `especie-${num}`, this.lado === 1 ? 'frente' : 'costas', true);
    if (this.vulto && e) { this.selo = iconeTipo(e.tipos[0]); this.selo.classList.add('bt-selo'); this.camada.append(this.selo); }
  }
  definirPessoa(modelo: string) { this.especie = 0; this.montar(modelo, this.lado === 1 ? 'batalha' : 'costas', false); }
  get existe() { return !!(this.spr || this.vulto); }
  get centro(): Pt { return [this.x, this.y - Math.round(this.alt / 2)]; }
  get topo(): Pt { return [this.x, this.y - this.alt]; }
  get pes(): Pt { return [this.x, this.y]; }
  tem(a: string) { return !!this.spr?.tem(a); }
  /** animação em laço que fica tocando (idle ou status) */
  base(a: string) { this.animBase = this.tem(a) ? a : 'idle'; this.spr?.tocar(this.animBase); }
  /** toca uma animação sem laço e volta para a base */
  async tocar(a: string, vel = 1): Promise<void> {
    if (!this.spr || !this.spr.tem(a)) return;
    await this.spr.tocarAte(a, vel);
    if (a !== 'desmaio' && this.spr) this.spr.tocar(this.animBase, { reiniciar: true });
  }
  atualizar(dt: number) { this.spr?.atualizar(dt); this.vulto?.atualizar(dt); }
  desenhar() {
    const x = Math.round(this.x + this.dx), y = Math.round(this.y + this.dy);
    const classe = (el: HTMLElement) => { el.classList.toggle('bt-branco', this.branco); el.classList.toggle('bt-escuro', this.escuro && !this.branco); };
    if (this.spr) { const s = this.spr; s.x = x; s.y = y + 2; s.visivel = this.visivel; s.opacidade = this.opacidade; s.z = this.y; s.desenhar(); classe(s.el); }
    if (this.vulto) { const v = this.vulto; v.x = x; v.y = y + 2; v.visivel = this.visivel; v.opacidade = this.opacidade; v.desenhar(); v.el.style.zIndex = String(this.y); classe(v.el); }
    if (this.selo) { this.selo.style.transform = `translate(${x - 6}px, ${y - 22}px)`; this.selo.style.visibility = this.visivel && !this.branco ? '' : 'hidden'; this.selo.style.zIndex = String(this.y + 1); }
    if (this.sombra) { const s = this.sombra.style; s.transform = `translate(${Math.round(this.x - parseInt(s.width) / 2)}px, ${Math.round(this.y - parseInt(s.height) / 2)}px)`; s.visibility = this.visivel && this.opacidade > 0.3 ? '' : 'hidden'; }
  }
  remover() { this.limpar(); }
}

interface AnimArena { el: HTMLElement; w: number; n: number; fps: number; t: number }
export class Palco {
  el = div('bt-palco');
  mundo = div('bt-mundo', this.el);
  private camadas: { el: HTMLElement; parallax: number }[] = [];
  private cenario = div('bt-cenario', this.mundo);
  penumbra = div('bt-penumbra', this.mundo);
  private sombras = div('bt-sombras', this.mundo);
  private fxTras = div('bt-fx', this.mundo);
  camadaAtores = div('bt-atores', this.mundo);
  private fxFrente = div('bt-fx bt-fx-frente', this.mundo);
  private frenteArena = div('bt-cenario bt-frente', this.mundo);
  private climaEl = div('bt-clima', this.mundo);
  veu = div('bt-veu', this.el);
  cena = new Cena(this.fxTras, this.fxFrente, this.mundo, this.veu, this.penumbra);
  arena: ArenaDef = RESERVA;
  private anims: AnimArena[] = [];
  private fxClima: Fx[] = [];
  private tinta = div('bt-tinta', this.climaEl);
  atores = new Map<string, Ator>();
  treinador: [Ator | null, Ator | null] = [null, null];
  clima: ClimaId = 'limpo';
  private desloc = 0;
  constructor(readonly dupla: boolean) {}

  /** carrega arena.json e as imagens do período; sem a arena pedida, usa a restinga e, sem ela, um fundo liso */
  async carregar(id: string): Promise<void> {
    const def = (await lerArena(id)) ?? (await lerArena('restinga')) ?? (await lerArena('mata'));
    if (!def) { this.cenario.classList.add('bt-liso'); return; }
    this.arena = def;
    const per = periodo() === 'noite' && def.periodos.includes('noite') ? 'noite' : 'dia';
    const url = (arq: string) => `assets/arenas/${def.id}/${arq}`;
    const espera: Promise<void>[] = [];
    const animsDe = (sobre: string, pai: HTMLElement) => {
      for (const a of def.anims ?? []) {
        if (a.sobre !== sobre) continue; const arq = a.arquivos[per]; if (!arq) continue;
        const el = div('bt-anim', pai); el.style.cssText = `left:${a.x}px;top:${a.y}px;width:${a.w}px;height:${a.h}px;background-image:url(${url(arq)})`;
        this.anims.push({ el, w: a.w, n: a.quadros, fps: a.fps, t: 0 }); espera.push(precarregar(url(arq)));
      }
    };
    for (const c of def.camadas) {
      const arq = c.arquivos[per] ?? c.arquivos.dia; if (!arq) continue;
      const el = div('bt-camada', this.cenario); el.style.backgroundImage = `url(${url(arq)})`;
      this.camadas.push({ el, parallax: c.parallax }); espera.push(precarregar(url(arq)));
      animsDe(c.id, el);
    }
    animsDe('frente', this.frenteArena);
    this.corSombra = def.sombra[per] ?? def.sombra.dia ?? '#14463a';
    await Promise.all(espera);
  }
  corSombra = '#14463a';

  /** "dolly" de entrada: as camadas chegam de lado, as da frente andam mais (parallax em px inteiros) */
  definirDolly(k: number) {
    this.desloc = k;
    for (const c of this.camadas) c.el.style.transform = `translateX(${Math.round(k * (c.parallax + 1) * 8)}px)`;
    this.frenteArena.style.transform = `translateX(${Math.round(k * 32)}px)`;
  }
  apoio(lado: 0 | 1, pos: number): Pt {
    const a = this.arena.apoios[lado ? 'inimigo' : 'jogador'];
    if (!this.dupla) return [a.x, a.y];
    return lado === 0 ? (pos === 0 ? [a.x - 24, a.y - 3] : [a.x + 28, a.y + 3]) : pos === 0 ? [a.x + 24, a.y + 3] : [a.x - 26, a.y - 2];
  }
  ator(lado: 0 | 1, pos: number): Ator {
    const k = `${lado}:${pos}`; let a = this.atores.get(k);
    if (!a) { a = new Ator(lado, pos, this.camadaAtores, this.sombras, this.corSombra); [a.x, a.y] = this.apoio(lado, pos); this.atores.set(k, a); }
    return a;
  }
  criarTreinador(lado: 0 | 1, modelo: string): Ator {
    const a = new Ator(lado, 9, this.camadaAtores, this.sombras, this.corSombra); a.definirPessoa(modelo);
    const ap = this.arena.apoios[lado ? 'inimigo' : 'jogador']; a.x = ap.x; a.y = ap.y; a.visivel = true;
    this.treinador[lado] = a; return a;
  }
  precarregarCriatura(num: number) { return temEspecie(num) ? precarregarModelo(especie(num).id, ['frente', 'costas']) : Promise.resolve(); }

  /** camadas de clima (sprites repetidos e tinta leve) */
  definirClima(c: ClimaId) {
    if (c === this.clima) return; this.clima = c;
    for (const f of this.fxClima) f.remover(); this.fxClima = [];
    const por = (id: string, x: number, y: number, o: { quadro?: number; fps?: number } = {}) => { const f = new Fx(id, x, y, { loop: true, ...o }); this.climaEl.append(f.el); this.fxClima.push(f); return f; };
    const ladrilhar = (id: string, w: number, h: number) => { for (let y = 0; y < 132; y += h) for (let x = 0; x < 320; x += w) por(id, x + w / 2, y + h / 2); };
    this.tinta.className = 'bt-tinta ' + c;
    if (c === 'chuva') { ladrilhar('clima-chuva', 32, 32); for (let i = 0; i < 9; i++) por('clima-respingo', 20 + ((i * 97) % 290), 96 + ((i * 53) % 60), { quadro: i % 3, fps: 8 + (i % 3) }); }
    else if (c === 'garoa') ladrilhar('clima-garoa', 32, 32);
    else if (c === 'poeira') ladrilhar('clima-poeira', 32, 32);
    else if (c === 'nevoa') { for (let j = 0; j < 4; j++) for (let x = 0; x < 320; x += 64) por('clima-nevoa', x + 32 + (j % 2) * 20 - 10, 34 + j * 28, { quadro: j % 4, fps: 3 + (j % 2) }); }
    else if (c === 'sol') por('clima-sol', 48, 48);
  }

  atualizar(dt: number) {
    for (const a of this.anims) { a.t += dt * a.fps; a.el.style.backgroundPosition = `-${(Math.floor(a.t) % a.n) * a.w}px 0`; }
    for (const a of this.atores.values()) a.atualizar(dt);
    for (const t of this.treinador) t?.atualizar(dt);
    for (const f of this.fxClima) f.atualizar(dt);
    this.cena.tique(dt);
  }
  desenhar() {
    for (const a of this.atores.values()) a.desenhar();
    for (const t of this.treinador) t?.desenhar();
    for (const f of this.fxClima) f.desenhar();
    this.cena.desenhar();
  }
}
