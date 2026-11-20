import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, entrada, saidas, bordas, gente, duelista, item, placa, E } from './_b2n-lib';
import { B7_PARA_BLG } from './_b2n-ligacoes';

/**
 * B-LG · Lagoa Gelada (arredores de B7 Serra da Geada) — passo 14. Lagoa de águas frias entre araucárias: a margem dá
 * a volta inteira a pé, mas a Ilha do Joca (barraco do pescador, B-LG-cabana) e a praia dos juncos do norte só de canoa
 * (Remo). Ligações: sul ↔ B7 (chegada aqui em (24, 42)); leste ↔ Campos de Altitude (B-SG), chegada em (48, 8).
 * Secretos: a Poça de Cima, no alto da cascata do noroeste (Cachoeira). Pós-jogo: na ponta do Trapiche Comprido, depois
 * do Conselho, o canto do Jubartão (`b2n-jubarte`, uma vez por dia).
 * 6.4 (B-LG): Capivarona (S r), Lontrinha/Lontra-Veloz (S c/i), Tuiuiú (G r), Jubartão (S r, pós-jogo: evento),
 * Pinguinzinho/Pinguimar (S c/i), Lavadeira-Dragão (G r). Selvagens 55–57 (camada pós-insígnia 15: 58–60).
 */
