import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, entrada, bordas, saidas, gente, duelista, item, placa } from './_b1-lib';

/**
 * B4 · Arraial Brasa — vila de ferreiros no alto da chapada, com o terreiro da fogueira de São João no meio.
 * Ginásio da Brasa (11ª insígnia, Ferreira Labareda; zona `B4-ginasio` do time de ginásios). Sul: Chapada dos Paredões.
 * Leste: Trilha da Roda (B-R3, time B2; chegada aqui em (48, 16)) — a porteira dos capoeiristas só abre com a insígnia 11.
 * Na entrada sul, a rival Tainá (encontro 6, `b1-rival-6`). Missão do São João no terreiro (`b1-sao-joao`, aos sábados).
 * Visível e fora de alcance: a prateleira da cascata do noroeste (Cachoeira, insígnia 12).
 */
const p = new Pincel(50, 34, '.').borda('#');
p.via(':', 2, 24, 26, 24, 33).via(':', 2, 24, 6, 24, 17).via(':', 2, 1, 14, 46, 14).r(46, 14, 3, 3, ':');
p.r(47, 1, 1, 13, '#').r(47, 17, 1, 16, '#');
p.r(14, 18, 22, 9, ',').q(14, 18, 22, 9, ':');
// cascata do noroeste: prateleira de cima, lagoa de baixo
p.r(1, 1, 10, 7, '#').r(2, 2, 5, 2, ',').p('w', 4, 4, 4, 5, 4, 6).r(2, 7, 7, 3, '~');
// pátio das forjas e o carvoeiro
p.r(2, 27, 10, 5, ';').r(38, 28, 9, 4, ';').r(30, 3, 8, 3, '"').r(41, 3, 6, 6, '"');
p.t(49, 14, 'Z', 'Z', 'Z').t(24, 33, 'SS');
p.t(22, 5, 'Y').t(8, 12, 'P').t(36, 12, 'V').t(8, 24, 'H').t(38, 25, 'A').t(23, 22, 'K').t(3, 31, 'G').t(43, 31, 'G').t(14, 31, 'G');
p.t(27, 6, 'a').t(26, 31, 'n').t(46, 12, 'h').t(13, 8, 'm');
p.t(18, 13, '1').t(31, 17, '2').t(16, 22, '3').t(32, 24, '4').t(8, 29, '5').t(44, 18, '6').t(20, 4, '7').t(40, 30, '8').t(28, 10, '9');
p.t(24, 29, 'R');
p.t(5, 2, 'k').t(46, 7, 'j').t(1, 20, 'z');
p.t(18, 19, 'F').t(30, 19, 'F').t(18, 25, 'F').t(30, 25, 'F').t(24, 19, 'F');
p.t(4, 17, 'u').t(46, 22, 'u').t(12, 3, 'u').t(35, 9, 'u');
const g = grade('B4', p.fim(), {
  Z: ':', S: ':', Y: '.', P: '.', V: '.', H: '.', A: '.', K: ',', G: ';', a: '.', n: '.', h: '.', m: '.',
  '1': '.', '2': '.', '3': ',', '4': ',', '5': ';', '6': '.', '7': '.', '8': ';', '9': '.', R: ':', k: ',', j: '"', z: '.', F: ',', u: '.',
});
const placas = [
  placa(g, 'a', 'GINÁSIO DE ARRAIAL BRASA\nLíder: Ferreira Labareda.\n"Ferro só aprende no fogo. Gente também."'),
  placa(g, 'n', 'ARRAIAL BRASA\nSul: Chapada dos Paredões. Leste: Trilha da Roda, para Cidade Ginga.\nTerreiro da fogueira: festa de São João todo sábado.'),
  placa(g, 'h', 'TRILHA DA RODA → CIDADE GINGA\nPorteira dos capoeiristas: só passa quem tem a Insígnia da Chama.'),
  placa(g, 'm', 'Lagoa da Cascata Velha. A prateleira lá em cima tem dono: quem subir a água.'),
];
const zona: ZonaDef = {
  id: 'B4', nome: 'Arraial Brasa', mapa: 'B', tipo: 'cidade', tileset: 'chapada', musica: 'cidade-forro', arena: 'vulcao', passo: 11, clima: 'sol',
  pouso: [10, 13],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'Y', 'ginasio', { cor: '#6c1c10,#b8401c,#f4a050' }), obj(g, 'P', 'posto'), obj(g, 'V', 'venda'), obj(g, 'H', 'forja'), obj(g, 'A', 'casa-colonial-c'),
    obj(g, 'K', 'coreto'), ...objs(g, 'G', 'forja'), ...objs(g, 'F', 'fogueira'), ...objs(g, 'u', 'cacto'),
    { o: 'poste', x: 14, y: 17 }, { o: 'poste', x: 35, y: 17 }, { o: 'poste', x: 14, y: 27 }, { o: 'poste', x: 35, y: 27 }, { o: 'banco', x: 20, y: 27 }, { o: 'banco', x: 27, y: 27 },
    { o: 'estatua', x: 23, y: 7 }, { o: 'pedra-grande', x: 45, y: 27 },
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...saidas(g, 'Z', 'B-R3', 1, 14, 'l'),
    ...bordas(g, 'S', 'B-CH', 14, 1, 's', 1, 0),
    entrada(g, 'Y', 'ginasio', 'B4-ginasio', 8, 17),
    entrada(g, 'P', 'posto', 'B4-posto', 6, 8),
    entrada(g, 'V', 'venda', 'B4-venda', 5, 7),
    entrada(g, 'H', 'forja', 'B4-forja', 5, 7),
    entrada(g, 'A', 'casa-colonial-c', 'B4-casa-1', 5, 7),
  ],
  portoes: [{ x: 47, y: 14, w: 1, h: 3, requer: 'insignia:11', sprite: 'cl-capoeirista', fala: 'Um capoeirista abre os braços na porteira da Trilha da Roda:\n— Ê, camarada! A roda da trilha é para quem já passou pelo fogo da Labareda.\f— Volte com a Insígnia da Chama que o berimbau toca para você passar.' }],
  npcs: [
    duelista(g, '1', 'B4-1', 'cl-ferreiro', 's', 3),
    duelista(g, '2', 'B4-2', 'cl-repentista', 'o', 3),
    gente(g, 'R', 'taina-b4', 'taina', 'Tainá', { dir: 's', se: '!flag:rival-6', script: 'b1-rival-6' }),
    gente(g, '3', 'b4-festeira', 'npc-mulher-2', 'Festeira Dona Quentão', { dir: 'l', script: 'b1-sao-joao' }),
    gente(g, '4', 'b4-sanfoneiro', 'cl-repentista', 'Sanfoneiro Zé Fole', { dir: 'o', mov: 'olhar', fala: ['Toda noite de sábado tem quadrilha no terreiro. A fogueira acende sozinha quando a sanfona puxa o baião.', 'Sozinha não: é a Ferreira Labareda que acende com o Calangão dela. Mas a gente finge que é milagre.'] }),
    gente(g, '5', 'b4-carvoeiro', 'npc-homem-2', 'Carvoeiro Tição', { dir: 'n', fala: ['Carvão daqui vai para as forjas e as forjas fazem ferradura, faca e sino.', 'O Cartel queria comprar todo o ferro da vila para fazer gaiola. A Labareda pôs eles para correr com um martelo em cada mão.'] }),
    gente(g, '6', 'b4-guardiao-porteira', 'cl-capoeirista', 'Contramestre Arame-Liso', { dir: 'o', se: 'insignia:11', fala: ['Insígnia da Chama no peito! Pode passar, camarada. A Trilha da Roda leva a Cidade Ginga.', 'Lá o Mestre Gingado espera. Treine a ginga: no ginásio dele, o berimbau manda.'] }),
    gente(g, '7', 'b4-aprendiz', 'cl-ferreiro', 'Aprendiz Fagulha', { dir: 's', fala: ['A Ferreira Labareda acende as fogueiras do ginásio numa ordem de música. Errou a nota, apaga tudo.', 'Bicho de Brasa sofre com Rio, Terra e Pedra. Mas a Labareda tem Calangão de Pedra no meio para enganar.'] }),
    gente(g, '8', 'b4-menina', 'cl-crianca-f', 'Bandeirinha', { mov: 'vagar', fala: ['Eu recorto bandeirinha de papel para a festa. Já fiz quinhentas!', 'O vento levou trezentas. Sobrou duzentas e um resfriado.'] }),
    gente(g, '9', 'b4-vulcanologo', 'npc-homem-1', 'Seu Basalto', { dir: 's', fala: ['A Caverna Vulcânica fica no terceiro degrau da Chapada dos Paredões, descendo daqui.', 'O Boitatá de lá só aparece para quem tem a Insígnia do Cristal. E só fica com quem tem paciência e Cuia de Ouro.'] }),
  ],
  gatilhos: [{ x: 24, y: 31, w: 2, h: 1, script: 'b1-rival-6', se: '!flag:rival-6' }],
  itens: [item(g, 'k', 'pedra-solar'), item(g, 'j', 'elixir-andiroba', 2, true), item(g, 'z', 'garrafada', 2, true)],
};
export default zona;
