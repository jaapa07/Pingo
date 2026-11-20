/**
 * LOJA (Venda, feiras) — comprar e vender com quantidade. Args: `{ itens: string[], titulo?: string }`.
 * Vende-se pela metade do preço; itens-chave e itens sem preço não são comprados. A cada 10 Cuias comuns, 1 de brinde.
 */
import { jogo, qtdItem, darItem, tirarItem } from '../../core/estado';
import { ITENS, item as itemDef, temItemDef, type ItemInfo } from '../../data/itens';
import type { Tela } from '../telas';
import { elTela, fechar } from '../base';
import { texto, escrever, em, medir } from '../fonte';
import { moldura, som, iconeBolso } from '../kit';
import { Lista } from '../componentes/lista';
import { informar } from '../componentes/confirmacao';
import { faixaDica, placaTitulo, patacas, caixa, rotulo } from './comum';
import { pedirQuantidade } from './quantidade';
import { caber } from './mochila';
import { T } from '../../data/textos-ui';

/** `moeda`: troca por outra moeda que não patacas (pontos da Gincana): só compra, com preço e saldo próprios */
export interface ArgsLoja { itens?: string[]; titulo?: string; moeda?: { nome: string; saldo(): number; gastar(n: number): void; preco(id: string): number } }
export function criarLoja(args: ArgsLoja = {}): Tela {
  const s = jogo.save;
  const el = elTela('ui', 'tela-loja', 'fundo-terra');
  const venda = (args.itens ?? []).filter(temItemDef).map(itemDef), md = args.moeda;
  const preco = (i: ItemInfo) => (md ? md.preco(i.id) : i.preco), saldo = () => (md ? md.saldo() : s.jogador.dinheiro);
  placaTitulo(el, (args.titulo ?? 'VENDA').toUpperCase(), 2, 1, 150);
  const cxDin = moldura('placa', 120, 15, 198, 1); el.append(cxDin);
  const tDin = texto('', { cor: 'amarelo', sombra: true }); cxDin.append(em(tDin, 6, 4));
  const painel = moldura('madeira', 186, 146, 2, 18), info = moldura('tinta', 128, 146, 190, 18); el.append(painel, info);
  const corpo = caixa('', 118, 136); info.append(em(corpo, 5, 5));
  const dica = faixaDica(el);
  let modo: 'menu' | 'comprar' | 'vender' = 'menu', lista: Lista | null = null, atuais: ItemInfo[] = [], ocupado = false, viva = true;
  const precoVenda = (i: ItemInfo) => Math.floor(i.preco / 2);
  const vendaveis = () => ITENS.filter((i) => qtdItem(i.id) > 0 && i.bolso !== 'chave' && i.preco > 0);
  function dinheiro() { escrever(tDin, `${patacas(saldo())} ${md ? md.nome : 'patacas'}`); tDin.style.left = 114 - parseInt(tDin.style.width) + 'px'; }
  function montar(indice = 0) {
    lista?.el.remove(); [...painel.querySelectorAll('.vazio')].forEach((x) => x.remove()); dinheiro();
    if (modo === 'menu') {
      atuais = [];
      lista = new Lista({ itens: md ? ['Trocar', T.loja.sair] : [T.loja.comprar, T.loja.vender, T.loja.sair], moldura: null, largura: 170, tamanho: 12, inicial: indice, aoMover: pintarInfo, aoCancelar: () => fechar(tela), aoEscolher: (i) => { if (i === (md ? 1 : 2)) { fechar(tela); return; } modo = i === 0 ? 'comprar' : 'vender'; montar(0); } });
    } else {
      atuais = modo === 'comprar' ? venda : vendaveis();
      lista = new Lista({ itens: atuais.map((i) => { const v = modo === 'comprar' ? patacas(preco(i)) : `×${qtdItem(i.id)}  ${patacas(precoVenda(i))}`; return { rotulo: caber(i.nome, 148 - medir(v) - 8), valor: v, desabilitado: modo === 'comprar' && preco(i) > saldo() }; }), moldura: null, largura: 170, visiveis: 10, inicial: Math.min(indice, Math.max(0, atuais.length - 1)), aoMover: pintarInfo, aoCancelar: () => { modo = 'menu'; montar(0); }, aoEscolher: (i) => void negociar(atuais[i]) });
      if (!atuais.length) { const v = texto(modo === 'vender' ? T.loja.nadaVender : 'A prateleira está vazia hoje.', { cor: 'marrom', largura: 160, alinhar: 'centro' }); v.classList.add('vazio'); painel.append(em(v, 13, 60)); }
    }
    painel.append(em(lista.el, 8, 10)); pintarInfo(); dica(T.loja.dica);
  }
  function pintarInfo() {
    corpo.replaceChildren();
    if (modo === 'menu') { rotulo(corpo, (md ? [`Troque seus ${md.nome} por prêmios.`, 'Volte sempre!'] : [T.loja.ola, 'Pago a metade do preço pelo que você não usa mais.', 'Volte sempre!'])[lista?.indice ?? 0], 0, 2, 'creme', { largura: 116 }); return; }
    const it = atuais[lista?.indice ?? 0]; if (!it) return;
    corpo.append(em(iconeBolso(it.bolso), 0, 0));
    const n = rotulo(corpo, it.nome, 20, 0, 'amarelo', { largura: 96 });
    const y = Math.max(20, parseInt(n.style.height) + 6);
    const d = rotulo(corpo, it.desc, 0, y, 'creme', { largura: 116 });
    const yy = Math.min(124, y + parseInt(d.style.height) + 6);
    rotulo(corpo, `Na mochila: {c:amarelo}×${qtdItem(it.id)}{/c}`, 0, yy, 'cinza');
  }
  async function negociar(it: ItemInfo | undefined) {
    if (!it || ocupado) return; ocupado = true;
    try {
      if (modo === 'comprar') {
        const max = Math.min(99, Math.floor(saldo() / Math.max(1, preco(it))));
        if (max < 1) { som('ui-erro'); await informar(T.loja.semDinheiro); return; }
        const q = await pedirQuantidade(`${it.nome}: quantas?`, max, md ? {} : { preco: preco(it) }); if (!q) return;
        if (md) md.gastar(q * preco(it)); else s.jogador.dinheiro -= q * it.preco;
        darItem(it.id, q); som('item-obtido');
        const brinde = it.id === 'cuia' && !md ? Math.floor(q / 10) : 0; if (brinde) darItem('cuia', brinde);
        await informar(T.loja.comprou + (brinde ? ' ' + T.loja.brinde : ''));
      } else {
        const q = await pedirQuantidade(`Vender quantas?`, qtdItem(it.id), { preco: precoVenda(it) }); if (!q) return;
        tirarItem(it.id, q); s.jogador.dinheiro += q * precoVenda(it); som('item-obtido');
        await informar(`${T.loja.vendeu} Você recebeu ${patacas(q * precoVenda(it))} patacas.`);
      }
    } finally { ocupado = false; if (viva) montar(lista?.indice ?? 0); }
  }
  const tela: Tela = { el, entrar() { montar(0); }, sair() { viva = false; }, atualizar(dt) { if (!ocupado) lista?.atualizar(dt); } };
  return tela;
}
