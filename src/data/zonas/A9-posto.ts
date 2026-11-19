import { postoGuardiao } from './_a1-grade';

/** Posto Guardião da Aldeia Tupã. */
export default { ...postoGuardiao('A9', 'Aldeia Tupã', [6, 20], [
  { sprite: 'cl-montanhista', nome: 'Montanhista Sem-Fôlego', fala: ['Paredão, gruta e cascata. Cheguei aqui com as pernas de outra pessoa.', 'Dizem que do Pico Pindorama dá para ver os dois mapas de uma vez. Eu vou acreditar sem conferir.'] },
  { sprite: 'npc-idosa', nome: 'Vó Jaciara', fala: ['O Pajé Trovão-Velho usa criaturas de Lenda. Geada, Encanto e outra Lenda são o que elas respeitam.', 'E leve remédio. Aqui em cima a Venda fecha quando o vendedor resolve tirar soneca.'], mov: 'parado' },
]), passo: 16 };
