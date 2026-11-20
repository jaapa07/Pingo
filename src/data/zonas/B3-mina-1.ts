import type { ZonaDef } from '../../core/tipos';
import { grade, obj, objs, saidas, duelista, gente, item, E } from './_b1-lib';

/**
 * B3-mina-1 · Mina Velha, galeria de cima (porta em (37, 10) em Chapada Rubra). Trilhos de vagonete, cascalho com
 * encontros (`%`), veios de rocha rachada que escondem duas câmaras (Quebra-pedra) e a escada para a galeria funda.
 * Capangas do Cartel vigiam as gaiolas de criaturas roubadas do ninhal. Selvagens 46–49; treinadores 46–48.
 */
const g = grade('B3-mina-1', [
  '##############################',
  '#%%%%%%.....####......%%%%%.S#',
  '#%%%%%%.....####......%%%%%..#',
  '#%%....::::::::::::::....%%..#',
  '#%%....:...#####....:....%%..#',
  '#......:...#####....:........#',
  '###.####...##k##....:...######',
  '#.....##...#...#....:...#....#',
  '#.1...##...#...#....:...#.j..#',
  '#.....##...##r##....:...#....#',
  '#.....##............:...##r###',
  '#%%%..##....%%%%....:....%%..#',
  '#%%%..::::::%%%%::::::...%%..#',
  '#%%%..:.....%%%%.....:...%%..#',
  '#.....:...........2..:.......#',
  '####..:....######....:..######',
  '#.....:....#....#....:.......#',
  '#..J..:....#.i..#....:...J...#',
  '#.....:....#....#..3.:.......#',
  '#..%%%:%%%.##r###..%%:%%%....#',
  '#..%%%:%%%.........%%:%%%..V.#',
  '#.....::::::::::::::::.......#',
  '#...........4................#',
  '###############D##############',
], { S: '.', D: '+', J: '.', V: '.', k: '.', i: '.', j: '.', '1': '.', '2': '.', '3': '.', '4': '.' });
const zona: ZonaDef = {
  id: 'B3-mina-1', nome: 'Mina Velha — Galeria de Cima', mapa: 'B', tipo: 'dungeon', tileset: 'industrial', musica: 'caverna', arena: 'caverna', passo: 10,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'mina' },
    obj(g, 'S', 'escada-desce'),
    ...objs(g, 'J', 'jaula', { texto: ['Uma gaiola do Cartel Ferrugem, vazia. No chão, penas de tuiuiú e uma etiqueta: "LOTE NINHAL — VENDA EXTERIOR".'] }),
    obj(g, 'V', 'vagonete', { texto: ['Um vagonete cheio de minério e, por baixo do minério, uma caixa de ovos. Alguém quis esconder carga roubada.'] }),
    { o: 'tambor', x: 9, y: 1 }, { o: 'caixote', x: 18, y: 7 }, { o: 'caixote', x: 18, y: 8 },
  ],
  warps: [
    ...saidas(g, 'D', 'B3', 37, 11, 's', 'porta'),
    ...saidas(g, 'S', 'B3-mina-2', 2, 1, 's', 'escada'),
  ],
  npcs: [
    duelista(g, '1', 'B3-M-1', 'capanga-m', 'l', 4, { se: '!flag:mina-ok' }),
    duelista(g, '2', 'B3-M-2', 'capanga-f', 'o', 4, { se: '!flag:mina-ok' }),
    duelista(g, '3', 'B3-M-3', 'cl-garimpeiro', 's', 3),
    gente(g, '4', 'b3-mina-vigia', 'npc-homem-2', 'Mineiro Galena', { dir: 'n', fala: ['Eu era vigia da mina. O Cartel me pôs para fora e trancou o portão de baixo.', 'A escada para a galeria funda fica no canto nordeste. O tenente está lá embaixo, com as gaiolas e o Topázio amarrado.'] }),
  ],
  itens: [item(g, 'k', 'pt-38'), item(g, 'i', 'pedra-lunar'), item(g, 'j', 'elixir-andiroba', 2)],
  habitats: [
    {
      // a Mina Velha não está na tabela 6.4: recebe criaturas de caverna e de rocha das zonas vizinhas (B-CV, B-CH, B-R2)
      metodo: 'caverna', taxa: 0.09,
      todos: [E(31, 50, 52, 22), E(166, 50, 52, 20), E(34, 50, 52, 16), E(42, 51, 53, 14), E(146, 51, 53, 14), E(164, 51, 53, 14)],
      camadas: [{ apos: 12, todos: [E(31, 52, 54, 20), E(166, 52, 54, 20), E(34, 52, 54, 16), E(42, 53, 55, 14), E(146, 53, 55, 16), E(164, 53, 55, 14)] }],
    },
    { metodo: 'rocha', todos: [E(166, 50, 52, 50), E(160, 51, 53, 30), E(164, 51, 53, 20)] },
  ],
};
export default zona;
