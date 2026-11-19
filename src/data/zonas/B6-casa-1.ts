/** Casa do zelador do ginásio: terrários por todo lado. */
import { casa, npc } from './_b2-lib';

export default casa({
  id: 'B6-casa-1', nome: 'Casa do Zelador Urtigão', saida: { zona: 'B6', x: 9, y: 12 }, passo: 13, tema: 'sertaneja', musica: 'cidade-catira',
  objetos: [
    { o: 'cama', x: 1, y: 3 }, { o: 'armario', x: 2, y: 2 }, { o: 'estante', x: 5, y: 2, texto: ['"Como Conversar com Cobras", "Cobras: Elas Não Querem Conversar" e um álbum de figurinhas de sapos.'] },
    { o: 'mesa-centro', x: 5, y: 4 }, { o: 'cadeira', x: 6, y: 4 }, { o: 'filtro-barro', x: 8, y: 2 }, { o: 'tapete-a', x: 3, y: 6 }, { o: 'janela', x: 4, y: 1 }, { o: 'quadro', x: 7, y: 1 },
  ],
  gente: [npc('esposa', 'Dona Babosa', 'npc-mulher-2', 7, 5, 'o', ['Meu marido fica plantado na porta do ginásio esperando o Doutor.', 'Ele trata as cobras do ginásio melhor do que trata o meu feijão.', 'Leve isto, você vai precisar mais do que eu.'], { script: 'b2-babosa' })],
});
