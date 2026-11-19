import type { ZonaDef } from '../../core/tipos';

/** Venda de Vila Buriti. */
const zona: ZonaDef = {
  id: 'B1-venda', nome: 'Venda de Vila Buriti', mapa: 'B', tipo: 'interior', tileset: 'predio', musica: 'venda', arena: 'cerrado', passo: 4,
  mapaChars: [
    '############',
    '############',
    '#..........#',
    '#..........#',
    '#..........#',
    '#..........#',
    '#..........#',
    '#....++....#',
    '#####++#####',
  ],
  objetos: [
    { o: 'balcao', x: 2, y: 3 },
    { o: 'balanca', x: 5, y: 3 },
    { o: 'prateleira', x: 7, y: 2, texto: 'Doce de buriti, paçoca de pilão e rapadura. A rapadura está presa com corrente.' },
    { o: 'prateleira', x: 9, y: 2, texto: 'Cuias de todo tamanho. Uma delas tem um bilhete: "amostra, não arremessar".' },
    { o: 'saco-graos', x: 1, y: 6 }, { o: 'caixote', x: 10, y: 6 }, { o: 'barril', x: 10, y: 5 },
    { o: 'prateleira', x: 7, y: 5, texto: 'Fumaça de Andiroba: espanta bicho fraco e visita demorada.' },
  ],
  warps: [
    { x: 5, y: 8, para: { zona: 'B1', x: 24, y: 15, dir: 's' }, tipo: 'porta' },
    { x: 6, y: 8, para: { zona: 'B1', x: 24, y: 15, dir: 's' }, tipo: 'porta' },
  ],
  npcs: [
    { id: 'vendedor', sprite: 'npc-vendedor', x: 3, y: 2, dir: 's', se: '!insignia:8', fala: ['Chegue mais! Tudo fresquinho, menos o vendedor.'], loja: ['cuia', 'cuia-trancada', 'cha-cidreira', 'garrafada', 'mel-puro', 'unguento', 'fumaca-andiroba', 'corda-de-cipo'] },
    { id: 'vendedor-2', sprite: 'npc-vendedor', x: 3, y: 2, dir: 's', se: 'insignia:8', fala: ['Oito insígnias? Para você eu abro o estoque de trás!'], loja: ['cuia', 'cuia-trancada', 'cuia-ouro', 'garrafada', 'elixir-andiroba', 'mel-puro', 'unguento', 'pomada-copaiba', 'cha-guarana', 'fumaca-andiroba-forte', 'corda-de-cipo'] },
    { id: 'freguesa', sprite: 'npc-idosa', x: 8, y: 6, dir: 'n', fala: ['No meu tempo a gente pegava criatura com balaio e conversa.', 'Hoje é tudo cuia disso, cuia daquilo. Mas a Trançada é boa mesmo, viu?'] },
  ],
};
export default zona;
