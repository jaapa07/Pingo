import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio da Pedra (nº 9, Chapada Rubra) — mina do Garimpeiro Topázio. Tema g09.
 * Quebra-cabeça (src/world/mecanicas/ginasio-09.ts): vagonetes sobre o abismo e chaves de desvio.
 * Solução: o vagonete da entrada leva à galeria oeste (desvio 1 para o oeste). Lá, o segundo vagonete bate
 * no para-choque enquanto o desvio 2 estiver para o leste. Volte, vire o desvio 1 (ao lado do trilho da entrada)
 * para o leste, vá à galeria leste, vire o desvio 2 para o norte, volte, vire o desvio 1 para o oeste e suba.
 */
const zona: ZonaDef = {
  id: 'B3-ginasio', nome: 'Ginásio de Chapada Rubra', mapa: 'B', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-09', passo: 9,
  mapaChars: [
    '#####################',
    '#.........,.........#',
    '#...................#',
    '#..:................#',
    '#oo:oooooooooooooooo#',
    '#oo::::::ooooooooooo#',
    '#oo:oooooooooooooooo#',
    '#..:.....ooo........#',
    '#........ooo........#',
    '#........ooo........#',
    '#....:...ooo...:....#',
    '#oooo:ooooooooo:oooo#',
    '#oooo:::::::::::oooo#',
    '#ooooooooo:ooooooooo#',
    '#.........:.........#',
    '#...................#',
    '#......,+,..........#',
    '#......+++..........#',
    '########+############',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g09' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE CHAPADA RUBRA\nLíder: Garimpeiro Topázio\n"Duro por fora, brilhante por dentro."', 'Dica do garimpo: o vagonete segue o trilho até o fim. Nos entroncamentos, quem manda é a chave de desvio.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['Uma chave de desvio pode ficar bem longe do entroncamento que ela comanda.', 'O desvio do trilho de cima fica na galeria leste, do outro lado do abismo.'] },
    { o: 'gin-desvio', x: 12, y: 14 }, { o: 'gin-desvio', x: 18, y: 7 },
    { o: 'gin-pedestal', x: 10, y: 1 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'B3', x: 20, y: 20, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g09-1', sprite: 'cl-garimpeiro', x: 16, y: 15, dir: 'o', treinador: 'g09-1', visao: 4 },
    { id: 'g09-2', sprite: 'cl-montanhista', x: 7, y: 8, dir: 'o', treinador: 'g09-2', visao: 4 },
    { id: 'g09-3', sprite: 'cl-garimpeiro', x: 13, y: 8, dir: 'l', treinador: 'g09-3', visao: 4 },
    { id: 'g09-4', sprite: 'cl-escoteira', x: 7, y: 2, dir: 'o', treinador: 'g09-4', visao: 4 },
    { id: 'lider', sprite: 'lider-09', x: 10, y: 1, dir: 's', script: 'ginasio-09-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
