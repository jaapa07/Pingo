import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A6-farol-1 Farol, térreo. Escada oeste livre; a escada leste fica atrás da grade (alavanca no 2º andar).
 * O depósito do meio só se alcança caindo pelo buraco do 2º andar; sai-se pulando a mureta.
 */
const g = grade('A6-farol-1', 16, [
  '################',
  '################',
  '#A....#...#...B#',
  '#.....#...#....#',
  '#.1...#.k.#....#',
  '#.....##v####J##',
  '###.###........#',
  '#..............#',
  '#..QQ.....2....#',
  '#..............#',
  '#.n....++....i.#',
  '#......++......#',
  '#......++......#',
  '#######SS#######',
], { S: '+', J: '+' });
const zona: ZonaDef = {
  id: 'A6-farol-1', nome: 'Farol — Térreo', mapa: 'A', tipo: 'dungeon', tileset: 'predio', musica: 'cartel-tema', arena: 'usina', passo: 5,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cais' },
    { o: 'escada-sobe', ...g.p('A') }, { o: 'escada-sobe', ...g.p('B') },
    ...g.todos('Q').map((p) => ({ o: 'caixote', ...p })), { o: 'barril', x: 14, y: 12 }, { o: 'ancora', x: 1, y: 12 },
  ],
  warps: [
    ...g.todos('S').map((p) => ({ ...p, para: { zona: 'A6', x: 37, y: 5, dir: 's' as const }, tipo: 'porta' as const })),
    { ...g.p('A'), para: { zona: 'A6-farol-2', x: 2, y: 2, dir: 'l' }, tipo: 'escada' },
    { ...g.p('B'), para: { zona: 'A6-farol-2', x: 13, y: 2, dir: 'o' }, tipo: 'escada' },
  ],
  portoes: [{ ...g.p('J'), requer: 'flag:farol-grade', fala: 'Uma grade de ferro desce do teto e fecha a passagem.\nO cabo dela sobe para o andar de cima.' }],
  npcs: [
    { id: 'A6-FA-1', sprite: 'capanga-m', ...g.p('1'), dir: 'l', se: '!flag:farol-ok', treinador: 'A6-FA-1', visao: 3 },
    { id: 'A6-FA-2', sprite: 'capanga-f', ...g.p('2'), dir: 'o', mov: 'olhar', se: '!flag:farol-ok', treinador: 'A6-FA-2', visao: 4 },
    { id: 'f1-pescador', sprite: 'cl-pescador', ...g.p('n'), se: '!flag:farol-ok', fala: ['Entrei para reclamar da luz e fiquei preso entre dois capangas. Estou fingindo que sou uma âncora.', 'A escada do lado de lá tem grade. O Volta abria com uma alavanca no andar de cima.'] },
    { id: 'f1-pescador-2', sprite: 'cl-pescador', ...g.p('n'), se: 'flag:farol-ok', fala: ['Agora que a luz voltou, eu podia ir embora. Mas aqui dentro é fresquinho.'] },
  ],
  itens: [
    { ...g.p('k'), item: 'pt-19', flag: 'item:A6-farol-1:deposito' },
    { ...g.p('i'), item: 'pomada-copaiba', qtd: 2, flag: 'item:A6-farol-1:canto' },
  ],
};
export default zona;
