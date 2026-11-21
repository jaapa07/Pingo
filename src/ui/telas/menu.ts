/**
 * MENU de pausa do mapa (sobreposto): Diário, Equipe, Mochila, Rádio Cipó, Perfil, Salvar, Opções e Sair.
 * Os itens aparecem conforme a história anda (Diário e Rádio só depois de recebidos; Equipe só com criatura).
 */
import { jogo, qtdItem, flag, minutosAgora, periodo } from '../../core/estado';
import { input, tocavel } from '../../core/input';
import * as save from '../../core/save';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em } from '../fonte';
import { moldura, som, spr } from '../kit';
import { Lista } from '../componentes/lista';
import { confirmar, informar } from '../componentes/confirmacao';
import { abrirTela, substituir } from '../dialogo';
import { patacas, tempoRelogio } from './comum';
import { nomeLocal } from './mapa-dados';
import { moduloMundo } from './dados';
import { T } from '../../data/textos-ui';
import { DEMO, TEXTOS_DEMO } from '../../core/demo';

const NOME_PERIODO = { manha: 'manhã', dia: 'dia', tarde: 'tarde', noite: 'noite' };
let ultimo = '';
/** executa no mapa o que a mochila pediu (bicicleta, vara, Amuleto do menu) depois de os menus fecharem */
export async function usarNoCampo(r: unknown) {
  const p = r as { campo?: string; amuleto?: string } | undefined; if (!p || (!p.campo && !p.amuleto)) return;
  const m = await moduloMundo();
  const f = (p.campo ? m?.usarItemNoCampo : m?.usarAmuleto) as ((id: string) => Promise<boolean>) | undefined;
  if (f) await f(p.campo ?? p.amuleto!); else await informar(T.mochila.naoAqui);
}
export function criarMenu(): Tela {
  const el = elTela('ui', 'tela-menu');
  const s = jogo.save;
  const ops: { id: string; rotulo: string }[] = [];
  if (qtdItem('diario-de-campo') || flag('ovo-entregue') || s.diario.visto.length) ops.push({ id: 'diario', rotulo: 'Diário' });
  if (s.equipe.length) ops.push({ id: 'equipe', rotulo: 'Equipe' });
  ops.push({ id: 'mochila', rotulo: 'Mochila' });
  if (qtdItem('radio-cipo') || flag('intro-ok')) ops.push({ id: 'radio', rotulo: 'Rádio Cipó' });
  ops.push({ id: 'perfil', rotulo: s.jogador.nome }, { id: 'salvar', rotulo: 'Salvar' }, { id: 'opcoes', rotulo: 'Opções' }, { id: 'sair', rotulo: 'Sair' });
  let ocupado = false, viva = true;
  const lista = new Lista({ itens: ops.map((o) => o.rotulo), tamanho: 12, visiveis: ops.length, inicial: Math.max(0, ops.findIndex((o) => o.id === ultimo)), aoEscolher: (i) => void escolher(ops[i].id), aoCancelar: () => fechar(tela) });
  const fundo = document.createElement('div'); fundo.style.cssText = 'position:absolute;left:0;top:0;width:320px;height:180px'; tocavel(fundo, () => { som('ui-voltar'); fechar(tela); });
  em(lista.el, 316 - lista.largura, 4); el.append(fundo, lista.el);
  // alvos de toque invisíveis, maiores que o texto: cada linha vira uma faixa de 16 px de altura (o passo da lista,
  // sem sobreposição) que vai de 32 px à esquerda da moldura até a borda da tela; a primeira e a última vão até as
  // bordas da moldura
  const xAlvo = 316 - lista.largura - 32, yLista = 4 + 8 + 1, hLista = parseInt(lista.el.style.height);
  ops.forEach((o, i) => {
    const y0 = i === 0 ? 0 : yLista + i * lista.alt, y1 = i === ops.length - 1 ? 4 + hLista + 2 : yLista + (i + 1) * lista.alt;
    const a = document.createElement('div'); a.className = 'alvo-menu';
    a.style.cssText = `position:absolute;left:${xAlvo}px;top:${y0}px;width:${320 - xAlvo}px;height:${y1 - y0}px`;
    tocavel(a, () => { if (ocupado) return; lista.selecionar(i, true); som('ui-ok'); void escolher(o.id); }, () => lista.selecionar(i, true));
    el.append(a);
  });
  const cx = moldura('tinta', 132, 46, 26, 118); el.append(cx);
  const l1 = texto(nomeLocal(s.jogador.zona), { cor: 'amarelo', sombra: true }), l2 = texto('', { cor: 'creme' }), l3 = texto(`${patacas(s.jogador.dinheiro)} patacas`, { cor: 'creme' });
  cx.append(em(l1, 6, 5), em(spr(periodo() === 'noite' ? 'lua' : 'sol'), 5, 15), em(l2, 22, 18), em(l3, 6, 32));
  if (DEMO) el.append(em(texto(TEXTOS_DEMO.selo, { cor: 'cinza', sombra: true }), 30, 166));
  const hora = () => `${tempoRelogio(minutosAgora())} · ${NOME_PERIODO[periodo()]}${s.repelente > 0 ? ` · fumaça ${s.repelente}` : ''}`;
  let relogio = '';

  async function escolher(id: string) {
    if (ocupado) return; ocupado = true; ultimo = id;
    try {
      if (id === 'salvar') {
        if (jogo.slot < 0) { await informar(T.menu.semSlot); return; }
        if (!(await confirmar(T.menu.salvar))) return;
        const ok = save.gravarSlot(jogo.slot); som(ok ? 'salvar' : 'ui-erro');
        await informar(substituir(ok ? T.menu.salvo : T.menu.naoSalvou));
      } else if (id === 'sair') {
        if (!(await confirmar(T.menu.sair, false))) return;
        save.marcarEmJogo(false); save.limparRetomada(); location.reload();
      } else if (id === 'mochila') {
        const r = await abrirTela('mochila');
        if (r && typeof r === 'object') { fechar(tela); void usarNoCampo(r); }
      } else await abrirTela(id);
    } finally { ocupado = false; }
  }
  const tela: Tela = {
    el, sobreposta: true,
    sair() { viva = false; },
    atualizar(dt) {
      if (!viva || ocupado) return;
      const h = hora(); if (h !== relogio) { relogio = h; escrever(l2, h); }
      if (input.apertou('menu')) { input.consumir('menu'); som('ui-voltar'); fechar(tela); return; }
      lista.atualizar(dt);
    },
  };
  return tela;
}
