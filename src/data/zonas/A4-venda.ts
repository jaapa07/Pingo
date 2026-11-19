import { venda } from './_a1-grade';

/** Venda do Porto: o estoque cresce com a Insígnia da Concha e de novo quando o trem volta a rodar. */
export default venda('A4', 'Porto Sereia', [34, 13], { nome: 'Dona Âncora', fala: 'Venda do Porto, às ordens! Chegou de navio, de trem ou de teimosia, a gente tem.' }, [
  ['flag:usina-ok', ['cuia', 'cuia-rede', 'cuia-trancada', 'cha-cidreira', 'garrafada', 'mel-puro', 'unguento', 'pomada-copaiba', 'cha-guarana', 'fumaca-andiroba', 'fumaca-andiroba-forte', 'corda-de-cipo']],
  ['insignia:3&!flag:usina-ok', ['cuia', 'cuia-rede', 'cuia-trancada', 'cha-cidreira', 'garrafada', 'mel-puro', 'unguento', 'pomada-copaiba', 'fumaca-andiroba', 'corda-de-cipo']],
  ['!insignia:3&!flag:usina-ok', ['cuia', 'cuia-rede', 'cha-cidreira', 'garrafada', 'mel-puro', 'unguento', 'fumaca-andiroba', 'corda-de-cipo']],
], { sprite: 'npc-mulher-3', nome: 'Viajante Dália', fala: ['Cuia Trançada segura criatura mais arisca que a cuia comum.', 'Eu compro de dúzia. Nunca se sabe quando vai aparecer bicho raro.'] });
