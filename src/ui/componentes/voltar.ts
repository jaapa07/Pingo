/**
 * Botão "◀ Voltar" visível e tocável (feedback de jogador, docs/UI-CORRECOES.md): no celular o botão B dos controles de
 * toque existe, mas não é óbvio que ele volta. Cada submenu ganha uma saída que se vê e se toca. O desenho é o botão do kit
 * (moldura `botao`, fonte 8); por baixo dele há um alvo invisível maior (`folga`), para o dedo não precisar acertar os
 * 13–14 px do desenho. Por padrão tocar nele vale um aperto de B (`input.pulsar('b')`): a tela faz o que já faria com B.
 */
import { input, tocavel } from '../../core/input';
import { em, medir, texto } from '../fonte';
import { moldura, som } from '../kit';
import { t } from '../../i18n';

export interface OpVoltar {
  /** texto depois do ◀ (padrão "Voltar") */
  rotulo?: string;
  /** altura do desenho (padrão 14) */
  altura?: number;
  /** quanto o alvo de toque passa do desenho em cada lado, em px da tela: [esq, cima, dir, baixo] */
  folga?: [number, number, number, number];
  /** o que o toque faz (padrão: um aperto de B) */
  aoTocar?: () => void;
}

/** largura do botão para um rótulo */
export const larguraVoltar = (rotulo = 'Voltar') => medir('◀ ' + t(rotulo)) + 12;

export function botaoVoltar(o: OpVoltar = {}): HTMLElement {
  const rot = '◀ ' + t(o.rotulo ?? 'Voltar'), h = o.altura ?? 14, w = larguraVoltar(o.rotulo);
  const el = moldura('botao', w, h); el.classList.add('voltar-toque');
  el.append(em(texto(rot, { cor: 'tinta' }), 6, Math.floor((h - 8) / 2)));
  const [fe, fc, fd, fb] = o.folga ?? [4, 4, 4, 4];
  if (fe || fc || fd || fb) {
    const alvo = document.createElement('div'); alvo.className = 'alvo-voltar';
    alvo.style.cssText = `position:absolute;left:${-fe}px;top:${-fc}px;width:${w + fe + fd}px;height:${h + fc + fb}px;pointer-events:auto`;
    el.append(alvo);
  }
  const tocar = o.aoTocar ?? (() => input.pulsar('b'));
  tocavel(el, () => { if (o.aoTocar) som('ui-voltar'); tocar(); });
  return el;
}

/**
 * Separa da dica do rodapé o trecho "B: <ação>" (ex.: "A: ficha   B: voltar" → ["A: ficha", "Voltar"]); o rodapé desenha
 * esse trecho como botão tocável. "A ou B: fechar" fica como está (o B não é o único jeito).
 */
export function separarDicaB(s: string): [resto: string, rotulo: string | null] {
  s = t(s); // traduz a dica inteira antes de separar (docs/I18N.md)
  const m = /(^|\s)(?<!ou |or )B: ([A-Za-zÀ-ú]+)[^]*?(?=\s{2,}|$)/.exec(s);
  if (!m) return [s, null];
  const palavra = m[2];
  const resto = (s.slice(0, m.index) + s.slice(m.index + m[0].length)).replace(/\s+$/, '').replace(/^\s+/, '');
  return [resto, palavra[0].toUpperCase() + palavra.slice(1)];
}
