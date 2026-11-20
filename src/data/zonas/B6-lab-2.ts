/**
 * B6-lab-2 · Laboratório do Cartel, 2º subsolo (jaulas e destilaria).
 * Quebra-cabeça: a comporta do núcleo (centro) só abre com as DUAS alavancas — a da ala das jaulas (sudoeste,
 * `b2-lab-alavanca-a`) e a da destilaria (nordeste, `b2-lab-alavanca-b`). Na cela das jaulas está o Doutor Peçonha,
 * que cura a equipe com antídotos (`b2-peconha-cela`).
 */
import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, saidas, gente, duelista, item } from './_b2s-lib';

const p = new Pincel(32, 24, '#');
p.r(2, 3, 8, 4, '.').r(10, 4, 12, 1, ':').r(22, 3, 8, 6, '.').r(4, 7, 2, 5, ':').r(2, 12, 10, 8, '.').r(25, 9, 2, 4, ':').r(20, 13, 10, 7, '.');
p.r(12, 16, 8, 1, ':').r(13, 8, 6, 5, '.').r(15, 13, 2, 3, ':').r(14, 10, 4, 1, ',');
p.p('x', 23, 7, 24, 7, 24, 8, 28, 16, 28, 17, 27, 17, 7, 18, 8, 18, 3, 6).r(21, 15, 5, 1, ':').r(21, 17, 5, 1, ':').r(3, 16, 4, 1, ',');
p.t(3, 4, 'S').t(17, 9, 'Z');
p.t(8, 3, 'A').t(9, 3, 'B').t(5, 3, 'P').t(22, 3, 'Q').t(24, 3, 'Q').t(26, 5, 'W').t(28, 3, 'L');
p.t(2, 12, 'J').t(4, 12, 'K').t(6, 12, 'Y').t(8, 12, 'U').t(8, 13, 'V').t(8, 14, '9').t(9, 15, 'U').t(10, 15, 'U').t(11, 15, 'U').t(2, 19, 'N').t(11, 19, 'A');
p.t(20, 13, 'G').t(23, 13, 'Q').t(27, 13, 'R').t(29, 19, 'B').t(20, 19, 'H').t(13, 8, 'Q').t(18, 12, 'A');
p.t(7, 5, '1').t(27, 7, '2').t(5, 17, '3').t(24, 16, '4').t(15, 11, '5');
p.t(29, 8, 'a').t(6, 15, 'h').t(21, 19, 'i').t(3, 6, 'j').t(10, 13, 'k');
const g = grade('B6-lab-2', p.fim(), {
  S: '.', Z: '.', A: '.', B: '.', P: '.', Q: '.', W: '.', L: '.', J: '.', K: '.', Y: '.', U: '.', V: '.', N: '.', G: '.', R: '.', H: '.',
  '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '9': '.', a: '.', h: '.', i: '.', j: 'x', k: '.',
});
const zona: ZonaDef = {
  id: 'B6-lab-2', nome: 'Laboratório do Cartel — Jaulas', mapa: 'B', tipo: 'dungeon', tileset: 'industrial', musica: 'cartel-tema', arena: 'usina', passo: 13,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cartel' },
    obj(g, 'S', 'escada-sobe'), obj(g, 'Z', 'escada-desce'), ...objs(g, 'A', 'tambor'), ...objs(g, 'B', 'caixote'),
    obj(g, 'P', 'painel', { texto: ['ESTEIRAS: LIGADAS.\nDESTINO DAS JAULAS: "COMPRADORES — COSTA DO SOL".'] }), ...objs(g, 'Q', 'tanque'),
    obj(g, 'W', 'mesa-lab', { texto: ['Frascos de peçonha rotulados por espécie. Há uma tabela de preços. Dá vontade de quebrar tudo.'] }), obj(g, 'L', 'alavanca', { script: 'b2-lab-alavanca-b' }),
    obj(g, 'J', 'jaula', { texto: ['Sapos-cururu espremidos, olhando para você.'] }), obj(g, 'K', 'jaula', { texto: ['Uma Jararaquinha enrolada num canto, tremendo.'] }), obj(g, 'Y', 'jaula', { texto: ['Pererequinhas. Uma delas acena. Ou é impressão.'] }),
    ...objs(g, 'U', 'jaula'), obj(g, 'V', 'jaula', { texto: ['A tranca desta cela é diferente: tem um teclado. E alguém lá dentro assobiando para uma cobra.'] }),
    obj(g, 'N', 'alavanca', { script: 'b2-lab-alavanca-a' }), obj(g, 'G', 'gerador'),
    obj(g, 'R', 'computador-cartel', { texto: ['PROJETO CAIPORA\n"O espécime resiste à sedação. Onde ele pisa, brota mato no concreto. O Coronel quer o segredo dele até a lua cheia."'] }), obj(g, 'H', 'vagonete'),
  ],
  warps: [...saidas(g, 'S', 'B6-lab-1', 20, 5, 's', 'escada'), ...saidas(g, 'Z', 'B6-lab-3', 4, 6, 's', 'escada')],
  portoes: [{ x: 15, y: 13, w: 2, requer: 'flag:b2-lab-a&flag:b2-lab-b', fala: 'Comporta do núcleo. Duas luzes vermelhas piscam: "ALAVANCA A — JAULAS" e "ALAVANCA B — DESTILARIA".\nEnquanto as duas não ficarem verdes, nada feito.' }],
  npcs: [
    duelista(g, '1', 'B6-lab-4', 'capanga-f', 'o', 4, { se: '!flag:laboratorio-ok' }),
    duelista(g, '2', 'B6-lab-5', 'capanga-m', 'n', 3, { se: '!flag:laboratorio-ok' }),
    duelista(g, '3', 'B6-lab-6', 'capanga-m', 'n', 4, { se: '!flag:laboratorio-ok' }),
    duelista(g, '4', 'B6-lab-7', 'capanga-f', 'n', 3, { se: '!flag:laboratorio-ok' }),
    duelista(g, '5', 'B6-lab-8', 'capanga-m', 's', 2, { se: '!flag:laboratorio-ok' }),
    gente(g, '9', 'peconha', 'lider-13', 'Doutor Peçonha', { dir: 'o', script: 'b2-peconha-cela', se: '!flag:laboratorio-ok' }),
  ],
  itens: [item(g, 'a', 'elixir-andiroba'), item(g, 'h', 'cuia-ouro', 3), item(g, 'i', 'engrenagem-velha'), item(g, 'j', 'pomada-copaiba', 1, true), item(g, 'k', 'rapadura', 1, true)],
};
export default zona;
