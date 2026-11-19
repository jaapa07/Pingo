import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/** A6-farol-4 Sala da lanterna: tenente Rebite, as jaulas das criaturas de Trovão e o Faroleiro Volta amarrado. */
const g = grade('A6-farol-4', 14, [
  '##############',
  '##############',
  '#D...JJ.JJ...#',
  '#..........V.#',
  '#.....L......#',
  '#............#',
  '#...8....9...#',
  '#GGGGGGGGGGGG#',
  '#............#',
  '#.....W......#',
  '##############',
]);
const gs = g.todos('G');
const zona: ZonaDef = {
  id: 'A6-farol-4', nome: 'Farol — Sala da Lanterna', mapa: 'A', tipo: 'dungeon', tileset: 'predio', musica: 'cartel-tema', arena: 'usina', passo: 5,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cais' },
    { o: 'escada-desce', ...g.p('D') },
    ...g.todos('J').map((p) => ({ o: 'jaula', ...p, script: 'a2-farol-jaula' })),
    { o: 'tanque', ...g.p('W'), script: 'a2-farol-faisca' },
  ],
  warps: [{ ...g.p('D'), para: { zona: 'A6-farol-3', x: 2, y: 2, dir: 'l' }, tipo: 'escada' }],
  gatilhos: [{ x: gs[0].x, y: gs[0].y, w: gs.length, h: 1, script: 'a2-farol-rebite', se: '!flag:farol-ok' }],
  npcs: [
    { id: 'rebite', sprite: 'tenente-rebite', ...g.p('L'), dir: 's', se: '!flag:farol-ok', script: 'a2-farol-rebite' },
    { id: 'A6-FA-8', sprite: 'capanga-m', ...g.p('8'), dir: 's', se: '!flag:farol-ok', treinador: 'A6-FA-8', visao: 1 },
    { id: 'A6-FA-9', sprite: 'capanga-f', ...g.p('9'), dir: 's', se: '!flag:farol-ok', treinador: 'A6-FA-9', visao: 1 },
    { id: 'volta', sprite: 'lider-05', ...g.p('V'), dir: 's', se: '!flag:farol-ok', script: 'a2-farol-volta' },
    { id: 'volta-2', sprite: 'lider-05', ...g.p('V'), dir: 's', se: 'flag:farol-ok&!flag:farol-remedio', script: 'a2-farol-volta' },
  ],
};
export default zona;
