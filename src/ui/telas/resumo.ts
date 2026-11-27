/**
 * RESUMO da criatura — 3 páginas (Info, Atributos, Golpes). Cima/baixo troca de criatura (nas páginas 1 e 2),
 * esquerda/direita troca de página. Na Info, A faz cafuné (minianimação; rende amizade a cada 10 minutos de jogo);
 * nos Golpes, A pega um golpe e A de novo troca a ordem. Devolve o índice da criatura em que parou.
 */
import type { CriaturaInst, Stat } from '../../core/tipos';
import { STATS } from '../../core/tipos';
import { jogo } from '../../core/estado';
import { input, tocavel } from '../../core/input';
import { bus } from '../../core/events';
import { golpe, temGolpe } from '../../data/golpes';
import { item as itemDef, temItemDef } from '../../data/itens';
import { personalidade } from '../../data/personalidades';
import { atributos, expParaNivel, amizadePor } from '../../battle/index';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, barra, chipTipo, iconeTipo, iconeStatus, seta, som, NOME_TIPO } from '../kit';
import { Abas } from '../componentes/abas';
import { Lista } from '../componentes/lista';
import { figura, nomeCri, sexoTxt, esp, n3, faixaDica, pix, caixa, rotulo, estrelaRara, type Icone } from './comum';
import { nomeLocal } from './mapa-dados';
import { T } from '../../data/textos-ui';
import { t, tr } from '../../i18n';

export interface ArgsResumo { lista?: CriaturaInst[]; indice?: number }
const NOME_STAT: Record<Stat, string> = { vida: 'Vida', atq: 'Ataque', def: 'Defesa', atqEsp: 'Atq. Esp.', defEsp: 'Def. Esp.', vel: 'Velocidade' };
const CAT = { fisico: 'Físico', especial: 'Especial', status: 'Status' };
const MAO = ['....kkkk....', '..kkppppkk..', '.kppppppppk.', 'kppkppkppkpk', 'kppkppkppkpk', 'kppkppkppkpk', '.kkkkkkkkkk.'];
const coracoes = (a: number) => { const n = Math.min(5, Math.floor(a / 51) + (a >= 255 ? 0 : 0)); return `{c:vermelho}${'♥'.repeat(n)}{/c}{c:cinza}${'♥'.repeat(5 - n)}{/c}`; };
const fraseAmizade = (a: number) => T.resumo.amizade[a >= 220 ? 4 : a >= 160 ? 3 : a >= 100 ? 2 : a >= 50 ? 1 : 0];

