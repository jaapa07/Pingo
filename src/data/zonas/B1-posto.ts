import type { ZonaDef } from '../../core/tipos';

/** Posto Guardião de Vila Buriti. */
const zona: ZonaDef = {
  id: 'B1-posto', nome: 'Posto Guardião de Vila Buriti', mapa: 'B', tipo: 'interior', tileset: 'predio', musica: 'posto', arena: 'cerrado', passo: 4,
  mapaChars: [
    '############',
    '############',
    '#..........#',
    '#..........#',
    '#..........#',
    '#...::::...#',
    '#...::::...#',
    '#....++....#',
    '#####++#####',
  ],
  objetos: [
    { o: 'balcao', x: 4, y: 3 },
    { o: 'maquina-cura', x: 7, y: 2 },
    { o: 'viveiro', x: 10, y: 2, script: 'viveiro' },
    { o: 'radio', x: 1, y: 2, script: 'radio' },
    { o: 'quadro', x: 2, y: 1, texto: ['MURAL DE MISSÕES — VILA BURITI', '• A observadora do Cerrado Aberto procura quem fotografe os poleiros das aves.', '• Em Pantanal Grande, uma capivara perdeu os cinco filhotes na cheia.'] },
    { o: 'planta', x: 1, y: 7 }, { o: 'planta-b', x: 10, y: 7 },
    { o: 'banco-estacao', x: 8, y: 5 },
  ],
  warps: [
    { x: 5, y: 8, para: { zona: 'B1', x: 14, y: 15, dir: 's' }, tipo: 'porta' },
    { x: 6, y: 8, para: { zona: 'B1', x: 14, y: 15, dir: 's' }, tipo: 'porta' },
  ],
  npcs: [
    { id: 'atendente', sprite: 'npc-atendente-posto', x: 5, y: 2, dir: 's', script: 'posto' },
    { id: 'vaqueiro', sprite: 'cl-vaqueiro', x: 2, y: 5, dir: 'l', fala: ['Vim tocando boi lá de Pantanal Grande. De canoa, veja você.', 'A líder de lá, a Boiadeira Zefa, só usa bicho de Terra. Leve um de Rio ou de Mata.'] },
    { id: 'escoteira', sprite: 'cl-escoteira', x: 9, y: 4, dir: 'o', fala: ['Criatura de Rio na equipe e Amuleto do Remo no bolso: sem os dois, nada de canoa.', 'Eu tenho o amuleto. Minha criatura de Rio é um peixinho de aquário. Não rolou.'] },
  ],
};
export default zona;
