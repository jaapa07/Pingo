import { casaLivre, obj, peca, gente } from './_b2s-lib';

/** B5-casa-1 · Sobrado dos Sapateado (Cidade Ginga, passo 12): a avó capoeirista e o neto. */
export default casaLivre({
  id: 'B5-casa-1', nome: 'Sobrado dos Sapateado', cidade: 'B5', tema: 'colonial', musica: 'cidade-samba', arena: 'cerrado', passo: 12, volta: [6, 13],
  linhas: [
    '############',
    '##J##Q##R###',
    '#FF.P.U..K.#',
    '#..........#',
    '#.1...HHh..#',
    '#.,,,......#',
    '#.,,,....2.#',
    '#.....aa..L#',
    '#####DD#####',
  ],
  marcas: { J: '#', Q: '#', R: '#', F: '.', P: '.', U: '.', K: '.', H: '.', h: '.', a: '.', L: '.', '1': '.', '2': '.' },
  objetos: (g) => [
    obj(g, 'J', 'janela'), obj(g, 'Q', 'quadro'), obj(g, 'R', 'relogio'),
    peca(g, 'F', 'fogao-lenha'), obj(g, 'P', 'pia'), obj(g, 'U', 'radio', { texto: ['♪ …e atenção, ouvintes da Rádio Cipó: carregamento estranho de jaulas visto na estrada do Brejo Roxo… ♪'] }), obj(g, 'K', 'cristaleira'),
    peca(g, 'H', 'mesa'), obj(g, 'h', 'cadeira'), { o: 'tapete-a', x: g.todos('a')[0][0], y: g.todos('a')[0][1] }, obj(g, 'L', 'planta'),
  ],
  gente: (g) => [
    gente(g, '1', 'vo', 'npc-idosa', 'Vó Sapateado', { dir: 'l', fala: ['No meu tempo a roda ia até o sol nascer.', 'Hoje eu durmo às oito. Mas sonho que estou dando rasteira.'] }),
    gente(g, '2', 'neto', 'cl-crianca-m', 'Zezinho', { dir: 'o', fala: ['O Mestre Gingado tem uma Quero-Guarda que voa E chuta!', 'Tipo Vento e tipo Ginga ao mesmo tempo. Golpe de Geada nela!'] }),
  ],
});
