import { casaLivre, obj, peca, gente } from './_b2s-lib';

/** B6-casa-2 · Palafita do Canoeiro (Brejo Roxo, passo 13). */
export default casaLivre({
  id: 'B6-casa-2', nome: 'Palafita do Canoeiro', cidade: 'B6', tema: 'palafita', musica: 'cidade-maracatu', arena: 'brejo', passo: 13, volta: [15, 29],
  linhas: [
    '############',
    '###J#R######',
    '#NN...FF.P.#',
    '#..........#',
    '#NN.B......#',
    '#.....1....#',
    '#.......2,,#',
    '#........,K#',
    '#####DD#####',
  ],
  marcas: { J: '#', R: '#', N: '.', F: '.', P: '.', B: '.', K: '.', '1': '.', '2': '.' },
  objetos: (g) => [
    obj(g, 'J', 'janela'), obj(g, 'R', 'rede-pesca'), { o: 'rede', x: g.todos('N')[0][0], y: g.todos('N')[0][1] }, { o: 'rede', x: g.todos('N')[2][0], y: g.todos('N')[2][1] },
    peca(g, 'F', 'fogao-lenha'), obj(g, 'P', 'pote-barro'), obj(g, 'B', 'banquinho'), obj(g, 'K', 'cesto'),
  ],
  gente: (g) => [
    gente(g, '1', 'canoeiro', 'npc-marinheiro', 'Canoeiro Piau', { dir: 'o', fala: ['No Vale do Veneno a água é grossa de tão roxa, mas a canoa passa.', 'Tem Sucurião lá que pesca a gente em vez de a gente pescar ela. Reme ligeiro.'] }),
    gente(g, '2', 'filha', 'cl-crianca-f', 'Piabinha (a menina)', { dir: 'n', fala: ['Meu nome é Piabinha igual ao peixe. Meu irmão se chama Mandi. Meu pai gosta muito de pescar.'] }),
  ],
});
