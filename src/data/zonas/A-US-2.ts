import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A-US-2 Usina Velha, passarelas e sala de controle. As passarelas de grade passam sobre o vão do salão;
 * dois ramais terminam em buracos que caem nos depósitos do térreo. A porta da sala de controle só destrava
 * com a chave geral do porão ligada (`usina-energia`). Lá dentro: tenente Lata.
 */
const g = grade('A-US-2', 30, [
  '##########|##########|##########',
  '##########|##########|##########',
  '#.........|.....#....|...#....B#',
  '#.PH..L..P|H....#....|...#.....#',
  '#.........|.....#..5.|...#.....#',
  '#........z|.....E....|...#.....#',
  '##########|######:###|#####:####',
  '#         |      :   |     :   #',
  '#         |      :   |     :   #',
  '#   ::::::|:::::::   |     :   #',
  '#  4:     |          |     :   #',
  '#   :     |          |     :3  #',
  '#   ::::::|::a     n:|::::::   #',
  '#   :     |          |     :   #',
  '#   :     |i         |     :   #',
  '#   :     |:         |     :   #',
  '#   ::::::|::::::::::|::::::   #',
  '#         |          |         #',
  '##########|##########|##########',
], { E: '+', a: 'o', n: 'o', i: ':', '3': ':', '4': ':' });

const zona: ZonaDef = {
  id: 'A-US-2', nome: 'Usina Velha — Passarelas', mapa: 'A', tipo: 'dungeon', tileset: 'industrial', musica: 'cartel-tema', arena: 'usina', passo: 3,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'usina' },
    { o: 'escada-desce', ...g.p('B') },
    ...g.todos('P').map((p) => ({ o: 'painel', ...p, texto: 'Painel de controle da Usina. Um bilhete colado: "NÃO APERTAR O VERMELHO. O VERMELHO É O DO CAFÉ."' })),
    { o: 'tambor', x: 22, y: 2 }, { o: 'caixote', x: 17, y: 2 },
  ],
  warps: [
    { ...g.p('B'), para: { zona: 'A-US-1', x: 27, y: 2, dir: 'o' }, tipo: 'escada' },
    { ...g.p('a'), para: { zona: 'A-US-1', x: 2, y: 14, dir: 's' }, tipo: 'buraco' },
    { ...g.p('n'), para: { zona: 'A-US-1', x: 27, y: 14, dir: 's' }, tipo: 'buraco' },
  ],
  portoes: [{ ...g.p('E'), requer: 'flag:usina-energia', fala: 'A porta da sala de controle é elétrica e está sem força.\nA chave geral da Usina fica no porão.' }],
  gatilhos: [{ ...g.d('E', -1, 0), script: 'a2-usina-lata', se: '!flag:usina-ok' }],
  npcs: [
    { id: 'lata', sprite: 'tenente-lata', ...g.p('L'), dir: 's', se: '!flag:usina-ok', script: 'a2-usina-lata' },
    { id: 'c5', sprite: 'capanga-m', ...g.p('5'), dir: 'o', se: '!flag:usina-ok', treinador: 'A-US-5', visao: 3 },
    { id: 'c6', sprite: 'capanga-f', ...g.p('3'), dir: 'o', se: '!flag:usina-ok', treinador: 'A-US-6', visao: 1 },
    { id: 'c7', sprite: 'capanga-m', ...g.p('4'), dir: 'l', se: '!flag:usina-ok', treinador: 'A-US-7', visao: 1 },
    { id: 'engenheira', sprite: 'npc-mulher-4', ...g.p('z'), dir: 'o', se: 'flag:usina-ok', fala: ['Sou a engenheira-chefe. Passei três dias trancada no almoxarifado comendo biscoito de polvilho.', 'A Usina está de volta: o guindaste do cais já sobe e desce. O trem? Esse só leva Campeão da Liga, ordem da linha da serra.'] },
  ],
  itens: [{ ...g.p('i'), item: 'garrafada', flag: 'item:A-US-2:passarela' }],
  habitats: [{ metodo: 'caverna', taxa: 0.1, todos: [{ e: 28, nv: [21, 24], peso: 45 }, { e: 141, nv: [20, 23], peso: 40 }, { e: 63, nv: [21, 24], peso: 15 }], camadas: [{ apos: 7, todos: [{ e: 29, nv: [36, 38], peso: 45 }, { e: 142, nv: [36, 38], peso: 35 }, { e: 64, nv: [37, 39], peso: 20 }] }] }],
};
export default zona;
