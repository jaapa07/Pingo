import { venda } from './_b2s-lib';

/** B6-venda · Botica do Brejo Roxo (passo 13): remédios de status em destaque. */
export default venda('B6', 'Brejo Roxo', 13, 'brejo', [39, 18],
  { nome: 'Boticário Jurubeba', fala: 'Botica do Brejo! Antídoto para tudo, menos para o preço.' },
  [['', ['cuia-trancada', 'cuia-ouro', 'cuia-noturna', 'garrafada', 'elixir-andiroba', 'cha-guarana', 'garapa', 'mel-puro', 'unguento', 'pomada-copaiba', 'fumaca-andiroba-forte', 'corda-de-cipo']]],
  { sprite: 'cl-crianca-f', nome: 'Aprendiz de Boticário', fala: ['Estou decorando: Mel Puro para veneno, Unguento para queimadura, Pomada de Copaíba para tudo.', 'E Chá de Guaraná para quem desmaiou. Serve para criatura e para segunda-feira.'] },
  'Botica do Brejo Roxo');
