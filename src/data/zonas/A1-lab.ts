import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente } from './_a1-grade';

/** Laboratório da Profª Ipê Amarelo: a mesa das 3 cuias (examine de frente cada cuia), bancadas e o viveiro de pesquisa. */
const g = grade('A1-lab', [
  '################',
  '##W##K####W##Q##',
  '#EE.mm..ee..V.P#',
  '#..............#',
  '#......1.......#',
  '#.....ccc...2..#',
  '#..............#',
  '#.R..........R.#',
  '#mm..........ee#',
  '#......aa......#',
  '#......aa......#',
  '#######DD#######',
], { W: '#', K: '#', Q: '#', E: '.', m: '.', e: '.', V: '.', P: '.', c: '.', R: '.', a: ',', D: '+', '1': '.', '2': '.' });
const m = g.todos('m'), e = g.todos('e'), c = g.todos('c')[0];
/** colunas das três cuias na mesa (esquerda → direita: Mata, Brasa, Rio) — usadas pelo evento `lab-cuias` */
export const COLUNAS_CUIAS: [number, number, number] = [c[0], c[0] + 1, c[0] + 2];
const zona: ZonaDef = {
  id: 'A1-lab', nome: 'Laboratório da Profª Ipê', mapa: 'A', tipo: 'interior', tileset: 'predio', musica: 'laboratorio', arena: 'restinga', passo: 1,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'laboratorio' },
    ...g.todos('W').map(([x, y]) => ({ o: 'janela', x, y })), obj(g, 'K', 'poster-c'), obj(g, 'Q', 'quadro'),
    { o: 'estante-lab', x: g.todos('E')[0][0], y: g.todos('E')[0][1] },
    { o: 'mesa-lab', x: m[0][0], y: m[0][1], texto: ['No microscópio, uma escama de Piabinha brilha como moeda nova.'] },
    { o: 'estante-lab', x: e[0][0], y: e[0][1], texto: ['Pastas e mais pastas: "Migração dos Pipirins", "Por que o Gambazinho finge de morto", "Receita de bolo de fubá".'] },
    obj(g, 'V', 'viveiro', { texto: ['O terminal de pesquisa da professora. Na tela: "Diário de Campo — 180 espécies previstas, 12 registradas. Socorro."'] }),
    obj(g, 'P', 'planta-b'),
    { o: 'mesa-cuias', x: c[0], y: c[1], script: 'lab-cuias' },
    ...g.todos('R').map(([x, y]) => ({ o: 'planta', x, y })),
    { o: 'mesa-lab', x: m[2][0], y: m[2][1], texto: ['Frascos com sementes de ipê. Cada um tem a data e um desenho de carinha feliz.'] },
    { o: 'estante-lab', x: e[2][0], y: e[2][1] },
    { o: 'tapete-a', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
  ],
  warps: saidas(g, 'D', 'A1', 26, 15, 's', 'porta'),
  npcs: [
    gente(g, '1', 'prof', 'prof-ipe', 'Profª Ipê', { script: 'prof-ipe' }),
    gente(g, '2', 'taina', 'taina', '{RIVAL}', { dir: 'o', se: 'flag:ovo-no-aroeira&!flag:rival-1', script: 'rival-1' }),
    { id: 'taina-depois', sprite: 'taina', x: g.p('2')[0], y: g.p('2')[1], dir: 'o', se: 'flag:rival-1&!flag:ovo-entregue', script: 'rival-1' },
  ],
  gatilhos: [{ x: 6, y: 9, w: 4, h: 2, script: 'rival-1', se: 'flag:ovo-no-aroeira&!flag:ovo-entregue' }],
};
export default zona;
