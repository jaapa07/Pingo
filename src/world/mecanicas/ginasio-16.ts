/**
 * Ginásio 16 (Lenda, A9) — a trilha das quatro provas elementais.
 * Quatro alas, cada uma com uma prova e um totem; vencida a prova, o totem acende (flag `g16-<elemento>`) e os
 * guardiões da aldeia levam o jogador de volta ao corredor. A porta de taquara da câmara do Pajé, em (15, 4), só abre
 * com os quatro totens acesos. Prova pela metade recomeça ao sair da ala; ao sair do ginásio, só os totens ficam.
 *  - FOGO: brasas em ondas. Cada brasa tem fase 0, 1 ou 2 e queima quando os passos dados na ala (contando o que
 *    chega) têm o resto da fase na divisão por 3. Brasa acesa = chama; a que acende no próximo passo fica vermelha.
 *  - TERRA: pedras empurradas com A, um tile; o buraco engole a pedra e vira chão.
 *  - VENTO: na corrente (`g`) o jogador é levado na direção do vento até sair dela ou bater; a pena (`,`) gira o
 *    vento no sentido horário. O vento começa soprando para o norte.
 *  - ÁGUA: o reflexo do jogador aparece na outra margem e anda espelhado (leste ↔ oeste); a prova termina com os dois
 *    nas pedras marcadas ao mesmo tempo.
 */
import type { Dir } from '../../core/tipos';
import { TILE } from '../../core/tipos';
import { flag, setFlag } from '../../core/estado';
import { mundo } from '../index';
import type { Ator } from '../ator';
import { registrarMecanica } from '../registro';
import { M, Enfeites, Ladrilho, DX, DY, cena, recolocar, arrastar, olharTreinadores, falar, avisar, sfx, quadros } from './_pecas';
import { juntar, tr } from '../../i18n';

const ZONA = 'A9-ginasio';
type Elem = 'fogo' | 'terra' | 'vento' | 'agua';
interface Ala { el: Elem; x0: number; y0: number; x1: number; y1: number; entrada: [number, number]; fora: [number, number]; totem: [number, number] }
const ALAS: Ala[] = [
  { el: 'fogo', x0: 2, y0: 10, x1: 12, y1: 14, entrada: [12, 12], fora: [14, 12], totem: [1, 12] },
  { el: 'terra', x0: 2, y0: 2, x1: 10, y1: 6, entrada: [10, 6], fora: [14, 6], totem: [2, 1] },
  { el: 'vento', x0: 20, y0: 2, x1: 30, y1: 8, entrada: [20, 8], fora: [16, 8], totem: [30, 1] },
  { el: 'agua', x0: 20, y0: 10, x1: 30, y1: 14, entrada: [20, 12], fora: [16, 12], totem: [25, 15] },
];
const NOME: Record<Elem, string> = { fogo: 'do Fogo', terra: 'da Terra', vento: 'do Vento', agua: 'da Água' };
const PORTA: [number, number] = [15, 4];
/** fases das brasas da ala do fogo, a partir de (2, 10); '.' e '#' não são brasa */
const FASES = ['0#10210#102', '01201201201', '.0#201#012.', '0120#201201', '1021#210210'];
const META_FOGO: [number, number] = [2, 12];
const PEDRAS: [number, number][] = [[3, 2], [8, 5], [9, 5]];
const BURACOS: [number, number][] = [[4, 2], [2, 3], [7, 5]];
const META_TERRA: [number, number] = [2, 2];
const META_VENTO: [number, number] = [30, 2];
const ORDEM: Dir[] = ['n', 'l', 's', 'o'];
const AGUA_JOG: [number, number] = [24, 14], AGUA_REF: [number, number] = [28, 13], REF_INICIO: [number, number] = [30, 12];
const espelho = (x: number) => 50 - x; // 20 ↔ 30
const ESP: Record<Dir, Dir> = { n: 'n', s: 's', l: 'o', o: 'l' };

