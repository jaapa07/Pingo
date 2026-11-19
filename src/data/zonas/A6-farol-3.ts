import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/** A6-farol-3 Farol, 3º andar: a Tainá espera na sala do meio (rival-4) antes da escada da lanterna. */
const g = grade('A6-farol-3', 16, [
  '################',
  '################',
  '#D......#......#',
  '#.......#..m...#',
  '#..6....#......#',
  '#.......###.####',
  '#..............#',
  '#......R.......#',
  '#...G..........#',
  '####.###########',
  '#..............#',
  '#.....7.......E#',
  '#..............#',
  '################',
]);
const zona: ZonaDef = {
  id: 'A6-farol-3', nome: 'Farol — 3º andar', mapa: 'A', tipo: 'dungeon', tileset: 'predio', musica: 'cartel-tema', arena: 'usina', passo: 5,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cais' },
    { o: 'escada-sobe', ...g.p('D') }, { o: 'escada-desce', ...g.p('E') },
    { o: 'barril', x: 14, y: 2 }, { o: 'caixote', x: 1, y: 12 }, { o: 'caixote', x: 14, y: 8 },
  ],
  warps: [
    { ...g.p('D'), para: { zona: 'A6-farol-4', x: 2, y: 2, dir: 'l' }, tipo: 'escada' },
    { ...g.p('E'), para: { zona: 'A6-farol-2', x: 13, y: 11, dir: 'o' }, tipo: 'escada' },
  ],
  gatilhos: [{ ...g.p('G'), script: 'a2-rival-4', se: '!flag:rival-4' }],
  npcs: [
    { id: 'taina', sprite: 'taina', ...g.p('R'), dir: 's', se: '!flag:rival-4', script: 'a2-rival-4' },
    { id: 'A6-FA-6', sprite: 'capanga-f', ...g.p('6'), dir: 's', mov: 'olhar', se: '!flag:farol-ok', treinador: 'A6-FA-6', visao: 3 },
    { id: 'A6-FA-7', sprite: 'capanga-m', ...g.p('7'), dir: 'l', se: '!flag:farol-ok', treinador: 'A6-FA-7', visao: 4 },
  ],
  itens: [{ ...g.p('m'), item: 'elixir-andiroba', flag: 'item:A6-farol-3:sala' }],
};
export default zona;
