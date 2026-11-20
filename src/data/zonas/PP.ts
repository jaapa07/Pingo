import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, entrada, saidas, gente, duelista, item, placa, E } from './_b2n-lib';
import { AMT_PARA_PP, BR4_PARA_PP } from './_b2n-ligacoes';

/**
 * PP · Pico Pindorama — a fronteira entre a Costa do Sol e o Sertão das Névoas (passo 17, depois das 16 insígnias).
 * De baixo para cima:
 *  - Acampamento da Fronteira: chegadas de A-MT em (6, 52) e de B-R4 em (34, 52), Posto e Venda do Pico.
 *  - Portão dos Guardiões (`insignias:16`): o guardião Tibiriçá confere o estojo.
 *  - A Subida: trilha em zigue-zague com capim de altitude (selvagens 62–65), seis montanhistas, dois capangas do
 *    Cartel, a Gruta do Pico (PP-gruta, saída secreta para o Beiral) e o campo de gelo do oeste.
 *  - O Cume: o Coronel Garrote espera na passagem da muralha (`pp-garrote` → `garrote-vencido`); a Tainá na porta do
 *    Salão (`pp-rival-8`); o Salão do Conselho (PP-conselho, só depois do Garrote).
 *  - Pós-jogo no Cume: o andarilho do topo (`pp-misterioso`), a neve brilhante do dia 20 de novembro (`pp-neve`).
 * Eventos da sequência final em src/data/eventos/conselho.ts; os do Cume e as missões em src/data/eventos/b2-norte.ts.
 */
