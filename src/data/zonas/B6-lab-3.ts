/**
 * B6-lab-3 · Laboratório do Cartel, núcleo. A Doutora Zinabre (cientista do Cartel), o tenente Lata e a jaula
 * reforçada da Queixada-Caipora. Ao pisar no corredor do núcleo começa `b2-lab-final` → flag `laboratorio-ok`
 * (spec 4.5: 5º evento do Cartel, antes da insígnia 13).
 */
import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, saidas, gente, item } from './_b2s-lib';

const p = new Pincel(26, 18, '#');
p.r(2, 4, 6, 4, '.').r(8, 6, 4, 1, ':').r(12, 3, 12, 12, '.').r(14, 9, 8, 4, ',').r(16, 5, 5, 3, ':').p('x', 13, 13, 13, 14, 14, 14, 22, 13, 23, 14, 2, 7);
p.r(12, 3, 3, 1, '.').t(4, 5, 'S');
p.t(2, 6, 'A').t(7, 7, 'B').t(5, 4, 'P').t(12, 3, 'K').t(14, 3, 'Q').t(22, 3, 'Q').t(23, 3, 'Q').t(17, 3, 'J').t(19, 3, 'J').t(17, 4, 'J').t(19, 4, 'J').t(12, 8, 'G').t(22, 8, 'W').t(22, 12, 'U').t(12, 12, 'A');
p.t(15, 7, '1').t(17, 9, '2').t(18, 3, '3').t(11, 6, 'Z');
p.t(13, 10, 'a').t(23, 6, 'h').t(6, 6, 'i');
const g = grade('B6-lab-3', p.fim(), { S: '.', A: '.', B: '.', P: '.', K: '.', Q: '.', J: '.', G: '.', W: '.', U: '.', '1': ':', '2': ',', '3': '.', Z: ':', a: '.', h: '.', i: '.' });
const zona: ZonaDef = {
  id: 'B6-lab-3', nome: 'Laboratório do Cartel — Núcleo', mapa: 'B', tipo: 'dungeon', tileset: 'industrial', musica: 'cartel-tema', arena: 'usina', passo: 13,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cartel' },
    obj(g, 'S', 'escada-sobe'), ...objs(g, 'A', 'tambor'), obj(g, 'B', 'caixote'),
    obj(g, 'P', 'painel', { texto: ['NÍVEL 3 — NÚCLEO\nAcesso restrito à Doutora Zinabre e ao tenente Lata.\n"Quem deixar a jaula 176 abrir limpa o brejo com escova de dentes. — Cel. Garrote"'] }),
    obj(g, 'K', 'computador-cartel', { script: 'b2-lab-terminal' }), ...objs(g, 'Q', 'tanque'), ...objs(g, 'J', 'jaula'),
    obj(g, 'G', 'gerador'), obj(g, 'W', 'mesa-lab', { texto: ['Seringas de sedativo vazias, uma atrás da outra. Ao lado, um broto de ipê nascendo de dentro de uma delas.'] }), obj(g, 'U', 'turbina'),
  ],
  warps: saidas(g, 'S', 'B6-lab-2', 17, 10, 's', 'escada'),
  gatilhos: [{ x: g.p('Z')[0], y: g.p('Z')[1], script: 'b2-lab-final', se: '!flag:laboratorio-ok' }],
  npcs: [
    gente(g, '1', 'zinabre', 'capanga-f', 'Doutora Zinabre', { dir: 'o', script: 'b2-lab-final', se: '!flag:laboratorio-ok' }),
    gente(g, '2', 'lata', 'tenente-lata', 'Tenente Lata', { dir: 'o', script: 'b2-lab-final', se: '!flag:laboratorio-ok' }),
    gente(g, '3', 'caipora', 'c:queixada-caipora', 'Queixada-Caipora', { dir: 's', se: '!flag:laboratorio-ok', fala: ['A criatura bufa atrás das grades. O concreto em volta dela está rachado, cheio de brotos verdes.'] }),
  ],
  itens: [item(g, 'a', 'folha-ancestral'), item(g, 'h', 'pt-27'), item(g, 'i', 'cha-guarana', 1, true)],
};
export default zona;
