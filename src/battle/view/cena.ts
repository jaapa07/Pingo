/**
 * Cena de efeitos da batalha: relógio de tarefas (esperas e interpolações em passos fixos de 60 Hz),
 * sprites de FX do atlas `assets/fx/fx.png`, tremor de tela, clarões e escurecimento.
 * Tudo em px nativos inteiros; os quadros dos FX são desenhados à mão (assets-src/fx) e montados por tools/build-fx.ts.
 */
import indice from '../anims/gerado/fx.json';
import { precarregar } from '../../core/assets';
import { cosmetico } from '../../core/rng';

type Reg = [number, number, number, number, number, number]; // x, y, w, h, quadros, fps
const FXS = indice.fx as unknown as Record<string, Reg>;
export const FX_SRC = indice.src;
export const temFx = (id: string) => !!FXS[id];
export const idsFx = () => Object.keys(FXS);
export const precarregarFx = () => precarregar(FX_SRC);

/** tarefas por passo: cada uma devolve true quando termina */
export class Relogio {
  private tarefas: ((dt: number) => boolean)[] = [];
  tempo = 0;
  cada(f: (dt: number) => boolean) { this.tarefas.push(f); }
  dormir(s: number): Promise<void> { return new Promise((r) => { let t = 0; this.cada((dt) => { t += dt; if (t >= s) { r(); return true; } return false; }); }); }
  /** chama `f(k)` com k de 0 a 1 ao longo de `s` segundos */
  entre(s: number, f: (k: number) => void): Promise<void> {
    return new Promise((r) => { let t = 0; f(0); this.cada((dt) => { t += dt; const k = Math.min(1, t / Math.max(0.001, s)); f(k); if (k >= 1) { r(); return true; } return false; }); });
  }
  /** espera até a condição valer */
  ate(cond: () => boolean): Promise<void> { return new Promise((r) => this.cada(() => { if (cond()) { r(); return true; } return false; })); }
  tique(dt: number) {
    this.tempo += dt;
    const lista = this.tarefas; this.tarefas = [];
    for (const f of lista) { let fim = true; try { fim = f(dt); } catch (e) { console.error('[batalha] tarefa falhou', e); } if (!fim) this.tarefas.push(f); }
  }
  limpar() { this.tarefas = []; }
}

export interface OpFx {
  /** repete até ser removido (padrão: toca uma vez e some) */
  loop?: boolean;
  fps?: number;
  espelho?: boolean; viraY?: boolean;
  /** (x, y) é o meio da base do quadro, e não o centro */
  base?: boolean;
  /** atrás das criaturas */
  atras?: boolean;
  /** quadro inicial */
  quadro?: number;
  /** segura o último quadro em vez de sumir */
  segura?: boolean;
  /** como `segura`, mas não é limpo no fim do golpe (efeitos de campo que duram turnos) */
  fixo?: boolean;
  /** fica parado no quadro inicial */
  parado?: boolean;
  z?: number;
  pai?: HTMLElement;
}
export class Fx {
  el = document.createElement('div');
  x = 0; y = 0; quadro = 0; vivo = true; visivel = true; opacidade = 1;
  readonly w: number; readonly h: number; readonly n: number;
  fps: number; private t = 0; private r: Reg;
  private aoFim: (() => void)[] = [];
  constructor(readonly id: string, x: number, y: number, readonly o: OpFx = {}) {
    const r = FXS[id]; if (!r) throw new Error('FX desconhecido: ' + id);
    this.r = r; this.w = r[2]; this.h = r[3]; this.n = r[4]; this.fps = o.fps ?? r[5]; this.x = x; this.y = y; this.quadro = o.quadro ?? 0;
    this.el.className = 'fx'; this.el.style.width = r[2] + 'px'; this.el.style.height = r[3] + 'px';
    if (o.z != null) this.el.style.zIndex = String(o.z);
    this.desenhar();
  }
  /** resolve quando o FX termina (ou é removido) */
  get fim(): Promise<void> { return new Promise((r) => (this.vivo ? this.aoFim.push(r) : r())); }
  atualizar(dt: number) {
    if (!this.vivo || this.o.parado) return;
    this.t += dt * this.fps;
    while (this.t >= 1) {
      this.t -= 1; this.quadro++;
      if (this.quadro >= this.n) { if (this.o.loop) this.quadro = 0; else if (this.o.segura || this.o.fixo) { this.quadro = this.n - 1; this.o.parado = true; for (const f of this.aoFim.splice(0)) f(); } else { this.remover(); return; } }
    }
  }
  desenhar() {
    const s = this.el.style, r = this.r;
    s.backgroundPosition = `-${r[0] + Math.min(this.quadro, this.n - 1) * r[2]}px -${r[1]}px`;
    const x = Math.round(this.x - r[2] / 2), y = Math.round(this.o.base ? this.y - r[3] : this.y - r[3] / 2);
    s.transform = `translate(${x}px, ${y}px)${this.o.espelho || this.o.viraY ? ` scale(${this.o.espelho ? -1 : 1}, ${this.o.viraY ? -1 : 1})` : ''}`;
    s.visibility = this.visivel ? '' : 'hidden';
    s.opacity = String(this.opacidade);
  }
  remover() { if (!this.vivo) return; this.vivo = false; this.el.remove(); for (const f of this.aoFim.splice(0)) f(); }
}
/** FX avulso para a interface (ícones do menu, cuias): não entra na cena; quem cria chama atualizar/desenhar se quiser animar */
export function fxUi(id: string, quadro = 0): Fx { const f = new Fx(id, 0, 0, { parado: true, quadro }); const r = FXS[id]; f.x = r[2] / 2; f.y = r[3] / 2; f.el.classList.add('fx-ui'); f.desenhar(); return f; }

