import { casaLivre, obj, peca, gente } from './_b2s-lib';

/** B5-casa-4 · Casa do Pescador Lambari (Cidade Ginga, passo 12): dá a dica do Jaú da Gruta do Fôlego e uma vara. */
export default casaLivre({
  id: 'B5-casa-4', nome: 'Casa do Pescador Lambari', cidade: 'B5', tema: 'sertaneja', musica: 'cidade-samba', arena: 'cerrado', passo: 12, volta: [19, 13],
  linhas: [
    '############',
    '#####R#J####',
    '#NN.FF...K.#',
    '#..........#',
    '#....HHB...#',
    '#.......1..#',
    '#.;;;......#',
    '#P.........#',
    '#####DD#####',
  ],
  marcas: { R: '#', J: '#', N: '.', F: '.', K: '.', H: '.', B: '.', P: '.', '1': '.' },
  objetos: (g) => [
    obj(g, 'R', 'rede-pesca'), obj(g, 'J', 'janela'), { o: 'rede', x: g.todos('N')[0][0], y: g.todos('N')[0][1] }, { o: 'fogao-lenha', x: g.todos('F')[0][0], y: g.todos('F')[0][1] },
    obj(g, 'K', 'bau', { texto: ['Anzóis, chumbadas e um bilhete: "Jaú-Gigante: só na gruta do Túnel, e só com vara de respeito."'] }), peca(g, 'H', 'mesa'), obj(g, 'B', 'banquinho'), obj(g, 'P', 'pote-barro'),
  ],
  gente: (g) => [gente(g, '1', 'lambari', 'cl-pescador', 'Pescador Lambari', { dir: 'l', script: 'b2-lambari' })],
});
