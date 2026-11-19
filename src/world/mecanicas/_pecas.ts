/**
 * Utilidades comuns às mecânicas dos ginásios 1 a 8: ladrilhos e marcas desenhados por cima do mapa
 * assado (a arte do bake não muda durante a visita), laço por quadro, movimento forçado e quedas.
 * Só o motor de mundo é usado; nada aqui roda fora do navegador.
 */
import type { Dir } from '../../core/tipos';
import { TILE } from '../../core/tipos';
import { jogo } from '../../core/estado';
import { mundo } from '../index';
import { M, ocupar, sfx, quadros } from '../vivo';
import { Pix } from '../pixel';
import { falar, avisar } from '../deps';
import { andarJogador } from '../jogador';
import { quemVe, abordagem } from '../npcs';
import { DX, DY } from '../zonas';

export { mundo, M, ocupar, sfx, quadros, falar, avisar, DX, DY, TILE, Pix };
export type { Dir };

/** cor de reserva por peça quando a zona roda sem bake (modo de depuração por caractere) */
const RESERVA: Record<string, string> = { piso: '#b89868', caminho: '#d9b97a', alternativo: '#ecd9a0', decorado: '#c8a870', ponte: '#a8763e', agua: '#3f7fd9', buraco: '#15121a', perigo: '#e8c040', lama: '#6a4a2a', tapete: '#c05050', gelo: '#cfeeff', encontro: '#74644f', funda: '#1f3f99' };

interface Removivel { remover(): void }
/** um tile do tilesheet do ginásio (peça do tema atual) desenhado sobre o chão assado */
export class Ladrilho implements Removivel {
  el = document.createElement('div');
  private px = 0; private py = 0; quadros = 1;
  constructor(nome: string, x: number, y: number, z = 1) {
    const f = mundo.cena.folha, p = f ? (f.pecas[f.tema + '/' + nome] ?? f.pecas[nome]) : undefined;
    this.el.className = 'chunk'; this.el.style.width = this.el.style.height = TILE + 'px';
    if (f && p) { this.px = p.x; this.py = p.y + p.h - TILE; this.quadros = p.quadros; this.el.style.backgroundImage = `url(${f.src})`; this.quadro(0); }
    else this.el.style.background = RESERVA[nome] ?? '#f0f';
    this.el.style.transform = `translate(${x * TILE}px,${y * TILE}px)`; this.el.style.zIndex = String(z);
    mundo.camadaSprites.append(this.el);
  }
  quadro(i: number): this { this.el.style.backgroundPosition = `${-(this.px + (i % this.quadros) * TILE)}px ${-this.py}px`; return this; }
  remover() { this.el.remove(); }
}

/** conjunto de enfeites dinâmicos de uma mecânica, por chave; some inteiro ao sair da zona */
export class Enfeites {
  private itens = new Map<string, Removivel>();
  /** tile do tema (substitui o que houver na chave) */
  tile(chave: string, nome: string, x: number, y: number, z = 1): Ladrilho { this.tirar(chave); const l = new Ladrilho(nome, x, y, z); this.itens.set(chave, l); return l; }
  /** desenho à mão (grade de caracteres) na posição do tile, com deslocamento em px */
  pix(chave: string, quadrosPix: string[][], pal: Record<string, string>, x: number, y: number, o: { dx?: number; dy?: number; z?: number } = {}): Pix {
    this.tirar(chave);
    const p = new Pix(quadrosPix, pal, mundo.camadaSprites);
    p.pos(x * TILE + (o.dx ?? 0), y * TILE + (o.dy ?? 0), o.z ?? 2);
    this.itens.set(chave, p);
    return p;
  }
  tem(chave: string) { return this.itens.has(chave); }
  pegar<T extends Removivel = Pix>(chave: string): T | undefined { return this.itens.get(chave) as T | undefined; }
  tirar(chave: string) { this.itens.get(chave)?.remover(); this.itens.delete(chave); }
  /** remove todas as chaves com o prefixo */
  tirarGrupo(prefixo: string) { for (const k of [...this.itens.keys()]) if (k.startsWith(prefixo)) this.tirar(k); }
  limpar() { for (const i of this.itens.values()) i.remover(); this.itens.clear(); }
  /** esquece as referências sem tocar no DOM (a cena já limpou a camada ao trocar de zona) */
  esquecer() { this.itens.clear(); }
}

/** roda `fn` a cada quadro de simulação do mapa enquanto `vivo()` valer (encerra sozinho ao trocar de zona) */
export function laco(vivo: () => boolean, fn: (q: number) => void) {
  let q = 0;
  void (async () => { while (vivo()) { await mundo.esperarQuadros(1); if (!vivo()) break; fn(q++); } })();
}

const guardarPos = () => { const s = jogo.save.jogador, j = M.jog; s.x = j.x; s.y = j.y; s.dir = j.dir; };
/** o tile aceita o jogador agora? (chão livre e sem ator) */
export function livre(x: number, y: number) { return M.zv.chao(x, y) && !M.npcs.some((n) => n.ator.visivel && n.ator.x === x && n.ator.y === y); }
/** passo forçado do jogador (vento, esteira): sem virar o corpo e sem disparar a chegada normal */
export async function arrastar(d: Dir, dur = 8) { await andarJogador(d, dur, { semVirar: true, base: 'idle' }); }
/** depois de um movimento forçado: treinador que enxergou o jogador vem desafiar */
export async function olharTreinadores() { if (!jogo.save.equipe.length) return; const t = quemVe(); if (t) await abordagem(t); }
/** o jogador some pelo chão e reaparece em (x, y) */
export async function cair(x: number, y: number, dir: Dir = 'n') {
  const j = M.jog;
  sfx('pulo-saliencia');
  await quadros(16, (i) => { j.ey = i; j.visivel = i < 12; });
  recolocar(x, y, dir);
  await quadros(10, (i) => { j.ey = i - 10; });
  j.ey = 0;
}
/** põe o jogador em (x, y) sem transição */
export function recolocar(x: number, y: number, dir?: Dir) {
  const j = M.jog;
  j.teleportar(x, y, dir); j.ey = 0; j.visivel = true;
  if (M.parceira) { M.parceira.teleportar(x, y); M.parceira.visivel = false; }
  guardarPos();
}
/** trava o jogador enquanto `f` roda (para usar dentro de `passo`/`interagir`, que são síncronos) */
export function cena(f: () => Promise<void>) { void ocupar(f); }
/** tile à frente de um ponto */
export const frente = (x: number, y: number, d: Dir): [number, number] => [x + DX[d], y + DY[d]];
export const chave = (x: number, y: number) => x + ',' + y;
