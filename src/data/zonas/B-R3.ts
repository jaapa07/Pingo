/**
 * B-R3 · Trilha da Roda (B4 Arraial Brasa → B5 Cidade Ginga) — passo 11.
 * Caminho principal: trilha dupla em zigue-zague de oeste a leste, cruzando o Riacho do Atabaque pela ponte.
 * Opcionais: o Tabuleiro (prateleira de rocha, Escalar), o bosque dos canteiros (Facão), o cofre de pedra (Quebra-pedra)
 * e a Lagoa de Cima, que se vê da trilha mas só se alcança subindo a cascata (Cachoeira, insígnia 11).
 */
import type { ZonaDef } from '../../core/tipos';
import { Grade, E, npc, tr } from './_b2-lib';

const g = new Grade(100, 32, '.');
g.q(0, 0, 100, 32, 'T').r(0, 1, 100, 1, 'T').r(0, 30, 100, 1, 'T');
// franja irregular de mata nas bordas
g.t(1, 2, 'TT', 'T').t(12, 2, 'TTT', '_T').t(28, 2, 'TTTT', 'TT').t(64, 2, 'TTTTT', '_TTT', '__T').t(83, 2, 'TTT', 'TT').t(97, 10, '_T', 'TT', 'TT', '_T');
g.t(13, 28, '__TT', 'TTTTT').t(30, 27, 'T', 'TT', 'TTTT').t(44, 28, 'TT_', 'TTTT').t(62, 28, '_TT', 'TTTT').t(80, 28, 'T__T', 'TTTTT').t(93, 26, '__TT', '_TTT', 'TTTTT', 'TTTTT');
// capim alto
g.r(3, 3, 8, 9, '"').r(15, 4, 13, 9, '"').r(34, 13, 13, 6, '"').r(69, 16, 13, 5, '"').r(70, 4, 11, 6, '"').r(88, 19, 8, 5, '"');
g.r(18, 7, 4, 3, '.').r(38, 15, 3, 2, '.').p(',', 19, 8, 20, 8, 39, 15, 74, 6, 75, 7).p('b', 6, 6, 7, 7, 24, 6, 44, 16, 78, 18, 72, 8);
// degrau de terra (pulo para o sul) entre o campo do meio e a baixada
g.r(15, 16, 13, 1, 'v').p('T', 14, 16, 28, 16);
// trilha dupla
g.via(':', 0, 14, 12, 14, 12, 20, 30, 20, 30, 10, 48, 10, 48, 22, 66, 22, 66, 13, 84, 13, 84, 16, 99, 16);
g.via(':', 1, 15, 13, 15, 13, 21, 31, 21, 31, 11, 49, 11, 49, 23, 67, 23, 67, 14, 85, 14, 85, 17, 98, 17);
// o Tabuleiro (prateleira) e a Lagoa de Cima
g.r(33, 7, 31, 2, '#').r(33, 2, 1, 5, '#').r(51, 2, 2, 5, '#').r(62, 2, 2, 5, '#');
g.r(34, 2, 17, 5, '.').r(42, 2, 8, 4, '"').p(',', 35, 5, 36, 5, 37, 4).p('T', 34, 2, 50, 2).p('t', 41, 2);
g.r(53, 2, 9, 5, '~').r(58, 3, 2, 2, '.').p('e', 40, 7, 40, 8).p('w', 55, 7, 55, 8);
// Riacho do Atabaque, ponte e o poção do sul
g.r(54, 9, 3, 21, '~').r(50, 26, 11, 4, '~').p('~', 53, 9, 57, 9, 53, 25, 57, 25).r(54, 22, 3, 2, '=');
g.p('b', 52, 12, 58, 14, 52, 18, 58, 19, 49, 27, 61, 27).p(';', 53, 21, 57, 21, 53, 24, 57, 24);
// rodas de capoeira (terreiros batidos)
for (const [x, y] of [[20, 23], [36, 24], [72, 24]]) g.t(x, y, '_,,,_', ',:::,', ',:::,', ',:::,', '_,,,_');
// bosque dos canteiros (Facão)
g.q(1, 20, 11, 10, 'T').r(2, 21, 9, 8, '.').p('c', 11, 25).p('C', 4, 23, 6, 23, 8, 23).p(',', 3, 25, 5, 26, 7, 25, 9, 27).p('t', 2, 21, 10, 21).r(5, 27, 3, 1, '"');
// cofre de pedra (Quebra-pedra)
g.q(87, 2, 11, 8, '#').r(88, 3, 9, 6, '.').r(89, 4, 7, 3, '"').p('r', 92, 9).p('t', 88, 3).p(',', 95, 7, 96, 8);
// árvores soltas, sacudíveis e moitas
g.p('T', 16, 18, 22, 18, 26, 12, 36, 20, 42, 21, 60, 16, 62, 11, 76, 12, 88, 12, 90, 25, 70, 22, 46, 26, 33, 23, 18, 26, 27, 24);
g.p('t', 16, 3, 24, 18, 28, 13, 45, 20, 60, 12, 71, 3, 81, 11, 86, 22, 64, 20);
g.p('b', 4, 16, 8, 17, 20, 19, 33, 12, 46, 12, 63, 24, 78, 12, 82, 22, 90, 14, 94, 14).p(',', 5, 13, 9, 16, 26, 22, 44, 24, 60, 24, 68, 26, 80, 24, 92, 15, 95, 18);
g.p('T', 0, 13, 0, 15, 99, 15, 99, 17);

