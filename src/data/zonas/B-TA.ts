/**
 * B-TA · Túnel Alagado (B5 Cidade Ginga → B6 Brejo Roxo) — passo 13, todo debaixo d'água (Mergulho).
 * Dois trechos submersos separados por rocha: o do oeste sobe para a Gruta do Fôlego (B-TA-gruta), onde se anda
 * a seco até a outra piscina e se mergulha de novo para o trecho do leste, que sai no charco do Brejo Roxo.
 * As clareiras de luz (`,` com warp) são os pontos de subir à tona. Salas sem saída guardam os tesouros.
 */
import type { ZonaDef } from '../../core/tipos';
import { Grade, E, tr } from './_b2-lib';

const g = new Grade(60, 30, '#');
// trecho oeste
g.r(2, 3, 8, 6, '.').r(9, 5, 6, 2, '%').r(14, 4, 8, 10, '.').r(15, 6, 6, 6, '%').r(16, 14, 2, 9, '%').r(16, 21, 9, 2, '%').r(23, 19, 6, 6, '.');
g.r(7, 9, 2, 12, '%').r(2, 18, 7, 8, '.').r(3, 20, 4, 4, '%').r(18, 16, 5, 2, '.').r(21, 14, 2, 2, '.');
// trecho leste
g.r(33, 5, 8, 6, '.').r(40, 7, 11, 2, '%').r(49, 8, 2, 7, '%').r(44, 14, 12, 6, '.').r(46, 15, 8, 4, '%').r(52, 20, 2, 3, '%').r(50, 22, 8, 5, '.');
g.r(34, 16, 10, 2, '%').r(34, 17, 2, 6, '%').r(31, 22, 8, 6, '.').r(33, 24, 4, 3, '%').r(44, 3, 2, 4, '%').r(43, 2, 8, 2, '.');
// clareiras de luz (subida), corais, algas e pedras do fundo
g.p(',', 5, 5, 26, 22, 36, 8, 54, 24);
g.p('T', 3, 3, 8, 4, 15, 4, 21, 13, 24, 19, 28, 24, 3, 25, 34, 5, 40, 10, 45, 14, 55, 19, 51, 26, 57, 23, 32, 27, 50, 2);
g.p('b', 2, 7, 9, 8, 14, 12, 20, 4, 27, 19, 2, 19, 8, 24, 33, 10, 39, 5, 44, 19, 55, 14, 31, 23, 38, 22, 43, 3);
g.p(';', 4, 6, 6, 4, 25, 21, 27, 23, 35, 7, 37, 9, 53, 25, 55, 23, 18, 8, 48, 16);

const zona: ZonaDef = {
  id: 'B-TA', nome: 'Túnel Alagado', mapa: 'B', tipo: 'agua', tileset: 'submerso', musica: 'mergulho', arena: 'recife', passo: 13, submerso: true,
  mapaChars: g.fim(),
  warps: [
    { x: 5, y: 5, para: { zona: 'B5', x: 48, y: 13, dir: 's' } },
    { x: 26, y: 22, para: { zona: 'B-TA-gruta', x: 7, y: 16, dir: 's' } },
    { x: 36, y: 8, para: { zona: 'B-TA-gruta', x: 37, y: 5, dir: 's' } },
    { x: 54, y: 24, para: { zona: 'B6', x: 8, y: 30, dir: 's' } },
  ],
  npcs: [
    tr('B-TA-1', 'cl-mergulhador', 19, 5, 's', { visao: 5 }),
    tr('B-TA-2', 'cl-mergulhador', 42, 8, 'l', { visao: 5 }),
    tr('B-TA-3', 'cl-mergulhador', 47, 19, 'n', { visao: 3 }),
  ],
  itens: [
    { x: 4, y: 24, item: 'concha-rara', flag: 'B-TA-i1' },
    { x: 22, y: 15, item: 'cuia-rede', qtd: 3, flag: 'B-TA-i2' },
    { x: 35, y: 26, item: 'pedra-mare', flag: 'B-TA-i3' },
    { x: 49, y: 2, item: 'pt-15', flag: 'B-TA-i4' },
    { x: 6, y: 19, item: 'pepita', oculto: true, flag: 'B-TA-o1' },
    { x: 57, y: 26, item: 'elixir-andiroba', oculto: true, flag: 'B-TA-o2' },
    { x: 37, y: 23, item: 'concha-rara', oculto: true, flag: 'B-TA-o3' },
  ],
  habitats: [
    {
      metodo: 'mergulho', taxa: 0.12,
      todos: [E(115, 46, 48, 24), E(114, 47, 49, 22), E(116, 48, 50, 16), E(26, 48, 51, 6), E(87, 49, 52, 5), E(112, 49, 52, 5), E(160, 50, 52, 4)],
      camadas: [{ apos: 15, todos: [E(114, 54, 56, 22), E(116, 54, 57, 24), E(26, 55, 58, 9), E(87, 55, 58, 8), E(112, 56, 59, 8), E(160, 56, 59, 6), E(115, 52, 54, 10)] }],
    },
  ],
};
export default zona;
