/**
 * B7 · Serra da Geada — passo 14 (líder 14, Gaúcha Pinhão, ás 59). Cidade de pedra e araucária no alto da serra.
 * Ginásio da Geada (zona `B7-ginasio`, time de ginásios; porta → (8, 17); saída em (31, 11)).
 * Sul: Subida da Serra (B-R4). Norte: Caminho das Névoas (B-R5, B2-norte; portão `insignia:14`).
 * Oeste: Campos de Altitude (B-SG, B2-norte). Leste: Lagoa Gelada (B-LG, B2-norte). Coordenadas em docs/HISTORIA.md.
 * Na entrada sul, a rival Tainá (encontro 7, `b2-rival-7`). No Galpão do CTG: o quiz da Rádio Serrana
 * (spec 10A-31) e a roda de chimarrão. Pista de gelo da praça: escorrega-se até bater (ilhota com prêmio).
 */
import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, entrada, saidas, bordas, gente, duelista, item, placa } from './_b2s-lib';

const p = new Pincel(50, 40, '.');
p.r(0, 0, 50, 2, 'T').r(0, 38, 50, 2, 'T').r(0, 0, 1, 40, 'T').r(49, 0, 1, 40, 'T');
p.t(1, 2, 'TTTT', 'TT_T', 'T').t(40, 2, 'TTTTTTTTT', '__TTT_TTT', '_____TTTT').t(1, 33, 'T', 'TTT', 'TTTT', 'TTTTT').t(43, 33, '_____T', '___TTT', '_TTTTT', 'TTTTTT');
// ruas: a avenida norte-sul e a rua da serra (oeste-leste)
p.r(24, 0, 2, 40, ':').r(0, 19, 50, 2, ':');
p.via(':', 1, 14, 18, 14, 18).via(':', 1, 34, 18, 34, 18).via(':', 1, 6, 13, 6, 18).via(':', 1, 42, 13, 42, 18).via(':', 1, 31, 11, 31, 18).via(':', 1, 11, 31, 11, 34, 23, 34);
p.via(':', 1, 26, 12, 31, 12);
// praça das araucárias e a pista de gelo
p.r(27, 22, 15, 13, ',').r(29, 24, 11, 9, 'g').r(33, 27, 2, 2, '.').p('b', 29, 24, 39, 24, 29, 32, 39, 32, 31, 26, 37, 30, 36, 25).q(28, 23, 13, 11, 'f').p(':', 34, 23, 34, 33);
// CTG: galpão, mangueira (curral) e o fogo de chão
p.q(3, 22, 12, 6, 'f').r(4, 23, 10, 4, ';').p(':', 9, 27).r(15, 24, 6, 2, ';');
// jardins com geada, muretas de pedra e canteiros
p.r(3, 8, 7, 3, ',').r(37, 6, 8, 4, ',').r(16, 6, 6, 4, '"').p('C', 17, 13, 18, 13, 19, 13).r(16, 12, 5, 1, 'f').r(16, 14, 5, 1, 'f').p('f', 16, 13, 20, 13);
p.r(2, 35, 7, 2, '"').r(16, 30, 6, 4, '"');
// riacho gelado do leste (cai para a Lagoa Gelada)
p.r(44, 22, 4, 10, '~').r(45, 25, 2, 2, 'g').p('=', 44, 19, 45, 19, 46, 19, 47, 19, 44, 20, 45, 20, 46, 20, 47, 20).r(44, 21, 4, 1, '~');
// árvores e moitas
p.p('T', 2, 16, 10, 22, 21, 22, 22, 26, 3, 30, 15, 36, 20, 36, 46, 15, 47, 9, 12, 5, 33, 4, 21, 4, 27, 36, 42, 36, 40, 26);
p.p('b', 8, 15, 19, 16, 29, 16, 38, 16, 45, 13, 4, 6, 14, 9, 18, 28, 12, 33, 7, 37);
p.p(',', 5, 15, 9, 17, 22, 17, 27, 17, 39, 17, 44, 17, 2, 25, 17, 21, 36, 21, 13, 27);
// marcas
p.t(24, 0, 'N').t(25, 0, 'N').t(0, 19, 'W').t(0, 20, 'W').t(49, 19, 'L').t(49, 20, 'L').t(24, 39, 'S').t(25, 39, 'S');
p.t(28, 10, 'G').t(12, 17, 'P').t(33, 17, 'V').t(5, 12, 'H').t(40, 12, 'I').t(8, 30, 'J');
p.t(22, 6, 'A').t(7, 9, 'A').t(14, 11, 'A').t(36, 13, 'A').t(41, 7, 'A').t(23, 29, 'A').t(26, 30, 'A').t(10, 36, 'A').t(39, 36, 'A');
p.t(23, 19, 'q').t(27, 13, 's').t(2, 18, 'u').t(47, 18, 'y').t(23, 36, 'z').t(23, 3, 'k');
p.t(25, 35, 'R').t(26, 15, '1').t(16, 25, '2').t(27, 25, '3').t(12, 24, '4').t(8, 24, '5').t(22, 11, '6').t(38, 22, '7').t(43, 24, '8').t(29, 14, '9').t(5, 20, 'K').t(19, 33, 'Y');
p.t(33, 28, 'h').t(19, 31, 'i').t(45, 31, 'j').t(4, 35, 'm').t(38, 7, 'n').t(17, 7, '!');
const g = grade('B7', p.fim(), {
  N: ':', W: ':', L: '=', S: ':', G: '.', P: '.', V: '.', H: '.', I: '.', J: '.', A: '.',
  q: '.', s: ':', u: '.', y: '.', z: '.', k: ':', R: ':',
  '1': ':', '2': ';', '3': ',', '4': ';', '5': ';', '6': '.', '7': ',', '8': '.', '9': '.', K: ':', Y: '"',
  h: '.', i: '"', j: '.', m: '"', n: ',', '!': '"',
});
const placas = [
  placa(g, 'q', 'SERRA DA GEADA\n"Aqui o frio é de lei e o chimarrão é de graça."\nSul: Subida da Serra · Oeste: Campos de Altitude · Leste: Lagoa Gelada · Norte: Caminho das Névoas.'),
  placa(g, 's', 'GINÁSIO DA SERRA DA GEADA\nLíder: Gaúcha Pinhão.\nInsígnia Floco. Piso de gelo: quem escorrega, recomeça.'),
  placa(g, 'u', 'CAMPOS DE ALTITUDE ⇠\nCapim dourado, gralhas e serelepes.'),
  placa(g, 'y', 'LAGOA GELADA ⇢\nCanoa, pinguim e frio no osso.'),
  placa(g, 'z', 'SUBIDA DA SERRA ⇣\nDescida para o Brejo Roxo. Use as saliências: é mais rápido do que subir.'),
  placa(g, 'k', 'CAMINHO DAS NÉVOAS ⇡\nPara o Planalto Lume. A névoa engole quem anda sem Lampião.\nA Guarda da Serra só deixa passar quem tem a Insígnia Floco.'),
];
const zona: ZonaDef = {
  id: 'B7', nome: 'Serra da Geada', mapa: 'B', tipo: 'cidade', tileset: 'geada', musica: 'cidade-gaucha', arena: 'geada', passo: 14, pouso: [14, 18], clima: 'limpo',
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'G', 'ginasio', { cor: '#1f3f5c,#4f8fc0,#bfe4f6' }), obj(g, 'P', 'posto'), obj(g, 'V', 'venda'), obj(g, 'H', 'casa-a'), obj(g, 'I', 'casa-c'), obj(g, 'J', 'casa-f'),
    ...objs(g, 'A', 'araucaria'), ...placas.map((q) => q.objeto),
    { o: 'fogueira', x: 17, y: 25, texto: ['O fogo de chão do CTG. Uma chaleira de ferro chia em cima da brasa: água para o chimarrão, nunca fervendo.'] },
    { o: 'banco', x: 15, y: 24 }, { o: 'banco', x: 19, y: 24 }, { o: 'poste', x: 23, y: 18 }, { o: 'poste', x: 26, y: 21 }, { o: 'poste', x: 11, y: 18 }, { o: 'poste', x: 37, y: 18 },
    { o: 'estatua', x: 32, y: 21, texto: ['Estátua de um tropeiro de poncho, com uma Gralha-Azul no ombro. Na base: "aos que plantaram a serra, um pinhão de cada vez".'] },
    { o: 'pedra-grande', x: 45, y: 11 }, { o: 'tronco-caido', x: 3, y: 33 },
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...saidas(g, 'N', 'B-R5', 15, 78, 'n', 'borda'),
    ...saidas(g, 'W', 'B-SG', 58, 20, 'o', 'borda'),
    ...saidas(g, 'L', 'B-LG', 1, 20, 'l', 'borda'),
    ...bordas(g, 'S', 'B-R4', 38, 1, 's', 1, 0),
    entrada(g, 'G', 'ginasio', 'B7-ginasio', 8, 17),
    entrada(g, 'P', 'posto', 'B7-posto', 6, 8),
    entrada(g, 'V', 'venda', 'B7-venda', 5, 7),
    entrada(g, 'H', 'casa-a', 'B7-casa-1', 5, 7),
    entrada(g, 'I', 'casa-c', 'B7-casa-2', 5, 7),
    entrada(g, 'J', 'casa-f', 'B7-ctg', 7, 9),
  ],
  portoes: [{ x: 24, y: 4, w: 2, requer: 'insignia:14', sprite: 'cl-montanhista', fala: 'Guarda da Serra Minuano: "Daqui para o norte é o Caminho das Névoas. A cerração é tanta que o sujeito perde a própria sombra."\f"Só passa quem a Gaúcha Pinhão aprovou: volte com a Insígnia Floco."' }],
  gatilhos: [{ x: 24, y: 36, w: 2, h: 1, script: 'b2-rival-7', se: '!flag:rival-7' }],
  npcs: [
    gente(g, 'R', 'taina-b7', 'taina', 'Tainá', { dir: 's', se: '!flag:rival-7', script: 'b2-rival-7' }),
    duelista(g, '6', 'B7-1', 'cl-vaqueiro', 'l', 3),
    duelista(g, 'Y', 'B7-2', 'cl-montanhista', 'n', 3),
    gente(g, '1', 'b7-guarda', 'cl-montanhista', 'Guarda da Serra Minuano', { dir: 'o', se: 'insignia:14', fala: ['Insígnia Floco! Pode seguir para o Caminho das Névoas, tchê.', 'Leve o Lampião aceso: a névoa de lá não tem fim nem começo.'] }),
    gente(g, '2', 'b7-patrao', 'npc-idoso', 'Patrão Ernesto', { dir: 's', script: 'b2-chimarrao' }),
    gente(g, '3', 'b7-patinadora', 'cl-crianca-f', 'Guria Neve', { dir: 's', fala: ['Na pista de gelo a gente não anda: escorrega até bater em alguma coisa!', 'Tem um pacotinho perdido na ilhota do meio. Eu nunca consigo parar lá. Você consegue?'] }),
    gente(g, '4', 'b7-tropeiro', 'npc-homem-2', 'Tropeiro Bento', { dir: 'l', fala: ['Na mangueira do CTG a gente guarda as mulas. E a Seriemão do patrão, que se acha mula.', 'Dizem que a Gaúcha Pinhão escorrega no gelo de propósito, só para mostrar que não cai.'] }),
    gente(g, '5', 'b7-gaiteiro', 'cl-repentista', 'Gaiteiro Chiru', { dir: 'l', mov: 'olhar', fala: ['♪ Vem cá, minha prenda, que a gaita chorou… ♪', 'Tipo Geada sofre com Brasa, Pedra, Ferro e Ginga. A Gaúcha sabe disso e põe Ferro no meio para enganar.'] }),
    gente(g, '7', 'b7-moca', 'npc-mulher-1', 'Prenda Dorinha', { dir: 'o', script: 'b2-carta-b7' }),
    gente(g, '8', 'b7-pescador', 'cl-pescador', 'Pescador Jundiá', { dir: 'o', fala: ['O riacho desce para a Lagoa Gelada. Lá tem pinguim, acredita? Pinguim na serra!', 'Vieram com o frio e ficaram. Igual a mim, que vim passar o fim de semana e estou aqui há trinta anos.'] }),
    gente(g, '9', 'b7-trocador', 'npc-homem-4', 'Seu Tchê Barbosa', { dir: 's', script: 'b2-troca-b7' }),
    gente(g, 'K', 'b7-viajante', 'npc-mulher-3', 'Viajante Querência', { dir: 's', fala: ['Os Campos de Altitude, a oeste, são o lugar da Gralha-Azul e do Serelepe. Ao amanhecer, dizem, canta um pássaro que cala a mata.', 'Só canta para quem já registrou muita criatura no Diário. Tipo cento e cinquenta.'] }),
  ],
  itens: [item(g, 'h', 'pt-20'), item(g, 'i', 'garrafada', 2, true), item(g, 'j', 'elixir-andiroba'), item(g, 'm', 'cuia-ouro', 2, true), item(g, 'n', 'pedra-lunar', 1, true), item(g, '!', 'cha-guarana')],
};
export default zona;
