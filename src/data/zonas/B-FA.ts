import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, bordas, gente, duelista, item, placa, E } from './_b2n-lib';

/**
 * B-FA · Floresta Ancestral — pós-jogo (passo 17; a Guardiã da Floresta, em B8, só abre com `pos-jogo`).
 * Mata fechada de árvores enormes com cinco clareiras ligadas por trilhas: a da entrada (sul, chegada de B8 em (30, 58)),
 * a da Lagoa Escura (oeste, Remo), e as dos três Ninhos Raros — Mata (noroeste), Brasa (nordeste) e Rio (leste) —, onde
 * nascem os estágios evoluídos dos três iniciais (spec 6.2): a forma do meio, filhote do ninho, em qualquer hora; a forma
 * final, rara, só de manhã. Cada ninho recebe uma visita por dia (`b2n-ninho-*`). No Coração da Floresta (norte),
 * depois do Conselho, o Mapinguari (175, nv 65) espera (`b2n-mapinguari`).
 * 6.4 (B-FA): Preguiçona (A r), Pintada (G r), Jacaruçu (S r), Antão (G i), Harpinha→Harpia (G r/mr), Herculão (A i),
 * Minhocão (Q mr). Selvagens 66–72 (faixa do pós-jogo 65–75); treinadores 66–72.
 */
