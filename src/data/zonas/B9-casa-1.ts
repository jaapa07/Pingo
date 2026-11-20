import { casa } from './_b1-lib';

/** Casa larga ao lado do Posto (porta em (14, 12) na cidade): Dona Açucena, destino da carta do violeiro (`b1-acucena`). */
export default casa({
  id: 'B9-casa-1', nome: 'Casa da Dona Açucena', tema: 'palafita', musica: 'cidade-catira', arena: 'pantanal', passo: 10, volta: [14, 13],
  canto: 'maquina-costura', parede: 'quadro',
  estante: ['Livros de moda de viola com páginas dobradas. Um deles tem uma flor de açucena seca entre as folhas.'],
  bau: ['Cartas antigas amarradas com fita azul. O remetente de todas é o mesmo: "Z., de Vila Cascavel".'],
  cantoTexto: ['Uma máquina de costura de pedal com um lenço bordado pela metade: uma viola e um rio.'],
  moradores: [
    { id: 'b9-acucena', sprite: 'npc-mulher-1', nome: 'Dona Açucena', dir: 's', script: 'b1-acucena' },
    { id: 'b9-gata', sprite: 'c:jaguatirim', nome: 'Jaguatirim', mov: 'vagar', fala: ['(O Jaguatirim da casa se esfrega na sua perna e finge que não foi nada.)'] },
  ],
});
