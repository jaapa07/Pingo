import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas } from './_a1-grade';

/** Quarto do jogador (andar de cima): cama, PC do Quarto, videogame e a decoração que o PC troca. */
const g = grade('A1-quarto', [
  '############',
  '#J#W##K#####',
  '#PE..Q...BR#',
  '#........B.#',
  '#..aa....c.#',
  '#..aa......#',
  '#V.......Z.#',
  '#N........D#',
  '############',
], { P: '.', E: '.', Q: '.', B: '.', R: '.', a: ',', c: '.', V: '.', Z: '.', D: '+', N: '.', J: '#', W: '#', K: '#' });
const cama = g.todos('B')[1], tapete = g.todos('a')[2];
const zona: ZonaDef = {
  id: 'A1-quarto', nome: 'Seu quarto', mapa: 'A', tipo: 'interior', tileset: 'casa', musica: 'vila-jacaranda', arena: 'restinga', passo: 1,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'quarto' },
    obj(g, 'P', 'pc', { script: 'pc-quarto' }),
    obj(g, 'E', 'estante', { texto: ['Gibis do Capitão Jangada, um atlas de Pindorama e o álbum de figurinhas das criaturas.', 'Falta só a figurinha do Uirapuru. Sempre falta a do Uirapuru.'] }),
    obj(g, 'Q', 'tv', { texto: ['Passa a reprise do Torneio do Pico Pindorama.', '"…e a Guardiã Iara Costa vence mais uma vez sem molhar o cabelo!"'] }),
    { o: 'cama-jogador', x: cama[0], y: cama[1], texto: ['Sua cama. A colcha de estrela foi a vó que costurou.'] },
    obj(g, 'R', 'planta'),
    obj(g, 'c', 'console', { texto: ['O videogame de cartucho. A fita de corrida de jangada está emperrada desde o Natal.'] }),
    { o: 'tapete-c', x: tapete[0], y: tapete[1] },
    obj(g, 'V', 'pelucia-a', { texto: ['Um tamanduá de pelúcia. O focinho já está meio careca de tanto abraço.'] }),
    obj(g, 'N', 'bau', { texto: ['Roupas de frio que nunca saem do baú. Aqui é a Costa do Sol, afinal.'] }),
    obj(g, 'Z', 'planta-c'),
    obj(g, 'D', 'escada-desce'),
    obj(g, 'J', 'poster-a'), obj(g, 'W', 'janela'), obj(g, 'K', 'poster-c'),
  ],
  warps: saidas(g, 'D', 'A1-casa-jogador', 11, 2, 'o', 'escada'),
};
export default zona;
