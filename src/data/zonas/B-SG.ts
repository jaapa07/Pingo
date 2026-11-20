import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, saidas, bordas, gente, duelista, item, placa, E } from './_b2n-lib';
import { B7_PARA_BSG } from './_b2n-ligacoes';

/**
 * B-SG · Campos de Altitude (arredores de B7 Serra da Geada) — passo 14 (chega-se com a Subida da Serra, antes do
 * ginásio da Geada). Capim dourado, araucárias e geada no chão de manhã.
 * Ligações: sudoeste ↔ B7 (chegada aqui em (6, 38)); oeste ↔ Lagoa Gelada (B-LG), pela trilha do pinheiral.
 * Secretos: o Açude Congelado (deslize no gelo até a pedra do meio) e o Mirante do Uirapuru, no alto do paredão do
 * nordeste (Escalar): ao amanhecer, com 150 criaturas no Diário, o Uirapuru canta lá (`b2n-uirapuru`).
 * Visível e fora de alcance: a Trilha Velha do sudeste, cercada; o Guardião do Campo só abre depois do Conselho.
 * Missão: a troca do pastor Seu Lã-Grossa (`b2n-troca`, regra 10A-12).
 * Selvagens 55–57 (camada pós-insígnia 15: 58–60); treinadores 55–57 (ás da Gaúcha Pinhão = 59).
 */
