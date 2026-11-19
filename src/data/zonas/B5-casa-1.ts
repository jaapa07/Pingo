/** Sobrado da família Sapateado: três gerações de capoeiristas e um rádio sempre ligado. */
import { casa, npc } from './_b2-lib';

export default casa({
  id: 'B5-casa-1', nome: 'Sobrado dos Sapateado', saida: { zona: 'B5', x: 6, y: 13 }, passo: 11, tema: 'colonial',
  chao: (g) => g.r(3, 4, 3, 2, ','),
  objetos: [
    { o: 'fogao-lenha', x: 1, y: 2 }, { o: 'pia', x: 3, y: 2 }, { o: 'cristaleira', x: 8, y: 2 }, { o: 'mesa', x: 6, y: 4 }, { o: 'cadeira', x: 5, y: 4 },
    { o: 'radio', x: 6, y: 2, texto: ['♪ …e atenção, ouvintes da Rádio Cipó: carregamento estranho de jaulas visto na estrada do Brejo Roxo… ♪'] },
    { o: 'quadro', x: 5, y: 1 }, { o: 'janela', x: 2, y: 1 }, { o: 'planta', x: 1, y: 6 },
  ],
  gente: [
    npc('vo', 'Vó Sapateado', 'npc-idosa', 2, 4, 'l', ['No meu tempo a roda ia até o sol nascer.', 'Hoje eu durmo às oito. Mas sonho que estou dando rasteira.']),
    npc('neto', 'Zezinho', 'cl-crianca-m', 7, 5, 'o', ['O Mestre Gingado tem uma Quero-Guarda que voa E chuta!', 'Tipo Vento e tipo Ginga ao mesmo tempo. Golpe de Geada nela!']),
  ],
});
