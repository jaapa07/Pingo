/**
 * B6 · Brejo Roxo — passo 13. Chega-se pelo charco (saída do Túnel Alagado). Ginásio Veneno (Doutor Peçonha):
 * a porta fica interditada até o laboratório secreto do Cartel (no Curtume Abandonado, atrás dos cipós) cair.
 * Norte: passo da serra para a Subida da Serra (só com a insígnia 13). Leste: Vale do Veneno.
 */
import type { ZonaDef } from '../../core/tipos';
import { Grade, npc } from './_b2-lib';

const g = new Grade(50, 38, '.');
g.q(0, 0, 50, 38, 'T').r(0, 36, 50, 1, 'T').r(0, 1, 50, 1, 'T').r(15, 0, 20, 4, '#').r(19, 4, 5, 2, '#').r(25, 4, 5, 2, '#');
g.t(1, 2, 'TTT', 'TT', 'T').t(1, 31, 'T', 'TT', 'TT', 'TTT', 'TTTT').t(42, 31, '___TTTT', '__TTTTT', 'TTTTTTT', 'TTTTTTT', 'TTTTTTT').t(36, 2, 'TT__________T', '_____________').t(8, 2, 'TTTT', '_TT');
// charco do túnel, riacho roxo e pontes
g.r(4, 27, 9, 7, '~').r(7, 29, 3, 3, 'd').p('~', 3, 29, 3, 30, 13, 28, 13, 29, 6, 34, 7, 34).r(13, 23, 28, 1, '~').r(12, 23, 1, 4, '~').p('~', 41, 24, 42, 24, 42, 25, 43, 25, 44, 25, 44, 26, 45, 26, 46, 26, 47, 26, 48, 26);
g.r(2, 13, 6, 5, '~').p(';', 3, 18, 4, 18, 8, 15, 8, 14);
// ruas
g.r(9, 20, 41, 2, ':').p('T', 49, 21).r(24, 6, 2, 14, ':').r(24, 0, 1, 6, ':');
g.via(':', 16, 18, 16, 19).via(':', 39, 18, 39, 19).via(':', 33, 12, 33, 19).via(':', 9, 12, 9, 19).via(':', 43, 8, 43, 19);
g.via(':', 20, 22, 20, 30, 15, 30, 15, 29).via(':', 33, 22, 33, 32, 31, 32, 31, 31).p('=', 20, 23, 33, 23);
// curtume cercado, cipós e vazamentos
g.q(38, 3, 10, 8, 'f').p('c', 43, 10).p('x', 39, 5, 39, 6, 40, 6, 46, 8, 46, 9, 45, 9, 39, 12, 40, 13, 46, 12).r(44, 11, 4, 3, 'l');
// lama, capim do brejo e canteiros
g.r(27, 25, 4, 2, 'l').r(10, 24, 2, 2, 'l').r(36, 26, 5, 4, '"').r(2, 20, 5, 5, '"').p('C', 22, 26, 23, 26, 24, 26).p('f', 21, 27, 22, 27, 23, 27, 24, 27, 25, 27, 25, 26, 21, 26);
g.p('T', 12, 6, 6, 8, 13, 12, 20, 9, 28, 14, 36, 13, 29, 18, 21, 17, 11, 17, 46, 17, 47, 23, 17, 33, 25, 34, 38, 33, 3, 25, 8, 22, 18, 25, 36, 24).p('t', 6, 19, 28, 8, 44, 29, 14, 9);
g.p('b', 10, 14, 19, 14, 22, 13, 27, 12, 30, 13, 36, 19, 42, 19, 5, 22, 14, 22, 26, 22, 38, 22, 12, 32, 22, 31, 28, 33).p(',', 12, 15, 18, 19, 21, 11, 27, 17, 35, 16, 16, 24, 23, 29, 27, 30, 35, 31, 41, 28, 11, 10, 31, 6);

