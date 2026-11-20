/**
 * B5-feira · Feira da Cidade Ginga (mercado coberto; spec 8 "Mercados especiais") — passo 12.
 * Às quintas a Artesã Cabacinha traz cuias de encomenda (spec 10A-2, feira às quintas: `b2-feira-quinta`).
 * Dona Dendê pede os frutos do tabuleiro (missão `m-dende`).
 */
import type { ZonaDef } from '../../core/tipos';
import { grade, obj, peca, objs, saidas, gente, item } from './_b2s-lib';

const g = grade('B5-feira', [
  '#################',
  '##J####R###Q##J##',
  '#.K.Z..S..Y..K..#',
  '#..1BBB2BBB3BBB4#',
  '#,,,,,,,,,,,,,,,#',
  '#.....:::::.....#',
  '#:::::::::::::::#',
  '#.,...:.:.:...,.#',
  '#.HH.5.:...6..W.#',
  '#.......7......X#',
  '########DD#######',
], { J: '#', R: '#', Q: '#', K: '.', Z: '.', S: '.', Y: '.', B: '.', H: '.', W: '.', X: ',', D: '+', '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.', '7': '.' });
const zona: ZonaDef = {
  id: 'B5-feira', nome: 'Feira da Cidade Ginga', mapa: 'B', tipo: 'interior', tileset: 'predio', musica: 'venda', arena: 'cerrado', passo: 12,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'venda' },
    ...objs(g, 'J', 'janela'), obj(g, 'R', 'rede-pesca'), obj(g, 'Q', 'quadro-ex-voto'),
    ...objs(g, 'K', 'cesto'), obj(g, 'Z', 'saco-graos'), obj(g, 'S', 'barril'), obj(g, 'Y', 'pote-barro'),
    { o: 'balcao', x: g.todos('B')[0][0], y: g.todos('B')[0][1] }, { o: 'balcao', x: g.todos('B')[3][0], y: g.todos('B')[3][1] }, { o: 'balcao', x: g.todos('B')[6][0], y: g.todos('B')[6][1] },
    peca(g, 'H', 'mesa'), obj(g, 'W', 'caixote'),
  ],
  warps: saidas(g, 'D', 'B5', 9, 31, 's', 'porta'),
  npcs: [
    gente(g, '1', 'frutos', 'npc-homem-2', 'Seu Cajá', { dir: 's', loja: ['caju', 'pitanga', 'jabuticaba', 'cupuacu', 'pequi', 'buriti', 'acai', 'acerola'], fala: ['Fruto fresco, colhido hoje! Plante nos canteiros e volte depois.', 'Se a criatura segurar o fruto, ela come sozinha na hora do aperto. Mais educada que muita gente.'] }),
    gente(g, '2', 'cuias', 'cl-rendeira', 'Artesã Cabacinha', { dir: 's', script: 'b2-feira-quinta' }),
    gente(g, '3', 'pergaminhos', 'cl-capoeirista', 'Mestre Rabo-de-Arraia', { dir: 's', loja: ['pt-23', 'pt-24', 'pt-31', 'pt-04', 'pt-05'], fala: ['Pergaminhos de Técnica: golpe de livro, mas dói igual.'] }),
    gente(g, '4', 'pedras', 'cl-garimpeiro', 'Garimpeira Faísca', { dir: 's', loja: ['pedra-solar', 'pedra-mare', 'pedra-lunar', 'engrenagem-velha'], fala: ['Pedra Solar, Maré, Lunar… Vieram da Chapada Rubra no lombo de mula.'] }),
    gente(g, '5', 'dende', 'npc-idosa', 'Dona Dendê', { dir: 's', script: 'b2-dende' }),
    gente(g, '6', 'provador', 'npc-idoso', 'Seu Gaspar', { dir: 'o', fala: ['Eu provo de tudo antes de comprar.', 'Hoje já provei cocada, pé de moleque, queijo coalho e a paciência da feira inteira.'] }),
    gente(g, '7', 'crianca', 'cl-crianca-m', 'Tico', { mov: 'vagar', fala: ['Moço, moça, me empresta dez patacas?', 'É para comprar uma Cuia de Mel. A minha Jataí merece.'] }),
  ],
  itens: [item(g, 'X', 'acerola', 3, true)],
};
export default zona;
