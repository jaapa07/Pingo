import { venda } from './_b2s-lib';

/** B7-venda · Armazém da Serra (passo 14). */
export default venda('B7', 'Serra da Geada', 14, 'geada', [34, 18],
  { nome: 'Bolicheiro Valdir', fala: 'Buenas! Armazém da Serra: tem cuia, tem remédio e tem erva-mate. A erva é de enfeite, que criatura não toma chimarrão.' },
  [['', ['cuia-trancada', 'cuia-ouro', 'cuia-rapida', 'garrafada', 'elixir-andiroba', 'cha-guarana', 'garapa', 'mel-puro', 'unguento', 'pomada-copaiba', 'fumaca-andiroba-forte', 'corda-de-cipo']]],
  { sprite: 'npc-idoso', nome: 'Seu Lauro', fala: ['Unguento é bom para queimadura. E aqui na serra, para quem encosta no fogão de lenha para se esquentar.', 'Já Pomada de Copaíba descongela criatura congelada. Leve umas, que a Gaúcha Pinhão congela até pensamento.'] },
  'Armazém da Serra');
