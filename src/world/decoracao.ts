/**
 * Decoração do Quarto (spec 10.1): desenha, por cima do bake do quarto, a peça escolhida em `save.decoracao` para
 * cada vaga de `ZonaDef.decoracao`, com colisão e texto de exame; refaz na hora quando o PC do quarto emite
 * `bus 'decoracao'`. As imagens vêm da folha assada por tools/bake-decoracao.ts (public/assets/tiles/decoracao.*).
 */
import { TILE } from '../core/tipos';
import { bus } from '../core/events';
import { precarregar } from '../core/assets';
import { DECORACOES, decoracaoAtual, type CategoriaDeco } from '../data/decoracao';
import { M } from './vivo';
import { objCat } from './zonas';
import { t } from '../i18n';

interface Ret { sx: number; sy: number; w: number; h: number; dx: number; dy: number }
interface Folha { pecas: Record<string, { chao?: Ret; alto?: Ret }> }
const SRC = 'assets/tiles/decoracao.png';
let folha: Folha | null | undefined;
let els: HTMLElement[] = [], presos: [number, number][] = [];
const textos = new Map<string, string[]>();
const EXAME: Record<string, string[]> = {
  'cama-jogador': ['Sua cama. A colcha de estrela foi a vó que costurou.'],
  cama: ['Uma cama simples, de colcha lisa. Dá saudade da colcha de estrela.'],
  console: ['O videogame de cartucho. A fita de corrida de jangada está emperrada desde o Natal.'],
  'pelucia-a': ['Um tamanduá de pelúcia. O focinho já está meio careca de tanto abraço.'],
};
/** peça mostrada na vaga: a escolhida no PC; a cama nunca some (sem escolha fica a cama simples) */
const pecaDa = (c: string): string => decoracaoAtual(c as CategoriaDeco) || (c === 'movel' ? 'cama' : '');

async function lerFolha(): Promise<Folha | null> {
  if (folha !== undefined) return folha;
  try { const r = await fetch('assets/tiles/decoracao.json'); folha = r.ok && (r.headers.get('content-type') ?? '').includes('json') ? ((await r.json()) as Folha) : null; } catch { folha = null; }
  if (folha) await precarregar(SRC);
  return folha;
}
function limpar() {
  for (const e of els) e.remove(); els = [];
  if (M.zv) for (const [x, y] of presos) M.zv.bloquear(x, y, false);
  presos = []; textos.clear();
}
function peca(r: Ret, x: number, y: number, z: number, pai: HTMLElement) {
  const e = document.createElement('div');
  e.className = 'chunk deco';
  e.style.cssText = `width:${r.w}px;height:${r.h}px;background-image:url(${SRC});background-position:${-r.sx}px ${-r.sy}px;transform:translate(${x * TILE + r.dx}px,${y * TILE + r.dy}px);z-index:${z}`;
  pai.append(e); els.push(e);
}
function pintar() {
  limpar();
  const vagas = M.zv?.def.decoracao;
  if (!vagas || !folha || M.cena.debug) return;
  for (const [cat, [x, y]] of Object.entries(vagas)) {
    const id = pecaDa(cat), f = id ? folha.pecas[id] : undefined;
    if (!id || !f) continue;
    const c = objCat(id), solido = !!c?.colisao.some((l) => l.some((v) => v === 1));
    if (f.chao) peca(f.chao, x, y, solido ? (y + 1) * TILE : 0, M.cena.sprites);
    if (f.alto) peca(f.alto, x, y, 0, M.cena.alto);
    if (!c) continue;
    const d = DECORACOES.find((p) => p.id === id);
    const exame = EXAME[id] ?? (d ? [`${t(d.nome)}. ${t(d.origem)}`] : []);
    for (let j = 0; j < c.h; j++) for (let i = 0; i < c.w; i++) {
      if (!c.colisao[j][i]) continue;
      const tx = x + i, ty = y - (c.h - 1) + j;
      if (M.zv.chao(tx, ty)) { M.zv.bloquear(tx, ty, true); presos.push([tx, ty]); }
      if (exame.length) textos.set(`${tx},${ty}`, exame);
    }
  }
}
/** chamado pelo mundo ao carregar uma zona (não faz nada fora do quarto) */
export async function montarDecoracao() {
  els = []; presos = []; textos.clear(); // a cena e a grade viva da zona anterior já foram descartadas
  for (const e of Array.from(M.cena.alto.querySelectorAll('.deco'))) e.remove();
  if (!M.zv.def.decoracao) return;
  await lerFolha();
  pintar();
}
/** texto de exame da peça em (x, y), se houver */
export const exameDecoracao = (x: number, y: number): string[] | undefined => textos.get(`${x},${y}`);
bus.on('decoracao', () => { if (M.pronto && M.zv?.def.decoracao) pintar(); });
