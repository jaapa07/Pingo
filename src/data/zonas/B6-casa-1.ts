import { casaLivre, obj, peca, gente } from './_b2s-lib';

/** B6-casa-1 · Casa do Zelador Urtigão (Brejo Roxo, passo 13): a Dona Babosa dá um remédio (`b2-babosa`). */
export default casaLivre({
  id: 'B6-casa-1', nome: 'Casa do Zelador Urtigão', cidade: 'B6', tema: 'sertaneja', musica: 'cidade-maracatu', arena: 'brejo', passo: 13, volta: [9, 12],
  linhas: [
    '############',
    '##J####Q####',
    '#K.EE...F..#',
    '#K.........#',
    '#....Y.H...#',
    '#........1.#',
    '#..AA......#',
    '#..AA.....L#',
    '#####DD#####',
  ],
  marcas: { J: '#', Q: '#', K: '.', E: '.', F: '.', Y: '.', H: '.', A: ',', L: '.', '1': '.' },
  objetos: (g) => [
    obj(g, 'J', 'janela'), obj(g, 'Q', 'quadro'), { o: 'cama', x: g.todos('K')[1][0], y: g.todos('K')[1][1] },
    peca(g, 'E', 'estante', { texto: ['"Como Conversar com Cobras", "Cobras: Elas Não Querem Conversar" e um álbum de figurinhas de sapos.'] }),
    obj(g, 'F', 'filtro-barro'), obj(g, 'Y', 'mesa-centro'), obj(g, 'H', 'cadeira'), { o: 'tapete-a', x: g.todos('A')[2][0], y: g.todos('A')[2][1] }, obj(g, 'L', 'planta'),
  ],
  gente: (g) => [gente(g, '1', 'esposa', 'npc-mulher-2', 'Dona Babosa', { dir: 'o', script: 'b2-babosa' })],
});
