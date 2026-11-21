import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, saidas, gente, duelista, item, placa, E } from './_b2n-lib';
import { B7_PARA_BR5 } from './_b2n-ligacoes';

/**
 * B-R5 · Caminho das Névoas (B7 Serra da Geada → B8 Planalto Lume) — passo 15 (depois da insígnia 14).
 * Trilha de serra que zigue-zagueia por cima do cânion do Rio Lume, sempre dentro da névoa (`nevoa: true`: só o Lampião
 * abre a vista). Logo na entrada, o Guarda da Névoa só deixa passar quem traz a Insígnia do Floco (14) e o Lampião.
 * Caminho: oeste → subida do pinheiral → mirante → descida até a Ponte do Cânion → campos altos → Planalto Lume.
 * Secretos: a Loca do Nevoeiro (rocha rachada no sudoeste, Quebra-pedra) e as touceiras da ladeira (itens ocultos).
 * Visível e fora de alcance: o Mirante do Guardião Velho (nordeste), cercado — o vigia só abre depois do Conselho.
 * Selvagens 55–59 (camada pós-insígnia 16: 60–63); treinadores 55–59 (ás da Astrônoma Jaci = 61).
 */
const p = new Pincel(90, 34, '.').borda('#');
// cânion do Rio Lume (paredões e água no fundo) e a ponte
p.r(42, 1, 6, 32, '#').r(43, 1, 4, 32, '~').r(42, 24, 6, 2, '=');
// trilha principal (largura 2)
p.via(':', 2, 0, 16, 12, 16, 12, 8).via(':', 2, 12, 8, 30, 8, 30, 24).via(':', 2, 30, 24, 52, 24, 52, 12).via(':', 2, 52, 12, 70, 12, 70, 16).via(':', 2, 70, 16, 89, 16);
p.r(42, 24, 6, 2, '=');
// capim alto da névoa
p.r(3, 3, 8, 9, '"').r(15, 11, 13, 9, '"').r(16, 27, 24, 5, '"').r(55, 15, 13, 7, '"').r(56, 2, 20, 7, '"').r(74, 20, 13, 10, '"');
// pinheiral de sacudir (Urutau-Fantasma e Noitão à noite) no alto do mirante
p.t(33, 2, 'T.t.T.T', '.t...t.', 'T..t..T', '.t.T.t.').t(58, 25, 't.T.t', '.....', 'T.t.T');
// degrau de pedra: atalho de mão única do campo do meio para a baixada sul
p.r(14, 22, 16, 1, 'v').p('#', 14, 22, 29, 22);
// Loca do Nevoeiro (Quebra-pedra) no sudoeste
p.q(1, 21, 12, 11, '#').r(2, 22, 10, 9, ',').r(3, 26, 4, 3, '%').p('r', 7, 21).p('.', 7, 20).p('T', 2, 22, 11, 22);
// Mirante do Guardião Velho (nordeste): cercado, abre depois do Conselho
p.q(78, 1, 11, 10, '#').r(79, 1, 9, 9, ',').r(80, 2, 7, 3, '"').p('.', 83, 10).p(':', 83, 11).p('T', 79, 1, 87, 1);
// franja de rocha irregular nas bordas e lajes soltas (o caminho é de serra, não de jardim)
p.t(6, 1, '###', '##').t(13, 1, '#####', '_###', '__#').t(25, 1, '####', '##').t(48, 1, '###', '##', '#').t(66, 1, '_###', '####')
  .t(14, 31, '__##', '#####').t(48, 30, '#', '##', '###').t(64, 30, '_##', '####').t(74, 31, '#######').t(88, 10, '#', '#', '#', '#', '#');
