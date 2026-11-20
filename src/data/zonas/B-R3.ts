/**
 * B-R3 · Trilha da Roda (B4 Arraial Brasa → B5 Cidade Ginga) — passo 12 (depois da insígnia 11; líder 12 com ás 55).
 * Caminho principal: trilha dupla em zigue-zague de oeste a leste, cruzando o Riacho do Atabaque pela ponte.
 * Áreas de Amuleto: o Tabuleiro (prateleira de rocha, Escalar), o bosque dos canteiros (Facão), o cofre de pedra
 * (Quebra-pedra) e — visível da trilha, fora de alcance até a insígnia 12 — a Lagoa de Cima, depois da cascata
 * (Cachoeira), com a ilhota do tesouro. Missão: os três alunos fujões do Mestre Cabaça (`b2-aluno-1..3`).
 */
import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, E, duelista, gente, item, placa, obj, objs } from './_b2s-lib';

const p = new Pincel(100, 32, '.');
p.q(0, 0, 100, 32, 'T').r(0, 1, 100, 1, 'T').r(0, 30, 100, 1, 'T');
// franja irregular de mata nas bordas
p.t(1, 2, 'TT', 'T').t(12, 2, 'TTT', '_T').t(28, 2, 'TTTT', 'TT').t(64, 2, 'TTTTT', '_TTT', '__T').t(83, 2, 'TTT', 'TT').t(97, 10, '_T', 'TT', 'TT', '_T');
p.t(13, 28, '__TT', 'TTTTT').t(30, 27, 'T', 'TT', 'TTTT').t(44, 28, 'TT_', 'TTTT').t(62, 28, '_TT', 'TTTT').t(80, 28, 'T__T', 'TTTTT').t(93, 26, '__TT', '_TTT', 'TTTTT', 'TTTTT');
// capim alto
p.r(3, 3, 8, 9, '"').r(15, 4, 13, 9, '"').r(34, 13, 13, 6, '"').r(69, 16, 13, 5, '"').r(70, 4, 11, 6, '"').r(88, 19, 8, 5, '"');
p.r(18, 7, 4, 3, '.').r(38, 15, 3, 2, '.').p(',', 19, 8, 20, 8, 39, 15, 74, 6, 75, 7).p('b', 6, 6, 7, 7, 24, 6, 44, 16, 78, 18, 72, 8);
// degrau de terra (pulo para o sul) entre o campo do meio e a baixada
p.r(15, 16, 13, 1, 'v').p('T', 14, 16, 28, 16);
// trilha dupla
p.via(':', 1, 0, 14, 12, 14, 12, 20, 30, 20, 30, 10, 48, 10, 48, 22, 66, 22, 66, 13, 84, 13, 84, 16, 99, 16);
p.via(':', 1, 1, 15, 13, 15, 13, 21, 31, 21, 31, 11, 49, 11, 49, 23, 67, 23, 67, 14, 85, 14, 85, 17, 98, 17);
// o Tabuleiro (prateleira de rocha) e a Lagoa de Cima
p.r(33, 7, 31, 2, '#').r(33, 2, 1, 5, '#').r(51, 2, 2, 5, '#').r(62, 2, 2, 5, '#');
p.r(34, 2, 17, 5, '.').r(42, 2, 8, 4, '"').p(',', 35, 5, 36, 5, 37, 4).p('T', 34, 2, 50, 2).p('t', 41, 2);
p.r(53, 2, 9, 5, '~').r(58, 3, 2, 2, '.').p('e', 40, 7, 40, 8).p('w', 55, 7, 55, 8);
// Riacho do Atabaque, ponte e o poção do sul
p.r(54, 9, 3, 21, '~').r(50, 26, 11, 4, '~').p('~', 53, 9, 57, 9, 53, 25, 57, 25).r(54, 22, 3, 2, '=');
p.p('b', 52, 12, 58, 14, 52, 18, 58, 19, 49, 27, 61, 27).p(';', 53, 21, 57, 21, 53, 24, 57, 24);
// rodas de capoeira (terreiros batidos)
for (const [x, y] of [[20, 23], [36, 24], [72, 24]]) p.t(x, y, '_,,,_', ',:::,', ',:::,', ',:::,', '_,,,_');
// bosque dos canteiros (Facão)
p.q(1, 20, 11, 10, 'T').r(2, 21, 9, 8, '.').p('c', 11, 25).p('C', 4, 23, 6, 23, 8, 23).p(',', 3, 25, 5, 26, 7, 25, 9, 27).p('t', 2, 21, 10, 21).r(5, 27, 3, 1, '"');
// cofre de pedra (Quebra-pedra)
p.q(87, 2, 11, 8, '#').r(88, 3, 9, 6, '.').r(89, 4, 7, 3, '"').p('r', 92, 9).p('t', 88, 3).p(',', 95, 7, 96, 8);
// árvores soltas, sacudíveis e moitas
p.p('T', 16, 18, 22, 18, 26, 12, 36, 20, 42, 21, 60, 16, 62, 11, 76, 12, 88, 12, 90, 25, 70, 22, 46, 26, 33, 23, 18, 26, 27, 24);
p.p('t', 16, 3, 24, 18, 28, 13, 45, 20, 60, 12, 71, 3, 81, 11, 86, 22, 64, 20);
p.p('b', 4, 16, 8, 17, 20, 19, 33, 12, 46, 12, 63, 24, 78, 12, 82, 22, 90, 14, 94, 14).p(',', 5, 13, 9, 16, 26, 22, 44, 24, 60, 24, 68, 26, 80, 24, 92, 15, 95, 18);
p.p('T', 0, 13, 0, 15, 99, 15, 99, 17);
// marcas: saídas, pessoas, itens, placas e objetos
p.t(0, 14, 'W').t(99, 16, 'L');
p.t(22, 25, '1').t(29, 15, '2').t(44, 9, '3').t(47, 5, '4').t(74, 26, '5').t(83, 15, '6').t(60, 21, '7').t(90, 19, '8');
p.t(38, 26, 'A').t(36, 3, 'B').t(91, 24, 'K').t(6, 13, 'J').t(52, 20, 'Z').t(39, 21, 'V');
p.t(8, 4, 'a').t(3, 27, 'k').t(49, 3, 'm').t(59, 3, 'n').t(95, 4, 'q').t(79, 27, 's').t(22, 9, 'u').t(46, 28, 'h').t(58, 4, 'i').t(96, 8, 'j');
p.t(3, 13, 'P').t(96, 15, 'Q').t(41, 9, 'R').t(58, 21, 'S');
p.t(10, 17, 'I').t(35, 9, 'U').t(68, 11, 'Y').t(17, 14, 'N').t(82, 9, 'N').t(63, 18, 'N').t(24, 28, 'X').t(77, 22, 'X').t(38, 22, 'F').t(39, 29, 'G');
const g = grade('B-R3', p.fim(), {
  W: ':', L: ':', '1': ':', '2': '.', '3': '.', '4': '"', '5': ':', '6': '.', '7': '.', '8': '"',
  A: ':', B: '.', K: '.', J: '.', Z: '.', V: '.',
  a: '"', k: '.', m: '"', n: '.', q: '"', s: '.', u: '"', h: '.', i: '.', j: ',',
  P: '.', Q: '.', R: '.', S: '.', I: '.', U: '.', Y: '.', N: '.', X: '.', F: '.', G: '.',
});
const placas = [
  placa(g, 'P', 'TRILHA DA RODA\nOeste: Arraial Brasa · Leste: Cidade Ginga.\nQuem passa sem gingar paga prenda!'),
  placa(g, 'Q', 'CIDADE GINGA logo adiante.\n"Aqui o chão é tambor e o pé é baqueta."'),
  placa(g, 'R', 'O TABULEIRO\nSubida só para quem sabe Escalar.\nLá em cima venta poesia.'),
  placa(g, 'S', 'RIACHO DO ATABAQUE\nA Lagoa de Cima fica depois da cascata.\nDizem que só o berimbau do Mestre Gingado ensina a subir.'),
];
const T = 'rota-dia-B';
const zona: ZonaDef = {
  id: 'B-R3', nome: 'Trilha da Roda', mapa: 'B', tipo: 'rota', tileset: 'cerrado', musica: T, arena: 'cerrado', passo: 12,
  mapaChars: g.mapa,
  objetos: [
    ...placas.map((q) => q.objeto),
    obj(g, 'I', 'ipe-amarelo'), obj(g, 'U', 'ipe-roxo'), obj(g, 'Y', 'ipe-amarelo'), ...objs(g, 'N', 'cupinzeiro'), ...objs(g, 'X', 'tronco-caido'),
    obj(g, 'F', 'fogueira'), obj(g, 'G', 'banco'),
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    { x: g.p('W')[0], y: g.p('W')[1], para: { zona: 'B4', x: 48, y: 16, dir: 'o' }, tipo: 'borda' },
    { x: g.p('L')[0], y: g.p('L')[1], para: { zona: 'B5', x: 1, y: 20, dir: 'l' }, tipo: 'borda' },
  ],
  npcs: [
    duelista(g, '1', 'B-R3-1', 'cl-capoeirista', 'n', 3),
    duelista(g, '2', 'B-R3-2', 'cl-vaqueiro', 'l', 4),
    duelista(g, '3', 'B-R3-3', 'cl-observadora', 's', 3),
    duelista(g, '4', 'B-R3-4', 'cl-repentista', 'o', 5),
    duelista(g, '5', 'B-R3-5', 'cl-capoeirista', 'n', 3),
    duelista(g, '6', 'B-R3-6', 'cl-mateira', 'l', 2),
    duelista(g, '7', 'B-R3-7', 'cl-escoteira', 's', 2),
    duelista(g, '8', 'B-R3-8', 'cl-ferreiro', 'o', 3),
    gente(g, 'A', 'aluno-1', 'cl-crianca-m', 'Aluno Bimba', { dir: 's', script: 'b2-aluno-1', se: 'flag:m-alunos&!flag:b2-aluno-1' }),
    gente(g, 'B', 'aluno-2', 'cl-crianca-f', 'Aluna Dandara', { dir: 's', script: 'b2-aluno-2', se: 'flag:m-alunos&!flag:b2-aluno-2' }),
    gente(g, 'K', 'aluno-3', 'cl-crianca-m', 'Aluno Pastinha', { dir: 'o', script: 'b2-aluno-3', se: 'flag:m-alunos&!flag:b2-aluno-3' }),
    gente(g, 'J', 'tropeiro', 'npc-homem-2', 'Tropeiro Juvêncio', { dir: 's', fala: ['Vim do Arraial com a tropa de mulas, mas elas empacaram ouvindo o berimbau.', 'Mula com suingue. Só nesta trilha mesmo.', 'Dica de tropeiro: sacuda as árvores de tronco grosso. Herculão adora cochilar lá em cima.'] }),
    gente(g, 'Z', 'lavadeira', 'npc-idosa', 'Dona Zefinha', { dir: 'l', fala: ['Tá vendo aquela cascata? Lá em cima tem uma lagoa com uma ilhota.', 'Meu finado subia aquilo no braço. Hoje em dia a mocidade precisa do Amuleto da Cachoeira.', 'O Mestre Gingado dá um para quem ganha dele. Só isso. Moleza, né?'] }),
    gente(g, 'V', 'poeta', 'npc-homem-3', 'Violeiro Tião', { dir: 'n', fala: ['♪ Quem tem pressa come cru,\nquem tem Cuia come assado… ♪', 'Não faz sentido? Rima também cansa, criatura.', 'À noite a trilha muda de gente: some o Papagaiozim, aparece Quatizão revirando a fogueira.'] }),
  ],
  itens: [
    item(g, 'a', 'garrafada'), item(g, 'k', 'pt-33'), item(g, 'm', 'cuia-ouro', 2), item(g, 'n', 'pedra-solar'), item(g, 'q', 'pepita'), item(g, 's', 'pomada-copaiba'),
    item(g, 'u', 'biscoito-de-polvilho', 2, true), item(g, 'h', 'cha-guarana', 1, true), item(g, 'i', 'concha-rara', 1, true), item(g, 'j', 'elixir-andiroba', 1, true),
  ],
  habitats: [
    {
      metodo: 'grama', taxa: 0.1,
      dia: [E(14, 54, 56, 20), E(53, 54, 56, 22), E(66, 55, 57, 18), E(46, 55, 57, 10), E(50, 55, 57, 10), E(96, 55, 57, 8), E(158, 55, 57, 8), E(19, 56, 58, 4)],
      noite: [E(14, 54, 56, 22), E(53, 54, 56, 10), E(66, 55, 57, 18), E(46, 55, 57, 10), E(96, 55, 58, 18), E(158, 55, 57, 12), E(50, 55, 57, 4), E(19, 56, 58, 6)],
      camadas: [{ apos: 14, todos: [E(14, 56, 58, 18), E(53, 56, 58, 18), E(66, 57, 59, 18), E(46, 57, 59, 12), E(50, 57, 59, 10), E(96, 57, 59, 10), E(158, 57, 59, 8), E(19, 58, 59, 6)] }],
    },
    {
      metodo: 'arvore',
      todos: [E(144, 55, 57, 60), E(154, 55, 57, 30), E(64, 56, 58, 10)],
      camadas: [{ apos: 14, todos: [E(144, 56, 58, 55), E(154, 57, 59, 32), E(64, 57, 59, 13)] }],
    },
    { metodo: 'pesca-velha', todos: [E(37, 20, 30, 70), E(113, 22, 29, 30)] },
    { metodo: 'pesca-boa', todos: [E(38, 54, 56, 60), E(114, 54, 56, 40)] },
  ],
};
export default zona;
