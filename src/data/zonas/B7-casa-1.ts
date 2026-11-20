import { casaLivre, obj, peca, gente } from './_b2s-lib';

/** B7-casa-1 · Casa da Vó Querência (Serra da Geada, passo 14): lareira, pinhão na chapa e histórias da serra. */
export default casaLivre({
  id: 'B7-casa-1', nome: 'Casa da Vó Querência', cidade: 'B7', tema: 'serrana', musica: 'cidade-gaucha', arena: 'geada', passo: 14, volta: [6, 13],
  linhas: [
    '############',
    '##J###Q##J##',
    '#LL..EE..K.#',
    '#..........#',
    '#.SS..HHh..#',
    '#.1........#',
    '#.....AA.2.#',
    '#Y....AA..Z#',
    '#####DD#####',
  ],
  marcas: { J: '#', Q: '#', L: '.', E: '.', K: '.', S: '.', H: '.', h: '.', A: ',', Y: '.', Z: '.', '1': '.', '2': '.' },
  objetos: (g) => [
    ...g.todos('J').map(([x, y]) => ({ o: 'janela', x, y })), obj(g, 'Q', 'quadro', { texto: ['Uma foto antiga: a Vó Querência moça, de bombacha, montada numa Seriemão com uma cuia de chimarrão na mão.'] }),
    peca(g, 'L', 'lareira', { texto: ['A lareira estala. Em cima da chapa, uma fileira de pinhões assando, cada um com a casca rachada no ponto.'] }), peca(g, 'E', 'estante'), obj(g, 'K', 'relogio'),
    peca(g, 'S', 'sofa'), peca(g, 'H', 'mesa'), obj(g, 'h', 'cadeira'), { o: 'tapete-c', x: g.todos('A')[2][0], y: g.todos('A')[2][1] }, obj(g, 'Y', 'planta'), obj(g, 'Z', 'cesto'),
  ],
  gente: (g) => [
    gente(g, '1', 'vo-querencia', 'npc-idosa', 'Vó Querência', { dir: 'l', fala: ['Senta, meu filho, que o pinhão está quase pronto.', 'A Gralha-Azul enterra pinhão e esquece onde. É assim que nasce araucária nova: de esquecimento.', 'Quem dera eu esquecesse as contas da luz e nascesse dinheiro.'] }),
    gente(g, '2', 'neto-b7', 'cl-crianca-m', 'Piá Tonico', { dir: 'n', fala: ['A Gaúcha Pinhão me deixou ver o ginásio por dentro! O chão é todo de gelo.', 'Se você escorregar para o lado errado, volta para o começo. Eu voltei onze vezes.'] }),
  ],
});
