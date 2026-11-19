import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A6-farol-2 Farol, 2º andar: duas metades sem passagem entre si. A oeste (escada A) ficam a alavanca da grade e o
 * buraco do assoalho que cai no depósito do térreo; a leste (escada B, depois da grade) sobe-se para o 3º andar.
 */
const g = grade('A6-farol-2', 16, [
  '################',
  '################',
  '#A.....##.....B#',
  '#......##......#',
  '#...3..##......#',
  '#......##..4...#',
  '###.#####......#',
  '#......##......#',
  '#.QQ...##......#',
  '#.....o##...j..#',
  '#......##......#',
  '#L...5.##.....E#',
  '#......##......#',
  '################',
]);
const zona: ZonaDef = {
  id: 'A6-farol-2', nome: 'Farol — 2º andar', mapa: 'A', tipo: 'dungeon', tileset: 'predio', musica: 'cartel-tema', arena: 'usina', passo: 5,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cais' },
    { o: 'escada-desce', ...g.p('A') }, { o: 'escada-desce', ...g.p('B') }, { o: 'escada-sobe', ...g.p('E') },
    { o: 'alavanca', ...g.p('L'), script: 'a2-farol-alavanca' },
    ...g.todos('Q').map((p) => ({ o: 'caixote', ...p })), { o: 'barril', x: 9, y: 12 },
  ],
  warps: [
    { ...g.p('A'), para: { zona: 'A6-farol-1', x: 2, y: 2, dir: 'l' }, tipo: 'escada' },
    { ...g.p('B'), para: { zona: 'A6-farol-1', x: 13, y: 2, dir: 'o' }, tipo: 'escada' },
    { ...g.p('E'), para: { zona: 'A6-farol-3', x: 13, y: 11, dir: 'o' }, tipo: 'escada' },
    { x: 6, y: 9, para: { zona: 'A6-farol-1', x: 8, y: 3, dir: 's' }, tipo: 'buraco' },
  ],
  npcs: [
    { id: 'A6-FA-3', sprite: 'capanga-f', ...g.p('3'), dir: 'o', se: '!flag:farol-ok', treinador: 'A6-FA-3', visao: 3 },
    { id: 'A6-FA-4', sprite: 'capanga-m', ...g.p('4'), dir: 'l', se: '!flag:farol-ok', treinador: 'A6-FA-4', visao: 3 },
    { id: 'A6-FA-5', sprite: 'capanga-m', ...g.p('5'), dir: 'o', se: '!flag:farol-ok', treinador: 'A6-FA-5', visao: 3 },
  ],
  itens: [{ ...g.p('j'), item: 'garrafada', qtd: 2, flag: 'item:A6-farol-2:leste' }],
};
export default zona;
