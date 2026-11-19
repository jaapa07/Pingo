import { venda } from './_a1-grade';

/** Venda de Cidade Coral: a Dona Alga também é a boticária da ilha (o Xarope de Algas da missão do Farol sai daqui). */
export default { ...venda('A5', 'Cidade Coral', [29, 10], { nome: 'Dona Alga', fala: 'Venda e botica da Dona Alga! O que o mar não cura, eu engarrafo.' }, [
  ['insignia:4', ['cuia', 'cuia-rede', 'cuia-trancada', 'cuia-noturna', 'cha-cidreira', 'garrafada', 'mel-puro', 'unguento', 'pomada-copaiba', 'cha-guarana', 'garapa', 'fumaca-andiroba', 'fumaca-andiroba-forte', 'corda-de-cipo']],
  ['!insignia:4', ['cuia', 'cuia-rede', 'cuia-trancada', 'cha-cidreira', 'garrafada', 'mel-puro', 'unguento', 'pomada-copaiba', 'cha-guarana', 'fumaca-andiroba', 'corda-de-cipo']],
], { sprite: 'cl-pescador', nome: 'Pescador Zé Tarrafa', fala: ['Cuia de Rede pega bicho de Rio e de Inseto que é uma beleza.', 'Eu gasto tudo em cuia e depois pesco o almoço. Economia circular.'] }), passo: 4 };