const enf = new Enfeites();
let atual: Ala | null = null, passosFogo = 0, vento: Dir = 'n';
let pedras: { x: number; y: number; l: Ladrilho }[] = [];
let tapados = new Set<string>();
let reflexo: Ator | null = null;
let antes: [number, number] = [0, 0];

const feito = (e: Elem) => !!flag('g16-' + e);
const todos = () => ALAS.every((a) => feito(a.el));
const dentro = (a: Ala, x: number, y: number) => x >= a.x0 && x <= a.x1 && y >= a.y0 && y <= a.y1;
const alaEm = (x: number, y: number) => ALAS.find((a) => dentro(a, x, y)) ?? null;
const k = (x: number, y: number) => x + ',' + y;

/* ------------------------------ desenhos ------------------------------ */
/** brasa apagada (cinza com ponto de brasa) e brasa quente (vai queimar no próximo passo), cobrindo o tile todo */
const cinza = (a: string, b: string) => Array.from({ length: 16 }, (_, y) => Array.from({ length: 16 }, (_, x) => ((x * 7 + y * 13) % 11 === 0 ? b : (x + y) % 5 === 0 ? 'c' : a)).join(''));
const BRASA_FRIA = [cinza('a', 'b')], BRASA_QUENTE = [cinza('a', 'b')];
const PAL_FRIA = { a: '#2c2430', b: '#7c3c24', c: '#3c3440' };
const PAL_QUENTE = { a: '#8c1c14', b: '#fcb42c', c: '#b8241c' };
const PORTA_TAQUARA = [['a.a.a.a.a.a.a.a.', 'abababababababab', 'abababababababab', 'cccccccccccccccc', 'abababababababab', 'abababababababab', 'abababababababab', 'cccccccccccccccc', 'abababababababab', 'abababababababab', 'abababababababab', 'cccccccccccccccc', 'abababababababab', 'abababababababab', 'abababababababab', 'abababababababab']];
const PAL_TAQUARA = { a: '#8c6430', b: '#c8a058', c: '#5c3c1c' };
const BRILHO = [['...a...', '..aba..', '.abcba.', 'abcccba', '.abcba.', '..aba..', '...a...']];
const PAL_BRILHO: Record<Elem, Record<string, string>> = {
  fogo: { a: '#b8241c', b: '#f0641c', c: '#fff48c' }, terra: { a: '#6c4c24', b: '#c8a058', c: '#fff8a8' },
  vento: { a: '#3c7cb4', b: '#94d4f0', c: '#ffffff' }, agua: { a: '#1c7c7c', b: '#3cb49c', c: '#94e8c4' },
};

function pintarTotens() {
  for (const a of ALAS) if (feito(a.el)) enf.pix('t' + a.el, BRILHO, PAL_BRILHO[a.el], a.totem[0], a.totem[1], { dx: 4, dy: -22, z: a.totem[1] * TILE + 400 });
  if (todos()) { enf.tirar('porta'); M.zv.bloquear(PORTA[0], PORTA[1], false); }
  else { enf.pix('porta', PORTA_TAQUARA, PAL_TAQUARA, PORTA[0], PORTA[1], { z: PORTA[1] * TILE + 15 }); M.zv.bloquear(PORTA[0], PORTA[1], true); }
}

/* ------------------------------ fogo ------------------------------ */
const fase = (x: number, y: number) => { const c = FASES[y - 10]?.[x - 2]; return c && '012'.includes(c) ? Number(c) : -1; };
function pintarFogo() {
  const apagado = feito('fogo');
  for (let y = 10; y <= 14; y++) for (let x = 2; x <= 12; x++) {
    const f = fase(x, y); if (f < 0) continue;
    const ch = 'f' + k(x, y);
    // acesa = a lava assada aparece; quente = vermelha (queima no próximo passo); apagada = cinza
    if (!apagado && f === passosFogo % 3) enf.tirar(ch);
    else if (!apagado && f === (passosFogo + 1) % 3) enf.pix(ch, BRASA_QUENTE, PAL_QUENTE, x, y, { z: 2 });
    else enf.pix(ch, BRASA_FRIA, PAL_FRIA, x, y, { z: 2 });
  }
}

