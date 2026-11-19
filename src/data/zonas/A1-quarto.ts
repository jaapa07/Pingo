import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas } from './_a1-grade';

/** Quarto do jogador (andar de cima): cama, PC do Quarto, videogame e a decoração que o PC troca. */
const g = grade('A1-quarto', [
  '############',
  '###W##K#####',
  '#PE..Q...BR#',
  '#........B.#',
  '#........c.#',
  '#..a.......#',
  '#V.........#',
  '#N........D#',
  '############',
], { P: '.', E: '.', Q: '.', B: '.', R: '.', a: '.', c: '.', V: '.', D: '+', N: '.', W: '#', K: '#' });
const cama = g.todos('B')[1];
/**
 * Vagas da Decoração do Quarto (canto inferior esquerdo de cada peça). As peças NÃO entram em `objetos` nem no bake:
 * o mundo (src/world/decoracao.ts) desenha a peça escolhida em `save.decoracao` com a folha assada por
 * tools/bake-decoracao.ts e troca na hora quando o PC do quarto emite `bus 'decoracao'`.
 */
export const VAGAS_DECORACAO: Record<string, [number, number]> = { tapete: g.p('a'), poster: g.p('K'), planta: g.p('R'), pelucia: g.p('V'), console: g.p('c'), movel: cama };
const zona: ZonaDef = {
  id: 'A1-quarto', nome: 'Seu quarto', mapa: 'A', tipo: 'interior', tileset: 'casa', musica: 'vila-jacaranda', arena: 'restinga', passo: 1,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'quarto' },
    obj(g, 'P', 'pc', { script: 'pc-quarto' }),
    obj(g, 'E', 'estante', { texto: ['Gibis do Capitão Jangada, um atlas de Pindorama e o álbum de figurinhas das criaturas.', 'Falta só a figurinha do Uirapuru. Sempre falta a do Uirapuru.'] }),
    obj(g, 'Q', 'tv', { texto: ['Passa a reprise do Torneio do Pico Pindorama.', '"…e a Guardiã Iara Costa vence mais uma vez sem molhar o cabelo!"'] }),
    obj(g, 'N', 'bau', { texto: ['Roupas de frio que nunca saem do baú. Aqui é a Costa do Sol, afinal.'] }),
    obj(g, 'D', 'escada-desce'),
    obj(g, 'W', 'janela'),
  ],
  decoracao: VAGAS_DECORACAO,
  warps: saidas(g, 'D', 'A1-casa-jogador', 11, 2, 'o', 'escada'),
};
export default zona;
