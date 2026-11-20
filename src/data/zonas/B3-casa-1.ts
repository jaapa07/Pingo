import { casa } from './_b1-lib';

/** Sobrado amarelo (porta em (7, 30) na cidade): Seu Cascalho troca pepitas por pergaminho (`b1-pepitas`). */
export default casa({
  id: 'B3-casa-1', nome: 'Sobrado do Seu Cascalho', tema: 'sertaneja', musica: 'cidade-catira', arena: 'chapada', passo: 10, volta: [7, 31],
  canto: 'fogao-lenha', parede: 'quadro',
  estante: ['Uma coleção de pedras com etiqueta: "quartzo-rosa", "jaspe", "pirita (NÃO É OURO)", "pedra que parece um Mocozim".'],
  bau: ['Uma bateia, uma peneira e um mapa de garimpo com um X desenhado em cima do próprio sobrado. O Seu Cascalho é desconfiado.'],
  moradores: [
    { id: 'b3-cascalho', sprite: 'npc-idoso', nome: 'Seu Cascalho', dir: 's', script: 'b1-pepitas' },
    { id: 'b3-cascalha', sprite: 'npc-idosa', nome: 'Dona Ágata', dir: 'o', fala: ['O velho troca tudo por pepita. Já trocou o relógio, a rede e quase trocou o cachorro.', 'Pepita sai de rocha rachada, com o Quebra-pedra. Na Estrada Vermelha e aqui na chapada tem um monte.'] },
  ],
});
