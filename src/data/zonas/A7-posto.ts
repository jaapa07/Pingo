import { postoGuardiao } from './_a1-grade';

/** Posto Guardião de Serra Fumaça. */
export default { ...postoGuardiao('A7', 'Serra Fumaça', [5, 13], [
  { sprite: 'cl-montanhista', nome: 'Montanhista Brumado', fala: ['Atravessei a Gruta Breu de lampião aceso e mesmo assim bati a testa três vezes.', 'A Lamparina da Dona Benta vem com o Quebra-pedra. Sem ele, a Encosta da Fumaça é um muro.'] },
  { sprite: 'npc-idosa', nome: 'Dona Garoa', fala: ['Criatura de Assombro some na neblina e aparece atrás de você. Igualzinho meu finado marido na hora da louça.', 'Leve Encanto ou outro Assombro. Golpe Comum passa direto, feito vento em peneira.'], mov: 'parado' },
]), passo: 6 };
