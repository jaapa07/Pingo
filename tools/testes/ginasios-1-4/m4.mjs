import { resolver } from './sol4.mjs';
export const MAPA = [
  '###################',
  '#..b.....,........#',
  '#.................#',
  '#.Cbbbbbbbbbbbbbbb#',
  '#.....b.....b.....#',
  '#bbbb.b.bbb.b.bbb.#',
  '#.b.......b...b...#',
  '#.b.bbbbb.bbb.b.bb#',
  '#...b..C..b.......#',
  '#bb.b.bbbbb.bbbbb.#',
  '#...b.....b.....b.#',
  '#.bbbbb.b.b.bbb.b.#',
  '#.......b.....b..C#',
  '#bbbbbbbbbbbbbb.bb#',
  '#.................#',
  '#.....C...........#',
  '#.......+.........#',
  '#......+++........#',
  '########+##########',
];
const VASOS = [[6, 15], [17, 12], [7, 8], [2, 3]];
export const VINHAS = [
  { de: [1, 14], rota: 'llllllllllllll', atraso: 0 },
  { de: [13, 12], rota: 'oooo', atraso: 8 },
  { de: [17, 4], rota: 'oooossn'.slice(0, 6), atraso: 8 },
  { de: [3, 6], rota: 'lll', atraso: 6 },
];
const r = (a, b, vasos = VASOS, v = VINHAS) => resolver(MAPA, v, vasos, a, b);
const mostra = (nome, s) => console.log(nome, s ? s.passos + ' passos' : 'IMPOSSÍVEL');
mostra('entrada → líder (tudo)', r([8, 17], [8, 2]));
mostra('sem o vaso 2', r([8, 17], [8, 2], [VASOS[0], VASOS[1], VASOS[3]]));
mostra('sem o vaso 3', r([8, 17], [8, 2], [VASOS[0], VASOS[2], VASOS[3]]));
mostra('sem nenhum vaso', r([8, 17], [8, 2], []));
mostra('volta: líder → porta', r([8, 2], [8, 17]));
const s = r([8, 17], [8, 2]); console.log(s.caminho.join(' '));
