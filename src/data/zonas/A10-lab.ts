import type { ZonaDef } from '../../core/tipos';
import { grade, obj, saidas, gente } from './_a1-grade';

/** Laboratório de campo da Drª Buriti: aquários de vereda, herbário e a cuia que veio de Vila Jacarandá. Entrada em (7, 8). */
const g = grade('A10-lab', [
  '################',
  '##W##K####W##Q##',
  '#EE.mm..ee..V.P#',
  '#..............#',
  '#......1.......#',
  '#.....BBB...2..#',
  '#.R..........R.#',
  '#......aa......#',
  '#......aa......#',
  '#######DD#######',
], { W: '#', K: '#', Q: '#', E: '.', m: '.', e: '.', V: '.', P: '.', B: '.', R: '.', a: ',', D: '+', '1': '.', '2': '.' });
const zona: ZonaDef = {
  id: 'A10-lab', nome: 'Laboratório da Drª Buriti', mapa: 'A', tipo: 'interior', tileset: 'predio', musica: 'laboratorio', arena: 'mata', passo: 8,
  mapaChars: g.mapa,
  objetos: [
    { o: 'tema', x: 0, y: 0, tema: 'laboratorio' },
    ...g.todos('W').map(([x, y]) => ({ o: 'janela', x, y })), obj(g, 'K', 'poster-c'), obj(g, 'Q', 'quadro'),
    { o: 'estante-lab', x: g.todos('E')[0][0], y: g.todos('E')[0][1], texto: ['Herbário da vereda: folha de buriti, flor de pequi e uma etiqueta: "não é para chá, Babaçu".'] },
    { o: 'mesa-lab', x: g.todos('m')[0][0], y: g.todos('m')[0][1], texto: ['Um aquário com girinos de Pererequinha. Um deles já tem perna e opinião.'] },
    { o: 'estante-lab', x: g.todos('e')[0][0], y: g.todos('e')[0][1], texto: ['Pastas: "Criaturas do Sertão das Névoas — só conheço de ouvir falar. Preciso de um Campeão que vá lá."'] },
    obj(g, 'V', 'viveiro', { script: 'viveiro' }), obj(g, 'P', 'planta-b'),
    { o: 'balcao', x: g.todos('B')[0][0], y: g.todos('B')[0][1] },
    ...g.todos('R').map(([x, y]) => ({ o: 'planta', x, y })),
    { o: 'tapete-a', x: g.todos('a')[2][0], y: g.todos('a')[2][1] },
  ],
  warps: saidas(g, 'D', 'A10', 32, 24, 's', 'porta'),
  npcs: [
    gente(g, '1', 'dra-buriti', 'dra-buriti', 'Drª Buriti', { script: 'dra-buriti' }),
    gente(g, '2', 'a10-estagiaria', 'cl-biologa', 'Estagiária Mangaba', { mov: 'olhar', fala: ['A doutora troca carta com a Profª Ipê toda semana. Metade é ciência, metade é cobrança de livro emprestado.', 'O terminal ali é ligado ao Viveiro de Cuias. Pode usar, só não mexa no meu Tetris.'] }),
  ],
};
export default zona;
