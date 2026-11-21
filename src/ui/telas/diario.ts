/**
 * DIÁRIO DE CAMPO — lista das 180 espécies (vista / capturada), medalhas de pesquisador a cada 30 capturadas e a
 * ficha da espécie em 4 páginas: Ficha (texto, altura, peso), Tamanho (comparação com o jogador e pegada),
 * Habitat (minimapa dos dois mapas com os locais onde aparece, derivado das tabelas das zonas) e Evolução.
 * `A` na ficha toca o grito. Args: `{ especie?: number }` abre direto na ficha.
 */
import type { EspecieDef, Evolucao, TipoId } from '../../core/tipos';
import { jogo } from '../../core/estado';
import { input, tocavel } from '../../core/input';
import { bus } from '../../core/events';
import { vista, precarregarModelo } from '../../core/assets';
import { Sprite } from '../../render/sprite';
import { item as itemDef, temItemDef } from '../../data/itens';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, chipTipo, seta, som, CORES_TIPO } from '../kit';
import { Abas } from '../componentes/abas';
import { Lista } from '../componentes/lista';
import { informar } from '../componentes/confirmacao';
import { figura, iconeCriatura, esp, n3, nomeEsp, faixaDica, placaTitulo, pix, caixa, rotulo, TOTAL_DIARIO, estrelaRara, type Icone } from './comum';
/** Pelagem Rara registrada no Diário (flag `rara:<nº>`, marcada ao ver uma rara em batalha: src/data/eventos/captura.ts) */
const temRara = (n: number) => !!jogo.save.flags['rara:' + n];
import { criarMapaDuplo, local } from './mapa-dados';
import { habitatsDe, NOME_MEIO, type PeriodoTabela } from './dados';
import { ESPECIES } from '../../data/criaturas';
import { caber } from './mochila';
import { T } from '../../data/textos-ui';

const CUIA = ['........', '..kkkk..', '.kooook.', 'koollook', 'kooooook', 'kddddddk', '.kddddk.', '..kkkk..'];
const OLHO = ['........', '........', '..kkkk..', '.kwkkwk.', 'kwwkkwwk', '.kwkkwk.', '..kkkk..', '........'];
const MEDALHA = ['..rr.rr..', '..rr.rr..', '...rrr...', '..kkkkk..', '.kmmmmmk.', 'kmmlmmmdk', 'kmlmmmmdk', 'kmmmmmddk', '.kmmmddk.', '..kkkkk..'];
const COR_MEDALHA: [string, string, string][] = [['#8fd45a', '#d9f07a', '#4fa346'], ['#c98f4e', '#e8c07a', '#9c6434'], ['#c4c6d4', '#fff8e7', '#8a8aa0'], ['#6fc7e8', '#c8f0f4', '#2f86c4'], ['#f9c22b', '#fff07a', '#f58a4b'], ['#e58ad0', '#f7c4e0', '#9a5fc4']];
const PEGADAS: Record<string, string[]> = {
  pata: ['.k..k..k.', '.k..k..k.', '.........', '..kkkkk..', '.kkkkkkk.', '.kkkkkkk.', '..kkkkk..'],
  ave: ['....k....', '.k..k..k.', '..k.k.k..', '...kkk...', '....k....', '....k....', '....k....'],
  agua: ['.........', '..kk...kk', '.k..k.k..', 'k....k...', '..kk...kk', '.k..k.k..', 'k....k...'],
  inseto: ['.k.....k.', '...k.k...', '.k.....k.', '...k.k...', '.k.....k.', '...k.k...', '.........'],
  casco: ['.........', '.kkk.kkk.', 'kkkk.kkkk', 'kkkk.kkkk', 'kkkk.kkkk', '.kkk.kkk.', '.........'],
};
const pegadaDe = (t: TipoId): keyof typeof PEGADAS => (t === 'vento' ? 'ave' : t === 'rio' || t === 'geada' ? 'agua' : t === 'inseto' || t === 'veneno' ? 'inseto' : t === 'terra' || t === 'pedra' || t === 'ferro' ? 'casco' : 'pata');
const NOME_PER: Record<PeriodoTabela, string> = { manha: 'manhã', dia: 'dia', noite: 'noite' };
const num1 = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');
function condEvolucao(ev: Evolucao): string {
  const p: string[] = [];
  if (ev.nivel) p.push(`Nv ${ev.nivel}`);
  if (ev.item) p.push(temItemDef(ev.item) ? itemDef(ev.item).nome : ev.item);
  if (ev.amizade) p.push('amizade');
  if (ev.periodo) p.push(`de ${NOME_PER[ev.periodo === 'tarde' ? 'dia' : ev.periodo]}`);
  if (ev.sexo) p.push(ev.sexo === 'F' ? '♀' : '♂');
  return p.join(', ') || 'evento';
}
/** família evolutiva em ordem: [espécie, estágio, condição para chegar nela] */
function familia(num: number): { n: number; estagio: number; como: string }[] {
  let raiz = num;
  for (let g = 0; g < 4; g++) { const pai = ESPECIES.find((e) => e.evolui?.some((v) => v.para === raiz)); if (!pai) break; raiz = pai.num; }
  const r: { n: number; estagio: number; como: string }[] = [];
  const andar = (n: number, estagio: number, como: string) => { if (r.some((x) => x.n === n) || r.length >= 8) return; r.push({ n, estagio, como }); for (const v of esp(n)?.evolui ?? []) andar(v.para, estagio + 1, condEvolucao(v)); };
  andar(raiz, 0, '');
  return r;
}

