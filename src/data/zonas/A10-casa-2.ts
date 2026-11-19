import { casaSimples } from './_a1-grade';

/** Casa do Seu Tucum, que quase foi Campeão em 1968 (segundo ele). */
export default casaSimples({
  id: 'A10-casa-2', nome: 'Casa do Seu Tucum', tema: 'sertaneja', musica: 'cidade-baiao', arena: 'mata', passo: 8, volta: [13, 30], parede: 'quadro-ex-voto',
  estante: ['Recortes de jornal amarelados: "Desafiante de Vila Buriti chega ao Campeão e pede para ir ao banheiro".'],
  bau: ['Uma faixa de desafiante da Liga, dobrada com cuidado. Ainda cheira a naftalina e a nervoso.'],
  moradores: [
    { id: 'a10-esposa', sprite: 'npc-idosa', nome: 'Dona Macaúba', fala: ['O Tucum conta a história da Liga todo santo dia. Cada dia ele chega mais longe.', 'Semana que vem ele ganha. Mês que vem, é capaz de virar o Cacique.'] },
    { id: 'a10-neta', sprite: 'cl-escoteira', nome: 'Escoteira Catolé', mov: 'olhar', fala: ['A Domadora Pampa, a quarta Mestra, usa Comum e Ginga. Assombro passa direto pelos golpes dela!', 'Mas ela sabe disso. Sempre sabe. Leve um plano B.'] },
  ],
});
