import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio do Trovão (nº 5, Ilha do Farol) — oficina do Faroleiro Volta. Tema g07.
 * Quebra-cabeça (src/world/mecanicas/ginasio-05.ts): o gerador só alimenta UM ramo de cada vez. Três chaves em
 * cadeia escolhem o ramo: chave 1 (entrada) = ponte oeste de baixo OU o relé do meio; chave 2 (relé, salão do
 * meio, lado oeste) = ponte leste de baixo OU a linha de cima (ponte do salão norte + chave 3); chave 3 (salão
 * norte) = piso eletrificado diante da última ponte OU a ponte do líder. Ponte sem energia fica recolhida.
 * Solução: atravesse a ponte oeste (já ligada), vire a chave 2 para a ponte leste, VOLTE pela ponte oeste, vire a
 * chave 1 para o relé (a ponte oeste recolhe e a leste estende), atravesse pela leste, ande até a chave 2 e vire-a
 * para a linha de cima, atravesse a ponte do salão norte e vire a chave 3: o piso desliga e a ponte do líder estende.
 */
const zona: ZonaDef = {
  id: 'A6-ginasio', nome: 'Ginásio da Ilha do Farol', mapa: 'A', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-07', passo: 5,
  mapaChars: [
    '###################',
    '#........,........#',
    '#.................#',
    '#oooooooo=oooooooo#',
    '#oooooooo=oooooooo#',
    '#.......xxx.......#',
    '#.......xxx.......#',
    '#.................#',
    '#ooooooooooooo=ooo#',
    '#ooooooooooooo=ooo#',
    '#.................#',
    '#.................#',
    '#ooo=ooooooooo=ooo#',
    '#ooo=ooooooooo=ooo#',
    '#.................#',
    '#.................#',
    '#.......+.........#',
    '#......+++........#',
    '########+##########',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g07' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DA ILHA DO FAROL\nLíder: Faroleiro Volta\n"Luz acesa, navio salvo."', 'Dica da oficina: o gerador só dá conta de um ramo por vez. Cada chave escolhe para onde a energia segue. Ponte sem energia recolhe.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['CHAVE 1: ponte oeste OU relé do meio.\nCHAVE 2 (relé): ponte leste OU linha de cima.\nCHAVE 3: piso de teste OU ponte do líder.', 'Chave sem energia também vira: ela só passa a valer quando a corrente chega. Deixe o relé pronto ANTES de mandar energia para ele.'] },
    { o: 'gin-pedestal', x: 9, y: 2 },
    { o: 'alavanca', x: 12, y: 15 }, { o: 'alavanca', x: 2, y: 10 }, { o: 'alavanca', x: 3, y: 6 },
    { o: 'gerador', x: 15, y: 16 }, { o: 'painel', x: 1, y: 2 },
    { o: 'gin-no-circuito', x: 4, y: 14 }, { o: 'gin-no-circuito', x: 14, y: 14 }, { o: 'gin-no-circuito', x: 14, y: 10 }, { o: 'gin-no-circuito', x: 9, y: 7 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'A6', x: 16, y: 9, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g05-1', sprite: 'cl-ferreiro', x: 1, y: 14, dir: 'l', treinador: 'g05-1', visao: 3 },
    { id: 'g05-2', sprite: 'cl-crianca-m', x: 7, y: 11, dir: 'o', treinador: 'g05-2', visao: 3 },
    { id: 'g05-3', sprite: 'cl-pescador', x: 17, y: 11, dir: 'o', treinador: 'g05-3', visao: 3 },
    { id: 'g05-4', sprite: 'cl-observadora', x: 11, y: 7, dir: 'l', treinador: 'g05-4', visao: 3 },
    { id: 'lider', sprite: 'lider-07', x: 9, y: 1, dir: 's', script: 'ginasio-05-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
