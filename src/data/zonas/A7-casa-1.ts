import { casaSimples } from './_a1-grade';

/** Sobrado da Vó Candinha, destinatária da carta de Cidade Coral (missão da entrega de carta). */
export default casaSimples({
  id: 'A7-casa-1', nome: 'Sobrado da Vó Candinha', tema: 'colonial', musica: 'cidade-baiao', arena: 'mata', passo: 6, volta: [13, 7], parede: 'quadro-ex-voto',
  estante: ['Álbuns de retrato. Em todos, a mesma senhora ao lado de um Graxaim cada vez mais grisalho.'],
  bau: ['Cobertas de lã dobradas e um saquinho de naftalina com cheiro de 1950.'],
  moradores: [
    { id: 'a7-candinha', sprite: 'npc-idosa', nome: 'Vó Candinha', script: 'a2-m-carta-entrega' },
    { id: 'a7-graxaim', sprite: 'c:graxaim', nome: 'Graxaim', mov: 'vagar', fala: ['O Graxaim boceja e mostra todos os dentes. Depois deita no tapete, que ninguém é de ferro.'] },
  ],
});