p.t(9, 6, '#', '##').t(23, 5, '##', '###').t(34, 13, '##', '#').t(50, 6, '##', '##').t(62, 16, '#').t(79, 23, '##').t(37, 28, '##');
p.p(';', 16, 9, 17, 9, 26, 9, 27, 9, 30, 20, 31, 20, 52, 19, 53, 19, 58, 13, 59, 13, 80, 16, 81, 16);
p.p(',', 7, 13, 12, 5, 20, 22, 25, 25, 33, 9, 39, 14, 49, 14, 57, 11, 68, 10, 75, 18, 82, 22, 87, 14);
p.p('T', 11, 2, 22, 4, 31, 2, 40, 9, 49, 9, 52, 4, 54, 8, 61, 10, 72, 10, 76, 11, 2, 19, 27, 21, 40, 30, 56, 29, 72, 27);
// paredão da entrada: o único caminho para leste passa pelo Guarda da Névoa
p.r(5, 1, 1, 15, '#').r(5, 18, 1, 3, '#');
// moitas e pedras soltas na beira da trilha
p.p('b', 9, 14, 11, 19, 21, 6, 26, 6, 34, 11, 37, 18, 40, 20, 49, 18, 56, 10, 64, 14, 72, 21, 80, 14, 86, 19, 63, 23);
p.p('T', 2, 14, 14, 3, 18, 3, 24, 2, 28, 4, 36, 21, 50, 3, 51, 30, 66, 26, 73, 30, 88, 24, 88, 29);
// marcas: bordas, placas, gente, itens e objetos
p.t(0, 16, 'W', 'W').t(89, 16, 'L', 'L');
p.t(2, 15, 'a').t(86, 15, 'n').t(29, 6, 'm').t(83, 10, 'z');
p.t(17, 7, '1').t(29, 14, '2').t(36, 23, '3').t(50, 20, '4').t(60, 11, '5').t(69, 15, '6').t(78, 18, '7').t(84, 15, '8');
p.t(8, 18, 'H').t(6, 15, 'G').t(40, 26, 'K').t(65, 10, 'P').t(23, 21, 'Q');
p.t(4, 28, 'k').t(10, 29, 'j').t(84, 3, 'i').t(86, 7, 'O').t(19, 15, 'u').t(70, 25, 'q').t(38, 4, 'y');
p.t(32, 18, 'U').t(54, 20, 'U').t(76, 13, 'U').t(10, 25, 'S').t(83, 6, 'X');
const g = grade('B-R5', p.fim(), {
  W: ':', L: ':', a: '.', n: '.', m: '.', z: '.', '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.', '7': '.', '8': '.',
  H: '.', G: '.', K: '"', P: '.', Q: '.', k: ',', j: ',', i: '"', O: ',', u: '"', q: '.', y: '.', U: '.', S: ',', X: ',',
});
const placas = [
  placa(g, 'a', 'CAMINHO DAS NÉVOAS\nOeste: Serra da Geada · Leste: Planalto Lume.\nNa névoa, ande com o Lampião aceso e o pé na trilha.'),
  placa(g, 'n', 'PLANALTO LUME logo adiante.\nObservatório, cânions e o Ginásio da Astrônoma Jaci.'),
  placa(g, 'm', 'MIRANTE DO PINHEIRAL\nDaqui se vê o cânion inteiro — quando a névoa deixa. Quase nunca deixa.'),
];
const [mx, my] = g.p('z');
const zona: ZonaDef = {
  id: 'B-R5', nome: 'Caminho das Névoas', mapa: 'B', tipo: 'rota', tileset: 'serra', musica: 'rota-noite-B', arena: 'planalto', passo: 15,
  clima: 'nevoa', nevoa: true,
  mapaChars: g.mapa,
  objetos: [
    ...objs(g, 'U', 'pedra-grande'), obj(g, 'K', 'tronco-caido'), obj(g, 'S', 'fogueira'), obj(g, 'X', 'totem', { texto: ['Um totem antigo de madeira de lei, coberto de líquen. Olha para o Pico Pingorama como quem espera alguém.'] }),
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...saidas(g, 'W', 'B7', B7_PARA_BR5[0], B7_PARA_BR5[1], 'o'),
    ...saidas(g, 'L', 'B8', 1, 19, 'l'),
  ],
  portoes: [
    { x: 5, y: 16, w: 1, h: 2, requer: 'insignia:14&amuleto:lampiao', sprite: 'guarda-nevoa', fala: 'O Guarda da Névoa finca o cajado no meio da trilha:\n— Daqui para leste a névoa não tem fim, e o cânion não perdoa passo errado.\f— Só passa quem traz a Insígnia do Floco, da Gaúcha Pinhão, e um Lampião para abrir a névoa. Volte quando tiver os dois.' },
    { x: mx, y: my, requer: 'pos-jogo', sprite: 'npc-idoso', fala: 'Um velho vigia de poncho guarda a porteira do mirante:\n— Este é o Mirante do Guardião Velho. Só sobe quem já se sentou à mesa do Conselho no Pico.\f— Não é desfeita, criança. É costume: o mirante mostra coisas que só servem a quem terminou a viagem.' },
  ],
  npcs: [
    duelista(g, '1', 'B-R5-1', 'cl-montanhista', 's', 3),
    duelista(g, '2', 'B-R5-2', 'cl-observadora', 'l', 3),
    duelista(g, '3', 'B-R5-3', 'cl-repentista', 's', 3),
    duelista(g, '4', 'B-R5-4', 'cl-biologa', 'l', 3),
    duelista(g, '5', 'B-R5-5', 'cl-escoteira', 's', 3),
    duelista(g, '6', 'B-R5-6', 'cl-vaqueiro', 'l', 3),
    duelista(g, '7', 'B-R5-7', 'cl-mateira', 'n', 3),
    duelista(g, '8', 'B-R5-8', 'cl-capoeirista', 's', 3),
    gente(g, 'G', 'b-r5-guarda', 'guarda-nevoa', 'Guarda da Névoa', { dir: 's', se: 'insignia:14', fala: ['Insígnia do Floco e Lampião aceso: pode seguir. Mantenha a luz na trilha e o ouvido no vento.', 'Os bichos da névoa enxergam melhor que a gente. O Graxaim-da-Névoa, então, nem precisa de olho: ele É a névoa.'] }),
    gente(g, 'H', 'b-r5-neblino', 'npc-idoso', 'Seu Neblino', { dir: 'l', mov: 'olhar', fala: ['A névoa daqui não é água no ar, menino. É o hálito do cânion. Ele respira de manhã e de noite.', 'Quem anda com Lampião vê a trilha. Quem anda sem, vê fantasma. Às vezes o fantasma é um Urutau-Fantasma mesmo, pousado no pinheiro.'] }),
    gente(g, 'P', 'b-r5-andarilha', 'npc-mulher-3', 'Andarilha Cerração', { dir: 's', fala: ['Lá do outro lado da ponte tem um campo de capim tão alto que a névoa fica presa nele. É onde a Jaguatiricão caça, de noite.', 'Do mirante cercado, lá no nordeste, dizem que dá para ver o Pico Pingorama inteiro. Mas o vigia não deixa ninguém subir.'] }),
    gente(g, 'Q', 'b-r5-menino', 'cl-crianca-m', 'Tiquinho', { mov: 'vagar', fala: ['Eu pulei o degrau de pedra e agora não consigo voltar por ele! Tenho que dar a volta toda.', 'Pelo menos o capim lá embaixo é macio.'] }),
  ],
  itens: [
    item(g, 'k', 'pt-43'), item(g, 'j', 'elixir-andiroba', 2), item(g, 'u', 'garrafada', 2, true), item(g, 'q', 'cuia-noturna', 3),
    item(g, 'y', 'pedra-lunar'), item(g, 'i', 'cuia-ouro', 3), item(g, 'O', 'pepita', 2),
  ],
  habitats: [
    {
      // 6.4 (B-R5): Jaguatiricão (G r, noite) e Graxaim-da-Névoa (G i); fauna de serra fria em volta, toda na forma crescida
      metodo: 'grama', taxa: 0.12,
      manha: [E(94, 64, 66, 22), E(136, 64, 66, 18), E(12, 64, 66, 16), E(66, 65, 67, 14), E(162, 64, 66, 14), E(102, 65, 67, 10), E(56, 66, 68, 6)],
      dia: [E(94, 64, 66, 20), E(136, 64, 66, 18), E(12, 64, 66, 15), E(66, 65, 67, 15), E(162, 64, 66, 14), E(102, 65, 67, 10), E(56, 66, 68, 8)],
      noite: [E(94, 64, 66, 22), E(44, 64, 66, 18), E(60, 64, 66, 15), E(21, 64, 66, 15), E(140, 65, 67, 12), E(162, 64, 66, 10), E(70, 66, 68, 8)],
      camadas: [{
        apos: 16,
        dia: [E(94, 68, 70, 22), E(136, 68, 70, 18), E(12, 68, 70, 15), E(66, 69, 71, 15), E(162, 68, 70, 12), E(102, 69, 71, 10), E(56, 69, 71, 8)],
        noite: [E(94, 68, 70, 22), E(44, 68, 70, 16), E(60, 68, 70, 15), E(21, 68, 70, 13), E(140, 69, 71, 14), E(70, 69, 71, 12), E(162, 68, 70, 8)],
      }],
    },
    {
      // 6.4 (B-R5, A): Urutau-Fantasma (r, noite) e Noitão (i, noite)
      metodo: 'arvore',
      dia: [E(138, 64, 66, 40), E(136, 64, 66, 30), E(144, 65, 67, 20), E(154, 64, 66, 10)],
      noite: [E(172, 64, 66, 40), E(44, 64, 66, 30), E(138, 64, 66, 18), E(170, 66, 68, 12)],
      camadas: [{ apos: 16, dia: [E(138, 68, 70, 40), E(136, 68, 70, 30), E(144, 69, 71, 30)], noite: [E(172, 68, 70, 40), E(44, 68, 70, 25), E(170, 69, 71, 20), E(138, 68, 70, 15)] }],
    },
    { metodo: 'rocha', todos: [E(162, 64, 66, 60), E(166, 64, 66, 40)], camadas: [{ apos: 16, todos: [E(162, 68, 70, 60), E(166, 68, 70, 40)] }] },
    // a Loca do Nevoeiro (chão de gruta)
    { metodo: 'caverna', taxa: 0.08, todos: [E(32, 64, 66, 22), E(172, 64, 66, 20), E(94, 64, 66, 18), E(31, 64, 66, 16), E(166, 64, 66, 14), E(162, 64, 66, 10)] },
  ],
};
export default zona;
