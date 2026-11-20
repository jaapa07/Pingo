/**
 * B7-ctg · Galpão do CTG da Serra da Geada (passo 14): o estúdio da Rádio Serrana, onde a locutora faz o quiz da
 * fauna (spec 10A-31, `b2-quiz`, uma tentativa por dia), o gaiteiro e as prendas.
 */
import type { ZonaDef } from '../../core/tipos';
import { grade, obj, peca, objs, saidas, gente, item } from './_b2s-lib';

const g = grade('B7-ctg', [
  '################',
  '##J###Q##J####R#',
  '#LL...KK...U.QQ#',
  '#..............#',
  '#.,,,,,,,,,,,..#',
  '#.,::::::::::,.#',
  '#.,:..3..4..:,.#',
  '#.,::::::::::,.#',
  '#.,,,,,,,,,,,..#',
  '#B.5....1....2Z#',
  '#######DD#######',
], { J: '#', Q: '#', R: '#', L: '.', K: '.', U: '.', B: '.', Z: '.', D: '+', '1': '.', '2': '.', '3': ':', '4': ':', '5': '.' });
const zona: ZonaDef = {
  id: 'B7-ctg', nome: 'Galpão do CTG', mapa: 'B', tipo: 'interior', tileset: 'casa', musica: 'cidade-gaucha', arena: 'geada', passo: 14,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'serrana' },
    ...objs(g, 'J', 'janela'), obj(g, 'Q', 'quadro', { texto: ['Quadro de honra do CTG: "Campeões do Laço, da Chula e do Quiz da Rádio Serrana".'] }), obj(g, 'R', 'relogio'),
    peca(g, 'L', 'lareira'), peca(g, 'K', 'mesa'), obj(g, 'U', 'radio', { texto: ['O microfone da Rádio Serrana, com um pano de lã enrolado para não pegar friagem.'] }), { o: 'estante', x: g.todos('Q')[1][0] - 0, y: 2 },
    obj(g, 'B', 'barril'), obj(g, 'Z', 'cesto'),
  ],
  warps: saidas(g, 'D', 'B7', 11, 31, 's', 'porta'),
  npcs: [
    gente(g, '1', 'locutora', 'npc-mulher-3', 'Locutora Florinda', { dir: 's', script: 'b2-quiz' }),
    gente(g, '2', 'gaiteiro-ctg', 'cl-repentista', 'Gaiteiro Tibúrcio', { dir: 'o', fala: ['♪ Chimarrão, chimarrão, amargo de coração… ♪', 'Na Rádio Serrana o quiz é sério: a Florinda explica cada resposta. Quem erra aprende, quem acerta ganha.'] }),
    gente(g, '3', 'prenda-1', 'npc-mulher-1', 'Prenda Lurdinha', { dir: 'l', mov: 'olhar', fala: ['Ensaio de chula! O peão sapateia em volta da lança sem encostar nela.', 'O meu par encostou três vezes. Agora ensaia sozinho.'] }),
    gente(g, '4', 'peao-1', 'cl-vaqueiro', 'Peão Laçador', { dir: 'o', fala: ['Laço de doze braças! Pego qualquer coisa: boi, cavalo, Emaçu.', 'Só não pego Gralha-Azul. Ela voa e ainda dá risada.'] }),
    gente(g, '5', 'b7-ctg-idoso', 'npc-idoso', 'Seu Valdomiro', { dir: 'n', fala: ['Nos tempos do meu pai, o Cartel Ferrugem quis comprar as araucárias da serra para fazer tábua.', 'O CTG inteiro se plantou na frente das árvores. Ficamos três dias. Ganhamos no cansaço. E no chimarrão.'] }),
  ],
  itens: [],
};
export default zona;
