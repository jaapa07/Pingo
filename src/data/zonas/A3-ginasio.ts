import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio do Inseto (nº 2, Bosque Alto) — plataformas nas copas da Lia Teia. Tema g02.
 * Quebra-cabeça (src/world/mecanicas/ginasio-02.ts): sete pontes de teia (`=`) sobre o vão (`o`), cada uma com
 * 1 a 7 nós. Só aguentam peso na ordem dos nós; atravessada inteira, a ponte fica firme para sempre.
 * Solução: 1 nó (entrada → centro), 2 nós (centro → leste), 3 nós (leste → nordeste), volta ao centro,
 * 4 nós (centro → oeste), 5 nós (oeste → noroeste), 6 nós (noroeste → líder). A ponte de 7 nós, que liga o
 * nordeste ao líder, é o atalho tentador: arrebenta com quem ainda não firmou a de 6.
 */
const zona: ZonaDef = {
  id: 'A3-ginasio', nome: 'Ginásio de Bosque Alto', mapa: 'A', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-02', passo: 2,
  mapaChars: [
    '#################',
    '#c..ooT...Too..c#',
    '#...==..,..==...#',
    '#...oo.....oo...#',
    '#...ooooooooo...#',
    '#...ooooooooo...#',
    '#o=ooooooooooo=o#',
    '#o=ooooooooooo=o#',
    '#o=ooooooooooo=o#',
    '#....oo...oo....#',
    '#....==...==....#',
    '#c...oo...oo...c#',
    '#ooooooo=ooooooo#',
    '#ooooooo=ooooooo#',
    '#ooooooo=ooooooo#',
    '#oooo.......oooo#',
    '#oooo...+...oooo#',
    '#oooo..+++..oooo#',
    '########+########',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g02' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE BOSQUE ALTO\nLíder: Lia Teia\n"Paciência de aranha, coragem de formiga."', 'Dica das copas: conte os nós de cada ponte de teia. Elas só aguentam peso na ordem em que foram tecidas: 1 nó, depois 2, depois 3…'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['Ponte atravessada de ponta a ponta fica firme e dourada: dali em diante pode ir e voltar à vontade.', 'Quem pisa numa teia fora da ordem cai na rede de segurança e recomeça da entrada.'] },
    { o: 'gin-pedestal', x: 8, y: 2 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'A3', x: 25, y: 7, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g02-1', sprite: 'cl-crianca-f', x: 15, y: 10, dir: 'o', treinador: 'g02-1', visao: 3 },
    { id: 'g02-2', sprite: 'cl-biologa', x: 14, y: 3, dir: 's', treinador: 'g02-2', visao: 2 },
    { id: 'g02-3', sprite: 'cl-escoteira', x: 1, y: 10, dir: 'l', treinador: 'g02-3', visao: 3 },
    { id: 'g02-4', sprite: 'cl-mateira', x: 2, y: 3, dir: 's', treinador: 'g02-4', visao: 2 },
    { id: 'lider', sprite: 'lider-02', x: 8, y: 1, dir: 's', script: 'ginasio-02-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
