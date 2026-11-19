/** Ateliê da costureira de abadás. */
import { casa, npc } from './_b2-lib';

export default casa({
  id: 'B5-casa-2', nome: 'Ateliê da Dona Linha', saida: { zona: 'B5', x: 40, y: 13 }, passo: 11, tema: 'colonial',
  chao: (g) => g.r(1, 5, 3, 2, ':'),
  objetos: [
    { o: 'maquina-costura', x: 2, y: 2 }, { o: 'armario', x: 1, y: 2 }, { o: 'estante', x: 6, y: 2, texto: ['Moldes de abadá em todos os tamanhos, de Saguinho a Capivarona.'] },
    { o: 'cesto', x: 8, y: 3 }, { o: 'banquinho', x: 3, y: 3 }, { o: 'tapete-b', x: 5, y: 6 }, { o: 'janela', x: 4, y: 1 }, { o: 'quadro-ex-voto', x: 8, y: 1 }, { o: 'planta-c', x: 8, y: 6 },
  ],
  gente: [
    npc('linha', 'Dona Linha', 'cl-rendeira', 4, 3, 's', ['Costuro abadá para gente e para criatura.', 'O mais difícil foi o da Sucurião do Doutor Peçonha, lá do Brejo Roxo. Oito metros de calça.', 'Aliás, ele sumiu faz dias e não veio buscar a encomenda. Estranho: aquele homem não perde prazo nem para tomar veneno.']),
    npc('cliente', 'Rapaz do Abadá', 'npc-homem-3', 6, 5, 'o', ['Pedi a calça branca e ela veio com um bolso para Cuia. Genial!']),
  ],
});