/* ------------------------------ terra ------------------------------ */
function montarTerra() {
  for (const p of pedras) { M.zv.bloquear(p.x, p.y, false); p.l.remover(); }
  pedras = []; tapados = new Set(); enf.tirarGrupo('tap');
  for (const [x, y] of BURACOS) M.zv.bloquear(x, y, !feito('terra'));
  if (feito('terra')) { for (const [x, y] of BURACOS) enf.tile('tap' + k(x, y), 'lama', x, y, 2); return; }
  for (const [x, y] of PEDRAS) { pedras.push({ x, y, l: new Ladrilho('din-p', x, y, y * TILE + 15) }); M.zv.bloquear(x, y, true); }
}
const buracoAberto = (x: number, y: number) => !feito('terra') && BURACOS.some(([a, b]) => a === x && b === y) && !tapados.has(k(x, y));
async function empurrarPedra(i: number, d: Dir) {
  const p = pedras[i], bx = p.x + DX[d], by = p.y + DY[d];
  const ala = ALAS[1];
  const livre = dentro(ala, bx, by) && !pedras.some((q) => q.x === bx && q.y === by) && (buracoAberto(bx, by) || M.zv.chao(bx, by));
  if (!livre) { sfx('batida'); await falar('A pedra não anda: do outro lado tem parede ou outra pedra.'); return; }
  sfx('empurrar');
  M.zv.bloquear(p.x, p.y, false);
  await quadros(14, (q) => { p.l.el.style.transform = `translate(${(p.x + DX[d] * (q + 1) / 14) * TILE}px,${(p.y + DY[d] * (q + 1) / 14) * TILE}px)`; });
  if (buracoAberto(bx, by)) {
    tapados.add(k(bx, by)); M.zv.bloquear(bx, by, false);
    p.l.remover(); pedras.splice(i, 1);
    enf.tile('tap' + k(bx, by), 'lama', bx, by, 2);
    sfx('quebrar'); M.cena.tremer(4);
    avisar('A pedra tapou o buraco!');
    return;
  }
  p.x = bx; p.y = by; p.l.el.style.zIndex = String(by * TILE + 15);
  M.zv.bloquear(bx, by, true);
}

/* ------------------------------ vento ------------------------------ */
function pintarVento() {
  const ala = ALAS[2];
  enf.tirarGrupo('v');
  if (feito('vento')) return;
  const SETA: Record<Dir, string[]> = {
    n: ['...a...', '..aaa..', '.a.a.a.', '...a...', '...a...', '...a...', '...a...'],
    s: ['...a...', '...a...', '...a...', '...a...', '.a.a.a.', '..aaa..', '...a...'],
    l: ['.......', '....a..', '.....a.', 'aaaaaaa', '.....a.', '....a..', '.......'],
    o: ['.......', '..a....', '.a.....', 'aaaaaaa', '.a.....', '..a....', '.......'],
  };
  for (let y = ala.y0; y <= ala.y1; y++) for (let x = ala.x0; x <= ala.x1; x++) if (M.zv.ch(x, y) === 'g' && (x + y) % 2 === 0) enf.pix('v' + k(x, y), [SETA[vento]], { a: '#ffffff' }, x, y, { dx: 4, dy: 4, z: 3 });
}
function girarVento() { vento = ORDEM[(ORDEM.indexOf(vento) + 1) % 4]; sfx('vento'); pintarVento(); avisar(({ n: 'O vento virou: sopra para o norte.', l: 'O vento virou: sopra para o leste.', s: 'O vento virou: sopra para o sul.', o: 'O vento virou: sopra para o oeste.' } as const)[vento]); }
async function levarNoVento() {
  const j = M.jog;
  sfx('vento');
  for (let n = 0; n < 40; n++) {
    if (M.zv.ch(j.x, j.y) !== 'g') break;
    const nx = j.x + DX[vento], ny = j.y + DY[vento];
    if (!M.zv.chao(nx, ny) || mundo.npcs.some((q) => q.ator.visivel && q.ator.x === nx && q.ator.y === ny)) break;
    await arrastar(vento, 7);
    if (M.zv.ch(j.x, j.y) === ',') girarVento();
  }
  if (j.x === META_VENTO[0] && j.y === META_VENTO[1]) await vencer(ALAS[2]);
}

