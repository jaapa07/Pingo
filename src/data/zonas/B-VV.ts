/**
 * B-VV · Vale do Veneno — arredores de Brejo Roxo (passo 13), pântano tóxico sem saída.
 * Caminho: da borda oeste (B6) pela passarela de tábuas que atravessa a Lagoa Roxa até o campo do leste.
 * Áreas de Amuleto: as ilhas da lagoa (Remo), a mata dos marimbondos do norte (Facão), o Covil das Cobras
 * (Quebra-pedra) e o charco de lama do sul. Fora de alcance até a insígnia 13: o Horto do Doutor Peçonha
 * (portão do jardineiro). Missão: as Pererequinhas 4 e 5 da Dona Rã (`b2-filhotes`).
 */
import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, E, duelista, gente, item, placa, obj, objs, saidas } from './_b2s-lib';

const p = new Pincel(64, 40, '.');
p.q(0, 0, 64, 40, 'T').q(1, 1, 62, 38, 'T');
p.t(2, 2, 'TTT', 'TT', 'T').t(57, 2, '__TTT', '___TT', '____T').t(2, 34, 'T', 'TT', 'TTT').t(56, 33, '_____TT', '____TTT', '___TTTT', 'TTTTTTT');
// a Lagoa Roxa, com ilhas, e a passarela de tábuas
p.r(18, 7, 23, 25, '~').p('~', 17, 10, 17, 11, 41, 12, 41, 13, 17, 26, 41, 28, 22, 6, 23, 6, 35, 32, 36, 32);
p.r(23, 10, 5, 4, '"').p('t', 24, 10).p('.', 27, 13, 23, 13).r(32, 24, 6, 4, '"').p('T', 37, 24).p('.', 32, 27, 33, 27);
p.r(18, 20, 23, 2, '=').p('b', 18, 19, 40, 19, 18, 22, 40, 22, 30, 15, 21, 28);
// trilha
p.via(':', 2, 0, 20, 17, 20).via(':', 2, 41, 20, 49, 20, 49, 9, 56, 9).via(':', 2, 49, 21, 49, 30);
// campina do norte (Facão para a mata dos marimbondos)
p.r(3, 3, 14, 12, '"').r(6, 6, 3, 3, '.').r(11, 11, 4, 2, '.').p(',', 7, 7, 12, 12, 4, 13, 15, 4);
p.q(3, 15, 9, 4, 'T').r(4, 16, 7, 2, '.').p('c', 7, 15).p('t', 4, 16, 10, 16, 6, 17, 9, 17);
// charco de lama e piso tóxico do sul
p.r(3, 24, 14, 13, 'l').r(5, 27, 6, 5, '"').r(12, 26, 4, 4, '"').p('x', 4, 25, 5, 25, 11, 33, 12, 33, 13, 34, 15, 31, 16, 31, 3, 30, 8, 35).p('T', 9, 26, 14, 32, 4, 34).p(',', 6, 33, 7, 34);
// campo do leste e o Covil das Cobras (rocha rachada)
p.r(43, 3, 11, 5, '"').r(52, 23, 9, 8, '"').r(42, 12, 6, 6, '"');
p.q(50, 12, 11, 9, '#').r(51, 13, 9, 7, '"').r(53, 15, 5, 3, '.').p('r', 55, 20).p('T', 51, 13, 59, 13).p('t', 59, 19).p(',', 54, 16, 56, 16);
// Horto do Doutor Peçonha (cercado; o jardineiro só abre com a insígnia 13)
p.q(41, 29, 8, 7, 'f').r(42, 30, 6, 5, '.').p('C', 43, 31, 45, 31, 43, 33, 45, 33).p(',', 47, 31, 47, 33, 42, 34).p('.', 44, 35).p('t', 46, 30);
// árvores soltas, moitas e flores roxas
p.p('T', 20, 4, 30, 3, 38, 5, 46, 10, 58, 11, 61, 22, 44, 25, 18, 35, 26, 35, 33, 36, 52, 34, 9, 21, 13, 22, 4, 22);
p.p('t', 14, 5, 44, 9, 53, 8, 58, 30, 30, 34, 12, 20);
p.p('b', 6, 20, 15, 18, 43, 22, 47, 18, 52, 22, 24, 33, 40, 34, 44, 3, 61, 6).p(',', 8, 23, 16, 23, 45, 23, 55, 31, 27, 33, 39, 33, 20, 3, 33, 4);
p.r(19, 33, 20, 4, '"').r(18, 3, 22, 3, '"');
// marcas
p.t(0, 20, 'W').t(0, 21, 'W');
p.t(8, 19, '1').t(15, 9, '2').t(25, 12, '3').t(46, 21, '4').t(56, 6, '5').t(10, 30, '6').t(57, 26, '7').t(34, 25, '8');
p.t(10, 8, 'A').t(26, 11, 'B').t(44, 35, 'J').t(48, 27, 'K').t(53, 17, 'U').t(3, 19, 'V');
p.t(2, 23, 's').t(50, 31, 'q');
p.t(5, 17, 'a').t(35, 26, 'h').t(57, 17, 'i').t(44, 32, 'j').t(15, 35, 'k').t(46, 34, 'm').t(24, 11, 'n').t(60, 4, 'u').t(52, 14, 'y');
p.t(30, 22, 'Q').t(42, 36, 'Z');
const g = grade('B-VV', p.fim(), {
  W: ':', '1': '.', '2': '"', '3': '"', '4': ':', '5': '"', '6': 'l', '7': '"', '8': '"', A: '"', B: '"', J: '.', K: '.', U: '.', V: '.', s: '.', q: '.',
  a: '.', h: '"', i: '"', j: '.', k: 'l', m: ',', n: '"', u: '.', y: '"', Q: '~', Z: 'T',
});
const placas = [
  placa(g, 's', 'VALE DO VENENO\nPassarela de tábuas: siga as tábuas, não a vontade de nadar.\n— Associação dos Moradores do Brejo Roxo'),
  placa(g, 'q', 'HORTO DO DOUTOR PEÇONHA\nPlantas que curam picada de cobra. E plantas que picam como cobra.\nProibida a entrada sem autorização do Doutor.'),
];
const zona: ZonaDef = {
  id: 'B-VV', nome: 'Vale do Veneno', mapa: 'B', tipo: 'rota', tileset: 'brejo', musica: 'rota-noite-B', arena: 'brejo', passo: 13, clima: 'garoa',
  mapaChars: g.mapa,
  objetos: [...placas.map((q) => q.objeto), { o: 'bromelia', x: 7, y: 21 }, { o: 'bromelia', x: 45, y: 16 }, { o: 'tronco-caido', x: 13, y: 24 }, { o: 'tronco-caido', x: 53, y: 25 }, { o: 'pedra-grande', x: 60, y: 37 }, { o: 'buriti', x: 16, y: 13 }, { o: 'buriti', x: 42, y: 8 }, { o: 'canoa', x: 16, y: 19 }],
  placas: placas.map((q) => q.placa),
  warps: saidas(g, 'W', 'B6', 48, 20, 'o', 'borda'),
  portoes: [{ x: g.p('J')[0], y: g.p('J')[1], requer: 'insignia:13', sprite: 'npc-idoso', fala: 'Jardineiro Timbó: "O Horto é do Doutor Peçonha. Sem a palavra dele, ninguém entra."\f"Ele só dá a palavra para quem ganha a Insígnia Espinho. Volte com ela no peito."' }],
  npcs: [
    duelista(g, '1', 'B-VV-1', 'cl-biologa', 'l', 4),
    duelista(g, '2', 'B-VV-2', 'cl-mateira', 's', 3),
    duelista(g, '3', 'B-VV-3', 'cl-pescador', 's', 2),
    duelista(g, '4', 'B-VV-4', 'cl-vaqueiro', 'n', 4),
    duelista(g, '5', 'B-VV-5', 'cl-observadora', 's', 4),
    duelista(g, '6', 'B-VV-6', 'cl-garimpeiro', 'l', 3),
    duelista(g, '7', 'B-VV-7', 'cl-repentista', 'o', 3),
    duelista(g, '8', 'B-VV-8', 'cl-escoteira', 'n', 2),
    gente(g, 'A', 'filhote-4', 'c:pererequinha', 'Pererequinha', { dir: 's', script: 'b2-filhote-4', se: 'flag:m-filhotes&!flag:b2-filhote-4' }),
    gente(g, 'B', 'filhote-5', 'c:pererequinha', 'Pererequinha', { dir: 's', script: 'b2-filhote-5', se: 'flag:m-filhotes&!flag:b2-filhote-5' }),
    gente(g, 'K', 'jardineiro', 'npc-idoso', 'Jardineiro Timbó', { dir: 'o', script: 'b2-timbo' }),
    gente(g, 'U', 'b-vv-ermitao', 'npc-homem-2', 'Seu Jiboião', { dir: 's', fala: ['Vim morar no Covil para estudar as cobras de perto. Perto demais, às vezes.', 'A Coralzinha de anéis que brilham aparece pouco. Quem vê, faz pedido. Eu pedi para ela ir embora.'] }),
    gente(g, 'V', 'b-vv-guia', 'cl-montanhista', 'Guia Ingá', { dir: 'l', fala: ['O Vale é do tamanho de uma fazenda e tem mais cobra que gente.', 'De canoa você chega nas ilhas da lagoa. A do norte tem uma Pererequinha fujona, e a do sul, um treinador que não sai de lá nem com chuva.'] }),
  ],
  itens: [
    item(g, 'a', 'pt-38'), item(g, 'h', 'elixir-andiroba'), item(g, 'i', 'pt-12'), item(g, 'j', 'mel-puro', 3), item(g, 'k', 'unguento', 2, true), item(g, 'm', 'pt-44'), item(g, 'n', 'cuia-noturna', 2, true),
    item(g, 'u', 'pomada-copaiba', 2), item(g, 'y', 'pepita', 1, true),
  ],
  habitats: [
    {
      metodo: 'grama', taxa: 0.12,
      dia: [E(21, 60, 62, 16), E(85, 60, 62, 18), E(148, 60, 62, 14), E(26, 61, 63, 12), E(87, 61, 63, 10), E(89, 61, 63, 12), E(128, 61, 63, 12), E(90, 62, 64, 6)],
      noite: [E(21, 60, 62, 22), E(85, 60, 62, 14), E(148, 60, 62, 20), E(26, 61, 63, 12), E(87, 61, 63, 8), E(89, 61, 63, 12), E(128, 61, 63, 6), E(90, 62, 64, 6)],
      camadas: [{ apos: 15, todos: [E(21, 65, 67, 16), E(85, 65, 67, 16), E(148, 65, 67, 16), E(26, 66, 68, 12), E(87, 66, 68, 10), E(89, 66, 68, 12), E(128, 66, 68, 10), E(90, 67, 69, 8)] }],
    },
    {
      metodo: 'agua', taxa: 0.08,
      todos: [E(114, 60, 62, 45), E(85, 60, 62, 25), E(118, 61, 63, 20), E(87, 62, 64, 10)],
      camadas: [{ apos: 15, todos: [E(114, 65, 67, 40), E(85, 65, 67, 25), E(118, 66, 68, 22), E(87, 67, 69, 13)] }],
    },
    { metodo: 'arvore', todos: [E(152, 60, 63, 70), E(31, 60, 62, 30)], camadas: [{ apos: 15, todos: [E(152, 65, 68, 70), E(31, 65, 67, 30)] }] },
    { metodo: 'pesca-velha', todos: [E(113, 20, 29, 70), E(125, 20, 29, 30)] },
    { metodo: 'pesca-boa', todos: [E(114, 60, 62, 65), E(126, 60, 62, 35)] },
    { metodo: 'pesca-mestra', todos: [E(114, 62, 64, 50), E(87, 62, 64, 30), E(118, 62, 64, 20)] },
  ],
};
export default zona;