const p = new Pincel(64, 60, 'T').borda('#');
// clareiras
p.r(24, 49, 16, 9, '.').r(3, 35, 15, 15, '.').r(3, 6, 14, 12, '.').r(45, 3, 16, 11, '.').r(47, 34, 15, 13, '.').r(22, 3, 18, 13, '.');
// lagoas: a Escura (oeste) e a do Ninho do Rio (leste)
p.r(4, 40, 11, 8, '~').r(5, 39, 9, 1, '~').r(51, 38, 7, 5, '~');
// trilhas
p.via(':', 2, 30, 40, 30, 59).via(':', 2, 16, 40, 30, 40).via(':', 2, 16, 14, 16, 41).via(':', 2, 10, 14, 16, 14);
p.via(':', 2, 30, 15, 30, 41).via(':', 2, 30, 30, 56, 30).via(':', 2, 52, 10, 52, 31).via(':', 2, 56, 30, 56, 37);
// passagens das clareiras do meio para as trilhas
p.r(38, 32, 2, 1, '.').r(29, 24, 1, 2, '.');
// capim, árvores de sacudir, rochas rachadas e flores
p.r(26, 51, 4, 4, '"').r(34, 51, 5, 4, '"').r(4, 8, 4, 4, '"').r(23, 9, 6, 5, '"').r(33, 9, 6, 5, '"').r(46, 9, 5, 3, '"').r(57, 44, 4, 2, '"');
p.r(14, 36, 3, 3, '"').r(20, 22, 9, 6, '.').r(21, 23, 7, 4, '"').r(34, 33, 10, 5, '.').r(35, 34, 8, 3, '"');
p.p('t', 25, 50, 38, 56, 6, 13, 13, 7, 23, 4, 38, 4, 60, 5, 48, 45, 20, 22, 43, 37, 10, 36);
p.p('r', 47, 4, 49, 6, 58, 11, 56, 4);
p.p(',', 27, 56, 36, 50, 8, 16, 12, 10, 26, 7, 35, 7, 31, 4, 50, 8, 55, 12, 60, 36, 49, 46, 5, 37, 15, 48);
p.p('b', 33, 56, 24, 53, 14, 7, 44, 5, 47, 35, 58, 46, 4, 49, 22, 27, 42, 36);
// marcas
p.t(30, 59, 'SS');
p.t(9, 11, 'N').t(53, 7, 'B').t(54, 44, 'R').t(31, 8, 'X');
p.t(28, 53, 'a').t(10, 34 + 1, 'n').t(32, 13, 'm');
p.t(31, 47, '1').t(20, 41, '2').t(31, 25, '3').t(45, 31, '4').t(15, 44, '5');
p.t(36, 52, 'A').t(31, 6, 'Z').t(25, 55, 'P');
p.t(3, 6, 'k').t(60, 3, 'j').t(61, 46, 'i').t(5, 49, 'q').t(39, 3, 'y').t(43, 34, 'u').t(22, 26, 'z');
const g = grade('B-FA', p.fim(), {
  S: ':', N: '.', B: '.', R: '.', X: '.', a: '.', n: '.', m: '.', '1': ':', '2': ':', '3': ':', '4': ':', '5': '.',
  A: '.', Z: '.', P: '.', k: '.', j: '.', i: '.', q: '.', y: '.', u: '.', z: '"',
});
const placas = [
  placa(g, 'a', 'FLORESTA ANCESTRAL\n"Ande devagar: aqui cada árvore é mais velha que o seu bisavô."\nNinhos Raros a oeste, a leste e a nordeste.'),
  placa(g, 'n', 'LAGOA ESCURA\nÁgua parada, fundo de lama. Jacaré do tamanho de canoa. Não estique a mão.'),
  placa(g, 'm', 'CORAÇÃO DA FLORESTA\nAqui os antigos ouviam o grito do Mapinguari. Respeite o silêncio.'),
];
const ninho = (m: string, linha: string) => obj(g, m, 'ninho', { script: `b2n-ninho-${linha}` });
const zona: ZonaDef = {
  id: 'B-FA', nome: 'Floresta Ancestral', mapa: 'B', tipo: 'floresta', tileset: 'mata', musica: 'rota-noite-B', arena: 'mata', passo: 17,
  mapaChars: g.mapa,
  objetos: [
    ninho('N', 'mata'), ninho('B', 'brasa'), ninho('R', 'rio'),
    obj(g, 'X', 'totem', { texto: ['Um tronco caído há séculos, coberto de musgo, com marcas de garras do tamanho de um braço. Alguma coisa muito grande se coça aqui.'] }),
    { o: 'tronco-caido', x: 34, y: 47 }, { o: 'tronco-caido', x: 6, y: 9 }, { o: 'pedra-grande', x: 58, y: 9 }, { o: 'buriti', x: 49, y: 37 }, { o: 'bromelia', x: 37, y: 54 },
    { o: 'bromelia', x: 14, y: 11 }, { o: 'bromelia', x: 26, y: 12 },
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: [...bordas(g, 'S', 'B8', 44, 1, 's', 1, 0)],
  npcs: [
    duelista(g, '1', 'B-FA-1', 'cl-mateira', 's', 3),
    duelista(g, '2', 'B-FA-2', 'cl-biologa', 'o', 3),
    duelista(g, '3', 'B-FA-3', 'cl-observadora', 's', 3),
    duelista(g, '4', 'B-FA-4', 'cl-capoeirista', 'o', 3),
    duelista(g, '5', 'B-FA-5', 'cl-pescador', 'o', 3),
    gente(g, 'A', 'b-fa-anciao', 'npc-idoso', 'Seu Jequitibá', { dir: 'o', fala: ['Os Ninhos Raros são dos filhos dos primeiros parceiros: Tamanduá-Copa, Guaraflama, Botorosa. Cada ninho recebe uma visita por dia — mais que isso, a mãe estranha.', 'De manhãzinha, às vezes, quem está no ninho é o bicho crescido: Bandeirão, Lobo-Fornalha, Iaraboto. Esses são raríssimos. Leve Cuia de Ouro.'] }),
    gente(g, 'P', 'b-fa-guarda', 'cl-mateira', 'Guardiã-Mirim Jurema', { dir: 'n', fala: ['A Guardiã da Floresta me deixou aqui para cuidar da entrada. Eu cuido. Principalmente dos cogumelos.', 'Lá no Coração da Floresta mora o Mapinguari. Ele só se mostra para quem o Conselho reconheceu. Você foi reconhecido? Então vai lá. Eu fico aqui.'] }),
    gente(g, 'Z', 'b-fa-mapinguari', 'c:mapinguari', 'Mapinguari', { dir: 's', se: 'pos-jogo&!flag:mapinguari-ok', script: 'b2n-mapinguari' }),
  ],
  itens: [
    item(g, 'k', 'folha-ancestral'), item(g, 'j', 'pt-01'), item(g, 'i', 'elixir-andiroba', 3), item(g, 'q', 'pt-25'), item(g, 'y', 'rapadura', 2),
    item(g, 'u', 'cuia-ouro', 5, true), item(g, 'z', 'pedra-solar', 1, true),
  ],
  habitats: [
    {
      metodo: 'grama', taxa: 0.1,
      dia: [E(98, 73, 76, 22), E(12, 73, 76, 18), E(64, 73, 76, 16), E(66, 73, 76, 16), E(110, 75, 78, 12), E(72, 75, 79, 10), E(56, 74, 77, 6)],
      noite: [E(98, 73, 76, 22), E(172, 73, 76, 20), E(44, 73, 76, 18), E(170, 74, 77, 14), E(72, 75, 79, 14), E(110, 75, 78, 12)],
    },
    { metodo: 'arvore', todos: [E(144, 73, 76, 40), E(138, 73, 76, 25), E(136, 73, 76, 20), E(62, 75, 78, 15)] },
    { metodo: 'rocha', todos: [E(166, 73, 76, 50), E(162, 73, 76, 40), E(160, 76, 79, 10)] },
    { metodo: 'agua', taxa: 0.08, todos: [E(114, 73, 76, 45), E(87, 73, 77, 40), E(85, 76, 79, 15)] },
    { metodo: 'pesca-mestra', todos: [E(112, 75, 78, 40), E(87, 73, 76, 40), E(85, 76, 79, 20)] },
  ],
};
export default zona;
