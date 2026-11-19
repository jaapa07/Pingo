/** Palafita da raizeira do brejo: troca conselhos por nada e chá por menos ainda. */
import { casa, npc } from './_b2-lib';

export default casa({
  id: 'B6-casa-3', nome: 'Palafita da Raizeira', saida: { zona: 'B6', x: 31, y: 31 }, passo: 13, tema: 'palafita', musica: 'cidade-catira',
  objetos: [
    { o: 'oratorio', x: 1, y: 2 }, { o: 'estante', x: 3, y: 2, texto: ['Vidros de raiz, casca e flor. Um deles está etiquetado "NÃO É CHÁ". Outro, "TALVEZ SEJA CHÁ".'] }, { o: 'fogao-lenha', x: 6, y: 2 }, { o: 'mesa', x: 2, y: 5 }, { o: 'banquinho', x: 4, y: 5 },
    { o: 'planta', x: 8, y: 2 }, { o: 'planta-b', x: 8, y: 6 }, { o: 'planta-c', x: 1, y: 6 }, { o: 'quadro-ex-voto', x: 5, y: 1 },
  ],
  gente: [npc('raizeira', 'Raizeira Mandrágora', 'npc-idosa', 5, 4, 's', ['Dizem que no fundo do Vale do Veneno mora uma Coralzinha de anéis que brilham. Rara que só.', 'E que as árvores de lá escondem Marimbondão. Sacuda e corra. Nessa ordem.', 'Quando o brejo sarar, as criaturas voltam. Brejo é teimoso igual a gente.'])],
});
