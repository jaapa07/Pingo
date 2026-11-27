/**
 * MAPA-MÚNDI — as duas regiões lado a lado (A Costa do Sol, B Sertão das Névoas) com os locais das tabelas 4.1/4.2,
 * a posição atual, a linha do Trem Serra-Sol (A4 ↔ B1) e a rota do Saveiro (A5 ↔ B9), com os veículos andando
 * quando liberados. `{ modo: 'voo' }`: só as cidades já visitadas podem ser escolhidas; devolve o id da zona
 * (ex.: 'A4') ou undefined se desistir.
 */
import { jogo, qtdItem } from '../../core/estado';
import { input, tocavel } from '../../core/input';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { em } from '../fonte';
import { moldura, som, insignia, NOME_INSIGNIA } from '../kit';
import { confirmar, informar } from '../componentes/confirmacao';
import { faixaDica, caixa, rotulo, pix } from './comum';
import { criarMapaDuplo, LOCAIS, local, localAtual, visitou, NOME_TIPO_LOCAL, type Local } from './mapa-dados';
import { caber } from './mochila';
import { T } from '../../data/textos-ui';
import { t, tr } from '../../i18n';

const TREM = ['.kk......', 'kffk.kkkk', 'kffkkrrrk', 'krrrrrrrk', 'kkkkkkkkk', '.o..o..o.'];
const BARCO = ['...k.....', '...kw....', '...kww...', '...kwww..', 'kkkkkkkkk', '.kmmmmmk.', '..kkkkk..'];
const ROSTO = ['.kkkkk.', 'kcccccK', 'kcpppck', 'kpkpkpk', 'kpppppk', '.kpppk.', '..kkk..'];
export interface ArgsMapa { modo?: 'ver' | 'voo' }

