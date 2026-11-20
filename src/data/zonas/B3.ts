import type { ZonaDef } from '../../core/tipos';
import { Pincel, grade, obj, objs, entrada, bordas, saidas, gente, duelista, item, placa } from './_b1-lib';

/**
 * B3 · Chapada Rubra — cidade do garimpo ao pé dos paredões. Ginásio da Pedra (10ª insígnia, Garimpeiro Topázio; zona
 * `B3-ginasio` do time de ginásios, que devolve o jogador em (20, 20)). O ginásio só abre depois da Mina Velha libertada
 * (`mina-ok`, evento `b1-mina` em `B3-mina-2`): até lá o líder está lá embaixo, enfrentando o Cartel sozinho.
 * Oeste: Estrada Vermelha. Norte: o paredão com trepadeira sobe para a Chapada dos Paredões (Escalar, insígnia 10).
 * Visível e fora de alcance: a laje do leste e a trilha do alto do paredão (Escalar). O poço de lava fica cercado.
 */
const p = new Pincel(46, 36, '.').borda('#');
p.r(1, 3, 44, 2, '#').p('e', 23, 3, 23, 4).r(22, 1, 3, 2, ':').r(1, 1, 21, 2, ',').r(25, 1, 20, 2, ',');
p.via(':', 2, 1, 17, 8, 17, 8, 21, 43, 21).via(':', 2, 25, 5, 25, 21).via(':', 1, 8, 15, 8, 16).via(':', 2, 1, 31, 43, 31).via(':', 2, 25, 21, 25, 31);
p.via(':', 1, 27, 11, 37, 11).via(':', 1, 23, 5, 24, 5);
p.q(39, 6, 6, 5, '#').r(40, 7, 4, 3, ',').p('e', 41, 10);
p.q(2, 6, 6, 5, 'f').r(3, 7, 4, 3, 'x');
p.q(36, 23, 8, 5, 'f').r(37, 24, 6, 3, ';').p('r', 40, 24, 40, 25, 40, 26).p('.', 39, 27);
p.r(12, 8, 8, 4, '"').r(28, 25, 5, 4, '"').r(14, 33, 10, 2, '"');
p.t(23, 0, 'N').t(0, 17, 'O', 'O');
p.t(17, 19, 'Y').t(36, 10, 'H').t(6, 14, 'P').t(30, 19, 'V').t(6, 30, 'A').t(34, 30, 'B').t(14, 26, 'K');
p.t(18, 20, 'a').t(35, 12, 'n').t(3, 19, 'h').t(42, 11, 'm');
p.t(21, 20, '1').t(30, 9, '2').t(14, 16, '3').t(40, 18, '4').t(11, 24, '5').t(28, 34, '6').t(5, 22, '7').t(13, 13, '8');
p.t(42, 8, 'k').t(40, 1, 'j').t(42, 25, 'z').t(20, 9, 'q').t(43, 33, 'i');
p.t(3, 25, 'u').t(20, 25, 'u').t(31, 14, 'u').t(44, 15, 'u').t(11, 6, 'u').t(2, 33, 'u').t(35, 6, 'U').t(10, 27, 'U');
const g = grade('B3', p.fim(), {
  N: ':', O: ':', Y: '.', H: '.', P: '.', V: '.', A: '.', B: '.', K: '.', a: '.', n: '.', h: '.', m: '.',
  '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '"', '7': '.', '8': '"', k: ',', j: ',', z: ';', q: '"', i: '.', u: '.', U: '.',
});
const placas = [
  placa(g, 'a', 'GINÁSIO DA CHAPADA RUBRA\nLíder: Garimpeiro Topázio.\n"Pedra bruta também brilha. Só precisa de quem lapide."'),
  placa(g, 'n', 'MINA VELHA DA CHAPADA\nDesativada desde a grande enchente. Entrada proibida.\n(Alguém riscou "proibida" e escreveu "do Cartel".)'),
  placa(g, 'h', 'CHAPADA RUBRA\nOeste: Estrada Vermelha. Norte, paredão acima: Chapada dos Paredões e Arraial Brasa.'),
  placa(g, 'm', 'LAJE DO GARIMPEIRO\nQuem subir a laje com trepadeira acha o que o garimpeiro esqueceu.'),
];
const zona: ZonaDef = {
  id: 'B3', nome: 'Chapada Rubra', mapa: 'B', tipo: 'cidade', tileset: 'chapada', musica: 'cidade-baiao', arena: 'chapada', passo: 10, clima: 'sol',
  pouso: [8, 15],
  mapaChars: g.mapa,
  objetos: [
    obj(g, 'Y', 'ginasio', { cor: '#5c2a1a,#9c4a2a,#e09a5a' }), obj(g, 'H', 'mina-entrada'), obj(g, 'P', 'posto'), obj(g, 'V', 'venda'),
    obj(g, 'A', 'casa-colonial-a'), obj(g, 'B', 'casa-colonial-b'), obj(g, 'K', 'coreto'),
    ...objs(g, 'u', 'cacto'), ...objs(g, 'U', 'pedra-grande'),
    { o: 'poste', x: 24, y: 14 }, { o: 'poste', x: 10, y: 20 }, { o: 'poste', x: 33, y: 30 }, { o: 'fogueira', x: 32, y: 13 },
    ...placas.map((q) => q.objeto),
  ],
  placas: placas.map((q) => q.placa),
  warps: [
    ...saidas(g, 'N', 'B-CH', 20, 68, 'n'),
    ...bordas(g, 'O', 'B-R2', 88, 16, 'o', 0, 1),
    entrada(g, 'Y', 'ginasio', 'B3-ginasio', 8, 17, { requer: 'flag:mina-ok', recusa: 'A porta do ginásio está trancada com um cadeado de minério. Um bilhete preso nela diz:\n"Fui à Mina Velha botar o Cartel para correr. Volto quando a mina for do povo de novo. — Topázio"' }),
    entrada(g, 'H', 'mina-entrada', 'B3-mina-1', 15, 22),
    entrada(g, 'P', 'posto', 'B3-posto', 6, 8),
    entrada(g, 'V', 'venda', 'B3-venda', 5, 7),
    entrada(g, 'A', 'casa-colonial-a', 'B3-casa-1', 5, 7),
    entrada(g, 'B', 'casa-colonial-b', 'B3-casa-2', 5, 7),
  ],
  npcs: [
    gente(g, '1', 'b3-aprendiz', 'cl-garimpeiro', 'Aprendiz Quartzinho', { dir: 's', se: '!flag:mina-ok', fala: ['O mestre Topázio desceu na Mina Velha faz três dias. Disse que ia "conversar" com o Cartel.', 'A boca da mina fica a leste, depois da fogueira. Se você for lá, leve Lampião… não, a mina tem luz. Leve coragem.'] }),
    gente(g, '1', 'b3-aprendiz-ok', 'cl-garimpeiro', 'Aprendiz Quartzinho', { dir: 's', se: 'flag:mina-ok', fala: ['O mestre voltou e abriu o ginásio! Ele disse que você salvou a mina. E ele. Mas principalmente a mina.', 'Lá dentro os trilhos dos vagonetes mudam com as chaves de desvio. Pense antes de embarcar.'] }),
    duelista(g, '2', 'B3-1', 'cl-garimpeiro', 'o', 3),
    duelista(g, '4', 'B3-2', 'cl-montanhista', 'o', 3),
    gente(g, '3', 'b3-menina', 'cl-crianca-f', 'Ágata', { mov: 'vagar', fala: ['Meu pai achou uma pedra que muda de cor com o sol. Ele chama de "pedra de humor".', 'Hoje está cinza. Ele também.'] }),
    gente(g, '5', 'b3-idoso', 'npc-idoso', 'Seu Feldspato', { dir: 'l', fala: ['Aquele poço cercado é lava de verdade. A chapada fica em cima de um vulcão adormecido.', 'Mais ao norte, depois dos paredões, tem a Caverna Vulcânica. Os antigos dizem que ali dorme uma serpente de fogo. Eu digo que ali dorme o meu medo.'] }),
    gente(g, '6', 'b3-escoteira', 'cl-escoteira', 'Escoteira Turmalina', { dir: 'n', fala: ['Paredão com trepadeira: quem tem o Amuleto de Escalar e uma criatura Ginga, Comum ou Inseto sobe na hora.', 'É o Topázio que entrega o Amuleto. Por isso todo mundo aqui está torcendo para alguém salvar a mina.'] }),
    gente(g, '7', 'b3-vaqueiro', 'cl-vaqueiro', 'Tropeiro Calcita', { dir: 's', fala: ['Desci a Estrada Vermelha com tropa de mula. Na metade, um Escorpião-Rei sentou no meu chapéu.', 'Deixei o chapéu com ele. Tem coisa que não se discute.'] }),
    gente(g, '8', 'b3-mineira', 'npc-mulher-4', 'Mineira Jaspe', { dir: 'l', fala: ['Trabalhei vinte anos naquela mina. Agora o Cartel usa os túneis para esconder bicho roubado.', 'Ouvi barulho de gaiola e de Tatucanastra raspando. Tatucanastra não gosta de gaiola. Ninguém gosta.'] }),
  ],
  itens: [item(g, 'k', 'pt-46'), item(g, 'j', 'pedra-solar'), item(g, 'z', 'pepita', 2), item(g, 'q', 'elixir-andiroba', 1, true), item(g, 'i', 'cuia-ouro', 3)],
};
export default zona;
