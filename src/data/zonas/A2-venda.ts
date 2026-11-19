import { venda } from './_a1-grade';

/** Venda de Vila Caiçara: o estoque cresce quando o jogador ganha a Insígnia da Pena. */
export default venda('A2', 'Vila Caiçara', [25, 15], { nome: 'Dona Cotinha', fala: 'Chegou freguesia! Olha a cuia fresquinha, olha o chá que levanta até Preguicim!' }, [
  ['!insignia:1', ['cuia', 'cha-cidreira', 'mel-puro']],
  ['insignia:1', ['cuia', 'cha-cidreira', 'mel-puro', 'unguento', 'fumaca-andiroba', 'corda-de-cipo']],
], { sprite: 'cl-pescador', nome: 'Pescador Dito', fala: ['Mel Puro tira o veneno da criatura na hora.', 'Tira também a fome do treinador, mas aí a Dona Cotinha cobra em dobro.'] });
