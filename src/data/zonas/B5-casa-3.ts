import { casaLivre, obj, gente } from './_b2s-lib';

/** B5-casa-3 · Academia do Mestre Cabaça (Cidade Ginga, passo 12): missão dos três alunos fujões (`b2-cabaca`). */
export default casaLivre({
  id: 'B5-casa-3', nome: 'Academia do Mestre Cabaça', cidade: 'B5', tema: 'colonial', musica: 'cidade-samba', arena: 'cerrado', passo: 12, volta: [38, 31],
  linhas: [
    '##############',
    '####J##Q##J###',
    '#Bs....1...EE#',
    '#...,,,,,....#',
    '#..,:::::,...#',
    '#..,:::::,.RR#',
    '#2.,:::::,...#',
    '#...,,,,,....#',
    '#F..........P#',
    '######DD######',
  ],
  marcas: { J: '#', Q: '#', B: '.', s: '.', E: '.', R: '.', F: '.', P: '.', '1': '.', '2': '.' },
  objetos: (g) => [
    ...[g.todos('J')[0], g.todos('J')[1]].map(([x, y]) => ({ o: 'janela', x, y })), obj(g, 'Q', 'quadro', { texto: ['Um retrato do Mestre Cabaça moço, de cabelo black e calça boca de sino, no meio de um rabo-de-arraia.'] }),
    obj(g, 'B', 'gin-berimbau', { texto: ['Um berimbau de biriba com a cabaça remendada. Tem cheiro de festa antiga.'] }), obj(g, 's', 'banquinho'),
    obj(g, 'E', 'estante', { texto: ['Troféus de roda, fitas de batizado e um caderno de cantigas com a letra tremida do Mestre.'] }), obj(g, 'R', 'rede'), obj(g, 'F', 'filtro-barro'), obj(g, 'P', 'pote-barro'),
  ],
  gente: (g) => [
    gente(g, '1', 'cabaca', 'npc-idoso', 'Mestre Cabaça', { dir: 's', script: 'b2-cabaca' }),
    gente(g, '2', 'aluna', 'cl-capoeirista', 'Aluna Sereia', { dir: 'l', fala: ['Eu sou a única que não fugiu do treino.', 'Não por virtude: é que eu durmo aqui na rede.'] }),
  ],
});
