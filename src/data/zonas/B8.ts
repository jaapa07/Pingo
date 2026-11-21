import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, entrada, saidas, bordas, gente, duelista, item, placa, E } from './_b2n-lib';

/**
 * B8 · Planalto Lume — cidade do observatório, na beira dos cânions. Ginásio da Mente (15ª insígnia, Astrônoma Jaci;
 * zona `B8-ginasio` do time de ginásios: a porta leva a (8, 17) e a volta é (23, 9), em docs/PORTAS-GINASIO.md).
 * Oeste: Caminho das Névoas (B-R5). Nordeste: a estrada da Floresta Ancestral (B-FA), fechada pela Guardiã da Floresta
 * até o Conselho (`pos-jogo`). Sul: os Campos do Lume (capim alto e ipês de sacudir; é o "B-PL" da tabela 6.4) e o cânion.
 * Missões: a carta da aprendiz para o pescador da Lagoa Gelada (`b2n-carta`), as constelações vivas do observatório
 * (`b2n-constelacoes`, só de noite) e a escrivã que lembra onde cada criatura foi capturada (`b2n-registro`).
 * Selvagens dos Campos 55–59 (camada pós-insígnia 16: 60–63); treinadores 56–59 (ás da Jaci = 61).
 */
const p = new Pincel(50, 40, '.').borda('#');
// avenida, rua do ginásio, rua do observatório e a estrada da floresta
p.via(':', 2, 0, 19, 46, 19).via(':', 2, 22, 9, 22, 19).via(':', 2, 22, 11, 38, 11).r(38, 10, 2, 3, ':').via(':', 2, 44, 0, 44, 19);
// praça do coreto, ao lado do ginásio
p.r(26, 3, 9, 7, ',').q(26, 3, 9, 7, ':');
// Campos do Lume (capim alto) e os ipês de sacudir
p.r(2, 22, 16, 7, '"').r(30, 22, 15, 7, '"').p('t', 6, 24, 12, 26, 35, 23, 41, 26, 15, 23);
// beira do cânion: mirante de tábua, paredões e o Rio Lume lá no fundo
p.r(1, 31, 48, 8, '#').r(3, 34, 44, 3, '~').p('w', 24, 33).p('#', 2, 30, 18, 30, 19, 30, 47, 30).r(20, 29, 8, 2, '=');
// cercas do mirante e da beira
p.r(1, 29, 19, 1, 'f').r(28, 29, 21, 1, 'f').p('.', 1, 29, 48, 29);
// mata fechada dos dois lados da porteira da floresta
p.r(42, 1, 2, 4, 'T').r(46, 1, 2, 4, 'T');
// canteiros e flores
p.p('C', 3, 9, 5, 9, 7, 9).p(',', 3, 10, 5, 10, 7, 10, 12, 4, 13, 5, 30, 4, 31, 5, 46, 24, 8, 21, 36, 21);
p.p('T', 1, 1, 2, 1, 1, 2, 11, 1, 17, 2, 28, 1, 33, 2, 47, 1, 47, 2, 48, 8, 41, 1, 9, 13, 18, 13, 47, 14, 2, 14);
p.p('b', 13, 9, 17, 9, 36, 5, 42, 14, 28, 21, 19, 21, 47, 21);
// marcas
p.t(0, 19, 'W', 'W').t(44, 0, 'NN');
p.t(20, 8, 'Y').t(8, 17, 'P').t(14, 17, 'V').t(30, 17, 'A').t(36, 17, 'B').t(38, 9, 'O');
p.t(21, 9, 'a').t(3, 18, 'n').t(43, 5, 'h').t(23, 28, 'm');
p.t(19, 25, '1').t(29, 25, '2').t(36, 12, '3');
p.t(41, 10, 'R').t(12, 12, 'S').t(27, 21, 'K').t(6, 6, 'D').t(34, 21, 'G').t(46, 5, 'F').t(28, 6, 'J');
p.t(2, 27, 'k').t(46, 22, 'j').t(48, 18, 'i').t(4, 3, 'q');
p.t(29, 7, 'Z').t(16, 7, 'X').t(35, 7, 'X');
const g = grade('B8', p.fim(), {
  W: ':', N: ':', Y: '.', P: '.', V: '.', A: '.', B: '.', O: '.', a: '.', n: '.', h: ':', m: '=', '1': '"', '2': '"', '3': '.',
  R: '.', S: '.', K: '.', D: '.', G: '.', F: '.', J: ',', k: '"', j: '"', i: '.', q: '.', Z: ',', X: '.',
});
const placas = [
  placa(g, 'a', 'GINÁSIO DE PLANALTO LUME\nLíder: Astrônoma Jaci.\n"O céu é um mapa. Quem sabe ler, nunca se perde."'),
  placa(g, 'n', 'PLANALTO LUME\nOeste: Caminho das Névoas. Nordeste: Floresta Ancestral (fechada).\nObservatório aberto toda noite.'),
  placa(g, 'h', 'ESTRADA DA FLORESTA ANCESTRAL\nPassagem guardada. Só entra quem já foi recebido pelo Conselho dos Guardiões.'),
  placa(g, 'm', 'MIRANTE DO CÂNION\nLá embaixo corre o Rio Lume. À noite a água reflete tanta estrela que parece outro céu.'),
];
const zona: ZonaDef = {
  id: 'B8', nome: 'Planalto Lume', mapa: 'B', tipo: 'cidade', tileset: 'planalto', musica: 'cidade-choro', arena: 'planalto', passo: 15,
  pouso: [10, 18],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'Y', 'ginasio', { cor: '#2a1c4a,#5a3c8c,#b89ce8' }), obj(g, 'P', 'posto'), obj(g, 'V', 'venda'), obj(g, 'A', 'casa-colonial-a'), obj(g, 'B', 'casa-c'),
    obj(g, 'O', 'observatorio'),
    obj(g, 'Z', 'coreto'), ...objs(g, 'X', 'poste'),
    { o: 'poste', x: 13, y: 21 }, { o: 'poste', x: 29, y: 21 }, { o: 'poste', x: 41, y: 21 }, { o: 'banco', x: 32, y: 9 }, { o: 'fonte', x: 27, y: 9 },
    { o: 'ipe-roxo', x: 3, y: 4 }, { o: 'ipe-roxo', x: 46, y: 9 }, { o: 'ipe-amarelo', x: 19, y: 3 }, { o: 'estatua', x: 42, y: 7, texto: ['Estátua de uma moça olhando pela luneta. A placa diz: "Jaci, a primeira astrônoma do Lume. Ela contou as estrelas e as estrelas contaram com ela."'] },
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...saidas(g, 'W', 'B-R5', 88, 16, 'o'),
    ...bordas(g, 'N', 'B-FA', 30, 58, 'n', 1, 0),
    entrada(g, 'Y', 'ginasio', 'B8-ginasio', 8, 17),
    entrada(g, 'P', 'posto', 'B8-posto', 6, 8),
    entrada(g, 'V', 'venda', 'B8-venda', 5, 7),
    entrada(g, 'A', 'casa-colonial-a', 'B8-casa-1', 5, 7),
    entrada(g, 'B', 'casa-c', 'B8-casa-2', 5, 7),
    entrada(g, 'O', 'observatorio', 'B8-observatorio', 6, 10),
  ],
  portoes: [
    { x: 44, y: 3, w: 2, h: 1, requer: 'pos-jogo', sprite: 'guardia-floresta', fala: 'A Guardiã da Floresta cruza a lança de taquara na estrada:\n— A Floresta Ancestral é a casa mais velha do Sertão. Tem árvore que viu a serra nascer.\f— Ela só recebe quem já foi recebido pelo Conselho dos Guardiões, lá no Pico Pingorama. Vença o Conselho e eu mesma abro o caminho.' },
  ],
  npcs: [
    duelista(g, '1', 'B8-1', 'cl-observadora', 'l', 3),
    duelista(g, '2', 'B8-2', 'cl-biologa', 'o', 3),
    duelista(g, '3', 'B8-3', 'cl-repentista', 's', 3),
    gente(g, 'R', 'b8-aprendiz', 'npc-mulher-1', "Aprendiz Estrela-d'Alva", { dir: 's', script: 'b2n-carta' }),
    gente(g, 'S', 'b8-escriva', 'npc-idosa', 'Dona Lembrança', { dir: 's', script: 'b2n-registro' }),
    gente(g, 'K', 'b8-menina', 'cl-crianca-f', 'Luzinha', { mov: 'vagar', fala: ['De noite o céu daqui tem mais estrela que a areia do Pantanal. Eu contei até mil e dormi.', 'A Astrônoma Jaci tem uma criatura que some e aparece em outro lugar do ginásio. Eu acho que é mágica. A Jaci diz que é Mente.'] }),
    gente(g, 'D', 'b8-tropeiro', 'npc-homem-3', 'Tropeiro Cerrito', { dir: 's', fala: ['Lá no Monte Tupã, do outro lado da serra, tem um guardião que não deixa ninguém subir. O Abaeté.', 'Ele só abre a trilha para quem traz quinze insígnias. Com a da Jaci, você chega lá. A Aldeia Tupã fica no topo, e o Ginásio da Lenda também.'] }),
    gente(g, 'G', 'b8-luneteiro', 'npc-homem-1', 'Seu Luneta', { dir: 'n', mov: 'olhar', fala: ['Bicho de Mente adora o Lume: Papagálio, Corujão-Orelha, Noitão. A Jaci joga com eles.', 'Contra a Mente vale Assombro e Inseto. E paciência: a Jaci troca de criatura como quem troca de estrela.'] }),
    gente(g, 'F', 'b8-guardia-floresta', 'guardia-floresta', 'Guardiã da Floresta', { dir: 's', se: 'pos-jogo', fala: ['O Conselho mandou avisar: o caminho está aberto. Pise de leve na Floresta Ancestral.', 'Lá dentro tem ninho raro de criatura que a gente só via em livro: Tamanduá-Copa, Guaraflama, Botorosa… e coisa maior. Muito maior.'] }),
    gente(g, 'J', 'b8-sanfoneiro', 'cl-repentista', 'Choro do Lume', { dir: 's', fala: ['Aqui a música da praça é choro: flauta, cavaquinho e pandeiro. O coreto foi feito para a lua ouvir.', 'Volte de noite: o observatório abre e a praça inteira apaga a luz para ver o céu.'] }),
  ],
  itens: [item(g, 'k', 'cuia-mel', 2), item(g, 'j', 'elixir-andiroba', 1, true), item(g, 'i', 'pedra-solar'), item(g, 'q', 'garrafada', 3)],
  habitats: [
    {
      // 6.4 (B-PL = Campos do Lume): Beija-Arco-Íris (G mr, dia), Papagálio (G r), Urubu-Rei (G r), Louva-Mestre (G r)
      metodo: 'grama', taxa: 0.1,
      dia: [E(47, 64, 66, 20), E(136, 64, 66, 18), E(12, 64, 66, 16), E(64, 65, 67, 14), E(158, 66, 68, 10), E(54, 66, 68, 10), E(56, 66, 68, 8), E(48, 66, 68, 4)],
      noite: [E(44, 64, 66, 20), E(172, 64, 66, 18), E(60, 64, 66, 16), E(54, 66, 68, 14), E(56, 66, 68, 12), E(158, 66, 68, 10), E(64, 65, 67, 10)],
      camadas: [{
        apos: 16,
        dia: [E(47, 68, 70, 18), E(136, 68, 70, 18), E(12, 68, 70, 16), E(64, 68, 70, 14), E(158, 69, 71, 12), E(54, 69, 71, 10), E(56, 69, 71, 8), E(48, 69, 71, 4)],
        noite: [E(44, 68, 70, 20), E(172, 68, 70, 18), E(60, 68, 70, 16), E(54, 69, 71, 14), E(56, 69, 71, 12), E(158, 69, 71, 10), E(64, 68, 70, 10)],
      }],
    },
    {
      // 6.4 (B-PL, A): Jataí-Rainha (r, dia)
      metodo: 'arvore',
      dia: [E(136, 64, 66, 35), E(138, 64, 66, 30), E(154, 64, 66, 20), E(150, 66, 68, 15)],
      noite: [E(172, 64, 66, 40), E(44, 64, 66, 35), E(138, 64, 66, 25)],
      camadas: [{ apos: 16, dia: [E(136, 68, 70, 35), E(138, 68, 70, 30), E(154, 68, 70, 15), E(150, 69, 71, 20)], noite: [E(172, 68, 70, 40), E(44, 68, 70, 35), E(138, 68, 70, 25)] }],
    },
  ],
};
export default zona;