const p = new Pincel(40, 54, '.').borda('#');
// muralhas: a do Portão dos Guardiões e a do Cume
p.r(1, 42, 38, 1, '#').r(1, 12, 38, 1, '#');
// Beiral Escondido (leste): fechado por rocha, só se chega pela Gruta do Pico
p.r(35, 22, 4, 7, '#').r(36, 23, 2, 5, ',');
// rochedos e lajes da subida
p.t(1, 13, '##', '#').t(36, 13, '___', '_##', '###').t(1, 30, '##', '###', '##').t(36, 30, '_##', '###', '###', '_##', '__#').t(14, 31, '##').t(28, 25, '#').t(9, 19, '#');
p.t(1, 1, '####', '###', '##', '#').t(33, 1, '__###', '___##', '____#').t(1, 9, '##', '###').t(36, 8, '_##', '###');
// trilhas (largura 2): acampamento, subida em zigue-zague e cume
p.via(':', 2, 6, 46, 6, 53).via(':', 2, 34, 46, 34, 53).via(':', 2, 6, 49, 34, 49).via(':', 2, 19, 43, 19, 50);
p.via(':', 2, 19, 36, 19, 42).via(':', 2, 19, 36, 4, 36).via(':', 2, 4, 28, 4, 37).via(':', 2, 4, 28, 33, 28).via(':', 2, 33, 20, 33, 29);
p.via(':', 2, 33, 20, 12, 20).via(':', 2, 12, 14, 12, 21).via(':', 2, 12, 14, 19, 14).via(':', 2, 19, 7, 19, 15);
p.via(':', 2, 8, 9, 31, 9);
// capim de altitude
p.r(7, 38, 10, 3, '"').r(23, 31, 14, 8, '"').r(7, 22, 24, 5, '"').r(15, 16, 15, 3, '"').r(23, 2, 9, 4, '"');
// campo de gelo do oeste (desliza até bater)
p.r(3, 14, 8, 5, 'g').p(';', 2, 14, 2, 15, 2, 16, 2, 17, 2, 18).r(2, 19, 9, 1, ';');
// pedras e pinheiros
p.p('T', 2, 44, 3, 47, 2, 51, 15, 44, 24, 44, 37, 44, 36, 47, 37, 51, 10, 52, 30, 52, 2, 40, 37, 40, 17, 33, 9, 27, 31, 26, 25, 17, 6, 11, 33, 11, 2, 6, 37, 6);
p.p('b', 12, 46, 30, 46, 22, 39, 8, 33, 26, 22, 10, 17, 28, 4, 12, 3);
p.p(';', 18, 44, 21, 44, 17, 45, 22, 45, 3, 35, 35, 35, 11, 30, 27, 33, 15, 25, 32, 18, 6, 4, 34, 7);
// marcas: bordas, prédios, gente, itens
p.t(6, 53, 'AA').t(34, 53, 'BB');
p.t(9, 47, 'P').t(26, 47, 'V').t(17, 6, 'Y').t(35, 18, 'H');
p.t(16, 48, 'F').t(17, 43, 'U').t(22, 43, 'U').t(15, 7, 'u').t(24, 7, 'u').t(30, 3, 'R').t(11, 4, 'Q');
p.t(4, 50, 'a').t(36, 50, 'I').t(17, 41, 'n').t(22, 13, 'm').t(8, 7, 'h');
p.t(8, 35, '1').t(6, 31, '2').t(20, 27, '3').t(32, 24, '4').t(24, 19, '5').t(14, 17, '6').t(17, 13, '7').t(21, 16, '8');
p.t(21, 43, 'G').t(13, 51, 'N').t(25, 51, 'L').t(28, 44, 'K').t(20, 11, 'X').t(21, 8, 'Z').t(32, 3, 'W').t(5, 8, 'S');
p.t(36, 24, 'k').t(37, 27, 'j').t(2, 17, 'i').t(9, 40, 'q').t(36, 32, 'y').t(26, 2, 'O').t(3, 12 - 3, 'z');
const g = grade('PP', p.fim(), {
  A: ':', B: ':', P: '.', V: '.', Y: '.', H: '.', F: '.', U: '.', u: '.', R: '.', Q: '.', a: '.', I: '.', n: ':', m: '.', h: '.',
  '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.', '7': '.', '8': '.',
  G: '.', N: '.', L: '.', K: '.', X: ':', Z: '.', W: '.', S: '.', k: ',', j: ',', i: ';', q: '"', y: '"', O: '"', z: '.',
});
const placas = [
  placa(g, 'a', 'PICO PINDORAMA — ACAMPAMENTO DA FRONTEIRA\nSul: Monte Tupã (Costa do Sol). Posto e Venda no acampamento.'),
  placa(g, 'I', 'PICO PINDORAMA — ACAMPAMENTO DA FRONTEIRA\nSul: Subida da Serra (Sertão das Névoas). Posto e Venda no acampamento.'),
  placa(g, 'n', 'PORTÃO DOS GUARDIÕES\n"Dezesseis insígnias abrem o portão. Uma equipe inteira abre o Conselho."'),
  placa(g, 'm', 'O CUME\nAdiante, o Salão do Conselho dos Guardiões. Lá dentro: cinco lutas, nenhuma volta.'),
  placa(g, 'h', 'MIRANTE DO CUME\nA oeste, a Costa do Sol inteira até o mar. A leste, o Sertão até onde a névoa deixa.'),
];
const [xg, yg] = g.p('X');
const zona: ZonaDef = {
  id: 'PP', nome: 'Pico Pindorama', mapa: 'PP', tipo: 'rota', tileset: 'pico', musica: 'pico', arena: 'pico', passo: 17, clima: 'garoa',
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'P', 'posto'), obj(g, 'V', 'venda'), obj(g, 'Y', 'ginasio', { cor: '#3a3448,#7c7690,#d8d4e8' }), obj(g, 'H', 'caverna-entrada'),
    obj(g, 'F', 'fogueira'), ...objs(g, 'U', 'estatua', { texto: ['Um Guardião antigo, de pedra, com o cajado apontado para o cume. Na base: "Quem sobe, sobe por todos."'] }),
    ...objs(g, 'u', 'totem'), obj(g, 'R', 'pedra-grande'), obj(g, 'Q', 'araucaria'),
    { o: 'poste', x: 17, y: 49 + 2 }, { o: 'banco', x: 22, y: 47 }, { o: 'pedra-grande', x: 36, y: 41 }, { o: 'pedra-grande', x: 2, y: 25 },
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...saidas(g, 'A', 'A-MT', AMT_PARA_PP[0], AMT_PARA_PP[1], 's', 'borda', { requer: 'insignias:16', recusa: 'A trilha do Monte Tupã desce para a Costa do Sol. O guardião Abaeté só deixa passar, lá embaixo, quem já tem quinze insígnias.\nSem as dezesseis, o Pico não leva ninguém para o outro lado.' }),
    ...saidas(g, 'B', 'B-R4', BR4_PARA_PP[0], BR4_PARA_PP[1], 's'),
    entrada(g, 'P', 'posto', 'PP-posto', 6, 8),
    entrada(g, 'V', 'venda', 'PP-venda', 5, 7),
    entrada(g, 'Y', 'ginasio', 'PP-conselho', 15, 55, { requer: 'flag:garrote-vencido', recusa: 'A porta de pedra do Salão do Conselho não se mexe.\nAlguém do Cartel acorrentou as argolas de bronze.' }),
    entrada(g, 'H', 'caverna-entrada', 'PP-gruta', 4, 14, { tipo: 'caverna' }),
    // a fenda do Beiral Escondido: só se chega a ela por dentro da Gruta do Pico
    { x: 37, y: 23, para: { zona: 'PP-gruta', x: 20, y: 3, dir: 's' }, tipo: 'caverna' },
  ],
  portoes: [
    { x: 19, y: 42, w: 2, h: 1, requer: 'insignias:16', sprite: 'guardiao-tibirica', fala: 'O guardião Tibiriçá, de cocar de penas de gavião, ergue a mão aberta:\n— Este é o Portão dos Guardiões. Daqui para cima, só quem venceu os dezesseis ginásios de Pindorama.\f— Não há desonra em voltar. A serra espera. Quando o estojo estiver cheio, o portão se abre sozinho.' },
  ],
  npcs: [
    duelista(g, '1', 'PP-1', 'cl-montanhista', 's', 3),
    duelista(g, '2', 'PP-2', 'cl-escoteira', 'o', 3),
    duelista(g, '3', 'PP-3', 'cl-observadora', 's', 3),
    duelista(g, '4', 'PP-4', 'cl-capoeirista', 'l', 3),
    duelista(g, '5', 'PP-5', 'cl-mateira', 's', 3),
    duelista(g, '6', 'PP-6', 'cl-montanhista', 'o', 3),
    duelista(g, '7', 'PP-7', 'capanga-m', 's', 3),
    duelista(g, '8', 'PP-8', 'capanga-f', 'n', 3),
    gente(g, 'G', 'pp-tibirica', 'guardiao-tibirica', 'Guardião Tibiriçá', { dir: 's', se: 'insignias:16', script: 'pp-tibirica' }),
    gente(g, 'N', 'pp-tropeira', 'npc-mulher-3', 'Tropeira Neve-Mansa', { dir: 'n', mov: 'olhar', fala: ['Esta trilha liga a Costa do Sol ao Sertão desde antes das estradas. Os tropeiros subiam com mula e desciam com histórias.', 'Lá no Cume fica o Salão do Conselho. Cinco Guardiões, um atrás do outro. Ninguém que eu conheço passou do segundo.'] }),
    gente(g, 'L', 'pp-cozinheiro', 'npc-homem-2', 'Cozinheiro Pinhão', { dir: 'n', fala: ['Pinhão cozido na fogueira, quentão sem álcool e chá de guaraná. É o cardápio do acampamento.', 'Os capangas do Cartel subiram ontem com caixote e corrente. Não pagaram o pinhão. Isso eu não perdoo.'] }),
    gente(g, 'K', 'pp-medica', 'cl-biologa', 'Doutora Altitude', { dir: 'o', fala: ['No Pico o ar é fino. Respire fundo antes de cada luta e leve remédio na mochila: lá em cima ninguém cura de graça.', 'O Posto daqui é o último antes do Conselho. Se perder lá dentro, os Guardiões trazem você até o Portão — e o Posto está logo abaixo.'] }),
    gente(g, 'X', 'pp-garrote', 'coronel-garrote', 'Coronel Garrote', { dir: 's', se: '!flag:garrote-vencido', script: 'pp-garrote' }),
    gente(g, 'Z', 'pp-taina', 'taina', 'Tainá', { dir: 'o', se: 'flag:garrote-vencido&!flag:rival-8', script: 'pp-rival-8' }),
    gente(g, 'W', 'pp-misterioso', 'andarilho-cume', 'Andarilho do Cume', { dir: 's', se: 'pos-jogo&flag:misterioso-pode', script: 'pp-misterioso' }),
    gente(g, 'S', 'pp-vigia-neve', 'npc-idoso', 'Seu Floco-Velho', { dir: 'l', mov: 'olhar', script: 'pp-neve' }),
  ],
  gatilhos: [
    { x: xg - 1, y: yg + 2, w: 2, h: 1, script: 'pp-garrote', se: '!flag:garrote-vencido' },
    { x: 19, y: 8, w: 2, h: 1, script: 'pp-rival-8', se: 'flag:garrote-vencido&!flag:rival-8' },
  ],
  itens: [
    item(g, 'k', 'elixir-andiroba', 3), item(g, 'j', 'pt-11'), item(g, 'i', 'pedra-solar'), item(g, 'q', 'cha-guarana', 2, true),
    item(g, 'y', 'garapa', 2, true), item(g, 'O', 'cuia-ouro', 5), item(g, 'z', 'pena-colorida', 3),
    // oferenda dos Guardiões a quem passa o Portão (como no Platô da Liga): cinco lutas sem Posto pedem mochila cheia
    { x: 18, y: 41, item: 'elixir-andiroba', qtd: 2, flag: 'item:PP:oferenda-oeste' },
    { x: 21, y: 41, item: 'cha-guarana', qtd: 2, flag: 'item:PP:oferenda-leste' },
  ],
  habitats: [
    {
      // 6.4 (PP, G): Gaviãozão (i), Araracanga (i), Prego-Mestre (i), Pintada (r), Harpia (r), Gralha-Azul (i), Maracajá-Nevado (r)
      metodo: 'grama', taxa: 0.1,
      dia: [E(12, 69, 71, 20), E(136, 69, 71, 18), E(52, 69, 71, 17), E(66, 69, 71, 17), E(72, 70, 72, 10), E(110, 70, 72, 9), E(140, 70, 72, 9)],
      noite: [E(140, 69, 71, 20), E(66, 69, 71, 18), E(12, 69, 71, 16), E(52, 69, 71, 16), E(72, 70, 72, 12), E(136, 69, 71, 10), E(110, 70, 72, 8)],
    },
  ],
};
export default zona;
