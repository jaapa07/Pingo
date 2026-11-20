import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, bordas, gente, duelista, item, placa, E } from './_b1-lib';

/**
 * B-PA — Pantanal Alagado. Liga Vila Cascavel (oeste, pela lagoa), o Cerrado Aberto (noroeste, por terra), Pantanal
 * Grande (leste, pelas passarelas) e Porto Pantaneiro (sul, pelo canal).
 * Norte (passo 9): campo do noroeste, ilha do Morro do Urucum e campo do leste, ligados por passarelas — o caminho a pé
 * até a Boiadeira Zefa. Uma faixa de mata ciliar separa o sul: o único canal tem a canoa do peão da Zefa, que só deixa
 * passar quem tem a Insígnia do Barro (9). No sul fica o ninhal, onde o tenente Arame, do Cartel Ferrugem, rouba ovos
 * (evento `b1-pantanal` → `pantanal-ok`); a rede de arrasto do Cartel fecha o canal para Porto Pantaneiro até lá.
 * Visível e fora de alcance: o alto do Morro do Urucum (Escalar, insígnia 10). Escondido: a clareira da mata ciliar (Facão).
 * Selvagens 44–48 (média ≤ 47); treinadores 45–47 no norte, 46–49 no sul; o tenente com ás 50.
 */
