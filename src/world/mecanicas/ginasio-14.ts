/**
 * Ginásio 14 (Geada, B7) — gelo escorregadio (o jogador desliza até bater).
 * O deslize do jogador é o do motor (`g` em src/world/jogador.ts). Esta mecânica cuida dos BLOCOS DE GELO das pistas
 * 2 e 3: olhando para um bloco, A o empurra; o bloco anda um tile e segue escorregando enquanto estiver no gelo,
 * até bater em parede, bloco, gente ou na beira da pista. Os blocos são obstáculo para o deslize do jogador.
 * Sair da pista (pisar fora do retângulo dela) devolve os blocos daquela pista ao lugar. Ao sair do ginásio, tudo
 * recomeça.
 */
import type { Dir } from '../../core/tipos';
import { TILE } from '../../core/tipos';
import { registrarMecanica } from '../registro';
import { atorEm } from '../vivo';
import { M, Enfeites, Ladrilho, DX, DY, cena, falar, sfx, quadros } from './_pecas';

const ZONA = 'B7-ginasio';
interface Pista { nome: string; x0: number; y0: number; x1: number; y1: number; blocos: [number, number][] }
/** interiores das pistas (inclusive) e posição inicial dos blocos */
const PISTAS: Pista[] = [
  { nome: '1', x0: 2, y0: 11, x1: 14, y1: 14, blocos: [] },
  { nome: '2', x0: 18, y0: 11, x1: 28, y1: 15, blocos: [[25, 13]] },
  { nome: '3', x0: 18, y0: 3, x1: 30, y1: 7, blocos: [[19, 4], [22, 5]] },
];
interface Bloco { pista: Pista; x: number; y: number; l: Ladrilho }
const enf = new Enfeites();
let blocos: Bloco[] = [], atual: Pista | null = null;

const dentro = (p: Pista, x: number, y: number) => x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1;
const pistaEm = (x: number, y: number) => PISTAS.find((p) => dentro(p, x, y)) ?? null;
const blocoEm = (x: number, y: number) => blocos.find((b) => b.x === x && b.y === y);
const zBloco = (y: number) => y * TILE + 15;

function porBloco(p: Pista, i: number, x: number, y: number) {
  const l = enf.tile(`b${p.nome}-${i}`, 'din-p', x, y, zBloco(y));
  M.zv.bloquear(x, y, true);
  blocos.push({ pista: p, x, y, l });
}
function arrumar(p: Pista) {
  for (const b of blocos.filter((q) => q.pista === p)) M.zv.bloquear(b.x, b.y, false);
  blocos = blocos.filter((q) => q.pista !== p);
  enf.tirarGrupo(`b${p.nome}-`);
  p.blocos.forEach(([x, y], i) => porBloco(p, i, x, y));
}
/** o bloco pode entrar em (x, y)? (dentro da pista, chão livre, sem bloco, sem gente) */
function cabe(b: Bloco, x: number, y: number) {
  return dentro(b.pista, x, y) && M.zv.chao(x, y) && !blocoEm(x, y) && !atorEm(x, y) && !(M.jog.x === x && M.jog.y === y);
}
async function empurrar(b: Bloco, d: Dir) {
  let x = b.x, y = b.y, n = 0;
  M.zv.bloquear(b.x, b.y, false);
  while (cabe(b, x + DX[d], y + DY[d])) { x += DX[d]; y += DY[d]; n++; if (M.zv.ch(x, y) !== 'g') break; }
  if (!n) { M.zv.bloquear(b.x, b.y, true); sfx('batida'); await falar('O bloco não se mexe: do outro lado não tem para onde ir.'); return; }
  sfx('gelo-deslize');
  const ox = b.x * TILE, oy = b.y * TILE, dur = 6 * n;
  await quadros(dur, (i) => { const k = (i + 1) / dur; b.l.el.style.transform = `translate(${ox + DX[d] * k * n * TILE}px,${oy + DY[d] * k * n * TILE}px)`; });
  b.x = x; b.y = y;
  b.l.el.style.transform = `translate(${x * TILE}px,${y * TILE}px)`; b.l.el.style.zIndex = String(zBloco(y));
  M.zv.bloquear(x, y, true);
  sfx('batida'); M.cena.tremer(2);
}

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer(); blocos = []; atual = null;
    for (const p of PISTAS) p.blocos.forEach(([x, y], i) => porBloco(p, i, x, y));
  },
  passo(x, y) {
    const p = pistaEm(x, y);
    if (atual && p !== atual) {
      const sujo = blocos.some((b) => b.pista === atual && !atual!.blocos.some(([bx, by]) => bx === b.x && by === b.y));
      if (sujo) { arrumar(atual); sfx('empurrar'); }
    }
    atual = p;
    if (p && M.zv.ch(x, y) === 'g') sfx('passo-gelo');
    return false;
  },
  interagir(x, y) {
    const b = blocoEm(x, y);
    if (b) {
      const d = M.jog.dir;
      if (M.jog.x + DX[d] !== x || M.jog.y + DY[d] !== y) return false;
      cena(() => empurrar(b, d));
      return true;
    }
    if (M.zv.ch(x, y) === 'g' && pistaEm(x, y)) { cena(() => falar('Gelo liso como espelho. Quem pisa só para quando bate em alguma coisa.')); return true; }
    return false;
  },
  sair() { enf.esquecer(); blocos = []; atual = null; },
});
