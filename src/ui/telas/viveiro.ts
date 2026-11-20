/**
 * VIVEIRO DE CUIAS — 16 caixas de 30. Mover (pegar e soltar em qualquer vaga, inclusive da equipe), retirar,
 * depositar (a criatura descansa e fica curada), soltar na natureza (com animação de volta ao habitat),
 * resumo e renomear a caixa. O nome das caixas fica em `flags['caixa:<n>']` e a caixa aberta em `flags['caixa-atual']`.
 */
import type { CriaturaInst } from '../../core/tipos';
import { jogo } from '../../core/estado';
import { input, tocavel } from '../../core/input';
import { curarCriatura } from '../../battle/index';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, seta, som, iconeTipo, iconeStatus } from '../kit';
import { perguntar, informar, confirmar } from '../componentes/confirmacao';
import { abrirTela, pedirNome } from '../dialogo';
import { iconeCriatura, figura, nomeCri, sexoTxt, esp, vidaMaxDe, faixaDica, caixa, rotulo, pix, type Icone, estrelaRara } from './comum';
import { T } from '../../data/textos-ui';

type Area = 'topo' | 'caixa' | 'equipe';
interface Pos { area: Area; i: number }
const CW = 30, CH = 25, COLS = 6, N = 30;
const FOLHA = ['.gg', 'ggl', 'gl.'];

