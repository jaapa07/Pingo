/** Casinha do pescador da lagoa: dá a dica do Túnel Alagado e guarda uma vara de pesca. */
import { casa, npc } from './_b2-lib';

export default casa({
  id: 'B5-casa-4', nome: 'Casa do Pescador Lambari', saida: { zona: 'B5', x: 19, y: 13 }, passo: 11, tema: 'sertaneja',
  objetos: [
    { o: 'rede', x: 1, y: 2 }, { o: 'rede-pesca', x: 5, y: 1 }, { o: 'bau', x: 8, y: 2, texto: ['Anzóis, chumbadas e um bilhete: "Jaú-Gigante: só na gruta do Túnel, e só com vara de respeito."'] },
    { o: 'mesa', x: 5, y: 4 }, { o: 'banquinho', x: 7, y: 4 }, { o: 'fogao-lenha', x: 3, y: 2 }, { o: 'pote-barro', x: 1, y: 6 }, { o: 'janela', x: 7, y: 1 },
  ],
  gente: [npc('lambari', 'Pescador Lambari', 'cl-pescador', 4, 5, 'l', null, { script: 'b2-lambari' })],
});
