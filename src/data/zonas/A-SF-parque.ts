import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas } from './_a1-grade';

/**
 * A-SF-parque · Parque Safári do Buriti-Alto (spec 10A item 33). Quatro setores de 22 × 17 tiles, desenhados à mão
 * um a um e juntados em 44 × 34 (os retângulos estão em src/data/safari.ts → SETORES):
 *   Mata Ciliar (NO, setor 3) | Toca dos Troncos Ocos (NE, setor 4)
 *   Vereda dos Buritis (SO, setor 1) | Lagoa das Garças (SE, setor 2)
 * Os setores 2–4 ficam atrás de cercas em obra (portões) até o Seu Jatobá montá-los. NÃO há `habitats`: quem
 * sorteia os encontros da grama alta é a mecânica src/world/mecanicas/safari.ts (tabelas por setor e período),
 * que também conta os passos e encerra o passeio. Só se entra pela porteira (evento `safari-porteira`).
 */
const MATA = [
  'TTTTTTTTTTTTTTTTTTTTTT',
  'TT"""TT....TT""""TTTTf',
  'T""""""T..T"""""""TT.f',
  'T"""TT""....""TT"""..f',
  'TT""TT"".bb.."TT""...f',
  'T"""""""......"""".T.f',
  'T..T"""T..::..""T""..f',
  'T..TT""...::...""""..f',
  'T.....""..::........::',
  'TT""".....::..TT"""..f',
  'T""""TT...::..T""""".f',
  'T"""""T...::...""""..f',
  'TT"""""...::....TT...f',
  'T..TT""...::...."""..f',
  'T....""...::...""""..f',
  'TT.....,..::.....,...f',
  'ffffffffff:fffffffffff',
];
const TOCA = [
  'TTTTTTTTTTTTTTTTTTTTTT',
  '.."""TT""""T""""TTTTTT',
  '.""""""""""T""""""TTTT',
  '..""X"""...""""""""TTT',
  '..""""""...""X"""""".T',
  '...."""..TT.""""""...T',
  '.::::::::::::::"""...T',
  '.:"""""...""":"""X"..T',
  '::"""""T..""":"""""..T',
  '..""X""TT.."":"""""..T',
  '..""""""...""":""""".T',
  'T..""""....."":"""TT.T',
  'TT.."""X""...:""""""TT',
  'T...""""""...:"""...TT',
  'T....,.......:.....,TT',
  'TT...........:......TT',
  'fffffffffff:ffffffffff',
];
const VEREDA = [
  'T.........:..........f',
  'T.""""U...:..""""U...f',
  'T."""""...:.."""""...f',
  'TU""""""..:.."""""U..f',
  'T.""""....:...""""...f',
  'T.....U...:.....U....f',
  'T..""""...:..""""....f',
  'T."""""...:..""""""..f',
  'T..""""...::::::::::::',
  'TU.""""U..:...""""U..f',
  'T..""""...:...""""...f',
  'T....""...:....""....f',
  'T.U.......:......U...f',
  'T..""""...:..""""....f',
  'T.,"""""..:..""""".,.f',
  'T.........:..........f',
  'TTTTTTTTTTSSTTTTTTTTTT',
];
const LAGOA = [
  '...........:........TT',
  '.""""""....:."""""...T',
  '.""""".....:..""""...T',
  '.."""..~~~~~~~~..""..T',
  '.""""~~~~~~~~~~~~."".T',
  '.""".~~~~~~~~~~~~~"".T',
  '..""~~~~~~~~~~~~~~~..T',
  '..""~~~~~~~~~~~~~~~""T',
  '::..~~~~~~~~~~~~~~.""T',
  '.""".~~~~~~~~~~~~."".T',
  '.""""..~~~~~~~~~.."""T',
  '.."""""........."""".T',
  '.."""U""""...U"""""..T',
  '...""""""...""""""...T',
  '..,......,......,...TT',
  '....................TT',
  'TTTTTTTTTTTTTTTTTTTTTT',
];

const g = grade('A-SF-parque', [...MATA.map((l, i) => l + TOCA[i]), ...VEREDA.map((l, i) => l + LAGOA[i])], { X: '.', U: '.', S: ':' });
export const PARQUE_ENTRADA: [number, number] = [10, 32];
const obra = (x: number, y: number, n: number, onde: string) => ({ x, y, requer: `flag:safari-setor-${n}`, sprite: 'npc-homem-2', fala: `Cerca em obra! Aqui vai ser ${onde}. O Seu Jatobá ainda está montando: falta o material.` });
const zona: ZonaDef = {
  id: 'A-SF-parque', nome: 'Parque Safári', mapa: 'A', tipo: 'rota', tileset: 'cerrado', musica: 'safari', arena: 'cerrado', passo: 9,
  mapaChars: g.mapa,
  objetos: [
    ...g.todos('X').map(([x, y]) => ({ o: 'tronco-caido', x, y, texto: ['Um tronco oco trazido para a toca. Lá dentro, alguém dorme e ronca.'] })),
    ...g.todos('U').map(([x, y]) => ({ o: 'buriti', x, y })),
  ],
  warps: saidas(g, 'S', 'A-SF', 13, 3, 's'),
  portoes: [obra(21, 25, 2, 'a Lagoa das Garças'), obra(10, 16, 3, 'a Mata Ciliar'), obra(33, 16, 4, 'a Toca dos Troncos Ocos'), obra(21, 8, 4, 'a Toca dos Troncos Ocos')],
};
export default zona;