export function criarDiario(args: { especie?: number } = {}): Tela {
  const d = jogo.save.diario;
  const viu = (n: number) => d.visto.includes(n), tem = (n: number) => d.capturado.includes(n);
  // Visitantes (spec 6.5): página extra que só aparece depois do primeiro encontro; não contam no total nem nas medalhas
  const VIS = [181, 182].filter((n) => esp(n) && viu(n));
  const nCap = d.capturado.filter((n) => n <= TOTAL_DIARIO).length, nVis = d.visto.filter((n) => n <= TOTAL_DIARIO).length;
  let pagina = args.especie && args.especie > TOTAL_DIARIO && VIS.includes(args.especie) ? 1 : 0;
  const conjunto = () => (pagina ? VIS : Array.from({ length: TOTAL_DIARIO }, (_, i) => i + 1));
  const numDe = (i: number) => conjunto()[i] ?? 1, idxDe = (n: number) => Math.max(0, conjunto().indexOf(n));
  const el = elTela('ui', 'tela-diario', 'fundo-papel-trama');
  const dica = faixaDica(el);
  /* ---------------- lista ---------------- */
  const cLista = caixa('', 320, 164); el.append(em(cLista, 0, 0));
  const abasPag = VIS.length ? new Abas({ rotulos: [T.diario.abaDiario, T.diario.abaVisitantes], x: 2, y: 1, largura: 78, inicial: pagina, aoTrocar: (i) => trocarPagina(i) }) : null;
  if (abasPag) cLista.append(abasPag.el); else placaTitulo(cLista, 'DIÁRIO DE CAMPO', 2, 1, 158);
  const painel = moldura('madeira', 158, 148, 2, 17); cLista.append(painel);
  const marca = (n: number) => (tem(n) ? pix(CUIA, { k: '#1a1423', o: '#c98f4e', l: '#f6e6b8', d: '#9c6434' }) : viu(n) ? pix(OLHO, { k: '#1a1423', w: '#fff8e7' }) : undefined);
  const itens = Array.from({ length: TOTAL_DIARIO }, (_, i) => { const n = i + 1, m = marca(n); const ic = caixa('', 12, 12); if (m) ic.append(em(m, 2, 3)); return { rotulo: `${n3(n)} ${viu(n) ? nomeEsp(n) : '?????'}`, icone: ic, cor: viu(n) ? undefined : ('marrom' as const) }; });
  const itensVis = VIS.map((n) => { const m = marca(n), ic = caixa('', 12, 12); if (m) ic.append(em(m, 2, 3)); return { rotulo: `${n3(n)} ${nomeEsp(n)}`, icone: ic }; });
  const lista = new Lista({ itens: pagina ? itensVis : itens, moldura: null, largura: 142, visiveis: 11, circular: true, inicial: idxDe(args.especie ?? 1), aoMover: () => pintarLado(), aoEscolher: (i) => abrirFicha(numDe(i)), aoCancelar: () => fechar(tela) });
  function trocarPagina(i: number) { pagina = i; lista.definirItens(i ? itensVis : itens, 0); pintarLado(); dica(dicaDaLista()); }
  const dicaDaLista = () => (pagina ? T.diario.dicaPaginaVis : VIS.length ? T.diario.dicaListaVis : T.diario.dicaLista);
  painel.append(em(lista.el, 8, 7));
  const lado = moldura('tinta', 156, 148, 162, 17); cLista.append(lado);
  const resumo = moldura('placa', 156, 15, 162, 1); cLista.append(resumo);
  resumo.append(em(texto(`Vistas {c:amarelo}${nVis}{/c}  Capturadas {c:amarelo}${nCap}{/c}`, { cor: 'creme' }), 6, 4));
  const ladoDyn = caixa('', 148, 106); lado.append(em(ladoDyn, 4, 4));
  let figLado: Icone | null = null;
  const nMedalhas = Math.min(6, Math.floor(nCap / 30));
  const linhaM = caixa('', 148, 24); lado.append(em(linhaM, 4, 120));
  linhaM.append(em(texto('MEDALHAS DE PESQUISADOR', { cor: 'cinza' }), 2, 0));
  for (let i = 0; i < 6; i++) { const [m, l, dd] = COR_MEDALHA[i]; const md = pix(MEDALHA, i < nMedalhas ? { k: '#1a1423', m, l, d: dd, r: '#e0483c' } : { k: '#1a1423', m: '#4a4a5e', l: '#4a4a5e', d: '#3b2a35', r: '#3b2a35' }); linhaM.append(em(md, 6 + i * 23, 12)); }
  tocavel(linhaM, () => void medalhas());
  function pintarLado() {
    const n = numDe(lista.indice), e = esp(n);
    ladoDyn.replaceChildren();
    figLado = figura(n, 80, 76, { silhueta: viu(n) && !tem(n), misterio: !viu(n) }); ladoDyn.append(em(figLado.el, 34, 0));
    // as vizinhas da lista (já vistas) começam a baixar antes de o cursor chegar nelas (rede lenta / pacotes do itch)
    const c = conjunto(), k = c.length;
    for (const d of [1, -1, 2, -2, 3, -3]) { const v = c[(lista.indice + d + k) % k]; const ev = v !== undefined && viu(v) ? esp(v) : undefined; if (ev) void precarregarModelo(ev.id, ['frente']); }
    if (temRara(n)) ladoDyn.append(em(estrelaRara(2), 4, 2)); // Pelagem Rara registrada
    rotulo(ladoDyn, viu(n) ? `Nº ${n3(n)} ${nomeEsp(n)}` : `Nº ${n3(n)} ?????`, 0, 80, 'amarelo', { largura: 148, alinhar: 'centro', sombra: true });
    rotulo(ladoDyn, tem(n) ? (e?.habitat ?? '') : viu(n) ? 'Só avistada' : 'Ainda não avistada', 0, 92, 'creme', { largura: 148, alinhar: 'centro' });
    if (n > TOTAL_DIARIO) rotulo(ladoDyn, T.diario.visitanteCurto, 0, 104, 'cinza', { largura: 148, alinhar: 'centro' });
  }
  let ocupado = false;
  async function medalhas() {
    if (ocupado) return; ocupado = true;
    const prox = nMedalhas < 6 ? `Faltam ${(nMedalhas + 1) * 30 - nCap} capturas para a ${T.diario.medalhas[nMedalhas]}.` : 'Diário completo. A Profª Ipê chorou de alegria!';
    await informar(`${nMedalhas ? T.diario.medalhas.slice(0, nMedalhas).join(', ') + '. ' : 'Nenhuma medalha ainda. '}${prox}`);
    ocupado = false;
  }

  /* ---------------- ficha ---------------- */
  const cFicha = caixa('', 320, 164); cFicha.style.display = 'none'; el.append(em(cFicha, 0, 0));
  const esq = moldura('tinta', 108, 148, 2, 17), dir = moldura('madeira', 206, 148, 112, 17), pos = moldura('placa', 108, 15, 2, 1); cFicha.append(esq, dir, pos);
  const posT = texto('', { cor: 'amarelo', sombra: true }); pos.append(em(posT, 30, 4));
  const sC = em(seta('cima'), 6, 5), sB = em(seta('baixo'), 95, 5); pos.append(sC, sB);
  tocavel(sC, () => trocar(-1)); tocavel(sB, () => trocar(1));
  const abas = new Abas({ rotulos: ['FICHA', 'PORTE', 'HABITAT', 'EVOL.'], x: 113, y: 2, largura: 50, aoTrocar: () => pintarFicha() }); cFicha.append(abas.el);
  const corpo = caixa('', 190, 132); dir.append(em(corpo, 9, 8));
  const esqDyn = caixa('', 100, 140); esq.append(em(esqDyn, 4, 4));
  let verRara = true;
  let naFicha = false, atual = 1, figF: Icone | null = null, anim: Icone[] = [], pisca: HTMLElement[] = [], tPisca = 0, jog: Sprite | null = null;

  function abrirFicha(n: number) {
    if (!viu(n)) { som('ui-erro'); dica(T.diario.naoVisto); return; }
    atual = n; naFicha = true; cLista.style.display = 'none'; cFicha.style.display = ''; pintarFicha(); gritar(0.5);
  }
  function fecharFicha() { naFicha = false; cFicha.style.display = 'none'; cLista.style.display = ''; lista.selecionar(idxDe(atual), true); pintarLado(); dica(dicaDaLista()); if (args.especie) fechar(tela); }
  function trocar(dn: number) { const c = conjunto(), k = c.length; let i = idxDe(atual); for (let j = 0; j < k; j++) { i = (i + dn + k) % k; if (viu(c[i])) break; } const n = c[i]; if (n !== atual) { atual = n; som('ui-mover'); pintarFicha(); } }
  function gritar(vol = 0.9) { bus.emit('grito', { especie: atual, vol }); }
  function pintarFicha() {
    const e = esp(atual), cap = tem(atual);
    esqDyn.replaceChildren(); corpo.replaceChildren(); anim = []; pisca = []; jog = null;
    figF = figura(atual, 96, 92, { silhueta: !cap, rara: verRara && temRara(atual) }); esqDyn.append(em(figF.el, 2, 0));
    // Pelagem Rara registrada (vista ou capturada): a estrela alterna a figura entre a cor comum e a rara
    if (temRara(atual)) { const est = em(estrelaRara(2), 2, 2); est.style.opacity = verRara ? '1' : '0.55'; esqDyn.append(est); tocavel(est, () => { verRara = !verRara; som('ui-ok'); pintarFicha(); }); }
    rotulo(esqDyn, nomeEsp(atual), 0, 92, 'creme', { largura: 100, alinhar: 'centro' });
    rotulo(esqDyn, cap ? '{c:verde}Capturada{/c}' : '{c:cinza}Avistada{/c}', 0, 102, 'creme', { largura: 100, alinhar: 'centro' });
    if (e) e.tipos.forEach((t, i) => esqDyn.append(em(chipTipo(t, 56), 24, e.tipos.length === 1 ? 120 : 114 + i * 13)));
    escrever(posT, `Nº ${n3(atual)}`); posT.style.left = Math.floor((108 - parseInt(posT.style.width)) / 2) + 'px';
    if (!e) { rotulo(corpo, T.diario.soVisto, 2, 4, 'tinta', { largura: 186 }); return; }
    [pgFicha, pgPorte, pgHabitat, pgEvolucao][abas.indice](e, cap);
    dica(T.diario.dicaFicha);
  }
  function pgFicha(e: EspecieDef, cap: boolean) {
    rotulo(corpo, cap ? e.habitat : 'Habitat: ???', 2, 2, 'marrom', { largura: 186 });
    rotulo(corpo, `Altura: ${cap ? num1(e.altura) + ' m' : '???'}`, 2, 24); rotulo(corpo, `Peso: ${cap ? num1(e.peso) + ' kg' : '???'}`, 100, 24);
    corpo.append(em(caixa('linha-div', 186, 1), 2, 36));
    rotulo(corpo, cap ? e.diario : T.diario.soVisto, 2, 41, 'chumbo', { largura: 186 });
    const bt = moldura('botao-foco', 98, 14); bt.append(em(texto('A: Ouvir o grito ♪', { cor: 'tinta' }), 6, 3)); corpo.append(em(bt, 68, 117)); tocavel(bt, () => gritar());
  }
  function pgPorte(e: EspecieDef, cap: boolean) {
    if (!cap) { rotulo(corpo, T.diario.soVisto, 2, 4, 'tinta', { largura: 186 }); return; }
    const ALT_JOG = 1.5, chao = 104, maxPx = 84, esc = maxPx / Math.max(ALT_JOG, e.altura);
    const hJ = Math.max(2, Math.round(ALT_JOG * esc)), hC = Math.max(2, Math.round(e.altura * esc));
    corpo.append(em(caixa('linha-div', 186, 1), 2, chao));
    const regua = (x: number, h: number, cor: string, leg: string, val: string) => {
      const r = caixa('', 5, h); r.style.background = `repeating-linear-gradient(to top, ${cor} 0 1px, transparent 1px 4px), linear-gradient(90deg, ${cor} 0 2px, transparent 2px)`; corpo.append(em(r, x, chao - h));
      rotulo(corpo, leg, x - 28, chao + 4, 'tinta', { largura: 80, alinhar: 'centro' }); rotulo(corpo, val, x - 28, chao + 14, 'marrom', { largura: 80, alinhar: 'centro' });
    };
    regua(38, hJ, '#2f86c4', 'Você', '1,5 m'); regua(128, hC, CORES_TIPO[e.tipos[0]][1], e.nome, `${num1(e.altura)} m`);
    const av = jogo.save.jogador.avatar, m = vista(av, 'mapa');
    if (m) { jog = new Sprite(av, 'mapa', corpo); jog.x = m.px + 8; jog.y = m.py + chao - m.ch; jog.tocar('idle-s'); jog.desenhar(); }
    const ic = iconeCriatura(e.num); corpo.append(em(ic.el, 98, chao - 24)); ic.animar(true); anim.push(ic);
    rotulo(corpo, 'Pegada', 150, 2, 'marrom'); corpo.append(em(pix(PEGADAS[pegadaDe(e.tipos[0])], { k: '#6b4226' }, 2), 156, 14));
    rotulo(corpo, `${num1(e.peso)} kg`, 140, 34, 'chumbo', { largura: 46, alinhar: 'centro' });
  }
  function pgHabitat(e: EspecieDef) {
    if (e.num > TOTAL_DIARIO) { // Visitante: onde encontrar (missão) e, no Borealce, a nota da Drª Solveig
      rotulo(corpo, 'ONDE ENCONTRAR', 2, 2, 'marrom');
      rotulo(corpo, T.diario.ondeVisitante[e.num] ?? T.diario.semHabitat, 2, 14, 'chumbo', { largura: 186 });
      if (e.num === 182 && (jogo.save.flags['borealce-nota'] || tem(182))) rotulo(corpo, T.diario.notaSolveig, 2, 96, 'tinta', { largura: 186 });
      return;
    }
    const hs = habitatsDe(e.num);
    const mapa = criarMapaDuplo(2, 6, false); corpo.append(em(mapa.el, 20, 0));
    const borda = caixa('', mapa.w + 2, mapa.h + 2); borda.style.boxShadow = 'inset 0 0 0 1px #6b4226'; borda.style.pointerEvents = 'none'; corpo.append(em(borda, 19, -1));
    for (const h of hs) { const [x, y] = mapa.pos(h.local); const p = caixa('', 4, 4); p.style.background = '#e0483c'; p.style.boxShadow = '0 0 0 1px #fff8e7'; mapa.el.append(em(p, x - 2, y - 2)); pisca.push(p); }
    rotulo(corpo, 'Costa do Sol', 2, 63, 'marrom'); rotulo(corpo, 'Sertão das Névoas', 2, 63, 'marrom', { largura: 186, alinhar: 'dir' });
    if (!hs.length) { rotulo(corpo, T.diario.semHabitat, 2, 78, 'chumbo', { largura: 186 }); return; }
    hs.slice(0, 5).forEach((h, i) => {
      const per = h.periodos.length >= 3 ? '' : `, ${h.periodos.map((p) => NOME_PER[p]).join('/')}`;
      rotulo(corpo, '•', 2, 76 + i * 10, 'vermelho'); rotulo(corpo, caber(`${local(h.local)?.nome ?? h.local}: ${NOME_MEIO[h.metodos[0]]}${per}`, 176), 10, 76 + i * 10, 'tinta');
    });
    if (hs.length > 5) rotulo(corpo, `e mais ${hs.length - 5} ${hs.length - 5 === 1 ? 'lugar' : 'lugares'}`, 2, 126, 'chumbo');
  }
  function pgEvolucao(e: EspecieDef) {
    const fam = familia(e.num);
    if (fam.length < 2) { const ic = iconeCriatura(e.num); corpo.append(em(ic.el, 2, 2)); anim.push(ic); rotulo(corpo, `${e.nome} não evolui.`, 32, 10); return; }
    const passo = Math.min(26, Math.floor(130 / fam.length));
    fam.forEach((f, i) => {
      const y = i * passo, x = Math.min(2, f.estagio) * 14, conhecida = viu(f.n);
      const ic = conhecida ? iconeCriatura(f.n) : null;
      if (ic) { corpo.append(em(ic.el, x, y + Math.floor((passo - 24) / 2))); if (!tem(f.n)) ic.el.classList.add('silhueta'); ic.animar(f.n === e.num); anim.push(ic); }
      else rotulo(corpo, '?', x + 9, y + Math.floor(passo / 2) - 4, 'cinza');
      rotulo(corpo, conhecida ? nomeEsp(f.n) : '?????', x + 28, y + Math.floor(passo / 2) - 9, f.n === e.num ? 'vermelho' : 'tinta');
      rotulo(corpo, f.estagio === 0 ? 'forma inicial' : `← ${f.como}`, x + 28, y + Math.floor(passo / 2) + 1, 'chumbo');
    });
  }

  const tela: Tela = {
    el,
    entrar() { pintarLado(); dica(dicaDaLista()); if (args.especie && viu(args.especie)) abrirFicha(args.especie); },
    atualizar(dt) {
      if (ocupado) return;
      if (!naFicha) {
        figLado?.atualizar(dt);
        if (abasPag && input.apertou('menu')) { input.consumir('menu'); abasPag.ir(1 - pagina); return; }
        if (input.apertou('select')) { void medalhas(); return; }
        if (input.repetiu('dir')) { lista.selecionar(Math.min(lista.itens.length - 1, lista.indice + 10)); return; }
        if (input.repetiu('esq')) { lista.selecionar(Math.max(0, lista.indice - 10)); return; }
        lista.atualizar(dt); return;
      }
      figF?.atualizar(dt); for (const a of anim) a.atualizar(dt);
      if (jog) { jog.atualizar(dt); jog.desenhar(); }
      tPisca += dt; const v = Math.floor(tPisca * 3) % 2 === 0; for (const p of pisca) p.style.visibility = v ? '' : 'hidden';
      if (abas.atualizar(dt)) return;
      if (input.repetiu('baixo')) trocar(1); else if (input.repetiu('cima')) trocar(-1);
      else if (input.apertou('a')) { input.consumir('a'); gritar(); }
      else if (input.apertou('b')) { input.consumir('b'); som('ui-voltar'); fecharFicha(); }
    },
  };
  return tela;
}
