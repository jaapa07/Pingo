import type { ZonaDef } from '../../core/tipos';
import { grade, saidas, item, E } from './_b2n-lib';

/**
 * PP-gruta · Gruta do Pico (escura: Lampião). Entra-se pela boca do leste da Subida (PP (36, 18)); a fenda do fundo sai
 * no Beiral Escondido (PP (37, 23)), a prateleira que se vê da trilha e não se alcança por fora.
 * 6.4 (PP, C): Vampirinha (r). Selvagens 62–65.
 */
const g = grade('PP-gruta', [
  '########################',
  '###################.####',
  '##.......#########.S.###',
  '#..%%%%...###..%%%...###',
  '#..%%%%%...#..%%%%%..###',
  '#...%%%.......%%%%...k##',
  '##....###..........#####',
  '###...####..%%%%...#####',
  '#.....###..%%%%%%...####',
  '#.%%%......%%%%%%....###',
  '#.%%%%..##...%%%...j..##',
  '#..%%...##..........####',
  '##.....###.%%%..##..####',
  '###.....#..%%%.......###',
  '####.DD.##....i....#####',
  '########################',
], { S: '.', D: '.', k: ',', j: '.', i: '.' });
const zona: ZonaDef = {
  id: 'PP-gruta', nome: 'Gruta do Pico', mapa: 'PP', tipo: 'caverna', tileset: 'caverna', musica: 'caverna', arena: 'caverna', passo: 17, escuro: true,
  mapaChars: g.mapa,
  warps: [
    ...saidas(g, 'D', 'PP', 36, 19, 's', 'caverna'),
    ...saidas(g, 'S', 'PP', 36, 25, 's', 'caverna'),
  ],
  itens: [item(g, 'k', 'pedra-lunar'), item(g, 'j', 'elixir-andiroba', 2, true), item(g, 'i', 'cuia-noturna', 3)],
  habitats: [{
    metodo: 'caverna', taxa: 0.1,
    todos: [E(31, 62, 64, 24), E(172, 62, 64, 20), E(166, 62, 64, 18), E(162, 62, 64, 16), E(94, 62, 64, 12), E(32, 63, 65, 10)],
  }],
};
export default zona;
