import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente } from './_a1-grade';

/** Casa da Dona Maré, rendeira e ex-desafiante do ginásio. */
const g = grade('A2-casa-1', [
  '############',
  '##W##N###W##',
  '#EE.Q...CC.#',
  '#..........#',
  '#.1...hmmh.#',
  '#..........#',
  '#P...aa..2.#',
  '#....aa....#',
  '#####DD#####',
], { W: '#', N: '#', E: '.', Q: '.', C: '.', h: '.', m: '.', P: '.', a: ',', D: '+', '1': '.', '2': '.' });
const h = g.todos('h');
const zona: ZonaDef = {
  id: 'A2-casa-1', nome: 'Casa da Dona Maré', mapa: 'A', tipo: 'interior', tileset: 'casa', musica: 'cidade-samba', arena: 'restinga', passo: 1,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'caicara' },
    ...g.todos('W').map(([x, y]) => ({ o: 'janela', x, y })), obj(g, 'N', 'rede-pesca'),
    { o: 'estante', x: g.todos('E')[0][0], y: g.todos('E')[0][1], texto: ['Um livro marcado na página 40: "O vento não se enfrenta de frente: Pedra e Trovão cortam as asas."'] },
    obj(g, 'Q', 'maquina-costura'),
    { o: 'cama-casal', x: g.todos('C')[0][0], y: g.todos('C')[0][1] + 1 },
    { o: 'cadeira', x: h[0][0], y: h[0][1] }, { o: 'mesa', x: h[0][0] + 1, y: h[0][1] }, { o: 'cadeira', x: h[1][0], y: h[1][1] },
    obj(g, 'P', 'pote-barro'),
    { o: 'tapete-a', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
  ],
  warps: saidas(g, 'D', 'A2', 14, 23, 's', 'porta'),
  npcs: [
    gente(g, '1', 'a2-mare', 'cl-rendeira', 'Dona Maré', { fala: ['O ginásio do Mestre Gaivota tem um píer onde o vento empurra a gente.', 'O truque é andar na hora em que a rajada descansa. E segurar a saia.'] }),
    gente(g, '2', 'a2-neta', 'cl-crianca-f', 'Marezinha', { mov: 'vagar', fala: ['A vó diz que criatura feliz luta melhor.', 'A minha Cotiazinha é tão feliz que dorme no meio da batalha.'] }),
  ],
};
export default zona;
