/**
 * B6 · Brejo Roxo — passo 13 (líder 13, Doutor Peçonha, ás 57). Chega-se pelo charco (saída do Túnel Alagado).
 * Ginásio do Veneno (zona `B6-ginasio`, time de ginásios; porta → (8, 17); saída em (33, 12)): a porta fica
 * interditada pelo zelador até o laboratório secreto do Cartel cair (`laboratorio-ok`). O laboratório fica debaixo do
 * Curtume Abandonado, no pátio cercado do nordeste, atrás do cipó (Facão) e de um capanga de guarda.
 * Ao sair do ginásio com a insígnia 13, a Queixada-Caipora é vista fugindo para o sertão (`b2-caipora-solta`).
 * Norte: o Passo da Serra para a Subida da Serra (B-R4, só com a insígnia 13). Leste: Vale do Veneno (B-VV).
 * Missão: as cinco Pererequinhas da Dona Rã (`b2-filhotes`, três aqui e duas no Vale).
 * Áreas de Amuleto: a ilhota do lago de cima, no brejo do oeste (sobe-se a cachoeirinha de canoa: Cachoeira) e a
 * pedra do mirante ao lado do Passo da Serra (Escalar). No pátio do curtume, o cipó (Facão).
 */
import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, entrada, saidas, gente, duelista, item, placa } from './_b2s-lib';

