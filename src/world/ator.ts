/** Ator do mapa: sprite em grade (jogador, NPCs, criaturas), com movimento tile a tile em px inteiros. */
import type { Dir } from '../core/tipos';
import { TILE } from '../core/tipos';
import { Sprite } from '../render/sprite';
import { Pix, pixBoneco, pixEmote } from './pixel';
import { DX, DY, dirPara } from './zonas';

export interface OpMover { tiles?: number; salto?: number; semVirar?: boolean; base?: string }
export class Ator {
  dir: Dir = 's';
  /** canto superior esquerdo do tile, em px nativos (interpolado durante o passo) */
  px: number; py: number;
  private ox = 0; private oy = 0; private t = 0; private dur = 0; private tiles = 1; private salto = 0; private mdir: Dir = 's';
  movendo = false;
  /** prefixo da animação de deslocamento: andar | correr | bike | remar | mergulhar | escalar */
  base = 'andar';
  visivel = true; solido = true; removido = false;
  /** deslocamento visual (tremor, pulo de animação) */
  ex = 0; ey = 0;
  /** desce o balão de emoção (criaturas baixas) */
  balaoDy = 0;
  spr: Sprite;
  /** desenho de reserva quando o modelo não tem sprite */
  boneco?: Pix;
  private balao?: Pix; private balaoT = 0;
  private fim?: () => void; private aoChegar?: () => void;
  private poseAtual = '';
  constructor(public modelo: string, pai: HTMLElement, public x: number, public y: number, dir: Dir = 's') {
    const criatura = modelo.startsWith('c:');
    this.spr = new Sprite(criatura ? modelo.slice(2) : modelo, 'mapa', pai);
    if (!this.spr.meta) this.boneco = pixBoneco(modelo, pai);
    this.px = x * TILE; this.py = y * TILE; this.dir = dir;
    this.pose();
  }
  /**
   * inicia um passo de `tiles` tiles em `dur` quadros; resolve ao chegar. `aoChegar` é chamado de forma
   * síncrona dentro do quadro da chegada (a promessa só continua depois do quadro).
   */
  mover(dir: Dir, dur: number, o: OpMover = {}, aoChegar?: () => void): Promise<void> {
    this.aoChegar = aoChegar;
    if (!o.semVirar) this.dir = dir;
    if (o.base) this.base = o.base;
    this.mdir = dir; this.tiles = o.tiles ?? 1; this.salto = o.salto ?? 0;
    this.ox = this.x * TILE; this.oy = this.y * TILE;
    this.x += DX[dir] * this.tiles; this.y += DY[dir] * this.tiles;
    this.t = 0; this.dur = Math.max(1, dur); this.movendo = true;
    this.pose();
    return new Promise((r) => { this.fim = r; });
  }
  teleportar(x: number, y: number, dir?: Dir) { this.x = x; this.y = y; this.px = x * TILE; this.py = y * TILE; this.movendo = false; if (dir) this.dir = dir; const f = this.fim; this.fim = undefined; f?.(); this.pose(); }
  virar(d: Dir) { this.dir = d; this.pose(); }
  olharPara(x: number, y: number) { if (x !== this.x || y !== this.y) this.virar(dirPara(x - this.x, y - this.y)); }
  emote(tipo: string, quadros = 60) { this.balao?.remover(); this.balao = pixEmote(tipo, this.spr.el.parentElement!); this.balaoT = quadros; }
  /** escolhe a animação conforme base/direção/movimento, com reservas quando o modelo não tem a animação */
  pose() {
    const s = this.spr; if (!s.meta) return;
    const d = this.dir;
    const anda = `${this.base}-${d}`, parado = this.base === 'andar' || this.base === 'correr';
    let nome: string, vel = 1;
    if (this.movendo) nome = s.tem(anda) ? anda : s.tem(`${this.base}-n`) && this.base === 'escalar' ? 'escalar-n' : `andar-${d}`;
    else if (parado && s.tem(`idle-${d}`)) nome = `idle-${d}`;
    else if (!parado && s.tem(anda)) { nome = anda; vel = 0.35; }
    else if (s.tem(`idle-${d}`)) nome = `idle-${d}`;
    else { nome = s.tem(`andar-${d}`) ? `andar-${d}` : 'idle-s'; vel = 0; }
    const chave = nome + vel;
    if (chave !== this.poseAtual) { this.poseAtual = chave; s.tocar(nome, { reiniciar: vel === 0 }); s.vel = vel; }
  }
  atualizar(dt: number) {
    if (this.movendo) {
      this.t++;
      const d = Math.round((TILE * this.tiles * this.t) / this.dur);
      this.px = this.ox + DX[this.mdir] * d; this.py = this.oy + DY[this.mdir] * d;
      if (this.t >= this.dur) { this.movendo = false; this.px = this.x * TILE; this.py = this.y * TILE; this.pose(); const f = this.fim, c = this.aoChegar; this.fim = this.aoChegar = undefined; f?.(); c?.(); }
    }
    this.spr.atualizar(dt);
    if (this.balao && --this.balaoT <= 0) { this.balao.remover(); this.balao = undefined; }
  }
  /** altura atual do arco de pulo, em px */
  get arco() { return this.movendo && this.salto ? Math.round(this.salto * Math.sin((Math.PI * this.t) / this.dur)) : 0; }
  desenhar() {
    const s = this.spr, arco = this.arco;
    s.x = this.px + 8 + this.ex; s.y = this.py + 14 - arco + this.ey; s.z = this.py + 16; s.visivel = this.visivel;
    s.desenhar();
    if (this.boneco) this.boneco.ver(this.visivel).pos(this.px + 8 - (this.boneco.w >> 1) + this.ex, this.py + 15 - this.boneco.h - arco + this.ey, this.py + 16);
    if (this.balao) this.balao.pos(this.px + 3, this.py - 22 - arco + this.balaoDy, this.py + 400);
  }
  remover() { this.removido = true; this.spr.remover(); this.boneco?.remover(); this.balao?.remover(); const f = this.fim; this.fim = undefined; f?.(); }
}
