import type { ZonaDef } from '../../core/tipos';

/** Casa da doceira de Vila Buriti. */
const zona: ZonaDef = {
  id: 'B1-casa-1', nome: 'Casa da Doceira', mapa: 'B', tipo: 'interior', tileset: 'casa', musica: 'cidade-catira', arena: 'cerrado', passo: 4,
  mapaChars: [
    '##########',
    '##########',
    '#........#',
    '#........#',
    '#..,,,...#',
    '#..,,,...#',
    '#...++...#',
    '####++####',
  ],
  objetos: [
    { o: 'fogao-lenha', x: 1, y: 2 },
    { o: 'pia', x: 3, y: 2 },
    { o: 'filtro-barro', x: 8, y: 2 },
    { o: 'mesa', x: 6, y: 4 },
    { o: 'cadeira', x: 6, y: 5 },
    { o: 'cristaleira', x: 5, y: 2 },
    { o: 'janela', x: 7, y: 1 },
    { o: 'pote-barro', x: 1, y: 6 },
  ],
  warps: [
    { x: 4, y: 7, para: { zona: 'B1', x: 5, y: 15, dir: 's' }, tipo: 'porta' },
    { x: 5, y: 7, para: { zona: 'B1', x: 5, y: 15, dir: 's' }, tipo: 'porta' },
  ],
  npcs: [
    { id: 'doceira', sprite: 'npc-idosa', x: 2, y: 3, dir: 's', script: 'b1-doceira' },
    { id: 'neto', sprite: 'cl-crianca-m', x: 7, y: 6, dir: 'o', fala: ['A vó diz que doce de buriti cura tristeza.', 'Eu fico triste três vezes por dia, só por garantia.'] },
  ],
};
export default zona;
