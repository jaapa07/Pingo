/**
 * Sprite de pixel art: div com o spritesheet como fundo, quadro por background-position.
 * Posições SEMPRE em pixels nativos inteiros (a tela 320×180 é ampliada por escala inteira).
 */
import { vista, type VistaMeta } from '../core/assets';

export class Sprite {
  el = document.createElement('div');
  meta?: VistaMeta;
  anim = ''; quadro = 0; fim = false;
  private t = 0; private aoFim?: () => void;
  x = 0; y = 0; z = 0;
  espelho = false; visivel = true; opacidade = 1;
  /** deslocamento visual em px (tremor, recuo de dano) */
  dx = 0; dy = 0;
  vel = 1;
  constructor(public modeloId: string, public vistaNome: string, pai?: HTMLElement, classe = '') {
    this.el.className = 'spr ' + classe;
    this.meta = vista(modeloId, vistaNome);
    if (this.meta) {
      const m = this.meta;
      const total = Object.values(m.anims).reduce((a, x) => Math.max(a, x.i + x.n), 0);
      this.el.style.width = m.cw + 'px'; this.el.style.height = m.ch + 'px';
      this.el.style.backgroundImage = `url(${m.src})`;
      this.el.style.backgroundSize = `${m.cols * m.cw}px ${Math.ceil(total / m.cols) * m.ch}px`;
    }
    pai?.append(this.el);
  }
  tem(a: string) { return !!this.meta?.anims[a]; }
  tocar(a: string, o: { reiniciar?: boolean; aoFim?: () => void; vel?: number } = {}): this {
    if (!this.meta?.anims[a]) { o.aoFim?.(); return this; }
    if (a === this.anim && !o.reiniciar) return this;
    this.anim = a; this.quadro = 0; this.t = 0; this.fim = false; this.aoFim = o.aoFim; this.vel = o.vel ?? 1;
    return this;
  }
  /** promessa que resolve quando a animação (sem loop) termina */
  tocarAte(a: string, vel = 1): Promise<void> { return new Promise((r) => this.tocar(a, { reiniciar: true, aoFim: r, vel })); }
  atualizar(dt: number) {
    const a = this.meta?.anims[this.anim];
    if (!a || this.fim) return;
    this.t += dt * a.fps * this.vel;
    while (this.t >= 1) {
      this.t -= 1; this.quadro++;
      if (this.quadro >= a.n) { if (a.loop) this.quadro = 0; else { this.quadro = a.n - 1; this.fim = true; const f = this.aoFim; this.aoFim = undefined; f?.(); break; } }
    }
  }
  desenhar() {
    const m = this.meta; const s = this.el.style;
    if (!m || !this.visivel) { s.display = 'none'; return; }
    const a = m.anims[this.anim] ?? Object.values(m.anims)[0];
    const f = a.i + Math.min(this.quadro, a.n - 1);
    s.display = '';
    s.backgroundPosition = `${-(f % m.cols) * m.cw}px ${-Math.floor(f / m.cols) * m.ch}px`;
    s.transform = `translate(${Math.round(this.x - m.px + this.dx)}px, ${Math.round(this.y - m.py + this.dy)}px)${this.espelho ? ' scaleX(-1)' : ''}`;
    s.zIndex = String(Math.round(this.z));
    s.opacity = String(this.opacidade);
  }
  remover() { this.el.remove(); }
}
