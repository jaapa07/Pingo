import { venda } from './_b1-lib';

/** Venda de Pantanal Grande (porta em (29, 13) na cidade). */
export default venda('B2', 'Pantanal Grande', 9, 'pantanal', [29, 14],
  { nome: 'Dona Piúva', fala: 'Venda da Piúva: o que não tem aqui, a canoa traz na quinta. O que a canoa não traz, ninguém precisa.' },
  [['', ['cuia', 'cuia-trancada', 'cuia-ouro', 'cuia-rede', 'cuia-rapida', 'garrafada', 'elixir-andiroba', 'cha-guarana', 'unguento', 'pomada-copaiba', 'fumaca-andiroba-forte', 'garapa-com-limao']]],
  { sprite: 'cl-vaqueiro', nome: 'Peão Dito', fala: ['Comprei vinte Cuias de Rede. Peguei um Piranhão e ele mordeu dezenove.', 'Pomada de Copaíba é boa para mordida. Comprei vinte também.'] });