const p = new Pincel(50, 38, '.');
p.r(0, 0, 50, 2, 'T').r(0, 36, 50, 2, 'T').r(0, 0, 1, 38, 'T').r(49, 0, 1, 38, 'T');
// paredão da serra no norte, com o Passo da Serra
p.r(15, 0, 20, 4, '#').r(19, 4, 5, 2, '#').r(25, 4, 5, 2, '#').r(24, 0, 1, 6, ':').r(15, 4, 4, 2, '#').r(16, 2, 2, 2, '.').p(',', 16, 2).p('e', 17, 4, 17, 5);
p.t(1, 2, 'TTT', 'TT', 'T').t(1, 31, 'T', 'TT', 'TT', 'TTT', 'TTTT').t(42, 31, '___TTTT', '__TTTTT', 'TTTTTTT', 'TTTTTTT', 'TTTTTTT').t(36, 2, 'TT', '_T').t(8, 2, 'TTTT', '_TT');
// charco do túnel (poço fundo), riacho roxo com pontes e o brejo do oeste
p.r(4, 27, 9, 7, '~').r(7, 29, 3, 3, 'd').p('~', 3, 29, 3, 30, 13, 28, 13, 29, 6, 34, 7, 34);
p.r(13, 23, 28, 1, '~').r(12, 23, 1, 4, '~').p('~', 41, 24, 42, 24, 42, 25, 43, 25, 44, 25, 44, 26, 45, 26, 46, 26, 47, 26, 48, 26);
p.r(1, 11, 8, 5, '#').r(2, 12, 6, 3, '~').r(4, 12, 2, 2, '.').p(',', 5, 12).p('t', 4, 12).p('w', 5, 15).r(2, 16, 7, 2, '~').p(';', 3, 18, 4, 18);
// ruas e passarelas
p.r(9, 20, 41, 2, ':').p('T', 49, 21).r(24, 6, 2, 14, ':');
p.via(':', 1, 16, 18, 16, 19).via(':', 1, 39, 18, 39, 19).via(':', 1, 33, 13, 33, 19).via(':', 1, 9, 12, 9, 19).via(':', 1, 43, 8, 43, 19);
p.via(':', 1, 20, 22, 20, 30, 15, 30, 15, 29).via(':', 1, 33, 22, 33, 32, 31, 32, 31, 31).p('=', 20, 23, 33, 23).p('=', 12, 24, 12, 25);
// pátio do Curtume Abandonado: cerca, cipó, vazamentos tóxicos e lama
p.q(38, 3, 10, 8, 'f').p('c', 43, 10).p('x', 39, 5, 39, 6, 40, 6, 46, 8, 46, 9, 45, 9, 39, 12, 40, 13, 46, 12).r(44, 11, 4, 3, 'l').p(';', 39, 4, 46, 4);
// lama, capim do brejo, canteiros cercados e flores roxas
p.r(27, 25, 4, 2, 'l').r(10, 24, 2, 2, 'l').r(36, 26, 5, 4, '"').r(2, 20, 5, 5, '"').r(44, 13, 4, 4, '"').p('C', 22, 26, 23, 26, 24, 26).p('f', 21, 27, 22, 27, 23, 27, 24, 27, 25, 27, 25, 26, 21, 26);
p.p(',', 12, 15, 18, 19, 21, 11, 27, 17, 35, 16, 16, 24, 23, 29, 27, 30, 35, 31, 41, 28, 11, 10, 31, 6, 20, 7, 21, 7, 29, 7, 30, 6, 13, 21, 14, 21, 36, 15, 37, 14, 6, 9, 7, 10);
p.p('T', 12, 6, 6, 8, 13, 12, 20, 9, 28, 14, 36, 12, 29, 18, 21, 17, 11, 17, 46, 17, 47, 23, 17, 33, 25, 34, 38, 33, 3, 25, 8, 22, 18, 25, 36, 24).p('t', 6, 19, 28, 8, 44, 29, 14, 9);
p.p('b', 10, 14, 19, 14, 22, 13, 27, 12, 30, 13, 36, 19, 42, 19, 5, 22, 14, 22, 26, 22, 38, 22, 12, 32, 22, 31, 28, 33, 32, 12, 34, 12, 2, 26, 13, 27, 40, 25);
// marcas: prédios, saídas, pessoas, itens e placas
p.t(30, 11, 'G').t(14, 17, 'P').t(38, 17, 'V').t(41, 7, 'K').t(8, 11, 'H').t(14, 28, 'I').t(30, 30, 'J');
p.t(24, 0, 'N').t(49, 20, 'L');
for (const [x, y] of [[7, 29], [8, 29], [9, 29], [7, 30], [9, 30], [7, 31], [8, 31], [9, 31]]) p.t(x, y, 'D');
p.t(8, 30, 'Y');
p.t(23, 7, 'a').t(35, 13, 'q').t(47, 19, 's').t(14, 26, 'u').t(42, 11, 'y').t(10, 19, 'z');
p.t(43, 9, '1').t(13, 31, '2').t(26, 12, '3').t(12, 27, '4').t(18, 20, '5').t(29, 26, '6').t(31, 14, '7').t(41, 12, '8').t(36, 21, '9').t(4, 21, 'A').t(46, 28, 'B').t(25, 6, 'O').t(37, 29, 'Q').t(30, 19, 'R').t(19, 30, 'S').t(22, 9, 'U');
p.t(45, 4, 'h').t(2, 19, 'i').t(39, 28, 'j').t(46, 6, 'k').t(11, 34, 'm').t(27, 6, 'n').t(5, 13, '!').t(17, 2, '?');
const g = grade('B6', p.fim(), {
  G: '.', P: '.', V: '.', K: '.', H: '.', I: '.', J: '.', N: ':', L: ':', D: 'd', Y: 'd',
  a: '.', q: '.', s: '.', u: '.', y: '.', z: '.',
  '1': '.', '2': '.', '3': '.', '4': '.', '5': ':', '6': '.', '7': '.', '8': '.', '9': ':', A: '"', B: '.', O: '.', Q: '"', R: ':', S: '.', U: '.',
  h: '.', i: '"', j: '.', k: '.', m: '.', n: '.', '!': '.', '?': ',',
});
const placas = [
  placa(g, 'a', 'PASSO DA SERRA\nNorte: Subida da Serra e Serra da Geada.\nSó sobe quem tem a Insígnia Espinho. E agasalho.'),
  placa(g, 'q', 'GINÁSIO DE BREJO ROXO\nLíder: Doutor Peçonha, o homem que abraça cobra.\nInsígnia Espinho.'),
  placa(g, 's', 'VALE DO VENENO →\nNão beba a água. Não lamba os sapos. Não diga que não avisamos.'),
  placa(g, 'u', 'CHARCO DO TÚNEL\nFundo de lama, saída para Cidade Ginga por baixo d’água.'),
  placa(g, 'y', 'CURTUME ABANDONADO\nFechado desde a última cheia.\n(Alguém rabiscou embaixo: "então por que sai fumaça roxa da chaminé?")'),
  placa(g, 'z', 'BREJO ROXO\n"Aqui até o sapo tem nome e sobrenome."'),
];
const zona: ZonaDef = {
  id: 'B6', nome: 'Brejo Roxo', mapa: 'B', tipo: 'cidade', tileset: 'brejo', musica: 'cidade-maracatu', arena: 'brejo', passo: 13, pouso: [16, 18], clima: 'garoa',
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'G', 'ginasio', { cor: '#3d1f52,#7b3fa0,#c48be0' }), obj(g, 'P', 'posto'), obj(g, 'V', 'venda'), obj(g, 'K', 'oficina'),
    obj(g, 'H', 'casa-d'), obj(g, 'I', 'casa-palafita'), obj(g, 'J', 'casa-palafita'),
    ...placas.map((q) => q.objeto),
    { o: 'poste', x: 23, y: 19 }, { o: 'poste', x: 26, y: 22 }, { o: 'poste', x: 37, y: 19 }, { o: 'poste', x: 12, y: 19 }, { o: 'poste', x: 32, y: 14 },
    { o: 'ipe-roxo', x: 18, y: 12 }, { o: 'ipe-roxo', x: 27, y: 28 }, { o: 'ipe-roxo', x: 41, y: 22 }, { o: 'ipe-roxo', x: 6, y: 11 }, { o: 'canoa', x: 10, y: 26 }, { o: 'banco', x: 21, y: 19 },
    { o: 'tronco-caido', x: 4, y: 26 }, { o: 'bromelia', x: 17, y: 22 }, { o: 'bromelia', x: 30, y: 22 }, { o: 'bromelia', x: 44, y: 22 }, { o: 'totem', x: 26, y: 8, texto: ['Um totem de madeira com uma cobra entalhada mordendo o próprio rabo. Na base: "o veneno e a cura moram no mesmo dente".'] },
    { o: 'tambor', x: 40, y: 9 }, { o: 'tambor', x: 46, y: 10 }, { o: 'pedra-grande', x: 2, y: 9 },
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...saidas(g, 'N', 'B-R4', 24, 68, 'n', 'borda'),
    ...saidas(g, 'L', 'B-VV', 1, 20, 'l', 'borda'),
    entrada(g, 'G', 'ginasio', 'B6-ginasio', 8, 17),
    entrada(g, 'P', 'posto', 'B6-posto', 6, 8),
    entrada(g, 'V', 'venda', 'B6-venda', 5, 7),
    entrada(g, 'H', 'casa-d', 'B6-casa-1', 5, 7),
    entrada(g, 'I', 'casa-palafita', 'B6-casa-2', 5, 7),
    entrada(g, 'J', 'casa-palafita', 'B6-casa-3', 5, 7),
    entrada(g, 'K', 'oficina', 'B6-lab-1', 15, 19),
    ...saidas(g, 'D', 'B-TA', 54, 23, 'n'), ...saidas(g, 'Y', 'B-TA', 54, 23, 'n'),
  ],
  portoes: [
    { x: 24, y: 4, requer: 'insignia:13', sprite: 'cl-montanhista', fala: 'Guarda-serra Pinheiro: "Daqui para cima é paredão, pedregulho e frio de rachar.\nSem a Insígnia Espinho do Doutor Peçonha eu não deixo subir. Ordem dos Guardiões."' },
    { x: 33, y: 12, requer: 'flag:laboratorio-ok', sprite: 'npc-homem-1', fala: 'Zelador Urtigão: "O ginásio está fechado. O Doutor Peçonha saiu para investigar a fumaça roxa do curtume e não voltou.\nFaz três dias. As cobras estão com saudade. Eu também, mas não conta para ele."' },
  ],
  gatilhos: [{ x: 32, y: 13, w: 3, h: 1, script: 'b2-caipora-solta', se: 'insignia:13&flag:laboratorio-ok&!flag:b2-caipora-solta' }],
  npcs: [
    gente(g, '1', 'porteiro-lab', 'capanga-m', 'Capanga do Cartel', { dir: 's', script: 'b2-lab-porteiro', se: '!flag:b2-lab-porteiro' }),
    gente(g, '2', 'mae-perereca', 'npc-mulher-4', 'Dona Rã', { dir: 'o', script: 'b2-filhotes' }),
    gente(g, 'A', 'filhote-1', 'c:pererequinha', 'Pererequinha', { dir: 's', script: 'b2-filhote-1', se: 'flag:m-filhotes&!flag:b2-filhote-1' }),
    gente(g, 'B', 'filhote-2', 'c:pererequinha', 'Pererequinha', { dir: 's', script: 'b2-filhote-2', se: 'flag:m-filhotes&!flag:b2-filhote-2' }),
    gente(g, 'Q', 'filhote-3', 'c:pererequinha', 'Pererequinha', { dir: 'o', script: 'b2-filhote-3', se: 'flag:m-filhotes&!flag:b2-filhote-3' }),
    gente(g, '3', 'botanica', 'cl-biologa', 'Botânica Jurema', { dir: 'o', fala: ['As flores roxas do brejo estão murchando. Tem cal e produto químico escorrendo do curtume.', 'Os sapos sumiram, as pererecas sumiram… e toda noite passa carroça com jaula coberta de lona.', 'Se você tem criatura que corta cipó, dê uma olhada lá atrás da cerca. Eu fico aqui… vigiando as flores.'], se: '!flag:laboratorio-ok' }),
    gente(g, '3', 'botanica-2', 'cl-biologa', 'Botânica Jurema', { dir: 'o', fala: ['Os sapos voltaram para o brejo na mesma noite em que você derrubou o laboratório. Cantaram até de manhã.', 'Brejo saudável é brejo barulhento. Ninguém dormiu, e todo mundo acordou feliz.'], se: 'flag:laboratorio-ok' }),
    gente(g, '4', 'pescador', 'cl-pescador', 'Seu Muçum', { dir: 'o', fala: ['Você saiu de dentro do charco?! Achei que fosse assombração.', 'O túnel vai dar em Cidade Ginga. Mande um abraço para o meu primo Tainha. Diga que ele me deve vinte patacas.'] }),
    gente(g, '5', 'velha', 'npc-idosa', 'Vó Arruda', { dir: 's', mov: 'olhar', fala: ['Menino, aqui todo mundo tem um chazinho para veneno.', 'Mel Puro tira peçonha de bicho. Para peçonha de gente, só mudando de cidade.'] }),
    gente(g, '6', 'menino', 'cl-crianca-m', 'Girino', { mov: 'vagar', fala: ['Eu sei pular todas as poças de lama sem sujar o pé!', '…Menos esta. E aquela. E a outra.'] }),
    gente(g, '7', 'aprendiz', 'cl-biologa', 'Aprendiz Ofídio', { dir: 's', fala: ['O Doutor diz que veneno é só remédio na dose errada.', 'Tipo Terra e tipo Mente dão dor de cabeça nas cobras dele. Tipo Mata, coitado, vira salada.'], se: 'flag:laboratorio-ok' }),
    gente(g, '8', 'liberto', 'npc-mulher-1', 'Moradora Aliviada', { dir: 'o', fala: ['A fumaça parou! O brejo voltou a cheirar a… brejo.', 'Dizem que uma queixada enorme saiu correndo do curtume, com folhas nascendo onde pisava.'], se: 'flag:laboratorio-ok' }),
    gente(g, '9', 'tropeiro', 'npc-homem-2', 'Carroceiro Assustado', { dir: 'o', fala: ['Me pagaram para levar caixas até o curtume. Uma delas roncou.', 'Caixa não ronca, criatura. Larguei tudo e vim tomar um chá.'], se: '!flag:laboratorio-ok' }),
    gente(g, 'O', 'guarda-serra', 'cl-montanhista', 'Guarda-serra Pinheiro', { dir: 's', se: 'insignia:13', fala: ['Insígnia Espinho! Pode subir. A Subida da Serra tem paredão de trepadeira e pedregulho no caminho.', 'Lá no alto, à esquerda, tem a trilha do Pico Pindorama. O Portão dos Guardiões só abre com as dezesseis insígnias, mas a vista já vale a subida.'] }),
    duelista(g, 'R', 'B6-1', 'cl-biologa', 's', 3),
    duelista(g, 'S', 'B6-2', 'cl-pescador', 'n', 3),
    gente(g, 'U', 'b6-carteiro', 'npc-homem-3', 'Carteiro Sapé', { dir: 's', script: 'b2-carta' }),
  ],
  itens: [
    item(g, 'h', 'elixir-andiroba'), item(g, 'i', 'cuia-noturna', 2), item(g, 'j', 'pomada-copaiba'), item(g, 'k', 'pepita', 1, true), item(g, 'm', 'mel-puro', 3, true), item(g, 'n', 'pedra-lunar', 1, true),
    item(g, '!', 'pt-21'), item(g, '?', 'folha-ancestral'),
  ],
};
export default zona;
