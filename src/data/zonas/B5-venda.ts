import { venda } from './_b2s-lib';

/** B5-venda · Venda de Cidade Ginga (passo 12). O estoque cresce com a insígnia 12. */
export default venda('B5', 'Cidade Ginga', 12, 'cerrado', [33, 18],
  { nome: 'Seu Gonçalo', fala: 'Bem-vindo! Aqui o troco vem com um passo de ginga de brinde.' },
  [
    ['insignia:12', ['cuia-trancada', 'cuia-ouro', 'cuia-rede', 'garrafada', 'garrafada-forte', 'elixir-andiroba', 'cha-guarana', 'mel-puro', 'unguento', 'pomada-copaiba', 'fumaca-andiroba-forte', 'corda-de-cipo']],
    ['!insignia:12', ['cuia-trancada', 'cuia-ouro', 'cuia-rede', 'garrafada', 'garrafada-forte', 'cha-guarana', 'mel-puro', 'unguento', 'pomada-copaiba', 'fumaca-andiroba-forte', 'corda-de-cipo']],
  ],
  { sprite: 'npc-idosa', nome: 'Dona Nazinha', fala: ['Cuia de Rede é uma mão na roda para bicho de água.', 'No Túnel Alagado você vai agradecer. Ou não vai, porque estará debaixo d’água. Agradeça agora.'] });