const zona: ZonaDef = {
  id: 'B-R3', nome: 'Trilha da Roda', mapa: 'B', tipo: 'rota', tileset: 'cerrado', musica: 'rota-dia-B', arena: 'cerrado', passo: 11,
  mapaChars: g.fim(),
  objetos: [
    { o: 'placa', x: 3, y: 13 }, { o: 'placa', x: 96, y: 15 }, { o: 'placa', x: 41, y: 9 }, { o: 'placa', x: 58, y: 21 },
    { o: 'ipe-amarelo', x: 10, y: 17 }, { o: 'ipe-roxo', x: 35, y: 9 }, { o: 'ipe-amarelo', x: 68, y: 11 }, { o: 'cupinzeiro', x: 17, y: 14 }, { o: 'cupinzeiro', x: 82, y: 9 },
    { o: 'cupinzeiro', x: 63, y: 18 }, { o: 'tronco-caido', x: 24, y: 28 }, { o: 'tronco-caido', x: 77, y: 22 }, { o: 'fogueira', x: 38, y: 22 }, { o: 'banco', x: 39, y: 29 },
  ],
  placas: [
    { x: 3, y: 13, texto: 'TRILHA DA RODA\nOeste: Arraial Brasa · Leste: Cidade Ginga.\nQuem passa sem gingar paga prenda!' },
    { x: 96, y: 15, texto: 'CIDADE GINGA logo adiante.\n"Aqui o chão é tambor e o pé é baqueta."' },
    { x: 41, y: 9, texto: 'O TABULEIRO\nSubida só para quem sabe Escalar.\nLá em cima venta poesia.' },
    { x: 58, y: 21, texto: 'RIACHO DO ATABAQUE\nA Lagoa de Cima fica depois da cascata.\nDizem que só o berimbau do Mestre ensina a subir.' },
  ],
  warps: [
    { x: 0, y: 14, para: { zona: 'B4', x: 48, y: 16, dir: 'o' }, tipo: 'borda' },
    { x: 99, y: 16, para: { zona: 'B5', x: 1, y: 20, dir: 'l' }, tipo: 'borda' },
  ],
  npcs: [
    tr('B-R3-1', 'cl-capoeirista', 22, 25, 'n'),
    tr('B-R3-2', 'cl-vaqueiro', 29, 15, 'l'),
    tr('B-R3-3', 'cl-observadora', 44, 9, 's'),
    tr('B-R3-4', 'cl-repentista', 47, 5, 'o', { visao: 5 }),
    tr('B-R3-5', 'cl-capoeirista', 74, 26, 'n', { visao: 3 }),
    tr('B-R3-6', 'cl-mateira', 83, 15, 'l', { visao: 2 }),
    tr('B-R3-7', 'cl-escoteira', 60, 21, 's', { visao: 2 }),
    npc('aluno-1', 'Aluno Bimba', 'cl-crianca-m', 38, 26, 's', null, { script: 'b2-aluno-1', se: '!flag:b2-aluno-1' }),
    npc('aluno-2', 'Aluna Dandara', 'cl-crianca-f', 36, 3, 's', null, { script: 'b2-aluno-2', se: '!flag:b2-aluno-2' }),
    npc('aluno-3', 'Aluno Pastinha', 'cl-crianca-m', 91, 24, 'o', null, { script: 'b2-aluno-3', se: '!flag:b2-aluno-3' }),
    npc('tropeiro', 'Tropeiro Juvêncio', 'npc-homem-2', 6, 13, 's', ['Vim do Arraial com a tropa de mulas, mas elas empacaram ouvindo o berimbau.', 'Mula com suingue. Só nesta trilha mesmo.', 'Dica de tropeiro: sacuda as árvores de tronco grosso. Besourim adora cochilar lá em cima.']),
    npc('lavadeira', 'Dona Zefinha', 'npc-idosa', 52, 20, 'l', ['Tá vendo aquela cascata? Lá em cima tem uma lagoa com uma ilhota.', 'Meu finado subia aquilo no braço. Hoje em dia a mocidade precisa de Amuleto da Cachoeira.', 'O Mestre Gingado dá um para quem ganha dele. Só isso. Moleza, né?']),
    npc('poeta', 'Violeiro Tião', 'npc-homem-3', 39, 21, 'n', ['♪ Quem tem pressa come cru,\nquem tem Cuia come assado… ♪', 'Não faz sentido? Rima também cansa, criatura.', 'À noite a trilha é a mesma. Aqui bicho não tem hora: é tudo boêmio.']),
  ],
  itens: [
    { x: 8, y: 4, item: 'garrafada', flag: 'B-R3-i1' },
    { x: 3, y: 27, item: 'pt-25', flag: 'B-R3-i2' },
    { x: 49, y: 3, item: 'cuia-ouro', qtd: 2, flag: 'B-R3-i3' },
    { x: 59, y: 3, item: 'pedra-solar', flag: 'B-R3-i4' },
    { x: 95, y: 4, item: 'pepita', flag: 'B-R3-i5' },
    { x: 79, y: 27, item: 'pomada-copaiba', flag: 'B-R3-i6' },
    { x: 22, y: 9, item: 'biscoito-de-polvilho', qtd: 2, oculto: true, flag: 'B-R3-o1' },
    { x: 46, y: 28, item: 'cha-guarana', oculto: true, flag: 'B-R3-o2' },
    { x: 58, y: 4, item: 'concha-rara', oculto: true, flag: 'B-R3-o3' },
    { x: 96, y: 8, item: 'elixir-andiroba', oculto: true, flag: 'B-R3-o4' },
  ],
  habitats: [
    {
      metodo: 'grama', taxa: 0.1,
      todos: [E(14, 41, 43, 26), E(53, 41, 43, 26), E(65, 42, 44, 24), E(46, 42, 44, 12), E(50, 42, 44, 10), E(96, 42, 44, 12), E(157, 41, 43, 10), E(19, 43, 45, 5), E(66, 43, 45, 5)],
      camadas: [{ apos: 14, todos: [E(14, 50, 53, 22), E(53, 50, 53, 22), E(65, 50, 53, 20), E(46, 51, 54, 14), E(50, 51, 54, 12), E(96, 51, 54, 14), E(157, 50, 53, 10), E(19, 52, 55, 8), E(66, 52, 55, 8)] }],
    },
    {
      metodo: 'arvore',
      todos: [E(143, 41, 43, 30), E(154, 42, 44, 14), E(64, 43, 45, 5)],
      camadas: [{ apos: 14, todos: [E(143, 50, 52, 26), E(154, 51, 54, 16), E(64, 52, 55, 8)] }],
    },
  ],
};
export default zona;
