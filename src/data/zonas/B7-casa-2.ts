import { casaLivre, obj, peca, gente } from './_b2s-lib';

/** B7-casa-2 · Casa do Seu Tchê Barbosa (Serra da Geada, passo 14): a esposa e o viveiro das gralhas. */
export default casaLivre({
  id: 'B7-casa-2', nome: 'Casa do Seu Tchê Barbosa', cidade: 'B7', tema: 'serrana', musica: 'cidade-gaucha', arena: 'geada', passo: 14, volta: [42, 13],
  linhas: [
    '############',
    '###J####Q###',
    '#FF.K...LL.#',
    '#..........#',
    '#..HHh..1..#',
    '#..........#',
    '#B.....,,,.#',
    '#P.....,,,Z#',
    '#####DD#####',
  ],
  marcas: { J: '#', Q: '#', F: '.', K: '.', L: '.', H: '.', h: '.', B: '.', P: '.', Z: '.', '1': '.' },
  objetos: (g) => [
    obj(g, 'J', 'janela'), obj(g, 'Q', 'quadro-ex-voto'), peca(g, 'F', 'fogao-lenha'), obj(g, 'K', 'geladeira'), peca(g, 'L', 'cama-casal'),
    peca(g, 'H', 'mesa'), obj(g, 'h', 'cadeira'), obj(g, 'B', 'bau', { texto: ['Ponchos dobrados, uma bombacha remendada e um saquinho de sementes de araucária com o rótulo "para as gralhas".'] }), obj(g, 'P', 'planta-b'), obj(g, 'Z', 'pote-barro'),
  ],
  gente: (g) => [gente(g, '1', 'dona-barbosa', 'npc-mulher-4', 'Dona Clarinda', { dir: 's', fala: ['O meu marido cria gralha no quintal. Cria, solta, e elas voltam para comer o pinhão dele.', 'Ele quer trocar uma das gralhas por um Tuco-Escavador, para cavar a horta. Tuco cava. Gralha só planta pinheiro onde não deve.'] })],
});
