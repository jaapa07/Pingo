/**
 * B-TA-gruta · Gruta do Fôlego — bolsão de ar no meio do Túnel Alagado (passo 13).
 * Chega-se pela piscina do oeste; um pedregulho (Força) fecha o corredor para o salão. No salão: o lago do Jaú-Gigante
 * (pesca), a prateleira de cima (Escalar) e a passagem para a piscina do leste, de onde se mergulha para o Brejo Roxo.
 */
import type { ZonaDef } from '../../core/tipos';
import { Grade, E, npc, tr } from './_b2-lib';

const g = new Grade(44, 26, '#');
g.r(3, 13, 9, 8, '~').r(5, 15, 4, 3, 'd').r(12, 12, 5, 8, ';').r(13, 11, 3, 1, ';').r(17, 14, 7, 1, '.').p('p', 18, 14);
g.r(24, 9, 8, 8, '.').r(25, 10, 5, 2, ',').r(24, 17, 8, 5, '~').r(23, 18, 1, 3, '~').p(';', 24, 16, 25, 16, 30, 16, 31, 16);
g.r(32, 11, 2, 2, '.').r(34, 9, 5, 5, ';').r(34, 3, 8, 6, '~').r(36, 4, 3, 3, 'd');
g.r(17, 4, 11, 4, '.').p('e', 26, 8).p('r', 21, 5).r(17, 4, 4, 2, ',').p('T', 27, 4, 24, 9, 31, 9, 12, 12, 16, 19, 38, 13).p('b', 14, 19, 28, 15, 34, 13);

const zona: ZonaDef = {
  id: 'B-TA-gruta', nome: 'Gruta do Fôlego', mapa: 'B', tipo: 'caverna', tileset: 'caverna', musica: 'caverna', arena: 'caverna', passo: 13,
  mapaChars: g.fim(),
  objetos: [{ o: 'placa', x: 15, y: 12 }, { o: 'fogueira', x: 29, y: 13 }, { o: 'canoa', x: 35, y: 10 }],
  placas: [{ x: 15, y: 12, texto: 'GRUTA DO FÔLEGO\nRespire. Conte até dez. Empurre o pedregulho.\n— Clube de Mergulho de Cidade Ginga' }],
  warps: [
    ...[5, 6, 7, 8].flatMap((x) => [15, 16, 17].map((y) => ({ x, y, para: { zona: 'B-TA', x: 26, y: 22, dir: 's' as const } }))),
    ...[36, 37, 38].flatMap((x) => [4, 5, 6].map((y) => ({ x, y, para: { zona: 'B-TA', x: 36, y: 8, dir: 's' as const } }))),
  ],
  npcs: [
    tr('B-TA-4', 'cl-pescador', 27, 14, 'o', { visao: 3 }),
    tr('B-TA-5', 'cl-garimpeiro', 22, 6, 'l', { visao: 3 }),
    npc('eremita', 'Eremita Bolha', 'npc-idoso', 30, 12, 'o', ['Moro aqui desde que perdi a hora de subir. Faz uns trinta anos.', 'No lago mora um Jaú do tamanho de uma canoa. Com Vara Velha ele nem se mexe; com Vara Mestra, ele pensa no assunto.', 'Se vir gente de macacão ferrugem do outro lado, não dê bom-dia. Eles levaram todos os sapos do brejo em jaulas.']),
    npc('mergulhadora', 'Mergulhadora Anêmona', 'cl-mergulhador', 35, 11, 'n', ['A piscina de cá desce para o trecho do leste.', 'Siga as clareiras de luz no fundo: é nelas que dá para subir. A última sai no charco do Brejo Roxo.']),
  ],
  itens: [
    { x: 18, y: 5, item: 'pedra-lunar', flag: 'B-TA-gruta-i1' },
    { x: 13, y: 18, item: 'cha-guarana', flag: 'B-TA-gruta-i2' },
    { x: 25, y: 5, item: 'pepita', oculto: true, flag: 'B-TA-gruta-o1' },
    { x: 37, y: 12, item: 'garapa', oculto: true, flag: 'B-TA-gruta-o2' },
  ],
  habitats: [
    { metodo: 'pesca-velha', todos: [E(39, 40, 44, 1)] },
    { metodo: 'pesca-boa', todos: [E(39, 44, 48, 16), E(40, 48, 50, 4)] },
    { metodo: 'pesca-mestra', todos: [E(39, 46, 49, 10), E(40, 49, 53, 6)] },
  ],
};
export default zona;