const zona: ZonaDef = {
  id: 'B6', nome: 'Brejo Roxo', mapa: 'B', tipo: 'cidade', tileset: 'brejo', musica: 'cidade-catira', arena: 'brejo', passo: 13, pouso: [16, 18], clima: 'garoa',
  mapaChars: g.fim(),
  objetos: [
    { o: 'ginasio', x: 30, y: 11, cor: '#3d1f52,#7b3fa0,#c48be0' }, { o: 'posto', x: 14, y: 17 }, { o: 'venda', x: 38, y: 17 }, { o: 'oficina', x: 41, y: 7 },
    { o: 'casa-d', x: 8, y: 11 }, { o: 'casa-palafita', x: 14, y: 28 }, { o: 'casa-palafita', x: 30, y: 30 },
    { o: 'placa', x: 23, y: 7 }, { o: 'placa', x: 35, y: 12 }, { o: 'placa', x: 47, y: 19 }, { o: 'placa', x: 14, y: 26 }, { o: 'placa', x: 42, y: 11 },
    { o: 'poste', x: 23, y: 19 }, { o: 'poste', x: 26, y: 22 }, { o: 'poste', x: 37, y: 19 }, { o: 'poste', x: 12, y: 19 }, { o: 'poste', x: 32, y: 13 },
    { o: 'ipe-roxo', x: 18, y: 12 }, { o: 'ipe-roxo', x: 27, y: 28 }, { o: 'ipe-roxo', x: 41, y: 22 }, { o: 'ipe-roxo', x: 6, y: 11 }, { o: 'canoa', x: 10, y: 26 }, { o: 'banco', x: 21, y: 19 },
    { o: 'tronco-caido', x: 4, y: 26 }, { o: 'bromelia', x: 17, y: 22 }, { o: 'bromelia', x: 30, y: 22 }, { o: 'bromelia', x: 44, y: 22 }, { o: 'totem', x: 26, y: 8 },
  ],
  placas: [
    { x: 23, y: 7, texto: 'PASSO DA SERRA\nNorte: Subida da Serra e Serra da Geada.\nSó sobe quem tem a Insígnia Espinho. E agasalho.' },
    { x: 35, y: 12, texto: 'GINÁSIO DE BREJO ROXO\nLíder: Doutor Peçonha, o homem que abraça cobra.\nInsígnia Espinho.' },
    { x: 47, y: 19, texto: 'VALE DO VENENO →\nNão beba a água. Não lamba os sapos. Não diga que não avisamos.' },
    { x: 14, y: 26, texto: 'CHARCO DO TÚNEL\nFundo de lama, saída para Cidade Ginga por baixo d’água.' },
    { x: 42, y: 11, texto: 'CURTUME ABANDONADO\nFechado desde a última cheia.\n(Alguém rabiscou embaixo: "então por que sai fumaça roxa da chaminé?")' },
  ],
  warps: [
    { x: 24, y: 0, para: { zona: 'B-R4', x: 24, y: 68, dir: 'n' }, tipo: 'borda' },
    { x: 49, y: 20, para: { zona: 'B-VV', x: 1, y: 20, dir: 'l' }, tipo: 'borda' },
    { x: 33, y: 11, para: { zona: 'B6-ginasio', x: 8, y: 17, dir: 'n' }, tipo: 'porta' },
    { x: 16, y: 17, para: { zona: 'B6-posto', x: 6, y: 8, dir: 'n' }, tipo: 'porta' },
    { x: 39, y: 17, para: { zona: 'B6-venda', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { x: 9, y: 11, para: { zona: 'B6-casa-1', x: 4, y: 6, dir: 'n' }, tipo: 'porta' },
    { x: 15, y: 28, para: { zona: 'B6-casa-2', x: 4, y: 6, dir: 'n' }, tipo: 'porta' },
    { x: 31, y: 30, para: { zona: 'B6-casa-3', x: 4, y: 6, dir: 'n' }, tipo: 'porta' },
    { x: 43, y: 7, para: { zona: 'B6-lab-1', x: 15, y: 20, dir: 'n' }, tipo: 'porta' },
    ...[7, 8, 9].flatMap((x) => [29, 30, 31].map((y) => ({ x, y, para: { zona: 'B-TA', x: 54, y: 24, dir: 's' as const } }))),
  ],
  portoes: [
    { x: 24, y: 4, requer: 'insignia:13', sprite: 'cl-montanhista', fala: 'Guarda-serra Pinheiro: "Daqui para cima é paredão, pedregulho e frio de rachar.\nSem a Insígnia Espinho do Doutor Peçonha eu não deixo subir. Ordem dos Guardiões."' },
    { x: 33, y: 12, requer: 'flag:laboratorio-ok', sprite: 'npc-homem-1', fala: 'Zelador Urtigão: "O ginásio está fechado. O Doutor Peçonha saiu para investigar a fumaça roxa do curtume e não voltou.\nFaz três dias. As cobras estão com saudade. Eu também, mas não conta para ele."' },
  ],
  npcs: [
    npc('porteiro-lab', 'Capanga do Cartel', 'capanga-m', 43, 9, 's', null, { script: 'b2-lab-porteiro', se: '!flag:b2-lab-porteiro' }),
    npc('mae-perereca', 'Dona Rã', 'npc-mulher-4', 13, 31, 'o', null, { script: 'b2-filhotes' }),
    npc('filhote-1', 'Pererequinha', 'c:pererequinha', 3, 21, 's', null, { script: 'b2-filhote-1', se: 'flag:b2-filhotes-missao&!flag:b2-filhote-1' }),
    npc('filhote-2', 'Pererequinha', 'c:pererequinha', 46, 28, 's', null, { script: 'b2-filhote-2', se: 'flag:b2-filhotes-missao&!flag:b2-filhote-2' }),
    npc('botanica', 'Botânica Jurema', 'cl-biologa', 26, 12, 'o', ['As flores roxas do brejo estão murchando. Tem cal e produto químico escorrendo do curtume.', 'Os sapos sumiram, as pererecas sumiram… e toda noite passa carroça com jaula coberta de lona.', 'Se você tem criatura que corta cipó, dê uma olhada lá atrás da cerca. Eu fico aqui… vigiando as flores.']),
    npc('pescador', 'Seu Muçum', 'cl-pescador', 12, 27, 'o', ['Você saiu de dentro do charco?! Achei que fosse assombração.', 'O túnel vai dar em Cidade Ginga. Mande um abraço para o meu primo Tainha. Diga que ele me deve vinte patacas.']),
    npc('velha', 'Vó Arruda', 'npc-idosa', 18, 20, 's', ['Menino, aqui todo mundo tem um chazinho para veneno.', 'Mel Puro tira peçonha de bicho. Para peçonha de gente, só mudando de cidade.'], { mov: 'olhar' }),
    npc('menino', 'Girino', 'cl-crianca-m', 29, 26, 'n', ['Eu sei pular todas as poças de lama sem sujar o pé!', '…Menos esta. E aquela. E a outra.'], { mov: 'vagar' }),
    npc('aprendiz', 'Aprendiz Ofídio', 'cl-biologa', 31, 14, 's', ['O Doutor diz que veneno é só remédio na dose errada.', 'Tipo Terra e tipo Mente dão dor de cabeça nas cobras dele. Tipo Mata, coitado, vira salada.'], { se: 'flag:laboratorio-ok' }),
    npc('liberto', 'Moradora Aliviada', 'npc-mulher-1', 41, 12, 'o', ['A fumaça parou! O brejo voltou a cheirar a… brejo.', 'Dizem que uma queixada enorme saiu correndo do curtume, com folhas nascendo onde pisava. Está solta pelo sertão.'], { se: 'flag:laboratorio-ok' }),
    npc('tropeiro', 'Carroceiro Assustado', 'npc-homem-2', 36, 21, 'o', ['Me pagaram para levar caixas até o curtume. Uma delas roncou.', 'Caixa não ronca, criatura. Larguei tudo e vim tomar um chá.'], { se: '!flag:laboratorio-ok' }),
  ],
  itens: [
    { x: 45, y: 4, item: 'elixir-andiroba', flag: 'B6-i1' },
    { x: 2, y: 19, item: 'cuia-noturna', qtd: 2, flag: 'B6-i2' },
    { x: 39, y: 28, item: 'pomada-copaiba', flag: 'B6-i3' },
    { x: 46, y: 6, item: 'pepita', oculto: true, flag: 'B6-o1' },
    { x: 11, y: 34, item: 'mel-puro', qtd: 3, oculto: true, flag: 'B6-o2' },
    { x: 27, y: 6, item: 'pedra-lunar', oculto: true, flag: 'B6-o3' },
  ],
};
export default zona;
