/**
 * B-R4 · Subida da Serra (B6 Brejo Roxo → B7 Serra da Geada) — passo 14 (depois da insígnia 13; líder 14 com ás 59).
 * Montanha em cinco patamares separados por paredões: sobe-se alternando trepadeiras (Escalar) e fendas fechadas
 * por pedregulhos (Força); saliências de mão única descem de volta de cada patamar. No alto, as araucárias, a saída
 * para a Serra da Geada (borda norte) e a trilha de Escalar do Pico Pindorama (PP, outro time; chegada lá em
 * (34, 52); volta aqui em (24, 3)) — o Guia do Pico e o próprio warp exigem as 16 insígnias (pedido do B2-norte).
 * Áreas de Amuleto: a gruta do mocó (Quebra-pedra) e o nicho da cascata seca (Escalar).
 */
import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, E, duelista, gente, item, placa, saidas, objs } from './_b2s-lib';

const p = new Pincel(50, 70, '.');
p.r(0, 0, 50, 1, '#').r(0, 69, 50, 1, '#').r(0, 0, 2, 70, '#').r(48, 0, 2, 70, '#');
// paredões entre os patamares (y = 59, 45, 31, 17) e o maciço do topo
p.r(2, 59, 46, 1, '#').r(2, 45, 46, 1, '#').r(2, 31, 46, 1, '#').r(2, 17, 46, 1, '#');
p.r(2, 1, 20, 3, '#').r(27, 1, 11, 3, '#').r(40, 1, 8, 3, '#').r(22, 1, 5, 1, '#').r(23, 4, 3, 4, '#').p('#', 22, 4, 26, 4, 22, 5, 26, 5);
// passagens: trepadeiras (Escalar), fendas com pedregulho (Força), saliências (descida)
p.p('e', 12, 59, 20, 31, 24, 4, 24, 5, 24, 6, 24, 7).p('.', 36, 45, 8, 17).p('p', 36, 45, 8, 17);
p.p('v', 30, 59, 31, 59, 14, 45, 15, 45, 34, 31, 35, 31, 28, 17, 29, 17);
p.r(22, 2, 5, 2, '.').p(':', 24, 2).p('#', 22, 2, 26, 2, 23, 8, 25, 8);
// trilhas de cada patamar
p.via(':', 2, 24, 68, 24, 63, 12, 63, 12, 60).via(':', 2, 12, 57, 12, 52, 36, 52, 36, 46).via(':', 2, 36, 43, 36, 38, 20, 38, 20, 32);
p.via(':', 2, 20, 29, 20, 24, 8, 24, 8, 18).via(':', 2, 8, 15, 8, 10, 38, 10, 38, 1).r(24, 8, 1, 2, ':');
// capim de altitude, pedras e rochas rachadas
p.r(3, 61, 8, 6, '"').r(28, 61, 12, 6, '"').r(3, 47, 7, 9, '"').r(20, 47, 12, 4, '"').r(39, 47, 8, 9, '"');
p.r(4, 33, 12, 9, '"').r(24, 34, 9, 3, '"').r(40, 33, 7, 10, '"').r(24, 19, 14, 4, '"').r(3, 19, 4, 4, '"').r(42, 19, 5, 9, '"').r(12, 5, 8, 4, '"').r(28, 5, 8, 4, '"');
p.p('r', 44, 64, 5, 52, 44, 38, 30, 26, 16, 12, 45, 8).p(',', 16, 65, 33, 64, 8, 50, 27, 49, 10, 40, 30, 41, 33, 22, 11, 21, 18, 6, 31, 7, 43, 13);
// gruta do mocó (Quebra-pedra): bolsão de pedra no patamar do meio
p.q(40, 22, 7, 7, '#').r(41, 23, 5, 5, '.').r(42, 24, 3, 3, ',').p('r', 43, 28).p('.', 43, 29);
// nicho da cascata seca (Escalar) no patamar de baixo
p.q(41, 60, 6, 5, '#').r(42, 61, 4, 3, '.').p('e', 43, 64).p('.', 43, 65);
// árvores: araucárias sacudíveis no alto, pinheiros e moitas
p.p('T', 3, 67, 46, 67, 18, 62, 34, 57, 4, 44, 46, 46, 16, 36, 27, 40, 3, 30, 46, 30, 15, 26, 33, 20, 4, 16, 46, 16, 3, 7, 46, 5);
p.p('t', 6, 6, 9, 13, 15, 13, 30, 12, 34, 14, 42, 6, 44, 12, 20, 8);
p.p('b', 22, 66, 26, 66, 14, 54, 30, 55, 42, 50, 8, 42, 30, 36, 38, 35, 12, 28, 26, 27, 36, 25, 4, 25, 33, 5);
// marcas
p.t(24, 69, 'S').t(25, 69, 'S').t(38, 0, 'N').t(39, 0, 'N').t(24, 2, 'K');
p.t(28, 65, '1').t(6, 55, '2').t(26, 49, '3').t(44, 42, '4').t(10, 35, '5').t(30, 23, '6').t(4, 21, '7').t(32, 9, '8').t(14, 6, '9');
p.t(22, 64, 'A').t(16, 53, 'B').t(24, 9, 'G').t(37, 6, 'H');
p.t(20, 66, 'q').t(46, 14, 's');
p.t(44, 61, 'a').t(43, 24, 'h').t(4, 48, 'i').t(46, 34, 'j').t(26, 30, 'k').t(5, 4, 'm').t(45, 56, 'n').t(17, 20, 'u').t(44, 4, 'y');
p.t(10, 12, 'Z').t(16, 10, 'Z').t(28, 13, 'Z').t(36, 12, 'Z').t(41, 14, 'Z');
const g = grade('B-R4', p.fim(), {
  S: ':', N: ':', K: ':', '1': '"', '2': '"', '3': '"', '4': '"', '5': '"', '6': '"', '7': '"', '8': '"', '9': '"', A: '.', B: ':', G: ':', H: ':', q: '.', s: '.',
  a: '.', h: ',', i: '"', j: '"', k: '.', m: '.', n: '.', u: '.', y: '.', Z: '.',
});
const placas = [
  placa(g, 'q', 'SUBIDA DA SERRA\nNorte: Serra da Geada. Paredões com trepadeira e fendas de pedregulho.\nSuba devagar; desça pelas saliências.'),
  placa(g, 's', 'TRILHA DO PICO PINDORAMA ⇡\nA oeste, depois da trepadeira grande.\nO Guia do Pico leva só quem tem as dezesseis insígnias.'),
];
const zona: ZonaDef = {
  id: 'B-R4', nome: 'Subida da Serra', mapa: 'B', tipo: 'rota', tileset: 'serra', musica: 'rota-dia-B', arena: 'pico', passo: 14, clima: 'limpo',
  mapaChars: g.mapa,
  objetos: [...placas.map((q) => q.objeto), ...objs(g, 'Z', 'araucaria'), { o: 'pedra-grande', x: 18, y: 50 }, { o: 'pedra-grande', x: 30, y: 39 }, { o: 'tronco-caido', x: 33, y: 63 }],
  placas: placas.map((q) => q.placa),
  warps: [
    ...saidas(g, 'S', 'B6', 24, 1, 's', 'borda'),
    ...saidas(g, 'N', 'B7', 24, 38, 'n', 'borda'),
    ...saidas(g, 'K', 'PP', 34, 52, 'n', 'borda', { requer: 'insignias:16', recusa: 'Um vento gelado desce do Pico e empurra {JOGADOR} de volta. Lá em cima, o Portão dos Guardiões só se abre para quem tem as dezesseis insígnias.' }),
  ],
  portoes: [{ x: g.p('G')[0], y: g.p('G')[1], requer: 'insignias:16', sprite: 'cl-montanhista', fala: 'Guia do Pico Carijó: "A trilha do Pico Pindorama começa nesta trepadeira. Lá em cima o vento derruba até Gavião."\f"O Portão dos Guardiões só abre para quem tem as dezesseis insígnias. Antes disso, a serra é que leva você."' }],
  npcs: [
    duelista(g, '1', 'B-R4-1', 'cl-montanhista', 'o', 4),
    duelista(g, '2', 'B-R4-2', 'cl-vaqueiro', 'l', 4),
    duelista(g, '3', 'B-R4-3', 'cl-escoteira', 's', 3),
    duelista(g, '4', 'B-R4-4', 'cl-observadora', 'n', 4),
    duelista(g, '5', 'B-R4-5', 'cl-garimpeiro', 'l', 4),
    duelista(g, '6', 'B-R4-6', 'cl-montanhista', 's', 3),
    duelista(g, '7', 'B-R4-7', 'cl-mateira', 's', 3),
    duelista(g, '8', 'B-R4-8', 'cl-repentista', 'o', 3),
    duelista(g, '9', 'B-R4-9', 'cl-biologa', 's', 3),
    gente(g, 'A', 'b-r4-tropeira', 'npc-mulher-3', 'Tropeira Graúna', { dir: 'l', fala: ['Subo esta serra toda semana levando erva-mate. As mulas sobem pela trilha; eu subo reclamando.', 'Pedregulho na fenda? Peça para uma criatura de Terra, Pedra ou Ginga empurrar. Trepadeira? Ginga, Comum ou Inseto sobe.'] }),
    gente(g, 'B', 'b-r4-pinhoeiro', 'npc-homem-1', 'Seu Pinhão-Manso', { dir: 's', script: 'b2-pinhoes' }),
    gente(g, 'H', 'b-r4-guia', 'cl-montanhista', 'Guia do Pico Carijó', { dir: 'o', fala: ['O Pico Pindorama fica entre os dois mapas, em cima de tudo. No topo, os Guardiões esperam quem junta as dezesseis insígnias.', 'Pelo lado da Costa, a subida é pelo Monte Tupã. Por aqui, é pela trepadeira grande.'] }),
  ],
  itens: [
    item(g, 'a', 'pt-48'), item(g, 'h', 'pepita'), item(g, 'i', 'garrafada', 2), item(g, 'j', 'cuia-ouro', 2), item(g, 'k', 'elixir-andiroba', 1, true), item(g, 'm', 'pt-10'),
    item(g, 'n', 'cha-guarana', 1, true), item(g, 'u', 'garapa', 1, true), item(g, 'y', 'pedra-lunar'),
  ],
  habitats: [
    {
      metodo: 'grama', taxa: 0.1,
      dia: [E(162, 62, 64, 24), E(34, 62, 64, 16), E(104, 63, 65, 14), E(12, 63, 65, 12), E(168, 63, 65, 12), E(136, 63, 65, 12), E(166, 64, 66, 10)],
      noite: [E(162, 62, 64, 26), E(34, 62, 64, 18), E(104, 63, 65, 8), E(168, 63, 65, 12), E(166, 64, 66, 12), E(94, 63, 65, 14), E(140, 64, 66, 10)],
      camadas: [{ apos: 16, todos: [E(162, 67, 69, 22), E(34, 67, 69, 16), E(104, 68, 70, 14), E(12, 68, 70, 12), E(168, 68, 70, 12), E(136, 68, 70, 12), E(166, 69, 70, 12)] }],
    },
    { metodo: 'rocha', todos: [E(162, 62, 65, 55), E(166, 63, 66, 45)], camadas: [{ apos: 16, todos: [E(162, 67, 69, 55), E(166, 68, 70, 45)] }] },
    { metodo: 'arvore', todos: [E(138, 62, 65, 60), E(136, 63, 65, 40)], camadas: [{ apos: 16, todos: [E(138, 67, 70, 60), E(136, 67, 70, 40)] }] },
  ],
};
export default zona;
