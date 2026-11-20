import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, saidas, gente, duelista, item, E } from './_b1-lib';

/**
 * B-CV — Caverna Vulcânica (opcional; boca no terceiro degrau da Chapada dos Paredões). Escura: exige o Lampião.
 * Galerias de rocha morna em volta de poços de lava cercados por pedra; no salão do fundo dorme o Boitatá (173), que só
 * desperta para quem traz a Insígnia do Cristal (10) — evento `b1-boitata`, nível 50, lendário.
 * Escondidos: o nicho do veio rachado (Quebra-pedra) e a câmara do pedregulho (Força). Selvagens 48–51; treinadores 48–51.
 */
const p = new Pincel(40, 36, '#');
// galerias
p.r(17, 28, 7, 7, '%').r(18, 33, 5, 2, '.').via('%', 2, 6, 27, 22, 27).via('%', 2, 6, 14, 6, 27).via('%', 2, 6, 14, 20, 14).via('%', 2, 22, 22, 33, 22).via('%', 2, 32, 8, 32, 22);
p.r(22, 20, 4, 4, '%').r(3, 18, 3, 6, '%').r(9, 9, 10, 4, '%').r(26, 26, 10, 6, '%');
p.via(':', 1, 20, 14, 20, 6).via(':', 1, 20, 6, 32, 6).r(30, 4, 5, 4, '.').r(12, 13, 1, 1, '%').r(28, 24, 1, 2, '%');
// salão do Boitatá (fundo): chão de pedra lisa, poço de lava ao redor
p.r(12, 1, 17, 4, '.').q(12, 1, 5, 4, '#').r(13, 2, 3, 2, 'x').q(24, 1, 5, 4, '#').r(25, 2, 3, 2, 'x').r(19, 5, 3, 2, '.').p(':', 20, 5);
// poços de lava cercados por rocha
p.r(9, 18, 8, 6, '#').r(10, 19, 6, 4, 'x').r(26, 9, 4, 8, '#').r(27, 10, 2, 6, 'x').r(25, 28, 1, 1, '#').r(36, 26, 3, 6, '#').r(37, 27, 1, 4, 'x');
// nicho do veio rachado (Quebra-pedra) e câmara do pedregulho (Força)
p.r(2, 30, 6, 4, '.').p('r', 8, 31).r(8, 30, 1, 1, '#').r(9, 31, 8, 1, '%');
p.r(35, 12, 4, 5, '.').p('p', 34, 14);
p.t(20, 35, 'D').t(20, 3, 'B');
p.t(8, 16, '1').t(30, 28, '2').t(14, 10, '3').t(31, 15, '4');
p.t(4, 31, 'k').t(37, 13, 'j').t(30, 5, 'z').t(3, 20, 'q').t(34, 29, 'i');
const g = grade('B-CV', p.fim(), { D: '+', B: '.', '1': '%', '2': '%', '3': '%', '4': '%', k: '.', j: '.', z: '.', q: '%', i: '%' });
const zona: ZonaDef = {
  id: 'B-CV', nome: 'Caverna Vulcânica', mapa: 'B', tipo: 'caverna', tileset: 'caverna', musica: 'caverna', arena: 'vulcao', escuro: true, passo: 11,
  mapaChars: g.mapa,
  objetos: [{ o: 'placa', x: 23, y: 33 }, { o: 'pedra-grande', x: 28, y: 31 }],
  placas: [{ x: 23, y: 33, texto: 'CAVERNA VULCÂNICA\nO chão esquenta a cada passo para o norte. Lá no fundo, o calor tem respiração.' }],
  warps: saidas(g, 'D', 'B-CH', 35, 32, 's', 'caverna'),
  npcs: [
    duelista(g, '1', 'B-CV-1', 'cl-garimpeiro', 'o', 4),
    duelista(g, '2', 'B-CV-2', 'cl-mergulhador', 'n', 3),
    duelista(g, '3', 'B-CV-3', 'cl-montanhista', 'l', 4),
    duelista(g, '4', 'B-CV-4', 'cl-ferreiro', 'l', 3),
    gente(g, 'B', 'boitata', 'c:boitata', 'Boitatá', { dir: 's', se: '!flag:boitata-ok', script: 'b1-boitata' }),
  ],
  gatilhos: [{ x: 19, y: 5, w: 3, h: 1, script: 'b1-boitata', se: '!flag:boitata-ok' }],
  itens: [item(g, 'k', 'pt-50'), item(g, 'j', 'elixir-andiroba', 2), item(g, 'z', 'pedra-solar'), item(g, 'q', 'fumaca-andiroba-forte', 2, true), item(g, 'i', 'garrafada', 2, true)],
  habitats: [{
    // 6.4 (B-CV, C): Morcegão (c), Vampirinha (r, noite), Calangão (c), Escorpim (c) e Escorpião-Rei (r) — o Escorpim já
    // aparece crescido no nível 48+. Completam a gruta Caranguejeirão e Noitão, das grutas da Costa, que fogem do frio.
    metodo: 'caverna', taxa: 0.1,
    todos: [E(31, 53, 55, 24), E(42, 53, 55, 22), E(146, 53, 55, 22), E(148, 53, 55, 14), E(172, 54, 56, 12), E(166, 53, 55, 6)],
    noite: [E(31, 53, 55, 22), E(42, 53, 55, 18), E(146, 53, 55, 18), E(32, 54, 56, 10), E(148, 53, 55, 14), E(172, 54, 56, 12), E(166, 53, 55, 6)],
    camadas: [{
      apos: 13,
      todos: [E(31, 54, 56, 22), E(42, 54, 56, 22), E(146, 54, 56, 24), E(148, 54, 56, 14), E(172, 55, 57, 12), E(166, 54, 56, 6)],
      noite: [E(31, 54, 56, 20), E(42, 54, 56, 18), E(146, 54, 56, 18), E(32, 55, 57, 14), E(148, 54, 56, 12), E(172, 55, 57, 12), E(166, 54, 56, 6)],
    }],
  }],
};
export default zona;