export function criarMapaMundi(args: ArgsMapa = {}): Tela {
  const voo = args.modo === 'voo';
  const el = elTela('ui', 'tela-mapa', 'fundo-roxo');
  const mapa = criarMapaDuplo(4, 16); el.append(em(mapa.el, 8, 13));
  const quadro = caixa('', mapa.w + 4, mapa.h + 4); quadro.style.boxShadow = 'inset 0 0 0 2px #c98f4e, 0 0 0 1px #1a1423'; quadro.style.pointerEvents = 'none'; el.append(em(quadro, 6, 11));
  rotulo(el, 'COSTA DO SOL', 8, 2, 'amarelo', { largura: 144, alinhar: 'centro', sombra: true });
  rotulo(el, 'SERTÃO DAS NÉVOAS', 168, 2, 'amarelo', { largura: 144, alinhar: 'centro', sombra: true });
  const info = moldura('tinta', 316, 30, 2, 135); el.append(info);
  const corpo = caixa('', 268, 24); info.append(em(corpo, 24, 3));
  const dica = faixaDica(el);
  const pode = (l: Local) => !voo || (l.tipo === 'cidade' && visitou(l.id));
  const escolhiveis = LOCAIS.filter(pode);
  /* rotas de transporte: trilho (A4 → B1) e travessia (A5 → B9), em trechos retos */
  const temTrem = qtdItem('passe-trem') > 0, temBarco = qtdItem('bilhete-saveiro') > 0;
  function rota(pontos: [number, number][], cor: string, liberada: boolean) {
    for (let i = 0; i + 1 < pontos.length; i++) {
      const [x1, y1] = pontos[i], [x2, y2] = pontos[i + 1], h = y1 === y2;
      const d = caixa('', h ? Math.abs(x2 - x1) + 2 : 2, h ? 2 : Math.abs(y2 - y1) + 2);
      const c = liberada ? cor : '#8a8aa0';
      d.style.background = `repeating-linear-gradient(${h ? '90deg' : '180deg'}, ${c} 0 3px, #1a1423 3px 5px)`; d.style.pointerEvents = 'none';
      mapa.el.append(em(d, Math.min(x1, x2) - 1, Math.min(y1, y2) - 1));
    }
  }
  const pA4 = mapa.pos('A4'), pB1 = mapa.pos('B1'), pA5 = mapa.pos('A5'), pB9 = mapa.pos('B9');
  const trilho: [number, number][] = [pA4, [pA4[0], pA4[1] + 8], [pB1[0], pA4[1] + 8], pB1];
  const fundo = mapa.h - 5, mar: [number, number][] = [pA5, [pA5[0], fundo], [pB9[0], fundo], pB9];
  rota(trilho, '#fff8e7', temTrem); rota(mar, '#6fc7e8', temBarco);
  const veiculos: { el: HTMLElement; pts: [number, number][]; t: number; total: number }[] = [];
  const comprimento = (p: [number, number][]) => p.slice(1).reduce((a, q, i) => a + Math.abs(q[0] - p[i][0]) + Math.abs(q[1] - p[i][1]), 0);
  if (temTrem) { const v = pix(TREM, { k: '#1a1423', f: '#fff07a', r: '#e0483c', o: '#3b2a35' }); v.style.zIndex = '3'; mapa.el.append(v); veiculos.push({ el: v, pts: trilho, t: 0, total: comprimento(trilho) }); }
  if (temBarco) { const v = pix(BARCO, { k: '#1a1423', w: '#fff8e7', m: '#9c6434' }); v.style.zIndex = '3'; mapa.el.append(v); veiculos.push({ el: v, pts: mar, t: 0.5, total: comprimento(mar) }); }
  function naRota(p: [number, number][], d: number): [number, number] {
    for (let i = 0; i + 1 < p.length; i++) { const l = Math.abs(p[i + 1][0] - p[i][0]) + Math.abs(p[i + 1][1] - p[i][1]); if (d <= l || i + 2 === p.length) { const f = l ? Math.min(1, d / l) : 0; return [Math.round(p[i][0] + (p[i + 1][0] - p[i][0]) * f), Math.round(p[i][1] + (p[i + 1][1] - p[i][1]) * f)]; } d -= l; }
    return p[0];
  }
  /* marcadores */
  // alvo de toque de cada marcador: 12 px no mínimo e até 20 px onde os vizinhos deixam (metade da distância ao mais
  // próximo, na métrica do quadrado), sem dois alvos se cobrirem
  const posicoes = LOCAIS.map((l) => mapa.pos(l.id));
  const raio = (i: number) => Math.max(6, Math.min(10, Math.floor(Math.min(99, ...posicoes.filter((_, j) => j !== i).map(([x, y]) => Math.max(Math.abs(x - posicoes[i][0]), Math.abs(y - posicoes[i][1])))) / 2)));
  for (const [n, l] of LOCAIS.entries()) {
    const [x, y] = mapa.pos(l.id), cid = l.tipo === 'cidade', t = cid ? 6 : 4;
    const m = caixa('', t, t); m.style.background = cid ? (visitou(l.id) ? '#e0483c' : '#c4c6d4') : l.id === 'PP' ? '#f9c22b' : '#fff8e7'; m.style.boxShadow = '0 0 0 1px #1a1423'; m.style.zIndex = '2';
    if (voo && !pode(l)) m.style.opacity = '0.45';
    mapa.el.append(em(m, x - t / 2, y - t / 2));
    const ra = raio(n), alvo = caixa('', ra * 2, ra * 2); alvo.style.zIndex = '4'; mapa.el.append(em(alvo, x - ra, y - ra));
    tocavel(alvo, () => { if (!pode(l)) { som('ui-erro'); return; } if (atual === l.id && voo) void confirmarVoo(); else { atual = l.id; som('ui-mover'); pintar(); } });
  }
  const aqui = localAtual();
  const rosto = pix(ROSTO, { k: '#1a1423', K: '#1a1423', c: '#3b2a35', p: '#f6c9a0' }); rosto.style.zIndex = '5';
  if (aqui) { const [x, y] = mapa.pos(aqui); mapa.el.append(em(rosto, x - 3, y - 11)); }
  const sel = moldura('selecao', 14, 14); sel.classList.add('quica'); sel.style.pointerEvents = 'none'; sel.style.zIndex = '6'; mapa.el.append(sel);
  let atual = (aqui && escolhiveis.some((l) => l.id === aqui) ? aqui : escolhiveis[0]?.id) ?? 'A1', ocupado = false, tempo = 0;

  function pintar() {
    const l = local(atual)!; const [x, y] = mapa.pos(atual); em(sel, x - 7, y - 7);
    corpo.replaceChildren();
    rotulo(corpo, l.nome, 0, 1, 'amarelo', { sombra: true });
    rotulo(corpo, [l.ginasio ? tr('Ginásio {nome}', { nome: NOME_INSIGNIA[l.ginasio - 1] }) : t(NOME_TIPO_LOCAL[l.tipo]), t(l.id === aqui ? 'você está aqui' : l.tipo === 'cidade' && !visitou(l.id) ? 'não visitada' : '')].filter(Boolean).join(' · '), 0, 1, 'cinza', { largura: l.ginasio ? 248 : 268, alinhar: 'dir' });
    rotulo(corpo, caber(l.nota, 268), 0, 13, 'creme');
    if (l.ginasio) corpo.append(em(insignia(l.ginasio, jogo.save.insignias.includes(l.ginasio)), 252, -3));
    dica(voo ? T.mapa.dicaVoo : T.mapa.dica);
  }
  function mover(dx: number, dy: number) {
    const [x0, y0] = mapa.pos(atual); let melhor: Local | null = null, nota = 1e9;
    for (const l of escolhiveis) {
      if (l.id === atual) continue; const [x, y] = mapa.pos(l.id);
      const ao = (x - x0) * dx + (y - y0) * dy, lado = Math.abs((x - x0) * dy) + Math.abs((y - y0) * dx);
      if (ao <= 0 || lado > ao * 2.5) continue;
      const n = ao + lado * 2; if (n < nota) { nota = n; melhor = l; }
    }
    if (melhor) { atual = melhor.id; som('ui-mover'); pintar(); }
  }
  function outraRegiao() {
    const l = local(atual)!, alvo = l.mapa === 'A' ? 'B' : 'A', [x0, y0] = mapa.pos(atual);
    const c = escolhiveis.filter((q) => q.mapa === alvo).sort((a, b) => { const [ax, ay] = mapa.pos(a.id), [bx, by] = mapa.pos(b.id); return Math.abs(ay - y0) + Math.abs(ax - x0) / 4 - (Math.abs(by - y0) + Math.abs(bx - x0) / 4); })[0];
    if (c) { atual = c.id; som('ui-mover'); pintar(); } else som('ui-erro');
  }
  async function confirmarVoo() {
    if (ocupado) return; ocupado = true;
    const l = local(atual)!;
    if (await confirmar(tr(T.mapa.voar, { L: l.nome }))) { fechar(tela, l.id); return; }
    ocupado = false;
  }
  const tela: Tela = {
    el,
    entrar() { if (voo && !escolhiveis.length) { ocupado = true; void informar(T.mapa.semDestino).then(() => fechar(tela, undefined)); return; } pintar(); },
    atualizar(dt) {
      tempo += dt; rosto.style.visibility = Math.floor(tempo * 2.5) % 2 ? 'hidden' : '';
      for (const v of veiculos) { v.t = (v.t + dt / 14) % 1; const ida = v.t < 0.5, f = ida ? v.t * 2 : 2 - v.t * 2; const [x, y] = naRota(v.pts, f * v.total); em(v.el, x - 4, y - 5); v.el.style.transform = ida ? '' : 'scaleX(-1)'; }
      if (ocupado) return;
      if (input.repetiu('dir')) mover(1, 0); else if (input.repetiu('esq')) mover(-1, 0); else if (input.repetiu('baixo')) mover(0, 1); else if (input.repetiu('cima')) mover(0, -1);
      if (input.apertou('select')) outraRegiao();
      else if (input.apertou('a') && voo) { input.consumir('a'); som('ui-ok'); void confirmarVoo(); }
      else if (input.apertou('b') || input.apertou('menu')) { input.consumir('b'); input.consumir('menu'); som('ui-voltar'); fechar(tela, undefined); }
    },
  };
  return tela;
}
