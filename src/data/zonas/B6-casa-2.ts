/** Palafita do canoeiro. */
import { casa, npc } from './_b2-lib';

export default casa({
  id: 'B6-casa-2', nome: 'Palafita do Canoeiro', saida: { zona: 'B6', x: 15, y: 29 }, passo: 13, tema: 'palafita', musica: 'cidade-catira',
  chao: (g) => g.r(6, 5, 3, 2, ','),
  objetos: [
    { o: 'rede', x: 1, y: 2 }, { o: 'rede', x: 1, y: 4 }, { o: 'rede-pesca', x: 5, y: 1 }, { o: 'fogao-lenha', x: 6, y: 2 }, { o: 'pote-barro', x: 8, y: 2 }, { o: 'cesto', x: 8, y: 6 }, { o: 'banquinho', x: 4, y: 4 }, { o: 'janela', x: 3, y: 1 },
  ],
  gente: [
    npc('canoeiro', 'Canoeiro Piau', 'npc-marinheiro', 5, 4, 'o', ['No Vale do Veneno a água é grossa de tão roxa, mas a canoa passa.', 'Tem Sucurião lá que pesca a gente em vez de a gente pescar ela. Reme ligeiro.']),
    npc('filha', 'Piabinha (a menina)', 'cl-crianca-f', 7, 6, 'n', ['Meu nome é Piabinha igual ao peixe. Meu irmão se chama Mandi. Meu pai gosta muito de pescar.']),
  ],
});