export type Pt = [number, number];
export class Cena {
  rel = new Relogio();
  private fxs = new Set<Fx>();
  private tremores: { amp: number; t: number; dur: number }[] = [];
  /** fator de velocidade das esperas dos golpes (1 normal) */
  constructor(readonly tras: HTMLElement, readonly frente: HTMLElement, readonly alvoTremor: HTMLElement, readonly veu: HTMLElement, readonly penumbra: HTMLElement) {}
  fx(id: string, x: number, y: number, o: OpFx = {}): Fx {
    const f = new Fx(id, x, y, o);
    (o.pai ?? (o.atras ? this.tras : this.frente)).append(f.el); this.fxs.add(f); return f;
  }
  /** toca um FX uma vez e resolve ao terminar */
  uma(id: string, x: number, y: number, o: OpFx = {}): Promise<void> { return this.fx(id, x, y, o).fim; }
  espera(s: number) { return this.rel.dormir(s); }
  /** move um FX de onde está até (bx, by) em `dur` s; `arco` levanta a trajetória em px */
  mover(f: Fx, bx: number, by: number, dur: number, arco = 0): Promise<void> {
    const ax = f.x, ay = f.y;
    return this.rel.entre(dur, (k) => { f.x = Math.round(ax + (bx - ax) * k); f.y = Math.round(ay + (by - ay) * k - Math.sin(k * Math.PI) * arco); });
  }
  /** projétil: nasce em `a`, voa até `b` e some */
  async voar(id: string, a: Pt, b: Pt, dur: number, o: OpFx & { arco?: number } = {}): Promise<void> {
    const f = this.fx(id, a[0], a[1], { loop: true, ...o });
    await this.mover(f, b[0], b[1], dur, o.arco ?? 0); f.remover();
  }
  tremor(amp: number, dur: number) { this.tremores.push({ amp, t: 0, dur }); return this.rel.dormir(dur); }
  /** clarão de tela em 3 degraus de opacidade */
  async flash(cor = '#fff8e7', dur = 0.18, forca = 0.85) {
    this.veu.style.background = cor;
    await this.rel.entre(dur, (k) => { this.veu.style.opacity = String(k >= 1 ? 0 : Math.round((1 - k) * 3) / 3 * forca); });
    this.veu.style.opacity = '0';
  }
  /** escurece (ou tinge) o cenário atrás das criaturas; devolve a função que desfaz */
  escurecer(cor = '#1a1423', forca = 0.5): () => void {
    this.penumbra.style.background = cor; this.penumbra.style.opacity = String(forca);
    return () => { this.penumbra.style.opacity = '0'; };
  }
  /** remove os FX que ficaram segurando o último quadro */
  limparSegurados() { for (const f of this.fxs) if (f.o.segura) f.remover(); }
  /** variação cosmética inteira em [-n, n] */
  var(n: number) { return Math.round((cosmetico() * 2 - 1) * n); }
  acaso() { return cosmetico(); }
  tique(dt: number) {
    this.rel.tique(dt);
    for (const f of this.fxs) { f.atualizar(dt); if (!f.vivo) this.fxs.delete(f); }
    let dx = 0, dy = 0;
    for (const t of [...this.tremores]) {
      t.t += dt; if (t.t >= t.dur) { this.tremores.splice(this.tremores.indexOf(t), 1); continue; }
      const fase = Math.floor(t.t * 30), a = Math.max(1, Math.round(t.amp * (1 - t.t / t.dur)));
      dx += fase % 2 ? a : -a; dy += fase % 4 < 2 ? 0 : fase % 4 === 2 ? a >> 1 : -(a >> 1);
    }
    this.alvoTremor.style.transform = dx || dy ? `translate(${dx}px, ${dy}px)` : '';
  }
  desenhar() { for (const f of this.fxs) if (f.vivo) f.desenhar(); }
  limpar() { for (const f of this.fxs) f.remover(); this.fxs.clear(); this.tremores = []; this.alvoTremor.style.transform = ''; this.veu.style.opacity = '0'; this.penumbra.style.opacity = '0'; }
}