/* ------------------------------ água ------------------------------ */
function tirarReflexo() { reflexo?.remover(); reflexo = null; }
function criarReflexo() {
  tirarReflexo();
  if (feito('agua')) return;
  reflexo = mundo.criarAtor(M.jog.modelo, REF_INICIO[0], REF_INICIO[1], ESP[M.jog.dir]);
  reflexo.solido = false;
  reflexo.spr.el.style.opacity = '0.65';
  reflexo.spr.el.style.filter = 'hue-rotate(160deg) saturate(1.4)';
  sfx('passo-agua');
}
async function moverReflexo(d: Dir) {
  if (!reflexo) return;
  const e = ESP[d], nx = reflexo.x + DX[e], ny = reflexo.y + DY[e];
  if (nx >= 26 && nx <= 30 && ny >= 10 && ny <= 14 && M.zv.chao(nx, ny)) await reflexo.mover(e, 14);
  else reflexo.virar(e);
}

/* ------------------------------ provas ------------------------------ */
async function vencer(a: Ala) {
  setFlag('g16-' + a.el);
  sfx('item-raro'); M.cena.tremer(6);
  if (a.el === 'fogo') pintarFogo();
  if (a.el === 'vento') pintarVento();
  pintarTotens();
  await quadros(20);
  await falar(tr(todos() ? 'O totem {el} se acendeu!\nOs quatro totens brilham juntos, e a porta de taquara do Pajé se abriu.' : 'O totem {el} se acendeu!', { el: NOME[a.el] }));
  tirarReflexo();
  sfx('warp');
  await quadros(10, (q) => { M.jog.visivel = q % 4 < 2; });
  recolocar(a.fora[0], a.fora[1], 'n');
  atual = null;
  avisar(tr('Totens acesos: {n} de 4', { n: ALAS.filter((q) => feito(q.el)).length }));
}
async function queimar() {
  sfx('fogueira'); M.cena.tremer(6);
  await quadros(18, (q) => { M.jog.visivel = q % 4 < 2; });
  M.jog.visivel = true;
  const a = ALAS[0];
  recolocar(a.entrada[0], a.entrada[1], 'o');
  passosFogo = 0; pintarFogo();
  await falar('Ai! A brasa acendeu bem debaixo do seu pé.\nVocê voltou correndo para o começo da prova. Olhe as brasas vermelhas: são elas que queimam no próximo passo.');
}
function reiniciar(a: Ala) {
  if (a.el === 'fogo') { passosFogo = 0; pintarFogo(); }
  if (a.el === 'terra') montarTerra();
  if (a.el === 'vento') { vento = 'n'; pintarVento(); }
  if (a.el === 'agua') tirarReflexo();
}

