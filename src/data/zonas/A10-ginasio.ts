import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio da Mata (nº 8, Vila Buriti) — estufa da raizeira Dona Buriti. Tema g04.
 * Quebra-cabeça (src/world/mecanicas/ginasio-08.ts): labirinto de sebes (`b`) em que quatro cipós crescem um tile
 * a cada passo do jogador, fechando corredores. Borrifar o extrato de um vaso (`C`) faz todos murcharem e a
 * contagem recomeçar; com o Facão dá para cortar um cipó de cada vez.
 * Solução: atravesse o salão sul sem enrolar (o cipó corre pela fila de cima), borrife o vaso ao lado da
 * portinhola, siga direto pelo corredor leste e suba pela coluna 13 antes que o cipó do norte a feche (13 passos,
 * o cipó chega no 16º), dê a volta pelo corredor de cima, borrife o vaso do meio pelo lado norte e corra para
 * oeste pela fila 6 (7 passos, o cipó chega no 10º) até a saída do canto noroeste.
 * O caminho pela fila 12 leva ao lado sul do vaso do meio (bolsão sem saída) e o lado oeste é beco.
 * Verificado por busca em (posição, passos desde o vaso): sem os vasos 2 e 3 não há solução.
 */
const zona: ZonaDef = {
  id: 'A10-ginasio', nome: 'Ginásio de Vila Buriti', mapa: 'A', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-04', passo: 8,
  mapaChars: [
    '###################',
    '#...b....,........#',
    '#.................#',
    '#.Cbbbbbbbbbbbbbbb#',
    '#.....b.....b.....#',
    '#bbbb.b.bbb.b.bbb.#',
    '#.b.......b...b...#',
    '#.b.bbbbb.bbb.b.bb#',
    '#...b..C..b.......#',
    '#bb.b.bbbbb.bbbbb.#',
    '#...b.....b.....b.#',
    '#.bbbbb.b.b.bbb.b.#',
    '#.......b.....b..C#',
    '#bbbbbbbbbbbbbb.bb#',
    '#.................#',
    '#.....C...........#',
    '#.......+.........#',
    '#......+++........#',
    '########+##########',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g04' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE VILA BURITI\nLíder: Dona Buriti\n"Planta não tem pressa. Você é que tem."', 'Dica da estufa: os cipós crescem um palmo a cada passo seu. Parado, ninguém perde tempo: pense antes de andar.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['Os vasos guardam extrato de raiz amarga. Borrifou, todos os cipós murcham e começam de novo.', 'Cada cipó acorda depois de um certo número de passos. O do corredor norte fecha a subida no 16º passo; o da fila do meio fecha a saída no 10º.'] },
    { o: 'gin-pedestal', x: 9, y: 2 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'A10', x: 9, y: 10, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g08-1', sprite: 'cl-mateira', x: 12, y: 17, dir: 'n', treinador: 'g08-1', visao: 3 },
    { id: 'g08-2', sprite: 'cl-biologa', x: 17, y: 8, dir: 'o', treinador: 'g08-2', visao: 4 },
    { id: 'g08-3', sprite: 'cl-crianca-f', x: 1, y: 8, dir: 'l', treinador: 'g08-3', visao: 2 },
    { id: 'g08-4', sprite: 'cl-escoteira', x: 17, y: 6, dir: 'o', treinador: 'g08-4', visao: 2 },
    { id: 'g08-5', sprite: 'cl-mateira', x: 5, y: 1, dir: 's', treinador: 'g08-5', visao: 1 },
    { id: 'lider', sprite: 'lider-04', x: 9, y: 1, dir: 's', script: 'ginasio-08-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
