import type { ZonaDef } from '../../core/tipos';

/**
 * Ginásio do Encanto (nº 4, Cidade Coral) — ateliê de renda da Iracema Lua. Tema g06.
 * Quebra-cabeça (src/world/mecanicas/ginasio-04.ts): três vitrais lançam raios de luz que ninguém atravessa;
 * quatro espelhos de renda giram entre `/` e `\` e desviam os raios. A cortina do salão da líder só abre com as
 * duas estrelas de cristal acesas (parede oeste do salão norte e alto da coluna 12).
 * Solução: 1) gire o espelho da entrada (o raio sai da frente da passagem); 2) no salão do meio, gire o espelho
 * da esquerda: o raio desce e libera a passagem oeste; 3) no salão norte, gire o espelho de cima da coluna 6 (ele
 * deve mandar a luz para OESTE) e o espelho da coluna 12 (o raio sobe, acende a 1ª estrela e libera a passagem
 * leste); 4) volte ao salão do meio pela passagem leste e gire de novo o espelho da esquerda: o raio sobe, bate
 * no espelho da coluna 6 e acende a 2ª estrela; 5) entre de novo pelo leste: a cortina abriu.
 */
const zona: ZonaDef = {
  id: 'A5-ginasio', nome: 'Ginásio de Cidade Coral', mapa: 'A', tipo: 'ginasio', tileset: 'ginasio', musica: 'ginasio', arena: 'ginasio-06', passo: 4,
  mapaChars: [
    '###################',
    '#........,........#',
    '#.................#',
    '#########.#########',
    '#.................#',
    '#.................#',
    '#.................#',
    '#.................#',
    '######.#####.######',
    '#.................#',
    '#.................#',
    '#.................#',
    '#.................#',
    '#########.#########',
    '#.................#',
    '#.................#',
    '#.......+.........#',
    '#......+++........#',
    '########+##########',
  ],
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'g06' },
    { o: 'gin-estatua', x: 6, y: 17, texto: ['GINÁSIO DE CIDADE CORAL\nLíder: Iracema Lua\n"Cada ponto da renda segura o outro."', 'Dica do ateliê: a luz dos vitrais anda em linha reta e ninguém passa por ela. Os espelhos de renda giram e mandam o raio para outro lado.'] },
    { o: 'gin-estatua', x: 10, y: 17, texto: ['A cortina da Iracema só abre quando as duas estrelas de cristal recebem luz ao mesmo tempo.', 'Um raio que acende uma estrela pode fechar a passagem por onde você veio. Antes de girar o último espelho, veja por onde vai entrar.'] },
    { o: 'gin-pedestal', x: 9, y: 2 },
    { o: 'gin-espelho', x: 3, y: 14 }, { o: 'gin-espelho', x: 6, y: 10 }, { o: 'gin-espelho', x: 6, y: 5 }, { o: 'gin-espelho', x: 12, y: 6 },
  ],
  warps: [{ x: 8, y: 18, para: { zona: 'A5', x: 34, y: 17, dir: 's' }, tipo: 'porta' }],
  npcs: [
    { id: 'g04-1', sprite: 'cl-rendeira', x: 3, y: 17, dir: 'n', treinador: 'g04-1', visao: 2 },
    { id: 'g04-2', sprite: 'cl-crianca-f', x: 10, y: 10, dir: 'o', treinador: 'g04-2', visao: 3 },
    { id: 'g04-3', sprite: 'cl-observadora', x: 2, y: 7, dir: 'l', treinador: 'g04-3', visao: 4 },
    { id: 'g04-4', sprite: 'cl-rendeira', x: 11, y: 4, dir: 's', treinador: 'g04-4', visao: 2 },
    { id: 'g04-5', sprite: 'cl-rendeira', x: 6, y: 2, dir: 'l', treinador: 'g04-5', visao: 3 },
    { id: 'lider', sprite: 'lider-06', x: 9, y: 1, dir: 's', script: 'ginasio-04-lider' },
  ],
  pouso: [8, 17],
};
export default zona;