registrarMecanica(ZONA, {
  entrar() {
    enf.esquecer(); pedras = []; tapados = new Set(); reflexo = null; atual = null; passosFogo = 0; vento = 'n';
    antes = [M.jog.x, M.jog.y];
    // a lama da ala da terra vira chão de passo normal (a arte assada continua)
    const t = ALAS[1];
    for (let y = t.y0; y <= t.y1; y++) for (let x = t.x0; x <= t.x1; x++) if (M.zv.ch(x, y) === 'l') M.zv.set(x, y, ':');
    pintarFogo(); montarTerra(); pintarVento(); pintarTotens();
  },
  passo(x, y) {
    const [ax, ay] = antes; antes = [x, y];
    const d: Dir | null = x > ax ? 'l' : x < ax ? 'o' : y > ay ? 's' : y < ay ? 'n' : null;
    const a = alaEm(x, y);
    if (atual && a !== atual) { reiniciar(atual); atual = null; }
    if (!a) return false;
    const entrou = atual !== a;
    atual = a;
    if (feito(a.el)) return M.zv.ch(x, y) === 'g';
    if (a.el === 'fogo') {
      passosFogo = entrou ? 0 : passosFogo + 1;
      if (!entrou && fase(x, y) === passosFogo % 3) { cena(queimar); return true; }
      pintarFogo();
      if (x === META_FOGO[0] && y === META_FOGO[1]) { cena(() => vencer(a)); return true; }
      return false;
    }
    if (a.el === 'terra') {
      if (x === META_TERRA[0] && y === META_TERRA[1]) { cena(() => vencer(a)); return true; }
      return false;
    }
    if (a.el === 'vento') {
      if (entrou) { vento = 'n'; pintarVento(); }
      if (M.zv.ch(x, y) === ',') girarVento();
      if (M.zv.ch(x, y) === 'g') { cena(async () => { await levarNoVento(); antes = [M.jog.x, M.jog.y]; await olharTreinadores(); }); return true; }
      if (x === META_VENTO[0] && y === META_VENTO[1]) { cena(() => vencer(a)); return true; }
      return false;
    }
    // água
    if (entrou || !reflexo) { criarReflexo(); return false; }
    if (d) {
      cena(async () => {
        await moverReflexo(d);
        if (x === AGUA_JOG[0] && y === AGUA_JOG[1] && reflexo && reflexo.x === AGUA_REF[0] && reflexo.y === AGUA_REF[1]) await vencer(a);
      });
      return true;
    }
    return false;
  },
  interagir(x, y) {
    const i = pedras.findIndex((p) => p.x === x && p.y === y);
    if (i >= 0) {
      const d = M.jog.dir;
      if (M.jog.x + DX[d] !== x || M.jog.y + DY[d] !== y) return false;
      cena(() => empurrarPedra(i, d));
      return true;
    }
    if (buracoAberto(x, y)) { cena(() => falar('Um buraco fundo na terra. Uma pedra empurrada para dentro dele vira chão.')); return true; }
    if (x === PORTA[0] && y === PORTA[1] && !todos()) {
      const faltam = ALAS.filter((a) => !feito(a.el)).map((a) => tr('o totem {el}', { el: NOME[a.el] }));
      cena(() => falar(tr(faltam.length > 1 ? 'Uma porta de taquara amarrada com cipó. Só abre quando os quatro totens estiverem acesos.\nFaltam: {lista}.' : 'Uma porta de taquara amarrada com cipó. Só abre quando os quatro totens estiverem acesos.\nFalta: {lista}.', { lista: juntar(faltam) })));
      return true;
    }
    const t = ALAS.find((a) => a.totem[0] === x && a.totem[1] === y);
    if (t) { cena(() => falar(feito(t.el) ? tr('O totem {el} brilha. A prova está cumprida.', { el: NOME[t.el] }) : tr('O totem {el} está apagado. A prova é ali dentro.', { el: NOME[t.el] }))); return true; }
    if (M.zv.ch(x, y) === 'x' && alaEm(x, y)) { cena(() => falar(feito('fogo') ? 'As brasas dormem desde que você venceu a prova.' : 'Brasas que acendem em ondas. A vermelha queima no próximo passo; a chama, agora.')); return true; }
    return false;
  },
  sair() { enf.esquecer(); pedras = []; tapados = new Set(); tirarReflexo(); atual = null; passosFogo = 0; vento = 'n'; },
});
