import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A-US-1 Usina Velha, térreo. Salão dos geradores; a sala oeste desce ao porão (A-US-3) e guarda a alavanca
 * que solta a grade da sala leste (escada para as passarelas, A-US-2). Os dois depósitos fechados só se
 * alcançam caindo pelos buracos das passarelas; sai-se deles pulando a mureta.
 */
const g = grade('A-US-1', 30, [
  '##########|##########|##########',
  '##########|##########|##########',
  '#A...L#...|..........|...#....B#',
  '#.....#..%|%%%....%%%|...#.2...#',
  '#.1...#..%|%%%....%%%|...#.....#',
  '#.....#...|..........|...#.....#',
  '###.###...|...xx.....|...###J###',
  '#.........|...xx.....|.........#',
  '#..GH.....|..........|....GH...#',
  '#......%%%|..........|%%%......#',
  '#......%%%|...::.....|%%%......#',
  '#.........|...::.....|.........#',
  '####...###|###.::.###|###...####',
  '#k.#......|...::.....|.....#..m#',
  '#..>..3...|...::.....|..4..<...#',
  '#..#......|...::.....|.....#...#',
  '####......|...::.....|.....#####',
  '#.........|...::.....|.........#',
  '#..n......|...::.....|......i..#',
  '#.Q.......|...+++....|....Q....#',
  '#.........|...+++....|.........#',
  '##########|#####S####|##########',
], { S: '+', J: '+' });

const zona: ZonaDef = {
  id: 'A-US-1', nome: 'Usina Velha — Salão dos Geradores', mapa: 'A', tipo: 'dungeon', tileset: 'industrial', musica: 'cartel-tema', arena: 'usina', passo: 3,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'usina' },
    { o: 'escada-desce', ...g.p('A') }, { o: 'escada-sobe', ...g.p('B') },
    { o: 'alavanca', ...g.p('L'), script: 'a2-usina-alavanca' },
    ...g.todos('G').map((p) => ({ o: 'gerador', ...p, texto: 'Um gerador parado. Tem um ninho de grilo dentro da bobina.' })),
    ...g.todos('Q').map((p) => ({ o: 'tambor', ...p })),
    { o: 'tambor', x: 28, y: 20 }, { o: 'caixote', x: 1, y: 17 }, { o: 'caixote', x: 28, y: 17 },
  ],
  warps: [
    { ...g.p('S'), para: { zona: 'A-R4', x: 70, y: 12, dir: 's' }, tipo: 'porta' },
    { ...g.p('A'), para: { zona: 'A-US-3', x: 2, y: 2, dir: 'l' }, tipo: 'escada' },
    { ...g.p('B'), para: { zona: 'A-US-2', x: 27, y: 2, dir: 'o' }, tipo: 'escada' },
  ],
  portoes: [{ ...g.p('J'), requer: 'flag:usina-grade', fala: 'Uma grade de ferro fecha a passagem.\nDeve haver uma alavanca em algum canto desta usina.' }],
  npcs: [
    { id: 'c1', sprite: 'capanga-m', ...g.p('1'), dir: 'l', se: '!flag:usina-ok', treinador: 'A-US-1', visao: 3 },
    { id: 'c2', sprite: 'capanga-f', ...g.p('2'), dir: 'l', se: '!flag:usina-ok', treinador: 'A-US-2', visao: 3 },
    { id: 'c3', sprite: 'capanga-m', ...g.p('3'), dir: 'l', mov: 'olhar', se: '!flag:usina-ok', treinador: 'A-US-3', visao: 4 },
    { id: 'c4', sprite: 'capanga-f', ...g.p('4'), dir: 'o', se: '!flag:usina-ok', treinador: 'A-US-4', visao: 4 },
    { id: 'zelador', sprite: 'npc-idoso', ...g.p('n'), se: '!flag:usina-ok', fala: ['Psiu! Sou o zelador. Estou fingindo que sou um tambor de óleo.', 'A chave geral fica no porão, depois do canal das turbinas. Sem ela a sala de controle não abre.', 'E a grade da escada de cima solta numa alavanca na salinha do fundo. Eu que lubrifico.'] },
    { id: 'zelador-2', sprite: 'npc-idoso', ...g.p('n'), se: 'flag:usina-ok', fala: ['Trinta anos varrendo esta usina e nunca vi tanta ferrugem ir embora de uma vez só.', 'Os grilos voltaram a cantar nos geradores. Dá até pena de ligar.'] },
    { id: 'operaria', sprite: 'npc-mulher-2', x: 20, y: 8, mov: 'vagar', se: 'flag:usina-ok', fala: ['Geradores um e dois girando redondo. O cais e a estação de Porto Sereia já podem puxar energia!', 'Se achar um Vagalampo dormindo no painel, não acorde. Ele é o nosso fusível reserva.'] },
  ],
  itens: [
    { ...g.p('k'), item: 'cuia-trancada', qtd: 3, flag: 'item:A-US-1:deposito-o' },
    { ...g.p('m'), item: 'pt-17', flag: 'item:A-US-1:deposito-l' },
    { ...g.p('i'), item: 'cha-cidreira', qtd: 2, flag: 'item:A-US-1:salao' },
    { x: 22, y: 3, item: 'unguento', oculto: true, flag: 'item:A-US-1:entulho' },
  ],
  habitats: [{
    metodo: 'caverna', taxa: 0.12,
    todos: [{ e: 141, nv: [20, 23], peso: 45 }, { e: 28, nv: [20, 23], peso: 35 }, { e: 63, nv: [21, 23], peso: 10 }, { e: 30, nv: [20, 21], peso: 10 }],
    camadas: [{ apos: 7, todos: [{ e: 29, nv: [36, 38], peso: 40 }, { e: 142, nv: [36, 38], peso: 35 }, { e: 141, nv: [24, 25], peso: 15 }, { e: 64, nv: [37, 39], peso: 10 }] }],
  }],
};
export default zona;
