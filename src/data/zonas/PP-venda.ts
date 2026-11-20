import { venda } from './_b2n-lib';

/** Venda do Pico Pindorama, no Acampamento da Fronteira (porta em (27, 47) no Pico). */
export default { ...venda('PP', 'Pico Pindorama', 17, 'pico', [27, 48],
  { nome: 'Dona Brasa-Fria', fala: 'Última venda antes do Conselho! Preço de altitude, mas é o que tem: remédio bom, cuia boa e pinhão de brinde.' },
  [['', ['cuia', 'cuia-trancada', 'cuia-ouro', 'cuia-rapida', 'cuia-noturna', 'cuia-rede', 'cuia-mel', 'garrafada', 'elixir-andiroba', 'cha-guarana', 'mel-puro', 'unguento', 'pomada-copaiba', 'garapa', 'fumaca-andiroba-forte', 'corda-de-cipo', 'rapadura']]],
  { sprite: 'npc-homem-1', nome: 'Seu Agasalho', fala: ['Subi para vender casaco e esqueci o meu. Estou de camiseta desde terça.', 'Os Guardiões não usam casaco. Dizem que a luta esquenta.'] }), mapa: 'PP' as const };
