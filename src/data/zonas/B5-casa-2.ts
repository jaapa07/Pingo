import { casaLivre, obj, peca, gente } from './_b2s-lib';

/** B5-casa-2 · Ateliê da Dona Linha (Cidade Ginga, passo 12): abadás para gente e criatura. */
export default casaLivre({
  id: 'B5-casa-2', nome: 'Ateliê da Dona Linha', cidade: 'B5', tema: 'colonial', musica: 'cidade-samba', arena: 'cerrado', passo: 12, volta: [40, 13],
  linhas: [
    '############',
    '###J###X####',
    '#AY..EE..K.#',
    '#..B.......#',
    '#...1......#',
    '#::.....2..#',
    '#::...ZZZ.P#',
    '#.....ZZZ..#',
    '#####DD#####',
  ],
  marcas: { J: '#', X: '#', A: '.', Y: '.', E: '.', K: '.', B: '.', Z: '.', P: '.', '1': '.', '2': '.' },
  objetos: (g) => [
    obj(g, 'J', 'janela'), obj(g, 'X', 'quadro-ex-voto'), obj(g, 'A', 'armario'), obj(g, 'Y', 'maquina-costura', { texto: ['A máquina de costura ainda está com um abadá enorme preso no pé: oito metros de calça branca.'] }),
    peca(g, 'E', 'estante', { texto: ['Moldes de abadá em todos os tamanhos, de Saguinho a Capivarona.'] }), obj(g, 'K', 'cesto'), obj(g, 'B', 'banquinho'),
    { o: 'tapete-b', x: g.todos('Z')[3][0], y: g.todos('Z')[3][1] }, obj(g, 'P', 'planta-c'),
  ],
  gente: (g) => [
    gente(g, '1', 'linha', 'cl-rendeira', 'Dona Linha', { dir: 's', fala: ['Costuro abadá para gente e para criatura.', 'O mais difícil foi o da Sucurião do Doutor Peçonha, lá do Brejo Roxo. Oito metros de calça.', 'Ele sumiu faz dias e não veio buscar a encomenda. Estranho: aquele homem não perde prazo nem para tomar veneno.'], se: '!flag:laboratorio-ok' }),
    gente(g, '1', 'linha-2', 'cl-rendeira', 'Dona Linha', { dir: 's', fala: ['O Doutor Peçonha veio buscar o abadá da Sucurião! Contou que ficou preso numa jaula do Cartel.', 'Pagou com uma cobra de pelúcia. Eu aceitei. Cobra de pelúcia não morde.'], se: 'flag:laboratorio-ok' }),
    gente(g, '2', 'cliente', 'npc-homem-3', 'Rapaz do Abadá', { dir: 'o', fala: ['Pedi a calça branca e ela veio com um bolso para Cuia. Genial!'] }),
  ],
});
