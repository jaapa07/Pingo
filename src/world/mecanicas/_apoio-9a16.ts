/**
 * Apoio dos quebra-cabeças dos ginásios 9 a 16: coberturas de piso (peças do tilesheet do tema),
 * desenhos de pixel art em DOM, passos forçados do jogador e retorno ao ponto seguro.
 * Só usa o estado vivo do mapa (`M`); nada aqui sobrevive à troca de zona.
 */
import type { Dir } from '../../core/tipos';
import { TILE } from '../../core/tipos';
import { jogo } from '../../core/estado';
import { M, ocupar, sfx, quadros, atorEm } from '../vivo';
import { DX, DY } from '../zonas';
import { Pix } from '../pixel';
import type { Prop } from '../cena';
import { quemVe, abordagem } from '../npcs';

export const DIRS: Dir[] = ['n', 'l', 's', 'o'];
export const NOME_DIR: Record<Dir, string> = { n: 'norte', s: 'sul', l: 'leste', o: 'oeste' };
const k = (x: number, y: number, s = '') => `m:${s}${x},${y}`;

/* ------------------------------ desenhos ------------------------------ */
const girar = (g: string[]): string[] => g[0].split('').map((_, x) => g.map((l) => l[x]).reverse().join(''));
const SETA_N = ['...k...', '..kyk..', '.kyyyk.', 'kyyyyyk', 'kkkykkk', '..kyk..', '..kkk..'];
const SETA_L = girar(SETA_N), SETA_S = girar(SETA_L), SETA_O = girar(SETA_S);
export const SETAS: Record<Dir, string[]> = { n: SETA_N, l: SETA_L, s: SETA_S, o: SETA_O };
export const pixSeta = (d: Dir, cor = '#fcd834', borda = '#2a1a0e') => (pai: HTMLElement) => new Pix([SETAS[d]], { y: cor, k: borda }, pai);
/** fábrica de Pix a partir de quadros e paleta */
export const pix = (qs: string[][], pal: Record<string, string>) => (pai: HTMLElement) => new Pix(qs, pal, pai);
const cheio = (cor: string) => pix([Array.from({ length: 16 }, () => 'a'.repeat(16))], { a: cor });

/* ------------------------------ props ------------------------------ */
/** cobre o tile com uma peça de piso do tema (`piso`, `caminho`, `ponte`, `perigo`…); fica sob todos os atores */
export function cobrir(x: number, y: number, peca: string, reserva = '#8a8a96', s = 'c'): Prop {
  M.cena.tirarProp(k(x, y, s));
  return M.cena.prop(k(x, y, s), M.cena.peca(peca, cheio(reserva)), x * TILE, y * TILE).pos(x * TILE, y * TILE, 1);
}
export function descobrir(x: number, y: number, s = 'c') { M.cena.tirarProp(k(x, y, s)); }
/** desenho solto preso a um tile (dx, dy em px a partir do canto do tile); `z` 0 = chão, 1 = ordenado pelo pé do tile, 2 = por cima de tudo */
export function enfeite(x: number, y: number, s: string, fab: (pai: HTMLElement) => Pix, dx = 0, dy = 0, z: 0 | 1 | 2 = 1): Pix {
  M.cena.tirarProp(k(x, y, s));
  const p = M.cena.prop(k(x, y, s), fab, x * TILE + dx, y * TILE + dy) as Pix;
  p.pos(x * TILE + dx, y * TILE + dy, z === 0 ? 2 : z === 1 ? y * TILE + 17 : y * TILE + 400);
  return p;
}
export function tirarEnfeite(x: number, y: number, s: string) { M.cena.tirarProp(k(x, y, s)); }

/* ------------------------------ jogador ------------------------------ */
export const frente = (): [number, number] => [M.jog.x + DX[M.jog.dir], M.jog.y + DY[M.jog.dir]];
export function gravarPos() { const s = jogo.save.jogador, j = M.jog; s.x = j.x; s.y = j.y; s.dir = j.dir; if (M.parceira) { M.parceira.teleportar(j.x, j.y); M.parceira.visivel = false; } }
/** passo forçado (esteira, vento, vagonete): não vira o jogador nem toca a animação de andar */
export async function passoForcado(d: Dir, dur: number, o: { tiles?: number; salto?: number; virar?: boolean } = {}) {
  await M.jog.mover(d, dur, { base: 'idle', semVirar: !o.virar, tiles: o.tiles, salto: o.salto });
  M.jog.base = 'andar'; M.jog.pose();
  gravarPos();
}
/** clarão e volta ao ponto seguro */
export async function voltarPara(x: number, y: number, dir: Dir = 'n') {
  sfx('pulo-saliencia');
  await quadros(18, (i) => { M.jog.visivel = i % 4 < 2; });
  M.jog.visivel = true;
  M.jog.teleportar(x, y, dir);
  gravarPos();
  await quadros(6);
}
/** depois de um deslocamento forçado: algum treinador avistou o jogador? */
export async function vigiar() { if (!jogo.save.equipe.length) return; const t = quemVe(); if (t) await abordagem(t); }
export const livre = (x: number, y: number) => M.zv.chao(x, y) && !atorEm(x, y);
/** roda uma ação de mecânica com o jogador travado */
export const acao = (f: () => Promise<void>) => { void ocupar(f); };
