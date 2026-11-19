/** Academia do Mestre Cabaça: missão "Chamada da Roda". */
import { casa, npc } from './_b2-lib';

export default casa({
  id: 'B5-casa-3', nome: 'Academia do Mestre Cabaça', saida: { zona: 'B5', x: 38, y: 31 }, passo: 11, tema: 'colonial', w: 14, h: 10, porta: 6,
  chao: (g) => g.t(4, 3, '_,,,,,_', ',:::::,', ',:::::,', ',:::::,', '_,,,,,_'),
  objetos: [
    { o: 'gin-berimbau', x: 1, y: 2, texto: ['Um berimbau de biriba com a cabaça remendada. Tem cheiro de festa antiga.'] }, { o: 'banquinho', x: 2, y: 2 }, { o: 'estante', x: 11, y: 2, texto: ['Troféus de roda, fitas de batizado e um retrato do Mestre mais novo, com cabelo.'] },
    { o: 'pote-barro', x: 12, y: 8 }, { o: 'filtro-barro', x: 1, y: 8 }, { o: 'quadro', x: 7, y: 1 }, { o: 'janela', x: 4, y: 1 }, { o: 'janela', x: 10, y: 1 }, { o: 'rede', x: 11, y: 5 },
  ],
  gente: [
    npc('cabaca', 'Mestre Cabaça', 'npc-idoso', 7, 2, 's', null, { script: 'b2-cabaca' }),
    npc('aluna', 'Aluna Sereia', 'cl-capoeirista', 3, 6, 'l', ['Eu sou a única que não fugiu do treino.', 'Não por virtude: é que eu durmo aqui na rede.']),
  ],
});
