import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas } from './_a1-grade';

/** Quarto do jogador (andar de cima): cama, PC do Quarto, videogame e a decoração que o PC troca. */
const g = grade('A1-quarto', [
  '############',
  '############',
  '#PE..Q...BR#',
  '#........B.#',
  '#..aa....c.#',
  '#..aa......#',
  '#V.......ZD#',
  '#N.........#',
  '############',
], { P: '.', E: '.', Q: '.', B: '.', R: '.', a: ',', c: '.', V: '.', Z: '.', D: '+', N: '.' });
const [bx, by] = g.todos('B')[1];
const zona: ZonaDef = {
  id: 'A1-quarto', nome: 'Seu quarto', mapa: 'A', tipo: 'interior', tileset: 'casa', musica: 'vila-jacaranda', arena: 'restinga', passo: 1,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'quarto' },
    obj(g, 'P', 'pc', { script: 'pc-quarto' }),
    obj(g, 'E', 'estante', { texto: ['Gibis do Capitão Jangada, um atlas de Pindorama e o álbum de figurinhas das criaturas.', 'Falta só a figurinha do Uirapuru. Sempre falta a do Uirapuru.'] }),
    obj(g, 'Q', 'tv', { texto: ['Passa a reprise do Torneio do Pico Pindorama.', '"…e a Guardiã Iara Costa vence mais uma vez sem molhar o cabelo!"'] }),
    { o: 'cama-jogador', x: bx, y: by, texto: ['Sua cama. A colcha de estrela foi a vó que costurou.'] },
    obj(g, 'R', 'planta'),
    obj(g, 'c', 'console', { texto: ['O videogame de cartucho. A fita de corrida de jangada está emperrada desde o Natal.'] }),
    { o: 'tapete-c', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
    obj(g, 'V', 'pelucia-a', { texto: ['Um tamanduá de pelúcia. O focinho já está meio careca de tanto abraço.'] }),
    obj(g, 'N', 'bau', { texto: ['Roupas de frio que nunca saem do baú. Aqui é a Costa do Sol, afinal.'] }),
    obj(g, 'Z', 'planta-c'),
    obj(g, 'D', 'escada-desce'),
    { o: 'janela', x: 4, y: 1 }, { o: 'poster-c', x: 7, y: 1 }, { o: 'poster-a', x: 3, y: 1 },
  ],
  warps: saidas(g, 'D', 'A1-casa-jogador', 9, 3, 'o', 'escada'),
};
export default zona;
