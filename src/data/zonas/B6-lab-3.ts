/**
 * B6-lab-3 · Laboratório do Cartel, núcleo. Doutora Zinabre, os tenentes Lata e Rebite e a jaula reforçada da
 * Queixada-Caipora. Evento `b2-lab-final` → flag `laboratorio-ok`; a lendária 176 passa a vagar pelo mapa B.
 */
import type { ZonaDef } from '../../core/tipos';
import { Grade, npc } from './_b2-lib';

const g = new Grade(26, 18, '#');
g.r(2, 4, 6, 4, '.').r(8, 5, 4, 1, ':').r(12, 3, 12, 12, '.').r(14, 9, 8, 4, ',').r(16, 5, 5, 3, ':').p('x', 13, 13, 13, 14, 14, 14, 22, 13, 23, 14);

const zona: ZonaDef = {
  id: 'B6-lab-3', nome: 'Laboratório do Cartel — Núcleo', mapa: 'B', tipo: 'dungeon', tileset: 'industrial', musica: 'cartel-tema', arena: 'usina', passo: 13,
  mapaChars: g.fim(),
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cartel' },
    { o: 'escada-sobe', x: 3, y: 5 }, { o: 'tambor', x: 2, y: 7 }, { o: 'caixote', x: 7, y: 7 }, { o: 'painel', x: 5, y: 4, texto: ['NÍVEL 3 — NÚCLEO\nAcesso restrito à Doutora Zinabre e aos tenentes.\n"Quem deixar a jaula 176 abrir limpa o brejo com escova de dentes. — Cel. Garrote"'] },
    { o: 'computador-cartel', x: 12, y: 3, script: 'b2-lab-terminal' }, { o: 'tanque', x: 14, y: 3 }, { o: 'tanque', x: 22, y: 3 }, { o: 'tanque', x: 23, y: 3 },
    { o: 'jaula', x: 17, y: 3 }, { o: 'jaula', x: 19, y: 3 }, { o: 'jaula', x: 17, y: 4 }, { o: 'jaula', x: 18, y: 4 }, { o: 'jaula', x: 19, y: 4 },
    { o: 'gerador', x: 12, y: 8 }, { o: 'mesa-lab', x: 22, y: 8 }, { o: 'turbina', x: 22, y: 12 }, { o: 'tambor', x: 12, y: 12 },
  ],
  warps: [{ x: 3, y: 5, para: { zona: 'B6-lab-2', x: 16, y: 9, dir: 'o' }, tipo: 'escada' }],
  gatilhos: [{ x: 12, y: 5, script: 'b2-lab-final', se: '!flag:laboratorio-ok' }],
  npcs: [
    npc('zinabre', 'Doutora Zinabre', 'capanga-f', 15, 7, 'o', null, { script: 'b2-lab-final', se: '!flag:laboratorio-ok' }),
    npc('lata', 'Tenente Lata', 'tenente-lata', 17, 9, 'o', null, { script: 'b2-lab-final', se: '!flag:laboratorio-ok' }),
    npc('rebite', 'Tenente Rebite', 'tenente-rebite', 19, 9, 'o', null, { script: 'b2-lab-final', se: '!flag:laboratorio-ok' }),
    npc('caipora', 'Queixada-Caipora', 'c:queixada-caipora', 18, 3, 's', ['A criatura bufa atrás das grades. O concreto em volta dela está rachado, cheio de brotos verdes.'], { se: '!flag:laboratorio-ok' }),
  ],
  itens: [
    { x: 13, y: 10, item: 'folha-ancestral', flag: 'B6-lab-i7' },
    { x: 23, y: 6, item: 'pt-27', flag: 'B6-lab-i8' },
    { x: 6, y: 6, item: 'cha-guarana', oculto: true, flag: 'B6-lab-o4' },
  ],
};
export default zona;
