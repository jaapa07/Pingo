/** Venda de Cidade Ginga. */
import { venda, npc, ESTOQUE_BASE } from './_b2-lib';

export default venda({
  id: 'B5-venda', nome: 'Venda de Cidade Ginga', saida: { zona: 'B5', x: 33, y: 18 }, passo: 11,
  loja: [...ESTOQUE_BASE, 'cuia-rede'],
  fala: 'Bem-vindo! Aqui o troco vem com um passo de ginga de brinde.',
  gente: [npc('freguesa', 'Dona Nazinha', 'npc-idosa', 8, 5, 'o', ['Cuia de Rede é uma mão na roda para bicho de água.', 'No Túnel Alagado você vai agradecer. Ou não vai, porque estará debaixo d’água. Agradeça agora.'])],
  mimo: [{ o: 'barril', x: 10, y: 6 }, { o: 'saco-graos', x: 10, y: 4 }, { o: 'caixote', x: 1, y: 7 }, { o: 'balanca', x: 4, y: 4 }, { o: 'rede-pesca', x: 7, y: 1 }],
});