const p = new Pincel(70, 40, '.').borda('#');
// trilha principal
p.via(':', 2, 6, 30, 6, 39).via(':', 2, 6, 30, 40, 30).via(':', 2, 40, 18, 40, 31).via(':', 2, 40, 18, 10, 18).via(':', 2, 10, 8, 10, 19).via(':', 2, 0, 8, 10, 8);
p.via(':', 2, 41, 18, 52, 18).via(':', 2, 52, 12, 52, 19);
// capim dourado (encontros)
p.r(9, 32, 28, 6, '"').r(14, 21, 24, 7, '"').r(43, 21, 7, 8, '"').r(13, 10, 22, 6, '"').r(1, 11, 7, 5, '"').r(24, 2, 14, 4, '"');
// araucárias (sacudir: Serelepim/Serelepão) e pinheiral do oeste
p.t(2, 2, 'T.t.T', '.T.T.', 'T.t.T').t(16, 2, 't.T', 'T.t').t(1, 21, 'T.', 't.', 'T.', '.T', 't.').t(39, 3, 'T.t', '.T.').p('t', 30, 25, 45, 26, 21, 13);
// Açude Congelado (gelo; a pedra do meio guarda o prêmio)
p.q(42, 32, 8, 6, ';').r(43, 33, 6, 4, 'g').p('#', 45, 34).p(';', 46, 34);
// Mirante do Uirapuru (nordeste): paredão com trepadeira
p.r(54, 1, 15, 1, '#').r(54, 11, 15, 1, '#').r(54, 1, 1, 11, '#').r(55, 2, 13, 9, ',').r(57, 3, 6, 3, '"').p('e', 60, 11);
// Trilha Velha (sudeste), cercada: só depois do Conselho
p.r(54, 24, 1, 15, 'f').r(55, 24, 14, 1, 'f').r(55, 25, 14, 14, ';').r(57, 27, 9, 5, '"').p('T', 56, 34, 67, 26, 67, 37, 60, 36).p(':', 54, 30);
// pedras, moitas e flores
p.t(28, 34, '##').t(60, 15, '###', '_#').t(2, 27, '##', '#').t(64, 19, '##').t(25, 36, '#').p('b', 8, 24, 12, 28, 36, 13, 44, 10, 48, 15, 33, 8, 6, 5, 20, 7);
p.p(',', 3, 30, 4, 34, 11, 26, 29, 22, 35, 27, 45, 15, 47, 7, 15, 9, 31, 17, 19, 30, 27, 30, 49, 23);
// marcas
p.t(6, 39, 'SS').t(0, 8, 'W', 'W');
p.t(4, 36, 'a').t(1, 10, 'n').t(51, 14, 'm').t(53, 30, 'h');
p.t(20, 29, '1').t(42, 25, '2').t(30, 20, '3').t(12, 15, '4').t(26, 9, '5').t(38, 17, '6').t(46, 19, '7');
p.t(8, 28, 'P').t(36, 29, 'G').t(60, 6, 'U').t(48, 13, 'K').t(53, 29, 'V');
p.t(46, 34, 'k').t(60, 3, 'j').t(65, 33, 'i').t(58, 28, 'q').t(3, 12, 'y').t(66, 8, 'z').t(33, 26, 'u');
p.t(24, 31, 'F').t(36, 11, 'X').t(9, 2, 'X');
const g = grade('B-SG', p.fim(), {
  S: ':', W: ':', a: '.', n: '.', m: '.', h: ';', '1': '.', '2': '.', '3': '.', '4': '"', '5': '.', '6': '.', '7': ':',
  P: '.', G: '.', U: ',', K: '.', V: '.', k: ';', j: '"', i: ';', q: '"', y: '"', z: ',', u: '"', F: '.', X: '.',
});
const placas = [
  placa(g, 'a', 'CAMPOS DE ALTITUDE\nSul: Serra da Geada. Oeste: Lagoa Gelada.\nCuidado: a geada da manhã escorrega.'),
  placa(g, 'n', 'LAGOA GELADA ⇠\nPelo pinheiral. Canoa só para quem sabe remar.'),
  placa(g, 'm', 'MIRANTE DO UIRAPURU\nSubida pela trepadeira. Os antigos dizem: "quem ouve o Uirapuru ao amanhecer, ouve a mata inteira calar".'),
  placa(g, 'h', 'TRILHA VELHA DOS GUARDIÕES\nCercada por ordem do Conselho. Só para quem já foi recebido no Pico.'),
];
const [vx, vy] = g.p('h');
const zona: ZonaDef = {
  id: 'B-SG', nome: 'Campos de Altitude', mapa: 'B', tipo: 'rota', tileset: 'geada', musica: 'rota-dia-B', arena: 'geada', passo: 14, clima: 'garoa',
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'F', 'fogueira'), ...objs(g, 'X', 'araucaria'), obj(g, 'U', 'totem', { texto: ['Um totem de pinho com um pássaro pequeno entalhado no alto, de bico aberto. Alguém deixou pinhões na base, como oferenda.'] }),
    { o: 'pedra-grande', x: 22, y: 38 }, { o: 'pedra-grande', x: 49, y: 3 }, { o: 'tronco-caido', x: 31, y: 37 }, { o: 'banco', x: 7, y: 33 },
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...saidas(g, 'S', 'B7', B7_PARA_BSG[0], B7_PARA_BSG[1], 's'),
    ...bordas(g, 'W', 'B-LG', 48, 8, 'o', 0, 1),
  ],
  portoes: [
    { x: vx + 1, y: vy, requer: 'pos-jogo', sprite: 'npc-homem-3', fala: 'O Guardião do Campo, de poncho e chimarrão, fecha a porteira com o pé:\n— Trilha Velha, tchê. Por aqui os Guardiões desciam do Pico para benzer o campo.\f— Só passa quem já foi recebido pelo Conselho. Volte com essa honra no peito que eu mesmo abro.' },
  ],
  npcs: [
    duelista(g, '1', 'B-SG-1', 'cl-vaqueiro', 's', 3),
    duelista(g, '2', 'B-SG-2', 'cl-observadora', 'o', 3),
    duelista(g, '3', 'B-SG-3', 'cl-escoteira', 'n', 3),
    duelista(g, '4', 'B-SG-4', 'cl-montanhista', 'o', 3),
    duelista(g, '5', 'B-SG-5', 'cl-mateira', 'o', 3),
    duelista(g, '6', 'B-SG-6', 'cl-repentista', 's', 3),
    duelista(g, '7', 'B-SG-7', 'cl-biologa', 'o', 3),
    gente(g, 'P', 'b-sg-pastor', 'npc-idoso', 'Seu Lã-Grossa', { dir: 'l', script: 'b2n-troca' }),
    gente(g, 'G', 'b-sg-gaiteira', 'npc-mulher-4', 'Gaiteira Rosa-dos-Ventos', { dir: 'n', mov: 'olhar', fala: ['Aqui em cima a geada cai de madrugada e o sol derrete antes do almoço. O capim fica dourado de tanto apanhar de frio.', 'O beija-flor dos campos só sai de dia. De noite quem manda é o Maracajá-Nevado, que caça no capim.'] }),
    gente(g, 'K', 'b-sg-mirante', 'cl-crianca-m', 'Piá Tchico', { dir: 's', fala: ['Eu subi o paredão do mirante pela trepadeira! Lá em cima tem um totem de passarinho.', 'Meu avô diz que o Uirapuru canta lá ao amanhecer, mas só para quem conhece MUITO bicho. Tipo cento e cinquenta. Eu conheço onze.'] }),
    gente(g, 'V', 'b-sg-guardiao', 'npc-homem-3', 'Guardião do Campo', { dir: 'l', se: 'pos-jogo', fala: ['Tchê! O Conselho mandou avisar: a Trilha Velha é sua. Lá dentro o capim é alto e a geada é antiga.', 'Diz que os pesquisadores do estrangeiro andam atrás de bicho do frio por estes campos. Não sei de bicho nenhum. Sei de chimarrão.'] }),
  ],
  itens: [
    item(g, 'k', 'pt-21'), item(g, 'j', 'elixir-andiroba', 2), item(g, 'i', 'pedra-lunar'), item(g, 'q', 'cuia-ouro', 3), item(g, 'y', 'garrafada', 2, true),
    item(g, 'z', 'pena-colorida', 2), item(g, 'u', 'cha-guarana', 1, true),
  ],
  habitats: [
    {
      // 6.4 (B-SG, G): Beija-florzim (c, dia), Ouriçudo (i, noite), Gralhinha→Gralha-Azul (c/i, dia), Maracajim→Maracajá-Nevado
      // (i/r, noite), Tuquim→Tuco-Escavador (c): no nível 55 todas as linhas por nível já estão na forma crescida
      metodo: 'grama', taxa: 0.1,
      manha: [E(47, 55, 57, 24), E(136, 55, 57, 22), E(162, 55, 57, 18), E(12, 55, 57, 12), E(46, 56, 57, 12), E(166, 55, 57, 12)],
      dia: [E(136, 55, 57, 24), E(47, 55, 57, 20), E(162, 55, 57, 18), E(12, 55, 57, 14), E(46, 56, 57, 12), E(166, 55, 57, 12)],
      noite: [E(60, 55, 57, 20), E(140, 55, 57, 18), E(162, 55, 57, 18), E(44, 55, 57, 16), E(21, 55, 57, 14), E(138, 56, 57, 14)],
      camadas: [{
        apos: 15,
        dia: [E(136, 58, 60, 24), E(47, 58, 60, 20), E(162, 58, 60, 18), E(12, 58, 60, 14), E(46, 58, 60, 12), E(166, 58, 60, 12)],
        noite: [E(60, 58, 60, 20), E(140, 58, 60, 20), E(162, 58, 60, 16), E(44, 58, 60, 16), E(21, 58, 60, 14), E(138, 58, 60, 14)],
      }],
    },
    {
      // 6.4 (B-SG, A): Serelepim→Serelepão (c/i)
      metodo: 'arvore',
      todos: [E(138, 55, 57, 70), E(136, 55, 57, 30)],
      camadas: [{ apos: 15, todos: [E(138, 58, 60, 70), E(136, 58, 60, 30)] }],
    },
  ],
};
export default zona;
