/**
 * B6-lab-1 · Laboratório do Cartel, 1º subsolo (depósito) — 5º evento do Cartel Ferrugem, passo 13.
 * A porta blindada do corredor só abre com a alavanca da sala de máquinas (leste, `b2-lab-alavanca-1`).
 * O depósito (oeste) guarda itens; o piso manchado (`x`) é vazamento de peçonha.
 */
import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, saidas, gente, duelista, item } from './_b2s-lib';

const p = new Pincel(30, 22, '#');
p.r(11, 15, 8, 6, '.').p('+', 15, 21).r(14, 6, 2, 9, ':').r(2, 8, 9, 6, '.').r(11, 10, 3, 1, ':').r(19, 8, 9, 6, '.').r(16, 10, 3, 1, ':').r(8, 3, 14, 3, '.');
p.p('x', 3, 12, 4, 12, 4, 13, 8, 9, 9, 9, 23, 12, 24, 12, 12, 17, 17, 18).r(21, 9, 5, 1, ':').r(10, 4, 9, 1, ',').r(12, 19, 6, 1, ',').r(3, 10, 6, 1, ':').r(20, 11, 6, 1, ',');
p.t(15, 21, 'D').t(20, 4, 'S');
p.t(2, 8, 'A').t(3, 8, 'A').t(10, 8, 'B').t(10, 9, 'B').t(2, 13, 'E').t(6, 8, 'J').t(19, 8, 'G').t(22, 8, 'P').t(26, 9, 'L').t(27, 13, 'A').t(9, 3, 'K').t(14, 3, 'Q').t(16, 3, 'Q').t(11, 19, 'B').t(18, 19, 'A').t(18, 15, 'B').t(2, 11, 'B');
p.t(13, 17, '1').t(5, 10, '2').t(24, 10, '3').t(17, 16, '4');
p.t(3, 10, 'a').t(9, 13, 'h').t(21, 13, 'i').t(7, 12, 'j').t(27, 10, 'k');
const g = grade('B6-lab-1', p.fim(), {
  D: '+', S: '.', A: '.', B: '.', E: '.', J: '.', G: '.', P: '.', L: '.', K: '.', Q: '.', '1': '.', '2': ':', '3': ':', '4': '.', a: ':', h: '.', i: '.', j: '.', k: '.',
});
const zona: ZonaDef = {
  id: 'B6-lab-1', nome: 'Laboratório do Cartel — Depósito', mapa: 'B', tipo: 'dungeon', tileset: 'industrial', musica: 'cartel-tema', arena: 'usina', passo: 13,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'cartel' },
    ...objs(g, 'A', 'tambor'), ...objs(g, 'B', 'caixote'), obj(g, 'E', 'barril'),
    obj(g, 'J', 'jaula', { texto: ['Uma jaula vazia. Na plaqueta: "Lote 12 — sapos-cururu — ENVIADO AO NÍVEL 2".'] }),
    obj(g, 'G', 'gerador'), obj(g, 'P', 'painel', { texto: ['PRESSÃO DAS CALDEIRAS DE PEÇONHA: ALTA.\nAlguém colou um bilhete: "não encostar, isso é com a Doutora Zinabre".'] }),
    obj(g, 'L', 'alavanca', { script: 'b2-lab-alavanca-1' }), obj(g, 'S', 'escada-desce'),
    obj(g, 'K', 'computador-cartel', { texto: ['REGISTRO DE CARGA\n• 212 anfíbios do Brejo Roxo\n• 38 serpentes do Vale\n• 1 "espécime especial" (jaula reforçada, nível 3)\n• 1 herpetólogo intrometido (cela, nível 2)'] }),
    ...objs(g, 'Q', 'tanque'),
  ],
  warps: [...saidas(g, 'D', 'B6', 43, 8, 's', 'porta'), ...saidas(g, 'S', 'B6-lab-2', 3, 5, 's', 'escada')],
  portoes: [{ x: 14, y: 6, w: 2, requer: 'flag:b2-lab-alavanca-1', fala: 'Uma porta blindada com o emblema da engrenagem enferrujada.\nUm cabo grosso sai dela e segue pela parede para o leste, até a sala de máquinas.' }],
  npcs: [
    duelista(g, '1', 'B6-lab-1', 'capanga-m', 'l', 4, { se: '!flag:laboratorio-ok' }),
    duelista(g, '2', 'B6-lab-2', 'capanga-f', 'l', 4, { se: '!flag:laboratorio-ok' }),
    duelista(g, '3', 'B6-lab-3', 'capanga-m', 'o', 4, { se: '!flag:laboratorio-ok' }),
    gente(g, '4', 'faxineiro', 'npc-homem-4', 'Faxineiro Contratado', { dir: 'o', se: '!flag:laboratorio-ok', fala: ['Eu só fui contratado para passar pano. Ninguém me avisou que o pano ia derreter.', 'A porta lá de cima? Abre na alavanca da sala das máquinas, a leste. Eu não falei nada.'] }),
  ],
  itens: [item(g, 'a', 'garrafada', 2), item(g, 'h', 'pt-26'), item(g, 'i', 'cha-guarana'), item(g, 'j', 'unguento', 2, true), item(g, 'k', 'cuia-trancada', 3)],
};
export default zona;
