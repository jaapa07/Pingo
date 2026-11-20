/**
 * B-TA · Túnel Alagado (B5 Cidade Ginga → B6 Brejo Roxo) — passo 13, todo debaixo d'água (Mergulho, insígnia 9).
 * Dois trechos submersos separados por rocha. O do oeste sobe para a Gruta do Fôlego (B-TA-gruta); lá dentro a
 * passagem para a piscina do leste sobe uma cascata (Cachoeira, insígnia 12): é esse o portão que segura o Brejo
 * Roxo até depois do Mestre Gingado. Da piscina do leste se mergulha para o trecho do leste, que sobe no charco de B6.
 * As clareiras de luz (`,` com warp; A para subir à tona) são as saídas. As salas sem saída guardam os tesouros.
 */
import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, E, duelista, item, saidas } from './_b2s-lib';

const p = new Pincel(60, 30, '#');
// trecho oeste
p.r(2, 3, 8, 6, '.').r(9, 5, 6, 2, '%').r(14, 4, 8, 10, '.').r(15, 6, 6, 6, '%').r(16, 14, 2, 9, '%').r(16, 21, 9, 2, '%').r(23, 19, 6, 6, '.');
p.r(7, 9, 2, 12, '%').r(2, 18, 7, 8, '.').r(3, 20, 4, 4, '%').r(18, 16, 5, 2, '.').r(21, 14, 2, 2, '.');
// trecho leste
p.r(33, 5, 8, 6, '.').r(40, 7, 11, 2, '%').r(49, 8, 2, 7, '%').r(44, 14, 12, 6, '.').r(46, 15, 8, 4, '%').r(52, 20, 2, 3, '%').r(50, 22, 8, 5, '.');
p.r(34, 16, 10, 2, '%').r(34, 17, 2, 6, '%').r(31, 22, 8, 6, '.').r(33, 24, 4, 3, '%').r(44, 3, 2, 4, '%').r(43, 2, 8, 2, '.');
// corais (T), algas (b), conchas e areia do fundo
p.p('T', 3, 3, 8, 4, 15, 4, 21, 13, 24, 19, 28, 24, 3, 25, 34, 5, 40, 10, 45, 14, 55, 19, 51, 26, 57, 23, 32, 27, 50, 2, 20, 9, 47, 17);
p.p('b', 2, 7, 9, 8, 14, 12, 20, 4, 27, 19, 2, 19, 8, 24, 33, 10, 39, 5, 44, 19, 55, 14, 31, 23, 38, 22, 43, 3, 16, 7, 48, 9, 25, 23);
p.p(';', 4, 6, 6, 4, 25, 21, 27, 23, 35, 7, 37, 9, 53, 25, 55, 23, 18, 8, 48, 16, 3, 22, 35, 26, 46, 3);
p.p(',', 17, 10, 19, 12, 47, 15, 53, 17, 5, 21, 34, 25);
// clareiras de luz (subidas) e marcas
p.t(5, 5, 'A').t(26, 22, 'G').t(36, 8, 'H').t(54, 24, 'B');
p.t(19, 5, '1').t(42, 8, '2').t(47, 18, '3');
p.t(4, 24, 'a').t(22, 15, 'h').t(35, 26, 'i').t(49, 2, 'j').t(6, 19, 'k').t(57, 26, 'm').t(37, 23, 'n').t(28, 20, 'q');
const g = grade('B-TA', p.fim(), { A: ',', G: ',', H: ',', B: ',', '1': '.', '2': '%', '3': '%', a: '.', h: '.', i: '%', j: '.', k: '.', m: '.', n: '.', q: '.' });
const zona: ZonaDef = {
  id: 'B-TA', nome: 'Túnel Alagado', mapa: 'B', tipo: 'agua', tileset: 'submerso', musica: 'mergulho', arena: 'recife', passo: 13, submerso: true,
  mapaChars: g.mapa,
  warps: [
    ...saidas(g, 'A', 'B5', 46, 13, 's'),
    ...saidas(g, 'G', 'B-TA-gruta', 8, 17, 'n'),
    ...saidas(g, 'H', 'B-TA-gruta', 39, 4, 's'),
    ...saidas(g, 'B', 'B6', 10, 30, 's'),
  ],
  npcs: [
    duelista(g, '1', 'B-TA-1', 'cl-mergulhador', 's', 5),
    duelista(g, '2', 'B-TA-2', 'cl-mergulhador', 'l', 5),
    duelista(g, '3', 'B-TA-3', 'cl-mergulhador', 'l', 3),
  ],
  itens: [
    item(g, 'a', 'concha-rara'), item(g, 'h', 'cuia-rede', 3), item(g, 'i', 'pedra-mare'), item(g, 'j', 'pt-15'),
    item(g, 'k', 'pepita', 1, true), item(g, 'm', 'elixir-andiroba', 1, true), item(g, 'n', 'concha-rara', 1, true), item(g, 'q', 'garrafada', 2, true),
  ],
  habitats: [
    {
      metodo: 'mergulho', taxa: 0.12,
      todos: [E(116, 51, 53, 25), E(114, 51, 53, 25), E(118, 51, 53, 20), E(26, 52, 54, 8), E(87, 52, 54, 8), E(112, 53, 55, 7), E(160, 53, 55, 7)],
      camadas: [{ apos: 15, todos: [E(116, 57, 59, 24), E(114, 57, 59, 22), E(118, 57, 59, 18), E(26, 58, 60, 10), E(87, 58, 60, 10), E(112, 58, 60, 8), E(160, 58, 60, 8)] }],
    },
  ],
};
export default zona;