const p = new Pincel(60, 56, '~').borda('T');
// noroeste: campo de chegada do Cerrado Aberto
p.r(1, 1, 14, 14, '.').r(3, 2, 5, 3, '"').r(2, 10, 3, 3, '"').r(9, 10, 4, 3, '"').via(':', 1, 1, 7, 14, 7).r(1, 14, 14, 1, ';');
p.r(15, 7, 7, 1, '=');
// ilha do Morro do Urucum
p.r(22, 3, 17, 13, '.').r(22, 15, 17, 1, ';').r(23, 10, 6, 4, '"').r(35, 12, 3, 3, '"').r(24, 5, 4, 2, 'l');
p.q(30, 3, 7, 6, '#').r(31, 4, 5, 4, '.').p('e', 33, 8).via(':', 1, 22, 7, 29, 7).via(':', 1, 33, 9, 33, 11).via(':', 1, 29, 11, 38, 11);
p.r(39, 11, 7, 1, '=');
// leste: campo das palafitas, saída para Pantanal Grande
p.r(46, 5, 13, 17, '.').r(48, 15, 6, 4, '"').r(52, 6, 5, 3, '"').via(':', 1, 46, 11, 58, 11).r(46, 21, 13, 1, ';').p('T', 50, 9, 56, 14, 47, 19);
// mata ciliar que separa o sul (canal com a canoa do peão)
p.r(1, 24, 58, 2, 'T').r(28, 24, 3, 2, '~');
// ninhal
p.r(14, 30, 26, 14, '.').r(14, 30, 26, 1, ';').r(16, 38, 6, 4, '"').r(32, 39, 6, 3, '"').r(24, 41, 5, 2, 'l').p('T', 15, 31, 38, 31, 20, 34, 35, 35, 14, 43, 39, 43);
p.via(':', 1, 29, 31, 29, 36).via(':', 1, 22, 36, 36, 36);
// mata do sudoeste com a clareira escondida atrás do cipó
p.r(1, 27, 12, 27, 'T').r(3, 40, 6, 5, '.').r(9, 42, 4, 1, '.').p('c', 9, 42).r(4, 41, 2, 2, '"');
// ilhota do sudeste
p.r(44, 30, 12, 11, '.').r(44, 30, 12, 1, ';').r(46, 34, 4, 4, '"').p('T', 54, 31, 45, 39);
// canal sul para Porto Pantaneiro
p.r(1, 46, 25, 10, 'T').r(30, 46, 29, 10, 'T');
// margens de capim no canal (fechadas na altura da rede) e aguapés no fundo do ninhal
p.r(21, 46, 5, 8, '.').r(30, 46, 5, 8, '.').r(22, 47, 3, 2, '"').r(31, 51, 3, 2, '"').r(21, 50, 5, 1, 'T').r(30, 50, 5, 1, 'T').r(31, 4, 5, 4, ',');
p.t(0, 6, 'O', 'O', 'O').t(59, 11, 'Z', 'Z').t(0, 16, 'Y', 'Y', 'Y', 'Y').t(26, 55, 'XXXX');
// marcas: placas, pessoas, itens, objetos
p.t(12, 6, 'a').t(22, 8, 'n').t(46, 10, 'h').t(27, 30, 'm');
p.t(5, 5, '1').t(26, 13, '2').t(52, 13, '3').t(37, 5, '4').t(25, 33, '5').t(33, 34, '6').t(18, 40, '7').t(49, 32, '8');
p.t(10, 3, 'i').t(48, 7, 'j').t(29, 33, 'k').t(27, 38, 'q').t(22, 32, 's').t(31, 41, 'u').t(53, 36, 'L');
p.t(33, 5, 'z').t(5, 43, 'y').t(36, 13, 'U').t(52, 38, 'V');
p.t(17, 33, 'N').t(36, 33, 'N').t(22, 39, 'N').t(37, 41, 'N').t(26, 4, 'F').t(19, 4, 'H').t(54, 20, 'G');
const g = grade('B-PA', p.fim(), {
  O: '.', Z: '.', Y: '~', X: '~', a: '.', n: '.', h: '.', m: ';', '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.', '7': '.', '8': '.',
  i: '.', j: '.', k: '.', q: '.', s: '.', u: '.', L: '.', z: '.', y: '.', U: '.', V: '.', N: '.', F: '.', H: '.', G: '.',
});
const placas = [
  placa(g, 'a', 'PANTANAL ALAGADO\nOeste: Cerrado Aberto. Leste, pelas passarelas: Pantanal Grande.\nSul: o ninhal (área interditada pela Boiadeira Zefa).'),
  placa(g, 'n', 'PASSARELA DO URUCUM\nTábua velha, rio fundo, jacaré curioso. Ande no meio.'),
  placa(g, 'h', 'PANTANAL GRANDE logo a leste.\nPalafitas, boiada e o Ginásio da Boiadeira Zefa.'),
  placa(g, 'm', 'NINHAL DO PANTANAL\nTuiuiús, garças e colhereiros fazem ninho aqui na cheia. Proibido mexer nos ovos.'),
];
const zona: ZonaDef = {
  id: 'B-PA', nome: 'Pantanal Alagado', mapa: 'B', tipo: 'agua', tileset: 'pantanal', musica: 'agua', arena: 'pantanal', passo: 9,
  mapaChars: g.mapa,
  objetos: [
    ...objs(g, 'N', 'ninho'),
    obj(g, 'F', 'ninho', { script: 'b1-foto-4' }),
    obj(g, 'H', 'canoa'), obj(g, 'G', 'casa-palafita'),
    { o: 'fogueira', x: 31, y: 34 }, { o: 'barco', x: 34, y: 28 },
    { o: 'tronco-caido', x: 4, y: 12 }, { o: 'tronco-caido', x: 50, y: 33 }, { o: 'pedra-grande', x: 25, y: 9 },
    { o: 'buriti', x: 2, y: 2 }, { o: 'buriti', x: 13, y: 12 }, { o: 'buriti', x: 47, y: 7 }, { o: 'buriti', x: 57, y: 6 }, { o: 'buriti', x: 24, y: 14 },
    { o: 'ipe-roxo', x: 38, y: 4 }, { o: 'ipe-amarelo', x: 49, y: 20 }, { o: 'ipe-amarelo', x: 16, y: 42 },
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...bordas(g, 'O', 'B-CE', 58, 12, 'o', 0, 1),
    ...bordas(g, 'Z', 'B2', 1, 15, 'l', 0, 1),
    ...bordas(g, 'Y', 'B1', 42, 28, 'o', 0, 1),
    ...bordas(g, 'X', 'B9', 20, 1, 's', 1, 0),
  ],
  portoes: [
    { x: 28, y: 24, w: 3, h: 1, requer: 'insignia:9', sprite: 'cl-vaqueiro', fala: 'Um peão da Boiadeira Zefa atravessa a canoa no canal:\n— Opa, Campeão! Ninhal interditado: tem gente rondando os ovos e a Zefa mandou fechar.\f— Ordem dela: só passa quem tiver a Insígnia do Barro. Bicho de ninhal é grande e bravo, não é lugar para quem ainda não venceu a boiadeira.' },
    { x: 26, y: 50, w: 4, h: 1, requer: 'flag:pantanal-ok', fala: 'Uma rede de arrasto do Cartel Ferrugem fecha o canal de margem a margem, presa em estacas de ferro.\nNem canoa, nem peixe, nem palpite passa.' },
  ],
  npcs: [
    duelista(g, '1', 'B-PA-1', 'cl-observadora', 's', 4),
    duelista(g, '2', 'B-PA-2', 'cl-pescador', 'n', 3),
    duelista(g, '3', 'B-PA-3', 'cl-vaqueiro', 'o', 4),
    gente(g, '4', 'b-pa-ribeirinha', 'npc-mulher-4', 'Ribeirinha Dona Cambará', { dir: 'o', mov: 'olhar', fala: ['Lá em cima do Morro do Urucum tem um ninho de Tuiuiú antigo e umas pedras brilhando.', 'Morro de pedra lisa, com trepadeira na face sul. Só sobe quem tem o Amuleto de Escalar.'] }),
    duelista(g, '5', 'B-PA-5', 'capanga-m', 'l', 3, { se: '!flag:pantanal-ok' }),
    duelista(g, '6', 'B-PA-6', 'capanga-f', 'o', 3, { se: '!flag:pantanal-ok' }),
    duelista(g, '7', 'B-PA-7', 'capanga-m', 'n', 4, { se: '!flag:pantanal-ok' }),
    duelista(g, '8', 'B-PA-8', 'cl-pescador', 's', 3),
    gente(g, 'k', 'arame', 'tenente-arame', 'Tenente Arame', { dir: 's', se: '!flag:pantanal-ok', script: 'b1-pantanal' }),
    gente(g, 'q', 'b-pa-biologa', 'cl-biologa', 'Bióloga Ingá', { dir: 'o', se: 'flag:pantanal-ok', fala: ['Contei os ninhos do ninhal: todos os ovos de volta e chocando!', 'Os filhotes que o Cartel tirou dos ninhos estão no Centro de Reabilitação de Pantanal Grande. A veterinária procura quem adote.'] }),
    gente(g, 's', 'b-pa-peao', 'cl-vaqueiro', 'Peão Bastião', { dir: 'l', se: 'flag:pantanal-ok', fala: ['A Zefa mandou agradecer: a rede do Cartel saiu do canal sul. Porto Pantaneiro está aberto de novo.', 'De lá sai a Estrada Vermelha, que sobe para a Chapada Rubra. Leve o Quebra-pedra: a estrada é só pedra rachada.'] }),
  ],
  gatilhos: [{ x: 27, y: 35, w: 5, h: 1, script: 'b1-pantanal', se: 'insignia:9&!flag:pantanal-ok' }],
  itens: [
    item(g, 'i', 'cuia-rede', 3), item(g, 'j', 'garrafada', 2), item(g, 'u', 'elixir-andiroba'), item(g, 'L', 'pt-26'),
    item(g, 'z', 'pedra-mare'), item(g, 'y', 'cuia-ouro', 2), item(g, 'U', 'buriti', 3, true), item(g, 'V', 'pomada-copaiba', 2, true),
  ],
  habitats: [
    {
      // 6.4 (B-PA, G): Pererecão (c), Capivarona (i), Onçinha (r), Jacarezinho (c) e Jacaretinga (i), Antão (r),
      // Cervo-do-Pantanal (r, dia), Tuiuiuzim (c, dia) e Tuiuiú (i), Garça-Real (i), Aruá (c), Lavadeirim (c). No nível do
      // Sertão as linhas já evoluídas aparecem adiante (Sapo-Cururuí, Jacaretinga, Pintada, Tuiuiú, Aruazão, Lavadeira-Dragão).
      metodo: 'grama', taxa: 0.12,
      dia: [E(26, 50, 52, 14), E(58, 50, 52, 12), E(85, 50, 50, 16), E(106, 51, 53, 14), E(108, 50, 52, 10), E(128, 50, 52, 10), E(156, 51, 53, 10), E(98, 52, 53, 6), E(100, 52, 53, 4), E(72, 52, 53, 4)],
      noite: [E(26, 50, 52, 22), E(58, 50, 52, 14), E(85, 50, 50, 18), E(128, 50, 52, 14), E(156, 51, 53, 12), E(108, 50, 52, 8), E(98, 52, 53, 6), E(72, 52, 53, 6)],
      camadas: [{
        apos: 11,
        dia: [E(26, 50, 52, 12), E(58, 50, 52, 12), E(85, 51, 53, 6), E(106, 51, 53, 16), E(108, 50, 52, 12), E(128, 50, 52, 10), E(156, 51, 53, 12), E(98, 51, 53, 8), E(100, 51, 53, 6), E(72, 52, 53, 6)],
        noite: [E(26, 50, 52, 20), E(58, 50, 52, 14), E(85, 51, 53, 8), E(128, 50, 52, 14), E(156, 51, 53, 14), E(108, 50, 52, 10), E(98, 51, 53, 10), E(72, 52, 53, 10)],
      }],
    },
    {
      // 6.4 (B-PA, S): Capivarinha (c), Ariranhinha (i) e Ariranhão (r), Jacaruçu (mr), Sucurizinha (i), Piranhinha (c) e
      // Piranhão (i), Poraquim (r), Arraiazinha (i) — no Sertão já na forma seguinte; o Jacaruçu só a partir do nível 45.
      metodo: 'agua', taxa: 0.08,
      todos: [E(58, 50, 52, 20), E(114, 50, 52, 22), E(74, 51, 53, 14), E(87, 51, 53, 12), E(118, 50, 52, 14), E(116, 52, 53, 8), E(85, 52, 53, 2), E(85, 50, 50, 8)],
      camadas: [{ apos: 11, todos: [E(58, 50, 52, 18), E(114, 50, 52, 20), E(74, 51, 53, 14), E(87, 51, 53, 14), E(118, 50, 52, 14), E(116, 51, 53, 12), E(85, 52, 53, 8)] }],
    },
    { metodo: 'pesca-velha', todos: [E(37, 22, 28, 40), E(39, 22, 28, 30), E(113, 22, 28, 20), E(111, 26, 32, 10)] },
    { metodo: 'pesca-boa', todos: [E(38, 50, 52, 26), E(40, 50, 52, 20), E(114, 50, 52, 24), E(112, 42, 45, 20), E(40, 36, 40, 10)] },
    { metodo: 'pesca-mestra', todos: [E(38, 52, 54, 40), E(40, 52, 54, 35), E(112, 52, 54, 25)] },
  ],
};
export default zona;
