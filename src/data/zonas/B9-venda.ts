import { venda } from './_b1-lib';

/** Venda de Porto Pantaneiro (porta em (27, 12) na cidade). */
export default venda('B9', 'Porto Pantaneiro', 10, 'pantanal', [27, 13],
  { nome: 'Seu Pacu', fala: 'Venda do Porto! Mercadoria que sobe de Saveiro: cuia de ouro, elixir, garrafada. E isca, que é o que mais sai.' },
  [['', ['cuia', 'cuia-trancada', 'cuia-ouro', 'cuia-rede', 'cuia-rapida', 'cuia-noturna', 'garrafada', 'elixir-andiroba', 'cha-guarana', 'mel-puro', 'unguento', 'pomada-copaiba', 'fumaca-andiroba-forte', 'corda-de-cipo']]],
  { sprite: 'cl-surfista', nome: 'Remadora Jaci', fala: ['Comprei Corda de Cipó para sair rápido da mina da Chapada, se precisar. Dizem que lá dentro é um labirinto.', 'E Fumaça de Andiroba Forte, para os bichos pequenos não atrasarem a minha vida.'] });