const p = new Pincel(50, 44, '.').borda('#');
// a lagoa (margem desenhada em degraus, sem sorteio)
p.r(7, 6, 36, 29, '~').r(9, 5, 30, 1, '~').r(10, 35, 28, 1, '~').r(6, 9, 1, 22, '~').r(43, 8, 1, 24, '~').r(12, 36, 18, 1, '~');
// Ilha do Joca
p.r(18, 15, 11, 8, '.').r(17, 17, 1, 4, '.').r(29, 17, 1, 4, '.').r(20, 16, 6, 2, ',').r(19, 22, 9, 1, ';').p('T', 18, 15, 28, 15, 28, 22).r(22, 23, 2, 3, '=');
// trapiches da margem leste e o Trapiche Comprido (ponta: o canto do Jubartão)
p.r(36, 26, 8, 1, '=').r(39, 12, 5, 1, '=');
// praia dos juncos (norte) — só de canoa
p.r(8, 1, 32, 4, ';').r(10, 2, 26, 2, '"').p('T', 8, 1, 39, 1, 22, 1);
// cascata do noroeste e a Poça de Cima
p.r(1, 1, 5, 6, '#').r(2, 2, 3, 2, ',').p('w', 3, 4, 3, 5, 3, 6).p('~', 3, 7, 4, 7, 5, 7).p('~', 4, 8, 5, 8).p('~', 5, 9, 6, 8);
// margens a pé: leste, sul e oeste
p.via(':', 2, 46, 8, 46, 38).via(':', 2, 24, 38, 46, 38).via(':', 2, 24, 38, 24, 43).via(':', 2, 2, 38, 24, 38).via(':', 2, 2, 12, 2, 39);
p.r(0, 8, 1, 2, '#').r(48, 8, 1, 2, ':').r(46, 8, 3, 2, ':');
// pinheiral e moitas da margem
p.p('T', 1, 41, 4, 42, 9, 41, 14, 42, 33, 41, 38, 42, 44, 41, 48, 40, 48, 30, 48, 20, 48, 13, 45, 3, 47, 5, 1, 30, 1, 20, 4, 10, 41, 2, 44, 6);
p.p('t', 6, 41, 18, 41, 30, 41, 42, 42, 48, 24, 48, 34, 1, 25, 1, 35);
p.p('b', 11, 40, 20, 40, 28, 40, 36, 40, 45, 33, 45, 16, 4, 16, 4, 28);
p.r(5, 36, 4, 1, '"').r(40, 36, 4, 1, '"').r(45, 10, 1, 5, '"').r(4, 18, 1, 8, '"').r(26, 40, 6, 2, '"').r(12, 40, 6, 2, '"');
// marcas
p.t(24, 43, 'SS').t(49, 8, 'L', 'L');
p.t(21, 20, 'Q').t(27, 39, 'a').t(47, 11, 'n').t(44, 25, 'm');
p.t(45, 22, '1').t(35, 37, '2').t(10, 37, '3').t(3, 24, '4').t(30, 3, '5');
p.t(38, 37, 'G').t(15, 3, 'H').t(21, 41, 'F');
p.t(3, 2, 'k').t(36, 2, 'j').t(27, 21, 'i').t(1, 40, 'q').t(47, 36, 'y').t(19, 16, 'z');
p.t(42, 36, 'P').t(4, 33, 'U');
const g = grade('B-LG', p.fim(), {
  S: ':', L: '.', Q: '.', a: '.', n: '.', m: '.', '1': ':', '2': '.', '3': '.', '4': '.', '5': '"', G: '.', H: ';', F: '.',
  k: ',', j: '"', i: ';', q: '.', y: '.', z: '.', P: '.', U: '.',
});
const placas = [
  placa(g, 'a', 'LAGOA GELADA\nSul: Serra da Geada. Leste: Campos de Altitude.\nÁgua fria o ano todo. Remo para a ilha e para a praia dos juncos.'),
  placa(g, 'n', 'CAMPOS DE ALTITUDE ⇢\nCapim dourado e geada.'),
  placa(g, 'm', 'TRAPICHE COMPRIDO\n"Na ponta, nos dias de silêncio, os velhos juram que se ouve uma baleia cantando no fundo da lagoa."'),
];
const zona: ZonaDef = {
  id: 'B-LG', nome: 'Lagoa Gelada', mapa: 'B', tipo: 'agua', tileset: 'geada', musica: 'agua', arena: 'geada', passo: 14, clima: 'garoa',
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'Q', 'casa-d'), obj(g, 'F', 'fogueira'), obj(g, 'P', 'canoa'), obj(g, 'U', 'pedra-grande'),
    { o: 'araucaria', x: 33, y: 39 }, { o: 'araucaria', x: 7, y: 39 }, { o: 'araucaria', x: 46, y: 41 }, { o: 'banco', x: 20, y: 37 },
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...saidas(g, 'S', 'B7', B7_PARA_BLG[0], B7_PARA_BLG[1], 's'),
    ...bordas(g, 'L', 'B-SG', 1, 8, 'l', 0, 1),
    entrada(g, 'Q', 'casa-d', 'B-LG-cabana', 5, 7),
  ],
  npcs: [
    duelista(g, '1', 'B-LG-1', 'cl-pescador', 'o', 3),
    duelista(g, '2', 'B-LG-2', 'cl-surfista', 'n', 3),
    duelista(g, '3', 'B-LG-3', 'cl-mergulhador', 'n', 3),
    duelista(g, '4', 'B-LG-4', 'cl-observadora', 'l', 3),
    duelista(g, '5', 'B-LG-5', 'cl-pescador', 's', 3),
    gente(g, 'G', 'b-lg-canoeira', 'npc-mulher-2', 'Canoeira Itaipava', { dir: 'n', fala: ['A canoa é sua se a sua criatura de Rio quiser puxar. Na água gelada, só bicho de Rio aceita.', 'A ilha do meio é do Joca, pai da Estrela-d’Alva do Planalto Lume. Ele não sai de lá nem para buscar carta.'] }),
    gente(g, 'H', 'b-lg-juncos', 'cl-biologa', 'Drª Junco', { dir: 's', fala: ['Estudo as libélulas da praia dos juncos. A Lavadeira-Dragão é a mais rara: aparece de vez em quando, com asas de vitral.', 'O Tuiuiú também passa por aqui. Ele sobe do Pantanal no inverno, ninguém sabe por quê. Talvez goste de frio.'] }),
  ],
  gatilhos: [{ x: 36, y: 26, script: 'b2n-jubarte', se: 'pos-jogo' }],
  itens: [item(g, 'k', 'pt-09'), item(g, 'j', 'cuia-rede', 3), item(g, 'i', 'garrafada', 2), item(g, 'q', 'elixir-andiroba', 1, true), item(g, 'y', 'cuia-rapida', 3), item(g, 'z', 'concha-rara')],
  habitats: [
    {
      metodo: 'agua', taxa: 0.08,
      todos: [E(134, 64, 66, 45), E(76, 64, 66, 45), E(58, 65, 66, 10)],
      camadas: [{ apos: 15, todos: [E(134, 67, 69, 42), E(76, 67, 69, 42), E(58, 67, 69, 16)] }],
    },
    {
      metodo: 'grama', taxa: 0.1,
      dia: [E(108, 64, 66, 22), E(136, 64, 66, 20), E(47, 64, 66, 18), E(46, 64, 66, 16), E(106, 65, 66, 12), E(156, 65, 66, 12)],
      noite: [E(44, 64, 66, 22), E(60, 64, 66, 20), E(108, 64, 66, 18), E(162, 64, 66, 16), E(106, 65, 66, 12), E(156, 65, 66, 12)],
      camadas: [{
        apos: 15,
        dia: [E(108, 67, 69, 22), E(136, 67, 69, 20), E(47, 67, 69, 18), E(46, 67, 69, 16), E(106, 67, 69, 12), E(156, 67, 69, 12)],
        noite: [E(44, 67, 69, 22), E(60, 67, 69, 20), E(108, 67, 69, 18), E(162, 67, 69, 16), E(106, 67, 69, 12), E(156, 67, 69, 12)],
      }],
    },
    { metodo: 'pesca-velha', todos: [E(133, 25, 30, 50), E(75, 25, 29, 50)] },
    { metodo: 'pesca-boa', todos: [E(134, 64, 65, 50), E(76, 64, 65, 50)] },
    { metodo: 'pesca-mestra', todos: [E(134, 65, 66, 40), E(76, 65, 66, 30), E(58, 65, 66, 30)] },
  ],
};
export default zona;
