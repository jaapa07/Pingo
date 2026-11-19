import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente } from './_a1-grade';

/** Casa do jogador (térreo): a cozinha da mãe, o rádio da sala e a escada para o quarto. */
const g = grade('A1-casa-jogador', [
  '##############',
  '###W###K##R###',
  '#FF.GI..T...U#',
  '#............#',
  '#..hmmh.1....#',
  '#............#',
  '#Y.....S...O.#',
  '#....aaa.....#',
  '#....aaa.....#',
  '#####DD#######',
], { W: '#', K: '#', R: '#', F: '.', G: '.', I: '.', T: '.', U: '+', h: '.', m: '.', '1': '.', Y: '.', S: '.', O: '.', a: ',', D: '+' });
const mesa = g.todos('h')[0];
const zona: ZonaDef = {
  id: 'A1-casa-jogador', nome: 'Sua casa', mapa: 'A', tipo: 'interior', tileset: 'casa', musica: 'vila-jacaranda', arena: 'restinga', passo: 1,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'caicara' },
    obj(g, 'W', 'janela'), obj(g, 'K', 'quadro'), obj(g, 'R', 'relogio'),
    { o: 'fogao-lenha', x: g.todos('F')[0][0], y: g.todos('F')[0][1], texto: ['O feijão está no fogo. O cheiro de louro toma a casa inteira.'] },
    obj(g, 'G', 'geladeira', { texto: ['Suco de caju, doce de leite e um bilhete: "O pudim é para DEPOIS do almoço."'] }),
    obj(g, 'I', 'pia'),
    obj(g, 'T', 'tv', { texto: ['O jornal do meio-dia: "Pescadores de Porto Sereia reclamam: a Usina Velha anda soltando faísca."'] }),
    { o: 'cadeira', x: mesa[0], y: mesa[1] }, { o: 'mesa', x: mesa[0] + 1, y: mesa[1] }, { o: 'cadeira', x: g.todos('h')[1][0], y: g.todos('h')[1][1] },
    obj(g, 'Y', 'radio', { script: 'radio' }),
    obj(g, 'S', 'sofa'),
    obj(g, 'O', 'oratorio', { texto: ['O oratório da família. Tem uma fitinha amarrada para cada viagem que deu certo.'] }),
    { o: 'tapete-b', x: g.todos('a')[3][0], y: g.todos('a')[3][1] },
    obj(g, 'U', 'escada-sobe'),
  ],
  warps: [
    ...saidas(g, 'U', 'A1-quarto', 9, 7, 'o', 'escada'),
    ...saidas(g, 'D', 'A1', 7, 10, 's', 'porta'),
  ],
  npcs: [gente(g, '1', 'mae', 'mae', 'Mãe', { script: 'mae' })],
  gatilhos: [
    { x: 10, y: 2, w: 2, h: 2, script: 'mae-intro', se: '!flag:intro-ok' },
  ],
};
export default zona;
