/**
 * Escolha de idioma (docs/I18N.md): aparece na 1ª abertura, antes do título, e pela tela de título
 * ("Idioma: Português" / "Language: English"). O idioma vale do começo ao fim do jogo; durante a aventura não se troca.
 * Os nomes dos idiomas aparecem sempre na própria língua.
 */
import type { Tela } from '../telas';
import { elTela } from '../base';
import { texto, em } from '../fonte';
import { Lista } from '../componentes/lista';
import { input } from '../../core/input';
import type { Idioma } from '../../i18n';

const NOMES: [Idioma, string][] = [['pt', 'Português'], ['en', 'English']];

/** `inicial`: idioma pré-selecionado; `aoEscolher` recebe o idioma (ou null se voltou com B, quando `podeVoltar`) */
export function criarTelaIdioma(args: { inicial: Idioma; podeVoltar?: boolean; aoEscolher(i: Idioma | null): void }): Tela {
  const el = elTela('ui', 'idioma', 'fundo-noite');
  const nome = texto('ADVENTURES OF PINGO', { tamanho: 12, cor: 'ouro', sombra: true, largura: 320, alinhar: 'centro' });
  const pergunta = texto('Idioma · Language', { cor: 'creme', sombra: true, largura: 320, alinhar: 'centro' });
  let feito = false;
  const escolher = (i: Idioma | null) => { if (feito) return; feito = true; args.aoEscolher(i); };
  const lista = new Lista({
    itens: NOMES.map(([, n]) => n), tamanho: 12, moldura: 'madeira', circular: true,
    inicial: Math.max(0, NOMES.findIndex(([i]) => i === args.inicial)),
    aoEscolher: (k) => escolher(NOMES[k][0]),
    aoCancelar: () => { if (args.podeVoltar) escolher(null); },
  });
  el.append(em(nome, 0, 34), em(pergunta, 0, 56), em(lista.el, Math.floor((320 - lista.largura) / 2), 80));
  const dica = texto(input.modo === 'toque' ? '' : '↑↓  ·  Z / Enter', { cor: 'cinza', largura: 320, alinhar: 'centro' });
  el.append(em(dica, 0, 160));
  return { el, atualizar(dt) { lista.atualizar(dt); } };
}
