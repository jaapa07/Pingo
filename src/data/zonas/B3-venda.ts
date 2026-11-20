import { venda } from './_b1-lib';

/** Venda de Chapada Rubra (porta em (31, 19) na cidade). */
export default venda('B3', 'Chapada Rubra', 10, 'chapada', [31, 20],
  { nome: 'Dona Hematita', fala: 'Venda do Garimpo! Aqui pepita vale troco e troco vale pepita. Brincadeira: aqui é pataca mesmo.' },
  [['', ['cuia', 'cuia-trancada', 'cuia-ouro', 'cuia-rapida', 'cuia-noturna', 'garrafada', 'elixir-andiroba', 'cha-guarana', 'unguento', 'pomada-copaiba', 'fumaca-andiroba-forte', 'corda-de-cipo', 'garapa-com-limao']]],
  { sprite: 'cl-garimpeiro', nome: 'Garimpeiro Pirita', fala: ['Achei uma pedra dourada linda e paguei a conta com ela. A Dona Hematita riu tanto que me deu desconto.', 'Era pirita. Ouro de tolo. Mas o desconto foi de verdade.'] });
