import { venda } from './_a1-grade';

/** Armazém do Parafuso: última parada antes da Estrada do Buriti. */
export default { ...venda('A8', 'Vila Ferrugem', [41, 13], { nome: 'Seu Parafuso', fala: 'Armazém do Parafuso! Se não tem na prateleira, eu fabrico. Se não sei fabricar, eu invento que tem.' }, [
  ['insignia:7', ['cuia', 'cuia-trancada', 'cuia-ouro', 'cuia-rede', 'cuia-noturna', 'cuia-rapida', 'elixir-andiroba', 'mel-puro', 'unguento', 'pomada-copaiba', 'cha-guarana', 'garapa', 'garapa-com-limao', 'fumaca-andiroba-forte', 'corda-de-cipo']],
  ['!insignia:7', ['cuia', 'cuia-trancada', 'cuia-rede', 'cuia-noturna', 'cuia-rapida', 'garrafada', 'elixir-andiroba', 'mel-puro', 'unguento', 'pomada-copaiba', 'cha-guarana', 'garapa', 'fumaca-andiroba-forte', 'corda-de-cipo']],
], { sprite: 'cl-garimpeiro', nome: 'Garimpeiro Cascalho', fala: ['Engrenagem Velha faz o Besourim… não, minto. Faz é o sucateiro da vila feliz. Ele troca por coisa boa.', 'Besourim evolui sozinho, no nível 34. Com um chifre de dar inveja em guindaste.'] }), passo: 7 };
