import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, bordas, entrada, gente, duelista, item, placa, E } from './_b1-lib';

/**
 * B-CH — Chapada dos Paredões (Chapada Rubra → Arraial Brasa). Passo 11: só se chega com o Amuleto de Escalar
 * (insígnia 10). Cinco degraus de chapada separados por paredões com trepadeira (`e`); saliências na beira de cada
 * degrau servem de atalho para descer. No terceiro degrau, a boca da Caverna Vulcânica (B-CV, exige Lampião).
 * Visível e fora de alcance: a prateleira da cascata do oeste (Cachoeira, insígnia 12). Escondidos: o recanto do
 * pedregulho (Força) e a gruta da rocha rachada (Quebra-pedra). Selvagens 48–51 (camada pós-insígnia 13: 54–57);
 * treinadores 47–51 (ás do líder 11 = 53).
 */
const p = new Pincel(40, 70, '.').borda('#');
// paredões entre os degraus, com trepadeira e com a saliência de descida
p.r(1, 56, 38, 2, '#').p('e', 12, 56, 12, 57).p('.', 33, 56).p('v', 33, 57);
p.r(1, 40, 38, 2, '#').p('e', 30, 40, 30, 41).p('.', 36, 40).p('v', 36, 41);
p.r(1, 24, 38, 2, '#').p('e', 8, 24, 8, 25).p('.', 3, 24).p('v', 3, 25);
p.r(1, 10, 38, 2, '#').p('e', 25, 10, 25, 11).p('.', 34, 10).p('v', 34, 11);
// trilhas de cada degrau
p.via(':', 2, 20, 68, 20, 59).via(':', 2, 12, 59, 20, 59).via(':', 1, 12, 58, 12, 58);
p.via(':', 2, 12, 50, 12, 55).via(':', 2, 12, 50, 30, 50).via(':', 2, 30, 42, 30, 50);
p.via(':', 2, 8, 33, 30, 33).via(':', 2, 30, 33, 30, 39).via(':', 2, 8, 26, 8, 33).via(':', 1, 32, 33, 35, 33);
p.via(':', 2, 8, 18, 25, 18).via(':', 2, 8, 12, 8, 23).via(':', 2, 25, 12, 25, 18);
p.via(':', 2, 14, 3, 25, 3).via(':', 2, 25, 3, 25, 9).via(':', 2, 14, 1, 14, 3);
// capim alto, mandacarus e pedras
p.r(24, 61, 10, 5, '"').r(3, 59, 6, 6, '"').r(16, 43, 10, 5, '"').r(31, 52, 6, 3, '"').r(12, 35, 12, 4, '"').r(2, 28, 4, 4, '"').r(12, 13, 9, 4, '"').r(29, 19, 8, 4, '"').r(2, 4, 8, 5, '"').r(28, 5, 9, 3, '"');
// prateleira da cascata (Cachoeira) e a lagoa de baixo
p.r(1, 42, 9, 5, '#').r(2, 42, 5, 2, ',').p('w', 4, 44, 4, 45, 4, 46).r(2, 47, 6, 6, '~');
// recanto do pedregulho (Força) e gruta da rocha rachada (Quebra-pedra)
p.r(30, 13, 9, 1, '#').r(30, 17, 9, 1, '#').r(30, 13, 1, 5, '#').r(31, 14, 8, 3, ',').p('p', 30, 15);
p.r(1, 13, 5, 6, '#').r(2, 14, 3, 3, ',').p('r', 4, 17).p('.', 4, 18);
p.t(20, 69, 'SS').t(14, 0, 'NN');
p.t(34, 31, 'H').t(22, 66, 'a').t(32, 30, 'n').t(17, 2, 'h');
p.t(27, 63, '1').t(9, 52, '2').t(22, 46, '3').t(19, 36, '4').t(14, 20, '5').t(33, 21, '6').t(6, 6, '7');
p.t(16, 61, '8').t(26, 28, '9');
p.t(4, 42, 'k').t(34, 15, 'j').t(3, 15, 'z').t(37, 62, 'q').t(2, 36, 'i').t(36, 2, 'm');
p.t(6, 66, 'u').t(34, 58, 'u').t(25, 53, 'u').t(4, 33, 'u').t(23, 27, 'u').t(31, 23, 'u').t(4, 21, 'u').t(20, 7, 'u').t(31, 2, 'u');
p.t(17, 64, 'U').t(36, 46, 'U').t(14, 29, 'U');
const g = grade('B-CH', p.fim(), {
  S: ':', N: ':', H: '.', a: '.', n: '.', h: '.', '1': '"', '2': '.', '3': '"', '4': '"', '5': '.', '6': '"', '7': '"', '8': '.', '9': '.',
  k: ',', j: ',', z: ',', q: '.', i: '.', m: '.', u: '.', U: '.',
});
const placas = [
  placa(g, 'a', 'CHAPADA DOS PAREDÕES\nCinco degraus de pedra até Arraial Brasa. Suba pela trepadeira; desça pela saliência.'),
  placa(g, 'n', 'CAVERNA VULCÂNICA\nEscuridão total. Chão quente. Sem Lampião, nem pense.\n"Aqui dorme a serpente de fogo." — os antigos'),
  placa(g, 'h', 'ARRAIAL BRASA logo ao norte.\nForjas, fogueira de São João e o Ginásio da Ferreira Labareda.'),
];
const zona: ZonaDef = {
  id: 'B-CH', nome: 'Chapada dos Paredões', mapa: 'B', tipo: 'rota', tileset: 'chapada', musica: 'rota-dia-B', arena: 'chapada', passo: 11, clima: 'sol',
  mapaChars: g.mapa,
  objetos: [obj(g, 'H', 'caverna-entrada'), ...objs(g, 'u', 'cacto'), ...objs(g, 'U', 'pedra-grande'), ...placas.map((q) => q.objeto)],
  placas: placas.map((q) => q.placa),
  warps: [
    ...bordas(g, 'S', 'B3', 23, 1, 's', 0, 0),
    ...bordas(g, 'N', 'B4', 24, 32, 'n', 1, 0),
    entrada(g, 'H', 'caverna-entrada', 'B-CV', 20, 34, { tipo: 'caverna' }),
  ],
  npcs: [
    duelista(g, '1', 'B-CH-1', 'cl-montanhista', 'o', 4),
    duelista(g, '2', 'B-CH-2', 'cl-observadora', 'l', 4),
    duelista(g, '3', 'B-CH-3', 'cl-capoeirista', 'o', 3),
    duelista(g, '4', 'B-CH-4', 'cl-garimpeiro', 's', 3),
    duelista(g, '5', 'B-CH-5', 'cl-repentista', 'l', 4),
    duelista(g, '6', 'B-CH-6', 'cl-montanhista', 'o', 3),
    duelista(g, '7', 'B-CH-7', 'cl-vaqueiro', 'l', 4),
    gente(g, '8', 'b-ch-escaladora', 'cl-montanhista', 'Escaladora Jandaíra', { dir: 'n', fala: ['Cada paredão tem um pé de trepadeira. Suba por ele. Para descer, pule a saliência da beira: é mais rápido e mais divertido.', 'A cascata do oeste? Aquilo só se sobe com o Amuleto da Cachoeira, do Mestre Gingado. Eu tentei de corda. A corda desceu primeiro.'] }),
    gente(g, '9', 'b-ch-pesquisador', 'cl-biologa', 'Vulcanóloga Brasilina', { dir: 's', fala: ['Medi o chão da Caverna Vulcânica: quarenta graus. E subindo quando uma coisa grande passa lá dentro.', 'Os antigos chamam de Boitatá. Ele só acorda para quem traz a Insígnia do Cristal. Ainda bem que eu trouxe só o termômetro.'] }),
  ],
  itens: [item(g, 'k', 'pedra-mare'), item(g, 'j', 'pt-49'), item(g, 'z', 'pedra-solar'), item(g, 'q', 'elixir-andiroba', 2), item(g, 'i', 'cuia-ouro', 3, true), item(g, 'm', 'garrafada', 3)],
  habitats: [
    {
      // 6.4 (B-CH, G): Gaviãozão (r, dia), Tatucanastra (i), Calangão (i), Ararinha (c) e Araracanga (r), Urubu-Rei (mr),
      // Jabutipiranga (i), Cascavelão (i), Emaçu (i), Seriemão (r), Mocozim (c) — no nível 48+ todas na forma crescida.
      metodo: 'grama', taxa: 0.1,
      dia: [E(52, 53, 55, 18), E(166, 53, 55, 16), E(34, 53, 55, 10), E(42, 53, 55, 10), E(82, 54, 56, 10), E(92, 53, 55, 10), E(102, 54, 56, 10), E(12, 54, 56, 8), E(104, 55, 56, 5), E(56, 55, 56, 3)],
      noite: [E(166, 53, 55, 20), E(92, 53, 55, 16), E(42, 53, 55, 14), E(34, 53, 55, 14), E(82, 54, 56, 12), E(102, 54, 56, 10), E(52, 54, 56, 8), E(56, 55, 56, 6)],
      camadas: [{
        apos: 13,
        dia: [E(52, 54, 56, 18), E(166, 54, 56, 14), E(34, 54, 56, 10), E(42, 54, 56, 10), E(82, 55, 57, 10), E(92, 54, 56, 10), E(102, 55, 57, 10), E(12, 55, 57, 10), E(104, 56, 57, 5), E(56, 56, 57, 3)],
        noite: [E(166, 54, 56, 18), E(92, 54, 56, 16), E(42, 54, 56, 14), E(34, 54, 56, 14), E(82, 55, 57, 12), E(102, 55, 57, 10), E(52, 55, 57, 8), E(56, 56, 57, 8)],
      }],
    },
    { metodo: 'rocha', todos: [E(166, 53, 55, 100)], camadas: [{ apos: 13, todos: [E(166, 54, 56, 100)] }] },
  ],
};
export default zona;
