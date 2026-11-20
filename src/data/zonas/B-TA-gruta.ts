/**
 * B-TA-gruta · Gruta do Fôlego — bolsão de ar no meio do Túnel Alagado (passo 13).
 * Chega-se pela piscina do oeste; um pedregulho (Força) fecha o corredor para o salão. No salão: o lago do Jaú-Gigante
 * (pesca), a prateleira de cima (Escalar, com um nicho atrás de rocha rachada) e o poço da cascata: só com a
 * Cachoeira (insígnia 12) se sobe à piscina do leste, de onde se mergulha para o trecho que sai no Brejo Roxo.
 */
import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, E, duelista, gente, item, placa, saidas, obj } from './_b2s-lib';

const p = new Pincel(44, 26, '#');
// piscina do oeste (com o poço que desce ao túnel) e a prainha
p.r(2, 13, 8, 9, '~').r(4, 15, 3, 3, 'd').r(10, 13, 3, 8, ';').p('.', 10, 12, 11, 12).p(',', 11, 14, 12, 18);
// corredor do pedregulho
p.r(13, 15, 5, 1, '.').p('p', 15, 15);
// salão, com chão de encontro e o lago do Jaú
p.r(18, 8, 14, 11, '.').r(20, 10, 5, 3, '%').r(26, 13, 4, 3, '%').r(21, 15, 4, 2, '%').p(',', 19, 9, 30, 9, 25, 12, 19, 17).p('b', 18, 8, 31, 18, 24, 9);
p.r(19, 19, 11, 4, '~').p(';', 18, 18, 30, 17).p('T', 18, 12, 31, 11);
// poço da cascata e a piscina do leste (de cima)
p.r(32, 10, 3, 3, '~').p('w', 33, 8, 33, 9).r(32, 2, 10, 6, '~').r(36, 3, 3, 3, 'd').r(42, 2, 1, 6, ';').r(30, 2, 2, 4, ';').p('b', 42, 7);
// prateleira de cima (Escalar) e o nicho da rocha rachada
p.r(19, 2, 9, 4, '.').p('e', 22, 6, 22, 7).p('r', 27, 3).p('.', 28, 3).p(',', 20, 3, 24, 2).p('T', 19, 5, 26, 2);
// marcas
for (const [x, y] of [[4, 15], [5, 15], [6, 15], [4, 16], [5, 16], [6, 16], [4, 17], [5, 17], [6, 17]]) p.t(x, y, 'W');
for (const [x, y] of [[36, 3], [37, 3], [38, 3], [36, 4], [37, 4], [36, 5], [37, 5], [38, 5]]) p.t(x, y, 'Q');
p.t(38, 4, 'Z');
p.t(28, 15, '1').t(20, 4, '2').t(29, 12, 'A').t(31, 3, 'B').t(16, 14, 'P').t(29, 10, 'F');
p.t(19, 2, 'a').t(28, 3, 'h').t(11, 19, 'i').t(25, 2, 'j').t(42, 6, 'k').t(18, 17, 'm');
const g = grade('B-TA-gruta', p.fim(), {
  W: 'd', Q: 'd', Z: 'd', '1': '%', '2': '.', A: '.', B: ';', P: '.', F: '.', a: '.', h: '.', i: ';', j: '.', k: ';', m: '.',
});
const pl = placa(g, 'P', 'GRUTA DO FÔLEGO\nRespire. Conte até dez. Empurre o pedregulho.\n— Clube de Mergulho de Cidade Ginga');
const zona: ZonaDef = {
  id: 'B-TA-gruta', nome: 'Gruta do Fôlego', mapa: 'B', tipo: 'caverna', tileset: 'caverna', musica: 'caverna', arena: 'caverna', passo: 13,
  mapaChars: g.mapa,
  objetos: [pl.objeto, obj(g, 'F', 'fogueira'), { o: 'canoa', x: 30, y: 17 }],
  placas: [pl.placa],
  warps: [
    ...saidas(g, 'W', 'B-TA', 26, 23, 'n'),
    ...saidas(g, 'Q', 'B-TA', 36, 9, 's'), ...saidas(g, 'Z', 'B-TA', 36, 9, 's'),
  ],
  npcs: [
    duelista(g, '1', 'B-TA-4', 'cl-pescador', 'o', 3),
    duelista(g, '2', 'B-TA-5', 'cl-garimpeiro', 'l', 3),
    gente(g, 'A', 'eremita', 'npc-idoso', 'Eremita Bolha', { dir: 'o', fala: [
      'Moro aqui desde que perdi a hora de subir. Faz uns trinta anos.',
      'No lago mora um Jaú do tamanho de uma canoa. Com Vara Velha ele nem se mexe; com Vara Mestra, ele pensa no assunto.',
      'A cascata do canto sobe para a piscina do leste. Quem tem o Amuleto da Cachoeira sobe remando. Quem não tem, me faz companhia.',
    ] }),
    gente(g, 'B', 'mergulhadora', 'cl-mergulhador', 'Mergulhadora Anêmona', { dir: 's', fala: ['A piscina de cá desce para o trecho do leste do túnel.', 'Siga as clareiras de luz no fundo: é nelas que dá para subir. A última sai no charco do Brejo Roxo.', 'Se vir gente de macacão ferrugem do outro lado, não dê bom-dia. Eles levaram os sapos do brejo em jaulas.'] }),
  ],
  itens: [item(g, 'a', 'pedra-lunar'), item(g, 'h', 'pt-36'), item(g, 'i', 'cha-guarana'), item(g, 'j', 'pepita', 1, true), item(g, 'k', 'garapa', 1, true), item(g, 'm', 'rapadura', 1, true)],
  habitats: [
    { metodo: 'caverna', taxa: 0.08, todos: [E(31, 56, 58, 26), E(128, 56, 58, 20), E(36, 56, 58, 18), E(148, 57, 59, 16), E(89, 57, 59, 12), E(26, 58, 60, 8)] },
    { metodo: 'pesca-velha', todos: [E(39, 20, 30, 100)] },
    { metodo: 'pesca-boa', todos: [E(114, 56, 58, 70), E(40, 57, 59, 30)] },
    { metodo: 'pesca-mestra', todos: [E(40, 58, 60, 55), E(114, 57, 59, 30), E(112, 59, 60, 15)] },
  ],
};
export default zona;
