import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, entrada, bordas, gente, duelista, item, placa } from './_b1-lib';

/**
 * B2 · Pantanal Grande — cidade de palafitas e boiada na beira do Pantanal. Ginásio da Terra (9ª insígnia, Boiadeira
 * Zefa; a zona `B2-ginasio` é do time de ginásios). Centro de Reabilitação de Fauna (filhotes resgatados do Cartel,
 * `b1-orfaos`, depois de `pantanal-ok`). Oeste: Pantanal Alagado. Ao norte do riacho, o Olho-d'Água fica no alto da
 * cascata: visível e fora de alcance até o Amuleto da Cachoeira (insígnia 12).
 */
const p = new Pincel(46, 34, '.').borda('T');
p.via(':', 2, 1, 15, 22, 15).via(':', 2, 22, 9, 22, 21).via(':', 1, 24, 15, 37, 15).via(':', 1, 12, 14, 12, 14);
// riacho que desce da cascata do Olho-d'Água até a lagoa
p.r(35, 2, 10, 7, '#').r(37, 3, 6, 4, '~').r(39, 4, 2, 1, ';').r(39, 7, 2, 2, 'w').r(39, 9, 2, 12, '~').r(39, 15, 2, 1, '=');
// curral da boiada
p.q(41, 8, 4, 6, 'f').r(42, 9, 2, 4, ',').p(',', 42, 13);
// lagoa com palafitas e passarelas
p.r(1, 21, 44, 1, ';').r(1, 22, 44, 11, '~').r(39, 21, 2, 1, '~');
p.r(4, 27, 37, 1, '=').r(4, 22, 1, 5, '=').r(40, 22, 1, 5, '=').r(7, 25, 1, 2, '=').r(15, 25, 1, 2, '=').r(31, 25, 1, 2, '=').r(22, 28, 2, 4, '=');
// canteiros, capim alto do pasto e um cupinzeiro de pasto
p.r(2, 2, 7, 4, '"').r(28, 17, 4, 3, '"').p('C', 16, 19, 18, 19).p('b', 9, 9, 2, 19, 33, 9);
p.t(0, 15, 'O', 'O');
p.t(20, 8, 'Y').t(10, 13, 'P').t(28, 13, 'V').t(33, 20, 'L').t(6, 25, 'A').t(14, 25, 'B').t(30, 25, 'K');
p.t(25, 9, 'a').t(14, 16, 'n').t(37, 16, 'h').t(36, 21, 'm');
p.t(26, 10, '1').t(8, 18, '2').t(30, 9, '3').t(43, 18, '4').t(17, 26, '5').t(23, 30, '6').t(12, 4, '7').t(36, 12, '8').t(42, 10, '9');
p.t(39, 4, 'k').t(5, 3, 'j').t(22, 31, 'z');
p.t(4, 9, 'u').t(16, 3, 'u').t(31, 4, 'u').t(6, 19, 'u').t(26, 19, 'y').t(18, 11, 'y');
const g = grade('B2', p.fim(), {
  O: ':', Y: '.', P: '.', V: '.', L: '.', A: '~', B: '~', K: '~', a: '.', n: '.', h: '.', m: ';',
  '1': '.', '2': '.', '3': '.', '4': '.', '5': '=', '6': '=', '7': '.', '8': '.', '9': ',', k: ';', j: '"', z: '=', u: '.', y: '.',
});
const placas = [
  placa(g, 'a', 'GINÁSIO DE PANTANAL GRANDE\nLíder: Boiadeira Zefa, a peoa.\n"Barro não tem pressa, mas não perdoa quem para."'),
  placa(g, 'n', 'PANTANAL GRANDE\nCidade das palafitas. Oeste: Pantanal Alagado e Vila Cascavel.'),
  placa(g, 'h', 'OLHO-D\'ÁGUA\nA nascente fica no alto da cascata. Sobe quem a água deixar.'),
  placa(g, 'm', 'CENTRO DE REABILITAÇÃO DE FAUNA\nFilhote resgatado não é mercadoria: é responsabilidade.'),
];
const zona: ZonaDef = {
  id: 'B2', nome: 'Pantanal Grande', mapa: 'B', tipo: 'cidade', tileset: 'pantanal', musica: 'cidade-forro', arena: 'pantanal', passo: 9,
  pouso: [12, 14],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'Y', 'ginasio', { cor: '#5a3418,#8c5a2c,#d8a868' }), obj(g, 'P', 'posto'), obj(g, 'V', 'venda'), obj(g, 'L', 'laboratorio'),
    obj(g, 'A', 'casa-palafita'), obj(g, 'B', 'casa-palafita'), obj(g, 'K', 'casa-palafita'),
    ...objs(g, 'u', 'buriti'), ...objs(g, 'y', 'ipe-amarelo'),
    { o: 'canoa', x: 26, y: 30 }, { o: 'canoa', x: 10, y: 29 }, { o: 'poste', x: 21, y: 13 }, { o: 'poste', x: 24, y: 20 }, { o: 'poste', x: 9, y: 14 },
    { o: 'ninho', x: 33, y: 4, script: 'b1-foto-5' }, { o: 'cupinzeiro', x: 3, y: 12 }, { o: 'banco', x: 16, y: 13 }, { o: 'tronco-caido', x: 30, y: 18 },
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...bordas(g, 'O', 'B-PA', 58, 11, 'o', 0, 1),
    entrada(g, 'Y', 'ginasio', 'B2-ginasio', 8, 17),
    entrada(g, 'P', 'posto', 'B2-posto', 6, 8),
    entrada(g, 'V', 'venda', 'B2-venda', 5, 7),
    entrada(g, 'L', 'laboratorio', 'B2-centro', 7, 8),
    entrada(g, 'A', 'casa-palafita', 'B2-casa-1', 5, 7),
    entrada(g, 'B', 'casa-palafita', 'B2-casa-2', 5, 7),
  ],
  npcs: [
    duelista(g, '1', 'B2-1', 'cl-vaqueiro', 's', 3),
    duelista(g, '3', 'B2-2', 'cl-mateira', 'o', 3),
    gente(g, '2', 'b2-menina', 'cl-crianca-f', 'Iara Mirim', { mov: 'vagar', fala: ['A Boiadeira Zefa laça boi com uma mão e segura o chapéu com a outra!', 'No ginásio dela o chão é de lama. Se você parar, afunda. Se correr, escorrega. Eu fiquei na arquibancada.'] }),
    gente(g, '4', 'b2-peao-curral', 'cl-vaqueiro', 'Peão Zé Berrante', { dir: 'n', mov: 'olhar', fala: ['Esse Antão do curral pensa que é boi. A gente não teve coragem de contar.', 'Depois que você vencer a Zefa, ela vai pedir ajuda com o ninhal. Tem gente do Cartel mexendo nos ovos, no sul do Pantanal.'] }),
    gente(g, '5', 'b2-pescadora', 'cl-pescador', 'Pescadora Dona Piraputanga', { dir: 's', fala: ['Pirarucinho só morde Vara Velha, filhote que é. O Pirarucão de verdade, só na Vara Mestra, e no fundo.', 'A Vara Mestra? Ganhei de um pescador que ganhou de outro pescador. Ninguém lembra onde começou.'] }),
    gente(g, '6', 'b2-canoeiro', 'npc-homem-3', 'Canoeiro Tuiú', { dir: 'n', fala: ['Daqui a canoa sai para o sul, mas o canal do ninhal está fechado pelo peão da Zefa.', 'E mais para baixo, perto de Porto Pantaneiro, o Cartel estendeu uma rede de margem a margem. Nem lambari passa.'] }),
    gente(g, '7', 'b2-capinzeira', 'npc-mulher-2', 'Dona Taboa', { dir: 's', fala: ['Capim alto no pasto: Sapo-Cururuí de noite, Tuiuiú de dia, Jacaretinga o tempo todo.', 'E Pintada de vez em quando. Quando a Pintada aparece, o pasto inteiro fica em silêncio.'] }),
    gente(g, '8', 'b2-menino-cascata', 'cl-crianca-m', 'Davizinho', { dir: 'n', fala: ['Lá em cima da cascata tem uma nascente e uma pedra que brilha de noite.', 'Meu avô diz que só sobe a água quem tem o Amuleto da Cachoeira. Eu tentei a nado. Desci mais rápido do que subi.'] }),
    gente(g, '9', 'b2-antao', 'c:antao', 'Antão', { dir: 's', fala: ['(O Antão do curral muge. Não é um som de anta. Ele está convencido.)'] }),
  ],
  itens: [item(g, 'k', 'pedra-lunar'), item(g, 'j', 'cuia-noturna', 2, true), item(g, 'z', 'garapa-com-limao', 2)],
};
export default zona;
