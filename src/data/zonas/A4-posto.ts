import { postoGuardiao } from './_a1-grade';

/** Posto Guardião de Porto Sereia. */
export default postoGuardiao('A4', 'Porto Sereia', [22, 13], [
  { sprite: 'npc-marinheiro', nome: 'Marinheiro Caolho', fala: ['Atravessei a Gruta do Eco só com um Pipirim e muita reza.', 'Na volta eu vou de trem. Quando tiver trem. Quando tiver luz.'] },
  { sprite: 'cl-pescador', nome: 'Pescador Nilo', fala: ['A Vara Boa pesca coisa que a Vara Velha nem sonha.', 'O Feirante Deodato, na porta do mercado, dá uma para quem mostrar peixe de bigode.'], mov: 'parado' },
]);