export function criarResumo(args: ArgsResumo = {}): Tela {
  const lista = args.lista?.length ? args.lista : jogo.save.equipe;
  let ind = Math.max(0, Math.min(lista.length - 1, args.indice ?? 0));
  const el = elTela('ui', 'tela-resumo', 'fundo-trama');
  const esq = moldura('tinta', 108, 148, 2, 17), dir = moldura('madeira', 206, 148, 112, 17); el.append(esq, dir);
  const pos = moldura('placa', 108, 15, 2, 1); el.append(pos);
  const posT = texto('', { cor: 'amarelo', sombra: true }); pos.append(em(posT, 22, 4));
  const sC = em(seta('cima'), 6, 5), sB = em(seta('baixo'), 95, 5); pos.append(sC, sB);
  tocavel(sC, () => trocarCriatura(-1)); tocavel(sB, () => trocarCriatura(1));
  const abas = new Abas({ rotulos: ['INFO', 'ATRIBUTOS', 'GOLPES'], x: 114, y: 2, largura: 67, aoTrocar: () => pintar() }); el.append(abas.el);
  const dica = faixaDica(el);
  const corpo = caixa('', 190, 132); dir.append(em(corpo, 9, 8));
  let fig: Icone | null = null, golpes: Lista | null = null, pego = -1, cafune = 0, recado = '';
  const maoEl = pix(MAO, { k: '#1a1423', p: '#f6c9a0' }); maoEl.style.display = 'none'; maoEl.style.zIndex = '6';
  const mimos: HTMLElement[] = [];
  const c = () => lista[ind];

  function trocarCriatura(d: number) { if (lista.length < 2 || cafune > 0) return; ind = (ind + d + lista.length) % lista.length; pego = -1; som('ui-mover'); pintar(); }
  function pintarEsq() {
    const k = c(), e = esp(k.especie);
    [...esq.querySelectorAll('.dyn')].forEach((x) => x.remove());
    const d = caixa('dyn', 100, 140); esq.append(em(d, 4, 4));
    fig = figura(k.especie, 96, 92, { misterio: !!k.ovo, rara: !!k.rara }); d.append(em(fig.el, 2, 0), maoEl);
    if (k.rara && !k.ovo) d.append(em(estrelaRara(2), 4, 4), em(estrelaRara(), 13, 104)); // Pelagem Rara: no retrato e ao lado do nível
    rotulo(d, `${nomeCri(k)} ${sexoTxt(k)}`, 0, 92, 'creme', { largura: 100, alinhar: 'centro' });
    rotulo(d, k.ovo ? 'Ovo' : tr('Nv{n}', { n: k.nivel }), 24, 103, 'amarelo');
    if (!k.ovo) { const s = k.vida <= 0 ? 'desmaiado' : k.status; if (s) d.append(em(iconeStatus(s), 62, 102)); }
    if (e && !k.ovo) e.tipos.forEach((t, i) => d.append(em(chipTipo(t, 56), 24, e.tipos.length === 1 ? 120 : 114 + i * 13)));
    escrever(posT, tr('{ind} de {n}', { ind: ind + 1, n: lista.length })); posT.style.left = Math.floor((108 - parseInt(posT.style.width)) / 2) + 'px';
  }
  function paginaInfo() {
    const k = c(), e = esp(k.especie), p = personalidade(k.personalidade);
    if (k.ovo) { rotulo(corpo, T.resumo.ovo, 2, 4, 'tinta', { largura: 186 }); return; }
    rotulo(corpo, `Nº ${n3(k.especie)}  ${e?.nome ?? '???'}`, 2, 2, 'marrom');
    rotulo(corpo, tr('Treinador: {c:azul}{jogador}{/c}', { jogador: k.treinadorOriginal || jogo.save.jogador.nome }), 2, 14);
    rotulo(corpo, p ? tr('Jeito: {jeito}  {c:vermelho}+{mais}{/c} {c:azul}-{menos}{/c}', { jeito: p.nome, mais: NOME_STAT[p.mais], menos: NOME_STAT[p.menos] }) : 'Jeito: Sereno', 2, 26);
    rotulo(corpo, tr(k.nivelCaptura ? 'Encontro: {local}, Nv{nivel}' : 'Encontro: {local}', { local: nomeLocal(k.localCaptura), nivel: k.nivelCaptura }), 2, 38);
    rotulo(corpo, k.item && temItemDef(k.item) ? tr('Item: {c:agua}{item}{/c}', { item: itemDef(k.item).nome }) : 'Item: nenhum', 2, 50);
    const prox = k.nivel >= 100 || !e ? 0 : expParaNivel(e.crescimento, k.nivel + 1) - k.exp;
    rotulo(corpo, tr('Exp: {exp}', { exp: k.exp }), 2, 62); rotulo(corpo, k.nivel >= 100 ? 'Nível máximo' : tr('Próx. nível: {prox}', { prox }), 96, 62);
    if (e && k.nivel < 100) { const b = barra('exp', 186); const a0 = expParaNivel(e.crescimento, k.nivel), a1 = expParaNivel(e.crescimento, k.nivel + 1); b.definir(Math.max(0, Math.min(1, (k.exp - a0) / Math.max(1, a1 - a0)))); corpo.append(em(b.el, 2, 73)); }
    rotulo(corpo, tr('Amizade: {amizade}', { amizade: coracoes(k.amizade) }), 2, 82);
    rotulo(corpo, fraseAmizade(k.amizade), 2, 94, 'chumbo', { largura: 186 });
    const bt = moldura('botao-foco', 94, 14); bt.append(em(texto('A: Fazer cafuné', { cor: 'tinta' }), 6, 3)); corpo.append(em(bt, 72, 116)); tocavel(bt, fazerCafune);
  }
  function paginaAtributos() {
    const k = c(), e = esp(k.especie);
    if (k.ovo || !e) { rotulo(corpo, T.resumo.ovo, 2, 4, 'tinta', { largura: 186 }); return; }
    const a = atributos(k), p = personalidade(k.personalidade);
    rotulo(corpo, 'ATRIBUTO', 2, 2, 'marrom'); rotulo(corpo, 'VALOR', 74, 2, 'marrom'); rotulo(corpo, 'TREINO', 152, 2, 'marrom');
    STATS.forEach((s, i) => {
      const y = 15 + i * 15, cor = p?.mais === s ? 'vermelho' : p?.menos === s ? 'azul' : 'tinta';
      rotulo(corpo, NOME_STAT[s], 2, y, cor);
      rotulo(corpo, s === 'vida' ? `${k.vida}/${a.vida}` : String(a[s]), 60, y, 'tinta', { largura: 38, alinhar: 'dir' });
      const trilho = caixa('trilho-stat', 46, 5), ench = caixa('ench-stat', Math.max(1, Math.min(44, Math.round((e.base[s] / 160) * 44))), 3);
      trilho.append(em(ench, 1, 1)); corpo.append(em(trilho, 102, y + 1));
      rotulo(corpo, String(k.esf[s] ?? 0), 152, y, 'chumbo', { largura: 34, alinhar: 'dir' });
    });
    rotulo(corpo, T.resumo.legendaAtributos, 2, 108, 'chumbo', { largura: 186 });
  }
  let detalhe: HTMLElement | null = null;
  function paginaGolpes() {
    const k = c();
    if (k.ovo) { rotulo(corpo, T.resumo.ovo, 2, 4, 'tinta', { largura: 186 }); return; }
    const itens = () => k.golpes.map((g, i) => ({ rotulo: (i === pego ? '▶ ' : '') + (temGolpe(g.id) ? t(golpe(g.id).nome) : g.id), valor: tr('PG {pg}/{pgMax}', { pg: g.pg, pgMax: g.pgMax }), icone: iconeTipo(temGolpe(g.id) ? golpe(g.id).tipo : 'comum'), cor: i === pego ? ('vermelho' as const) : undefined }));
    golpes = new Lista({ itens: itens(), moldura: null, largura: 190, visiveis: 4, tamanho: 8, aoMover: pintarDetalhe, aoCancelar: () => { if (pego >= 0) { pego = -1; golpes!.definirItens(itens()); pintarDica(); } else sair(); },
      aoEscolher: (i) => {
        if (k.golpes.length < 2) return;
        if (pego < 0) pego = i; else { if (pego !== i) [k.golpes[pego], k.golpes[i]] = [k.golpes[i], k.golpes[pego]]; pego = -1; }
        golpes!.definirItens(itens()); pintarDetalhe(); pintarDica();
      } });
    corpo.append(em(golpes.el, 0, 0));
    const linha = caixa('linha-div', 186, 1); corpo.append(em(linha, 2, 54));
    detalhe = caixa('', 186, 74); corpo.append(em(detalhe, 2, 58)); pintarDetalhe();
  }
  function pintarDetalhe() {
    if (!detalhe || !golpes) return; detalhe.replaceChildren();
    const s = c().golpes[golpes.indice]; if (!s || !temGolpe(s.id)) return;
    const g = golpe(s.id);
    detalhe.append(em(chipTipo(g.tipo, 52), 0, 0));
    rotulo(detalhe, CAT[g.cat], 58, 2, 'marrom');
    rotulo(detalhe, tr('Poder {poder}   Precisão {precisao}', { poder: g.poder || '—', precisao: g.precisao || '—' }), 0, 16);
    rotulo(detalhe, g.desc, 0, 28, 'chumbo', { largura: 186 });
  }
  function pintarDica() { dica(abas.indice === 0 ? T.resumo.dicaInfo : abas.indice === 1 ? T.resumo.dicaAtributos : pego >= 0 ? T.resumo.dicaTroca : T.resumo.dicaGolpes); }
  function pintar() {
    pintarEsq(); corpo.replaceChildren(); golpes = null; detalhe = null;
    [paginaInfo, paginaAtributos, paginaGolpes][abas.indice]();
    pintarDica();
  }
  function fazerCafune() {
    const k = c(); if (cafune > 0 || k.ovo || abas.indice !== 0) return;
    cafune = 1.6; som('ui-ok'); bus.emit('grito', { especie: k.especie, vol: 0.6 });
    const chave = 'cafune:' + k.uid, ultimo = Number(jogo.save.flags[chave] ?? -9999);
    const rende = k.vida > 0 && jogo.save.tempoJogo - ultimo >= 600;
    if (rende) { amizadePor(k, 'cafune'); jogo.save.flags[chave] = jogo.save.tempoJogo; }
    recado = tr('{nome} {acao}', { nome: nomeCri(k), acao: k.vida <= 0 ? T.resumo.cafuneDesmaiada : rende ? T.resumo.cafuneBom : T.resumo.cafuneRepetido }); dica(recado);
    for (let i = 0; i < 3; i++) { const h = texto('♥', { cor: 'vermelho', sombra: true }); h.dataset.t = String(-i * 0.35); h.style.display = 'none'; h.style.zIndex = '7'; maoEl.parentElement?.append(em(h, 30 + i * 18, 30)); mimos.push(h); }
  }
  function sair() { fechar(tela, ind); }
  const tela: Tela = {
    el,
    entrar() { pintar(); },
    atualizar(dt) {
      fig?.atualizar(dt);
      if (cafune > 0) {
        cafune -= dt; const f = 1.6 - cafune;
        maoEl.style.display = ''; em(maoEl, 40 + Math.round(Math.sin(f * 9) * 14), 14 + (Math.floor(f * 8) % 2));
        for (const h of mimos) { const t = Number(h.dataset.t) + dt; h.dataset.t = String(t); if (t > 0) { h.style.display = ''; h.style.top = 30 - Math.round(t * 22) + 'px'; } }
        if (cafune <= 0) { maoEl.style.display = 'none'; mimos.splice(0).forEach((h) => h.remove()); pintar(); dica(recado); }
        return;
      }
      if (input.apertou('select')) { trocarCriatura(1); return; }
      if (abas.atualizar(dt)) { pego = -1; return; }
      if (abas.indice === 2 && golpes) { golpes.atualizar(dt); return; }
      if (input.repetiu('baixo')) trocarCriatura(1); else if (input.repetiu('cima')) trocarCriatura(-1);
      if (input.apertou('a') && abas.indice === 0) { input.consumir('a'); fazerCafune(); }
      else if (input.apertou('b')) { input.consumir('b'); som('ui-voltar'); sair(); }
    },
  };
  return tela;
}
