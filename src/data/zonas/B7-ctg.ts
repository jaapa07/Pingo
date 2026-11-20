/**
 * B7-ctg · Galpão do CTG da Serra da Geada (passo 14): o Payador e as adivinhas do dia (`b2-payada`, três por dia),
 * o gaiteiro, as prendas e o peão laçador.
 */
import type { ZonaDef } from '../../core/tipos';
import { grade, obj, peca, objs, saidas, gente } from './_b2s-lib';

const g = grade('B7-ctg', [
  '################',
  '##J###Q##J####R#',
  '#LL...KK...U.EE#',
  '#..........1...#',
  '#.,,,,,,,,,,,..#',
  '#.,::::::::::,.#',
  '#.,:..3..4..:,.#',
  '#.,::::::::::,.#',
  '#.,,,,,,,,,,,..#',
  '#B.5.........2Z#',
  '#######DD#######',
], { J: '#', Q: '#', R: '#', L: '.', K: '.', U: '.', E: '.', B: '.', Z: '.', D: '+', '1': '.', '2': '.', '3': ':', '4': ':', '5': '.' });
const zona: ZonaDef = {
  id: 'B7-ctg', nome: 'Galpão do CTG', mapa: 'B', tipo: 'interior', tileset: 'casa', musica: 'cidade-gaucha', arena: 'geada', passo: 14,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'serrana' },
    ...objs(g, 'J', 'janela'), obj(g, 'Q', 'quadro', { texto: ['Quadro de honra do CTG: "Campeões do Laço, da Chula e da Payada de Adivinha".'] }), obj(g, 'R', 'relogio'),
    peca(g, 'L', 'lareira'), peca(g, 'K', 'mesa'), obj(g, 'U', 'radio', { texto: ['Um rádio antigo tocando milonga baixinho. Ninguém sabe a estação: ele só pega milonga.'] }), peca(g, 'E', 'estante', { texto: ['Troféus de laço, um par de esporas e uma pilha de discos de milonga.'] }),
    obj(g, 'B', 'barril'), obj(g, 'Z', 'cesto'),
  ],
  warps: saidas(g, 'D', 'B7', 11, 31, 's', 'porta'),
  npcs: [
    gente(g, '1', 'payador', 'cl-repentista', 'Payador Juvenal', { dir: 's', script: 'b2-payada' }),
    gente(g, '2', 'gaiteiro-ctg', 'cl-repentista', 'Gaiteiro Tibúrcio', { dir: 'o', fala: ['♪ Chimarrão, chimarrão, amargo de coração… ♪', 'O Juvenal faz adivinha em verso. Quem erra aprende, quem acerta ganha prenda.'] }),
    gente(g, '3', 'prenda-1', 'npc-mulher-1', 'Prenda Lurdinha', { dir: 'l', mov: 'olhar', fala: ['Ensaio de chula! O peão sapateia em volta da lança sem encostar nela.', 'O meu par encostou três vezes. Agora ensaia sozinho.'] }),
    gente(g, '4', 'peao-1', 'cl-vaqueiro', 'Peão Laçador', { dir: 'o', fala: ['Laço de doze braças! Pego qualquer coisa: boi, cavalo, Emaçu.', 'Só não pego Gralha-Azul. Ela voa e ainda dá risada.'] }),
    gente(g, '5', 'b7-ctg-idoso', 'npc-idoso', 'Seu Valdomiro', { dir: 'n', fala: ['Nos tempos do meu pai, o Cartel Ferrugem quis comprar as araucárias da serra para fazer tábua.', 'O CTG inteiro se plantou na frente das árvores. Ficamos três dias. Ganhamos no cansaço. E no chimarrão.'] }),
  ],
};
export default zona;
