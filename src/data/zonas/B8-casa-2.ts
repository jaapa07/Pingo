import { casa } from './_b2n-lib';

/** Casa larga de alpendre (porta em (38, 17) na cidade): o casal de luthiers do choro. */
export default casa({
  id: 'B8-casa-2', nome: 'Casa do Choro', tema: 'serrana', musica: 'cidade-choro', arena: 'planalto', passo: 15, volta: [38, 18],
  canto: 'oratorio', parede: 'quadro',
  estante: ['Cavaquinhos sem corda, uma flauta de bambu e partituras com títulos como "Choro para um Papagálio que não para de imitar".'],
  bau: ['Cordas de violão novas, ainda no papel, e um pandeiro com o couro remendado com fita.'],
  cantoTexto: ['Um oratório pequeno com uma vela acesa e um bilhete: "Para a névoa abrir no caminho de quem sobe a serra".'],
  moradores: [
    { id: 'b8-luthier', sprite: 'npc-homem-2', nome: 'Mestre Cavaquinho', dir: 's', fala: ['Faço instrumento com madeira caída da Floresta Ancestral. Só a caída: a viva tem dono, e o dono é grande e peludo.', 'O Papagálio do vizinho aprendeu o meu choro inteiro. Agora ele toca melhor que eu.'] },
    { id: 'b8-flautista', sprite: 'npc-mulher-4', nome: 'Dona Pixinguinha', dir: 'l', fala: ['A praça do coreto toca choro toda noite. Quando o observatório abre, a gente toca baixinho para não espantar as estrelas.', 'Dizem que no alto do Pico Pindorama o vento toca flauta sozinho. Quem chega lá conta.'] },
  ],
});
