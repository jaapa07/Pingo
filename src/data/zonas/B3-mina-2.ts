import type { ZonaDef } from '../../core/tipos';
import { grade, obj, objs, saidas, duelista, gente, item, E } from './_b1-lib';

/**
 * B3-mina-2 · Mina Velha, galeria funda. O tenente Rebite (o mesmo do Farol) guarda as gaiolas do ninhal e o Garimpeiro
 * Topázio amarrado. Evento `b1-mina` → `mina-ok`: as criaturas voltam para casa, o Topázio reabre o ginásio da Pedra.
 */
const g = grade('B3-mina-2', [
  '##############################',
  '#S.....%%%%%.......%%%%%.....#',
  '#......%%%%%.......%%%%%.....#',
  '#..::::::::::::::::::::::::..#',
  '#..:....####.....####.....:..#',
  '#..:....#k.#..1..#..#.....:..#',
  '#..:....#..#.....#r.#.....:..#',
  '#..:....##r#.....####.....:..#',
  '#..:......................:..#',
  '#%%:%%%%..............%%%%:%%#',
  '#%%:%%%%..######.##...%%%%:%%#',
  '#..:......#........#......:..#',
  '#..::::::::..J.J.J.::::::::..#',
  '#.........#........#.........#',
  '#.2.......#..YzR...#.......3.#',
  '#.........#........#.........#',
  '#.........##########.........#',
  '#..%%%%......................#',
  '#..%%%%.........j........%%%.#',
  '##############################',
], { S: '.', J: '.', Y: '.', R: '.', z: '.', k: '.', j: '.', '1': '.', '2': '.', '3': '.' });
const zona: ZonaDef = {
  id: 'B3-mina-2', nome: 'Mina Velha — Galeria Funda', mapa: 'B', tipo: 'dungeon', tileset: 'industrial', musica: 'caverna', arena: 'caverna', passo: 10,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'mina' },
    obj(g, 'S', 'escada-sobe'),
    ...objs(g, 'J', 'jaula', { script: 'b1-mina-jaula' }),
    { o: 'vagonete', x: 5, y: 15 }, { o: 'vagonete', x: 24, y: 15 }, { o: 'tambor', x: 28, y: 1 }, { o: 'computador-cartel', x: 21, y: 11, texto: ['Planilha do Cartel: "Ovos de tuiuiú: 40. Filhotes de arara: 12. Destino: porto do exterior. Responsável: Ten. Rebite."'] },
  ],
  warps: saidas(g, 'S', 'B3-mina-1', 27, 2, 's', 'escada'),
  npcs: [
    duelista(g, '1', 'B3-M-4', 'capanga-m', 's', 3, { se: '!flag:mina-ok' }),
    duelista(g, '2', 'B3-M-5', 'capanga-f', 'l', 4, { se: '!flag:mina-ok' }),
    duelista(g, '3', 'B3-M-6', 'capanga-m', 'o', 4, { se: '!flag:mina-ok' }),
    gente(g, 'R', 'rebite', 'tenente-rebite', 'Tenente Rebite', { dir: 'n', se: '!flag:mina-ok', script: 'b1-mina' }),
    gente(g, 'Y', 'topazio-preso', 'lider-09', 'Garimpeiro Topázio', { dir: 'n', se: '!flag:mina-ok', script: 'b1-mina' }),
  ],
  gatilhos: [{ x: 11, y: 12, w: 1, h: 1, script: 'b1-mina', se: '!flag:mina-ok' }, { x: 18, y: 12, w: 1, h: 1, script: 'b1-mina', se: '!flag:mina-ok' }, { x: 16, y: 11, w: 1, h: 1, script: 'b1-mina', se: '!flag:mina-ok' }],
  itens: [item(g, 'k', 'pt-47'), item(g, 'z', 'cuia-ouro', 3), item(g, 'j', 'garrafada', 3)],
  habitats: [
    {
      metodo: 'caverna', taxa: 0.09,
      todos: [E(31, 51, 53, 20), E(166, 51, 53, 18), E(146, 51, 53, 18), E(42, 51, 53, 16), E(164, 51, 53, 14), E(34, 51, 53, 14)],
      camadas: [{ apos: 12, todos: [E(31, 53, 55, 18), E(166, 53, 55, 18), E(146, 53, 55, 20), E(42, 53, 55, 16), E(164, 53, 55, 14), E(34, 53, 55, 14)] }],
    },
    { metodo: 'rocha', todos: [E(166, 51, 53, 60), E(160, 51, 53, 40)] },
  ],
};
export default zona;
