import { casaLivre, obj, peca, gente } from './_b2s-lib';

/** B6-casa-3 · Palafita da Raizeira Mandrágora (Brejo Roxo, passo 13): dicas do Vale do Veneno. */
export default casaLivre({
  id: 'B6-casa-3', nome: 'Palafita da Raizeira', cidade: 'B6', tema: 'palafita', musica: 'cidade-maracatu', arena: 'brejo', passo: 13, volta: [31, 31],
  linhas: [
    '############',
    '#####X######',
    '#OEE..FF..L#',
    '#..........#',
    '#.HH.B.....#',
    '#.....1....#',
    '#..........#',
    '#Y.......Z.#',
    '#####DD#####',
  ],
  marcas: { X: '#', O: '.', E: '.', F: '.', L: '.', H: '.', B: '.', Y: '.', Z: '.', '1': '.' },
  objetos: (g) => [
    obj(g, 'X', 'quadro-ex-voto'), obj(g, 'O', 'oratorio'), peca(g, 'E', 'estante', { texto: ['Vidros de raiz, casca e flor. Um deles está etiquetado "NÃO É CHÁ". Outro, "TALVEZ SEJA CHÁ".'] }),
    peca(g, 'F', 'fogao-lenha'), obj(g, 'L', 'planta'), peca(g, 'H', 'mesa'), obj(g, 'B', 'banquinho'), obj(g, 'Y', 'planta-c'), obj(g, 'Z', 'planta-b'),
  ],
  gente: (g) => [gente(g, '1', 'raizeira', 'npc-idosa', 'Raizeira Mandrágora', { dir: 's', fala: ['Dizem que no fundo do Vale do Veneno mora uma Coralzinha de anéis que brilham. Rara que só.', 'E que as árvores de lá escondem Marimbondão. Sacuda e corra. Nessa ordem.', 'Quando o brejo sarar, as criaturas voltam. Brejo é teimoso igual a gente.'] })],
});
