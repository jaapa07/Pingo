import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio do Assombro (nº 6, Serra Fumaça) — sobrado da Dona Benta Sombra. Tema g08.
 * Quebra-cabeça (src/world/mecanicas/ginasio-06.ts): a casa é um breu. Três salas têm o assoalho cheio de
 * alçapões que só aparecem à luz da lamparina (2 tiles em volta do jogador). A lamparina de mão acende nas
 * lamparinas de pé e dura 16 passos; quem cai num alçapão volta ao começo da sala, de chama apagada.
 * Solução: sala 1 — acenda na entrada, suba pela coluna 12 e siga a fila 13 para oeste até a porta.
 * Sala 2 — acenda ao lado da porta, suba pela coluna 4, fila 9 até a coluna 8, desça, fila 11 para leste até a
 * segunda lamparina (acenda de novo), suba pela coluna 14 e volte pela fila 9 até a porta do meio.
 * Sala 3 — acenda na entrada, suba a coluna 10 só até a fila 5 (o corredor leste da fila 6 é beco), oeste até
 * a coluna 6, desça à fila 7, oeste até a coluna 2, suba (lamparina na parede oeste) e siga a fila 4 até a porta.
 */
const zona: ZonaDef = {
  id: 'A7-ginasio', nome: 'Ginásio de Serra Fumaça', mapa: 'A', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-08', passo: 6,
  mapaChars: [
    '###################',
    '#........,........#',
    '#.................#',
    '########.##########',
    '#.................#',
    '#.................#',
    '#.................#',
    '#.................#',
    '##########.########',
    '#.................#',
    '#.................#',
    '#.................#',
    '####.##############',
    '#.................#',
    '#.................#',
    '#.................#',
    '#.......+.........#',
    '#......+++........#',
    '########+##########',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g08' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE SERRA FUMAÇA\nLíder: Dona Benta Sombra\n"Quem tem medo do escuro nunca ouviu o fim da história."', 'Dica do sobrado: o assoalho está cheio de alçapões que só a luz da lamparina mostra. Encoste numa lamparina de pé para acender a sua.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['O óleo dá para 16 passos. Parado, a chama não gasta: olhe em volta antes de andar.', 'Quem cai num alçapão volta ao começo da sala com a chama apagada. Corredor comprido demais costuma ser beco.'] },
    { o: 'gin-pedestal', x: 9, y: 2 },
    { o: 'gin-lamparina', x: 13, y: 16 }, { o: 'gin-lamparina', x: 2, y: 11 }, { o: 'gin-lamparina', x: 15, y: 11 }, { o: 'gin-lamparina', x: 11, y: 7 }, { o: 'gin-lamparina', x: 1, y: 6 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'A7', x: 24, y: 14, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g06-1', sprite: 'cl-crianca-m', x: 4, y: 16, dir: 'l', treinador: 'g06-1', visao: 4 },
    { id: 'g06-2', sprite: 'cl-repentista', x: 5, y: 11, dir: 'o', treinador: 'g06-2', visao: 1 },
    { id: 'g06-3', sprite: 'cl-observadora', x: 9, y: 7, dir: 'l', treinador: 'g06-3', visao: 1 },
    { id: 'g06-4', sprite: 'cl-repentista', x: 5, y: 2, dir: 'l', treinador: 'g06-4', visao: 3 },
    { id: 'lider', sprite: 'lider-08', x: 9, y: 1, dir: 's', script: 'ginasio-06-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
