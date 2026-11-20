import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, objs, bordas, gente, duelista, item, placa, E } from './_b1-lib';

/**
 * B-R2 — Estrada Vermelha (Porto Pantaneiro → Chapada Rubra). Passo 10: só abre depois do ninhal salvo (`pantanal-ok`).
 * A estrada de terra roxa serpenteia entre mesas de pedra; rochas rachadas fecham o caminho em três pontos (Quebra-pedra) e
 * as saliências do meio dão um atalho de volta. Visíveis e fora de alcance: a Mesa do Gavião (Escalar, insígnia 10) e a
 * gruta do poço da cascata seca (Cachoeira, insígnia 12). Escondido: o bosque de pequizeiros atrás do cipó (Facão).
 * Selvagens 46–49 (camada pós-insígnia 12: 52–55); treinadores 46–49 (ás do líder 10 = 51).
 */
const p = new Pincel(90, 30, '.').borda('#');
// mesas de pedra e paredões
p.r(20, 1, 12, 5, '#').r(5, 20, 10, 8, '#').r(40, 22, 14, 7, '#').r(78, 1, 11, 6, '#').r(46, 1, 8, 4, '#');
p.q(60, 2, 10, 7, '#').r(61, 3, 8, 5, ',').p('e', 64, 8);
// estrada
p.via(':', 2, 1, 14, 15, 14, 15, 8, 35, 8, 35, 19, 55, 19, 55, 12, 75, 12, 75, 16, 88, 16);
p.r(25, 1, 1, 28, '#').r(80, 1, 1, 28, '#').p('r', 25, 8, 25, 9, 55, 15, 56, 15, 80, 16, 80, 17);
// capim alto
p.r(3, 3, 8, 5, '"').r(17, 16, 10, 5, '"').r(38, 10, 9, 6, '"').r(58, 21, 12, 5, '"').r(70, 6, 6, 4, '"').r(71, 22, 6, 4, '"').r(28, 22, 8, 5, '"');
// saliências do atalho (só se pula para baixo) e as árvores de marimbondo
p.r(37, 17, 12, 1, 'v');
p.p('t', 12, 10, 30, 13, 44, 6, 66, 18, 72, 24, 84, 9, 9, 17);
// bosque de pequizeiros atrás do cipó (Facão)
p.r(36, 1, 9, 5, 'T').r(37, 2, 7, 3, '.').p('c', 40, 5).r(40, 6, 1, 2, '.');
// poço da cascata seca (Cachoeira)
p.r(82, 19, 7, 6, '#').r(83, 20, 5, 3, '~').r(84, 21, 3, 1, ';').r(85, 23, 1, 2, 'w').r(81, 25, 8, 3, '~');
p.t(0, 14, 'O', 'O').t(89, 16, 'Z', 'Z');
p.t(8, 12, 'a').t(86, 14, 'n').t(63, 10, 'h');
p.t(13, 15, '1').t(28, 7, '2').t(34, 14, '3').t(45, 20, '4').t(57, 17, '5').t(68, 11, '6').t(83, 17, '7');
p.t(22, 11, '8').t(73, 19, '9');
p.t(65, 4, 'k').t(42, 3, 'j').t(85, 21, 'z').t(5, 9, 'q').t(52, 13, 'i').t(77, 3, 'Q').t(60, 27, 'm');
p.t(11, 18, 'K').t(31, 17, 'K').t(48, 9, 'K').t(70, 15, 'K').t(77, 21, 'K').t(19, 12, 'K').t(4, 13, 'K');
const g = grade('B-R2', p.fim(), {
  O: ':', Z: ':', a: '.', n: '.', h: '.', '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.', '7': '.', '8': '.', '9': '.',
  k: ',', j: '.', z: ';', q: '"', i: '.', Q: '.', m: '"', K: '.',
});
const placas = [
  placa(g, 'a', 'ESTRADA VERMELHA\nOeste: Porto Pantaneiro. Leste: Chapada Rubra.\nTerra roxa mancha a bota. A bota que se acostume.'),
  placa(g, 'n', 'CHAPADA RUBRA logo adiante.\nCidade do garimpo, da mina velha e do Ginásio da Pedra.'),
  placa(g, 'h', 'MESA DO GAVIÃO\nNinho de Gaviãozão no alto. Escalada só com o Amuleto de Escalar.'),
];
const zona: ZonaDef = {
  id: 'B-R2', nome: 'Estrada Vermelha', mapa: 'B', tipo: 'rota', tileset: 'chapada', musica: 'rota-dia-B', arena: 'chapada', passo: 10, clima: 'sol',
  mapaChars: g.mapa,
  objetos: [...objs(g, 'K', 'cacto'), { o: 'pedra-grande', x: 33, y: 26 }, { o: 'pedra-grande', x: 66, y: 27 }, { o: 'tronco-caido', x: 38, y: 3 }, ...placas.map((q) => q.objeto)],
  placas: placas.map((q) => q.placa),
  warps: [...bordas(g, 'O', 'B9', 42, 14, 'o', 0, 1), ...bordas(g, 'Z', 'B3', 1, 17, 'l', 0, 1)],
  npcs: [
    duelista(g, '1', 'B-R2-1', 'cl-vaqueiro', 'l', 4),
    duelista(g, '2', 'B-R2-2', 'cl-garimpeiro', 's', 3),
    duelista(g, '3', 'B-R2-3', 'cl-observadora', 'o', 4),
    duelista(g, '4', 'B-R2-4', 'cl-repentista', 'n', 3),
    duelista(g, '5', 'B-R2-5', 'cl-montanhista', 'o', 3),
    duelista(g, '6', 'B-R2-6', 'cl-capoeirista', 's', 4),
    duelista(g, '7', 'B-R2-7', 'cl-garimpeiro', 'o', 3),
    gente(g, '8', 'b-r2-tropeiro', 'npc-homem-2', 'Tropeiro Bené', { dir: 's', fala: ['Pedra rachada fecha a estrada em três lugares. Quem passa com Quebra-pedra deixa aberto, mas na volta a pedra cresce de novo.', 'Pedra que cresce? É o Minhocão por baixo, empurrando. Ou é história de tropeiro. Escolha.'] }),
    gente(g, '9', 'b-r2-raizeira', 'npc-idosa', 'Benzedeira Dona Arnica', { dir: 'o', fala: ['Lá no fundo, aquele poço seco tem uma cascata que só corre para cima na lua cheia. Mentira: corre para baixo, que nem toda cascata.', 'Para subir aquilo você precisa do Amuleto da Cachoeira. Para ter paciência, precisa de chá de camomila.'] }),
  ],
  itens: [
    item(g, 'k', 'pt-41'), item(g, 'j', 'pequi', 3), item(g, 'z', 'pedra-lunar'), item(g, 'q', 'garrafada', 2, true), item(g, 'i', 'cuia-ouro', 2),
    item(g, 'Q', 'pepita', 1, true), item(g, 'm', 'elixir-andiroba'),
  ],
  habitats: [
    {
      // 6.4 (B-R2, G): Tatucanastra (c), Urubuzim (c), Jabutipiranga (r), Jararaquinha (c), Cascavelzim (i), Seriemão (i),
      // Escorpim (i), Mocozim (c) — no nível 46+ as linhas já evoluídas aparecem crescidas.
      metodo: 'grama', taxa: 0.11,
      dia: [E(34, 50, 52, 16), E(56, 50, 52, 14), E(89, 50, 52, 16), E(166, 50, 52, 16), E(92, 51, 53, 10), E(104, 51, 53, 10), E(146, 51, 53, 10), E(82, 52, 53, 8)],
      noite: [E(89, 50, 52, 20), E(92, 51, 53, 16), E(146, 51, 53, 16), E(34, 50, 52, 14), E(166, 50, 52, 14), E(56, 50, 52, 12), E(82, 52, 53, 8)],
      camadas: [{
        apos: 12,
        dia: [E(34, 52, 54, 16), E(56, 52, 54, 16), E(89, 52, 54, 14), E(166, 52, 54, 14), E(92, 53, 55, 10), E(104, 53, 55, 10), E(146, 53, 55, 10), E(82, 54, 55, 10)],
        noite: [E(89, 52, 54, 18), E(92, 53, 55, 16), E(146, 53, 55, 18), E(34, 52, 54, 14), E(166, 52, 54, 12), E(56, 52, 54, 12), E(82, 54, 55, 10)],
      }],
    },
    { metodo: 'arvore', todos: [E(152, 50, 52, 100)], camadas: [{ apos: 12, todos: [E(152, 52, 54, 100)] }] },
    { metodo: 'rocha', todos: [E(160, 50, 52, 70), E(166, 50, 52, 30)], camadas: [{ apos: 12, todos: [E(160, 52, 54, 70), E(166, 52, 54, 30)] }] },
  ],
};
export default zona;