export function criarViveiro(): Tela {
  const s = jogo.save;
  const el = elTela('ui', 'tela-viveiro', 'fundo-azulejo');
  let cx = Math.max(0, Math.min(15, Number(s.flags['caixa-atual'] ?? 0)));
  let cur: Pos = { area: 'caixa', i: 0 }, pego: Pos | null = null, pegoCx = 0, ocupado = false, viva = true;
  const nomeCaixa = (i: number) => String(s.flags['caixa:' + i] ?? `Caixa ${i + 1}`);
  const info = moldura('tinta', 108, 84, 2, 2), painelEq = moldura('tinta', 108, 77, 2, 88), topo = moldura('placa', 206, 16, 112, 2), painel = moldura('madeira', 206, 146, 112, 19);
  el.append(info, painelEq, topo, painel);
  const dica = faixaDica(el);
  const tNome = texto('', { cor: 'amarelo', sombra: true }), tQtd = texto('', { cor: 'creme' });
  const sE = em(seta('esq'), 6, 4), sD = em(seta('dir'), 194, 4); topo.append(sE, sD, em(tNome, 20, 4), em(tQtd, 150, 4));
  tocavel(sE, () => trocarCaixa(-1)); tocavel(sD, () => trocarCaixa(1)); tocavel(topo, () => { cur = { area: 'topo', i: 0 }; pintarCursor(); void acaoTopo(); });
  painelEq.append(em(texto('EQUIPE', { cor: 'cinza' }), 6, 5));
  const grade = caixa('', COLS * (CW + 1), 5 * (CH + 1)), gradeEq = caixa('', 3 * (CW + 1), 2 * (CH + 1));
  painel.append(em(grade, 10, 9)); painelEq.append(em(gradeEq, 8, 18));
  const sel = moldura('selecao', CW + 4, CH + 4); sel.classList.add('quica'); sel.style.pointerEvents = 'none'; sel.style.zIndex = '5'; el.append(sel);
  const mao = caixa('', 24, 24); mao.style.zIndex = '6'; mao.style.pointerEvents = 'none'; el.append(mao);
  const infoDyn = caixa('', 100, 76); info.append(em(infoDyn, 4, 4));
  let icones: Icone[] = [], figInfo: Icone | null = null, icMao: Icone | null = null;
  const anima: { t: number; passo(dt: number): boolean }[] = [];

  const em_ = (p: Pos, c = cx): CriaturaInst | null => (p.area === 'caixa' ? s.viveiro[c][p.i] : p.area === 'equipe' ? s.equipe[p.i] ?? null : null);
  const equipeValida = (eq: CriaturaInst[]) => eq.some((c) => !c.ovo && c.vida > 0);
  const xy = (p: Pos): [number, number] => (p.area === 'caixa' ? [122 + (p.i % COLS) * (CW + 1), 28 + Math.floor(p.i / COLS) * (CH + 1)] : p.area === 'equipe' ? [10 + (p.i % 3) * (CW + 1), 106 + Math.floor(p.i / 3) * (CH + 1)] : [112, 2]);

  function celula(p: Pos, c: CriaturaInst | null): HTMLElement {
    const d = caixa('cel-viv', CW, CH); d.style.background = p.area === 'caixa' ? '#e8c07a' : '#4a4a5e'; d.style.boxShadow = `inset -1px -1px 0 ${p.area === 'caixa' ? '#c98f4e' : '#3b2a35'}`;
    if (c) { const ic = iconeCriatura(c.especie, !!c.ovo, !!c.rara); d.append(em(ic.el, 3, 0)); icones.push(ic); if (!c.ovo && c.vida <= 0) ic.el.style.opacity = '0.5'; }
    if (pego && pego.area === p.area && pego.i === p.i && (p.area !== 'caixa' || pegoCx === cx)) d.classList.add('pega');
    tocavel(d, () => { cur = p; pintarCursor(); som('ui-ok'); void acao(); }, () => { cur = p; pintarCursor(); });
    return d;
  }
  function montar() {
    icones = []; grade.replaceChildren(); gradeEq.replaceChildren();
    for (let i = 0; i < N; i++) grade.append(em(celula({ area: 'caixa', i }, s.viveiro[cx][i]), (i % COLS) * (CW + 1), Math.floor(i / COLS) * (CH + 1)));
    for (let i = 0; i < 6; i++) gradeEq.append(em(celula({ area: 'equipe', i }, s.equipe[i] ?? null), (i % 3) * (CW + 1), Math.floor(i / 3) * (CH + 1)));
    escrever(tNome, nomeCaixa(cx)); escrever(tQtd, `${s.viveiro[cx].filter(Boolean).length}/30`); tQtd.style.left = 188 - parseInt(tQtd.style.width) + 'px';
    s.flags['caixa-atual'] = cx;
    pintarCursor();
  }
  function pintarCursor() {
    const [x, y] = xy(cur);
    if (cur.area === 'topo') { sel.style.width = '210px'; sel.style.height = '20px'; em(sel, 110, 0); } else { sel.style.width = CW + 4 + 'px'; sel.style.height = CH + 4 + 'px'; em(sel, x - 2, y - 2); }
    em(mao, x + 3, y - 8); mao.style.display = pego && cur.area !== 'topo' ? '' : 'none';
    const c = pego ? em_(pego, pegoCx) : em_(cur);
    infoDyn.replaceChildren(); figInfo = null;
    if (c) {
      const e = esp(c.especie);
      figInfo = figura(c.especie, 100, 52, { misterio: !!c.ovo, rara: !!c.rara }); infoDyn.append(em(figInfo.el, 0, 0));
      if (c.rara && !c.ovo) infoDyn.append(em(estrelaRara(), 2, 2)); // Pelagem Rara
      rotulo(infoDyn, `${nomeCri(c)} ${sexoTxt(c)}`, 0, 54, 'creme');
      if (!c.ovo) { rotulo(infoDyn, `Nv${c.nivel}  ${c.vida}/${vidaMaxDe(c)}`, 0, 65, 'amarelo'); e?.tipos.forEach((t, i) => infoDyn.append(em(iconeTipo(t), 74 + i * 13, 63))); const st = c.vida <= 0 ? 'desmaiado' : c.status; if (st) infoDyn.append(em(iconeStatus(st, true), 90, 54)); }
    } else rotulo(infoDyn, cur.area === 'topo' ? `${nomeCaixa(cx)}: ${s.viveiro[cx].filter(Boolean).length} de 30 vagas ocupadas.` : 'Vaga livre.', 0, 30, 'cinza', { largura: 100, alinhar: 'centro' });
    dica(pego ? T.viveiro.dicaMover : cur.area === 'topo' ? T.viveiro.dicaTopo : T.viveiro.dica);
  }
  function trocarCaixa(d: number) { cx = (cx + d + 16) % 16; som('ui-mover'); montar(); }
  function pegar(p: Pos) { const c = em_(p); if (!c) return; pego = p; pegoCx = cx; mao.replaceChildren(); icMao = iconeCriatura(c.especie, !!c.ovo, !!c.rara); icMao.animar(true); mao.append(icMao.el); montar(); }
  function largarPego() { pego = null; icMao = null; mao.replaceChildren(); montar(); }
  /** troca o conteúdo de duas vagas (A = origem do que está na mão). Devolve o motivo se não puder. */
  function trocar(a: Pos, ca: number, b: Pos): string | null {
    const eq = [...s.equipe], va = em_(a, ca), vb = em_(b);
    if (!va) return null;
    const naCaixa = (p: Pos, c: number, v: CriaturaInst | null) => { s.viveiro[c][p.i] = v; if (v) curarCriatura(v); };
    if (a.area === 'caixa' && b.area === 'caixa') { s.viveiro[ca][a.i] = vb; s.viveiro[cx][b.i] = va; return null; }
    if (a.area === 'equipe' && b.area === 'equipe') { if (vb) [eq[a.i], eq[b.i]] = [eq[b.i], eq[a.i]]; else { eq.splice(a.i, 1); eq.push(va); } s.equipe = eq; return null; }
    if (a.area === 'equipe') { if (vb) eq[a.i] = vb; else eq.splice(a.i, 1); if (!equipeValida(eq)) return T.viveiro.ultima; s.equipe = eq; naCaixa(b, cx, va); return null; }
    if (vb) { eq[b.i] = va; if (!equipeValida(eq)) return T.viveiro.ultima; s.equipe = eq; naCaixa(a, ca, vb); return null; }
    if (eq.length >= 6) return T.viveiro.equipeCheia;
    eq.push(va); s.equipe = eq; s.viveiro[ca][a.i] = null; return null;
  }
  async function soltar(p: Pos, c: CriaturaInst) {
    if (c.ovo) { som('ui-erro'); await informar(T.viveiro.soltarOvo); return; }
    if (p.area === 'equipe' && !equipeValida(s.equipe.filter((x) => x !== c))) { som('ui-erro'); await informar(T.viveiro.ultima); return; }
    if (!(await confirmar(T.viveiro.soltar.replace('{N}', nomeCri(c)), false))) return;
    const nome = nomeCri(c), [x, y] = xy(p);
    if (p.area === 'equipe') s.equipe.splice(p.i, 1); else s.viveiro[cx][p.i] = null;
    montar();
    // a criatura sai andando para fora da caixa, entre folhas, de volta ao habitat
    const ic = iconeCriatura(c.especie); ic.animar(true); const ator = em(ic.el, x + 3, y); ator.style.zIndex = '8'; el.append(ator);
    const folhas = [0, 1, 2, 3].map((k) => { const f = pix(FOLHA, { g: '#4fa346', l: '#8fd45a' }); f.style.zIndex = '9'; el.append(em(f, x + 4 + k * 6, y + 20)); return f; });
    som('passo-grama');
    await new Promise<void>((ok) => anima.push({ t: 0, passo(dt) {
      this.t += dt; const t = this.t;
      ator.style.top = y + Math.round(t * 46) + 'px'; ator.style.opacity = t > 1 ? '0.5' : '1';
      ic.atualizar(dt);
      folhas.forEach((f, k) => { f.style.left = x + 4 + k * 6 + Math.round(Math.sin(t * 6 + k) * 5) + 'px'; f.style.top = y + 20 + Math.round(t * 30 * (0.6 + k * 0.2)) + 'px'; });
      if (t < 1.5) return false;
      ator.remove(); folhas.forEach((f) => f.remove()); ok(); return true;
    } }));
    await informar(T.viveiro.soltou.replace('{N}', nome).replace('{H}', (esp(c.especie)?.habitat ?? 'a mata').replace(/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/, (m) => m.toLowerCase())));
  }
  async function acaoTopo() {
    if (ocupado || pego) return; ocupado = true;
    try {
      const op = await perguntar(nomeCaixa(cx), ['Renomear caixa', 'Caixa anterior', 'Próxima caixa', 'Voltar']);
      if (op === 0) { const n = (await pedirNome('Nome da caixa?', 10, nomeCaixa(cx))).trim(); if (n) s.flags['caixa:' + cx] = n; }
      else if (op === 1) cx = (cx + 15) % 16; else if (op === 2) cx = (cx + 1) % 16;
    } finally { ocupado = false; if (viva) montar(); }
  }
  async function acao() {
    if (ocupado) return;
    if (cur.area === 'topo') { await acaoTopo(); return; }
    if (pego) {
      if (pego.area === cur.area && pego.i === cur.i && (cur.area !== 'caixa' || pegoCx === cx)) { largarPego(); return; }
      const erro = trocar(pego, pegoCx, cur);
      if (erro) { som('ui-erro'); ocupado = true; await informar(erro); ocupado = false; pintarCursor(); return; }
      som('ui-ok'); largarPego(); return;
    }
    const c = em_(cur); if (!c) { som('ui-erro'); return; }
    ocupado = true;
    try {
      const naEq = cur.area === 'equipe', p = { ...cur };
      const ops = ['Mover', 'Resumo', naEq ? 'Depositar' : 'Retirar', 'Soltar na natureza', 'Voltar'];
      const op = ops[await perguntar(nomeCri(c), ops)];
      if (op === 'Mover') pegar(p);
      else if (op === 'Resumo') await abrirTela('resumo', { lista: [c], indice: 0 });
      else if (op === 'Retirar') { if (s.equipe.length >= 6) { som('ui-erro'); await informar(T.viveiro.equipeCheia); } else { s.viveiro[cx][p.i] = null; s.equipe.push(c); som('ui-ok'); } }
      else if (op === 'Depositar') {
        const vaga = s.viveiro[cx].indexOf(null);
        if (vaga < 0) { som('ui-erro'); await informar(T.viveiro.caixaCheia); }
        else if (!equipeValida(s.equipe.filter((x) => x !== c))) { som('ui-erro'); await informar(T.viveiro.ultima); }
        else { s.equipe.splice(p.i, 1); s.viveiro[cx][vaga] = c; curarCriatura(c); som('ui-ok'); }
      } else if (op === 'Soltar na natureza') await soltar(p, c);
    } finally { ocupado = false; if (viva) montar(); }
  }
  function mover(dx: number, dy: number) {
    const a = cur.area, i = cur.i;
    if (a === 'topo') { if (dx) trocarCaixa(dx); else if (dy > 0) { cur = { area: 'caixa', i: 2 }; som('ui-mover'); } pintarCursor(); return; }
    const cols = a === 'caixa' ? COLS : 3, lin = a === 'caixa' ? 5 : 2, c = i % cols, l = Math.floor(i / cols);
    let nc = c + dx, nl = l + dy, na: Area = a;
    if (a === 'caixa') { if (nc < 0) { na = 'equipe'; nc = 2; nl = l >= 3 ? 1 : 0; } else if (nc >= COLS) nc = COLS - 1; if (nl < 0) { na = 'topo'; nc = 0; nl = 0; } else if (nl >= lin) nl = lin - 1; }
    else { if (nc >= 3) { na = 'caixa'; nc = 0; nl = 3 + l; } else if (nc < 0) nc = 0; if (nl < 0) nl = 0; else if (nl >= lin) nl = lin - 1; }
    const ni = na === 'topo' ? 0 : nl * (na === 'caixa' ? COLS : 3) + nc;
    if (na !== a || ni !== i) { cur = { area: na, i: ni }; som('ui-mover'); pintarCursor(); }
  }
  const tela: Tela = {
    el,
    entrar() { montar(); },
    sair() { viva = false; },
    voltar() { if (viva && !ocupado) montar(); },
    atualizar(dt) {
      for (let k = anima.length - 1; k >= 0; k--) if (anima[k].passo(dt)) anima.splice(k, 1);
      figInfo?.atualizar(dt); icMao?.atualizar(dt);
      if (ocupado) return;
      if (input.repetiu('dir')) mover(1, 0); else if (input.repetiu('esq')) mover(-1, 0); else if (input.repetiu('baixo')) mover(0, 1); else if (input.repetiu('cima')) mover(0, -1);
      if (input.apertou('select')) { trocarCaixa(1); return; }
      if (input.apertou('a')) { input.consumir('a'); if (cur.area !== 'topo' && (pego || em_(cur))) som('ui-ok'); void acao(); }
      else if (input.apertou('b')) { input.consumir('b'); som('ui-voltar'); if (pego) largarPego(); else fechar(tela); }
    },
  };
  return tela;
}
