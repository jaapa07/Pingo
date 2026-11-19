import { postoGuardiao } from './_a1-grade';

/** Posto Guardião do Platô da Liga: a última cura grátis antes das cinco lutas. */
export default postoGuardiao('A-LG', 'Platô da Liga', [5, 57], [
  { sprite: 'cl-capoeirista', nome: 'Desafiante Ginga-Mole', fala: ['Perdi para o Pajé Neblina. As criaturas dele botam a gente para dormir e depois assombram o sono.', 'Leve criatura do tipo Assombro ou de Mente forte. E Pomada de Copaíba. Muita.'] },
  { sprite: 'npc-mulher-2', nome: 'Desafiante Alvorada', fala: ['Salve o jogo antes de entrar, descanse a equipe e confira a mochila.', 'Parece conselho de mãe. É que a minha mãe foi Mestra da Liga.'], mov: 'parado' },
]);
