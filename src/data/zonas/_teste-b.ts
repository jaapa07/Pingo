/** Zona de TESTE do motor de mundo: fundo submerso e escuro, alcançado pelo ponto de mergulho de `_teste-a`. */
import type { ZonaDef } from '../../core/tipos';

const zona: ZonaDef = {
  id: '_teste-b', nome: 'Poço de Provas', mapa: 'A', tipo: 'agua', tileset: 'submerso', musica: 'submerso', arena: 'submerso', passo: 1,
  submerso: true, escuro: true,
  mapaChars: [
    '################',
    '#..............#',
    '#..%%%%........#',
    '#..%%%%...##...#',
    '#.........##...#',
    '#....d.........#',
    '#..............#',
    '#......,,......#',
    '#..............#',
    '################',
  ],
  warps: [{ x: 5, y: 5, para: { zona: '_teste-a', x: 8, y: 16, dir: 's' } }],
  itens: [{ x: 8, y: 7, item: 'perola', oculto: true, flag: 'teste-item-3' }],
  habitats: [{ metodo: 'mergulho', taxa: 1, todos: [{ e: 13, nv: [25, 27], peso: 1 }] }],
};
export default zona;
