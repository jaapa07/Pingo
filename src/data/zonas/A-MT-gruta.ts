import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A-MT-gruta Gruta do Monte Tupã (escura: Lampião): nove salões em grade por dentro do monte. Entra-se pelo platô da
 * trepadeira (sul) e sai-se no platô do lago (norte). Os cristais das paredes cantam quando o Lampião passa.
 */
const g = grade('A-MT-gruta', 30, [
  '##########|##########|##########',
  '##########|###.U.####|##########',
  '###%%%%###|##%%%%%%##|###%%%%###',
  '##%%%%%%%%|%%%%%%%%%%|%%%%%%%%##',
  '##%%k%%%##|###%%%%###|##%%%%%%##',
  '###%%%%###|##########|###%%5%###',
  '####%%####|##########|####%%####',
  '###%%%%###|##%%%%%%##|###%%%%###',
  '##%%%%%%%%|%%%%%%%%%%|%%%%%%%%##',
  '##%%%%%%##|##%%%%%%##|##%%%%%%##',
  '###%%%%###|##########|###%%%%###',
  '####%%####|##########|####%%####',
  '###%%%%###|###%%%%###|###%%%%###',
  '##%%%%%%%%|%%%%%%%%%%|%%%%%%%%##',
  '##%%%m%%##|##%%%%%%##|##%%%%%%##',
  '###%%%%###|###%.%%###|###%%%%###',
  '##########|###.D.####|##########',
  '##########|##########|##########',
], { U: '+', D: '+', k: '%', m: '%', '5': '%' });
const zona: ZonaDef = {
  id: 'A-MT-gruta', nome: 'Gruta do Monte Tupã', mapa: 'A', tipo: 'caverna', tileset: 'caverna', musica: 'caverna', arena: 'caverna', escuro: true, passo: 16,
  mapaChars: g.mapa,
  warps: [
    { ...g.p('D'), para: { zona: 'A-MT', x: 24, y: 41, dir: 's' }, tipo: 'caverna' },
    { ...g.p('U'), para: { zona: 'A-MT', x: 24, y: 23, dir: 'n' }, tipo: 'caverna' },
  ],
  npcs: [
    { id: 'A-MT-5', sprite: 'cl-garimpeiro', ...g.p('5'), dir: 's', treinador: 'A-MT-5', visao: 2 },
    { id: 'mtg-cantor', sprite: 'cl-repentista', x: 15, y: 8, mov: 'olhar', fala: ['Shhh. Encoste o ouvido na parede. Os cristais daqui cantam em lá menor.', 'A saída de cima é ao norte do salão do meio. Siga o cristal mais desafinado.'] },
  ],
  itens: [
    { ...g.p('k'), item: 'pedra-lunar', flag: 'item:A-MT-gruta:noroeste' },
    { ...g.p('m'), item: 'pt-49', flag: 'item:A-MT-gruta:sudoeste' },
    { x: 25, y: 13, item: 'pepita', oculto: true, flag: 'item:A-MT-gruta:sudeste' },
  ],
  habitats: [{ metodo: 'caverna', taxa: 0.09, todos: [{ e: 166, nv: [57, 60], peso: 30 }, { e: 172, nv: [57, 60], peso: 25 }, { e: 164, nv: [57, 60], peso: 20 }, { e: 32, nv: [58, 61], peso: 15 }, { e: 162, nv: [57, 60], peso: 10 }] }],
};
export default zona;
