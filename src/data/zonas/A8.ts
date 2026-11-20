import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A8 Vila Ferrugem (passo 7): antiga cidade operária, Ginásio do Ferro (Engenheira Bigorna). Chega-se pela Encosta
 * da Fumaça (oeste). A saída leste, para a Estrada do Buriti, está entupida por um pedregulho (Força, insígnia
 * Engrenagem). Ao norte, a trilha do Monte Tupã; no açude do noroeste nasce o Rio Cachoeira-Véu (só para quem
 * já sobe cascata). Para depois: o balcão da trepadeira (Escalar), a loca rachada (Quebra-pedra) e a ilhota (Remo).
 */
const g = grade('A8', 60, [
  '########~~|##########|##########|######N###|##########|##########',
  '######~~~~|~~########|####......|......:###|##########|##########',
  '#####~~~~~|~~~#######|##...T....|...t..:.##|#####....#|##########',
  '####.~~~~~|~~~.....##|#.........|......:..#|####..i...|.#########',
  '###..~~~~~|~~..,.....|..........|......:...|######e###|##########',
  '##....~~~~|~.........|....""""..|......:...|..........|..########',
  '##........|..........|...""""""_|.""""_:...|..........|...#######',
  '#.........|..........|...""""""_|.""""_:...|..........|....######',
  '#.....1...|..........|....""""..|......:...|..........|....######',
  '#.........|....HHHHH.|.......HHH|HHH...:...|HHHH......|.....#####',
  '#..t......|....HHHHH.|.......HHH|HHH...:...|HHHH...2..|.....#####',
  '#.........|....HHHHH.|.......HHH|HHH...:...|HHHH......|......####',
  '#.........|....OHHHH.|.......GHH|HHH...:...|VHHH......|...#######',
  '#.........|......:...|..........|:.....:...|.:........|...#######',
  '#.....s...|......:...|..u.......|:.....:...|.:........|...##....#',
  'W:::::::::|::::::::::|::::::::::|::::::::::|::::::::::|::::p....E',
  '#.........|..........|..........|.....:....|..........|...##....#',
  '#.........|..........|...T......|.....:....|.....3....|...#######',
  '#..""""...|..........|..........|.....:....|..........|...#######',
  '#.""""""..|..HHHH....|HHHHH.....|.....:HHHH|....HHHHH.|....######',
  '#.""""""..|..HHHH....|HHHHH.....|.....:HHHH|....HHHHH.|.....#####',
  '#..""""...|..FHHH....|QHHHH.....|.....:AHHH|....BHHHH.|.....#####',
  '#.........|...:......|..:.......|.....:.:..|.......:..|......####',
  '#.........|...:::::::|::::::::::|::::::::::|::::::::..|......####',
  '##........|..........|.....4....|..........|..........|.....#####',
  '##..C.C...|....t.....|..........|...""""...|...##r##..|....######',
  '###.......|..........|..~~~~~...|..""""""..|...#.k.#..|...#######',
  '####......|..........|.~~~;;~~..|..""""""..|...#####..|..########',
  '#####.....|.....5....|.~~~;n~~..|...""""...|..........|.#########',
  '######....|..........|..~~~~~...|..........|........##|##########',
  '########..|..........|..........|.........#|##########|##########',
  '##########|##########|##########|##########|##########|##########',
].map((l) => l.split('_').join('.')), { W: ':', E: ':', N: ':', n: ';' });
const G = g.p('G');
const zona: ZonaDef = {
  id: 'A8', nome: 'Vila Ferrugem', mapa: 'A', tipo: 'cidade', tileset: 'ferrugem', musica: 'cidade-maracatu', arena: 'usina', passo: 7,
  pouso: [16, 13],
  mapaChars: g.mapa,
  objetos: [
    { o: 'posto', ...g.p('O') }, { o: 'ginasio', ...G, cor: '#5a5f66,#9aa3ad,#e6ebf0' }, { o: 'venda', ...g.p('V') },
    { o: 'forja', ...g.p('F') }, { o: 'oficina', ...g.p('Q') }, { o: 'casa-d', ...g.p('A') }, { o: 'casa-f', ...g.p('B') },
    { o: 'placa', ...g.p('s'), texto: 'VILA FERRUGEM\n"O que enferruja a gente lixa. O que quebra a gente solda."\nNorte: trilha do Monte Tupã · Leste: Estrada do Buriti.' },
    { o: 'placa', ...g.p('u'), texto: 'GINÁSIO DE VILA FERRUGEM\nLíder: Engenheira Bigorna.\n"Favor não se apoiar nas engrenagens. Elas se apoiam de volta."' },
    { o: 'placa', x: 52, y: 14, texto: 'ESTRADA DO BURITI → Vila Buriti e Platô da Liga.\nPista interditada por pedregulho. A prefeitura promete tirar "assim que alguém forte passar".' },
    { o: 'placa', x: 37, y: 2, texto: 'TRILHA DO MONTE TUPÃ\nSubida para gente de muitas insígnias. O guardião confere uma por uma. Devagar.' },
    { o: 'poste', x: 12, y: 14 }, { o: 'poste', x: 26, y: 14 }, { o: 'poste', x: 45, y: 14 }, { o: 'poste', x: 18, y: 22 }, { o: 'poste', x: 42, y: 22 },
    { o: 'banco', x: 22, y: 16 }, { o: 'estatua', x: 33, y: 17 }, { o: 'cupinzeiro', x: 7, y: 28 },
  ],
  warps: [
    { ...g.p('W'), para: { zona: 'A-R5', x: 88, y: 16, dir: 'o' }, tipo: 'borda' },
    { ...g.p('E'), para: { zona: 'A-R7', x: 1, y: 15, dir: 'l' }, tipo: 'borda' },
    { ...g.p('N'), para: { zona: 'A-MT', x: 20, y: 58, dir: 'n' }, tipo: 'borda' },
    { x: 8, y: 0, para: { zona: 'A-R6', x: 14, y: 1, dir: 's' }, tipo: 'borda' }, { x: 9, y: 0, para: { zona: 'A-R6', x: 15, y: 1, dir: 's' }, tipo: 'borda' },
    { x: G.x + 3, y: G.y, para: { zona: 'A8-ginasio', x: 8, y: 17, dir: 'n' }, tipo: 'porta' },
    { ...g.d('O', 2, 0), para: { zona: 'A8-posto', x: 6, y: 8, dir: 'n' }, tipo: 'porta' },
    { ...g.d('V', 1, 0), para: { zona: 'A8-venda', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { ...g.d('F', 1, 0), para: { zona: 'A8-forja', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { ...g.d('Q', 2, 0), para: { zona: 'A8-casa-1', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { ...g.d('A', 1, 0), para: { zona: 'A8-casa-2', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { ...g.d('B', 3, 0), para: { zona: 'A8-casa-3', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
  ],
  portoes: [
    { x: 8, y: 1, w: 2, h: 1, requer: 'amuleto:cachoeira', sprite: 'cl-pescador', fala: 'Guarda-rios: daqui para baixo o rio despenca no Véu, três cascatas de uma vez.\nDescer é fácil. Voltar é que só com o Amuleto da Cachoeira. Sem ele, eu não deixo ninguém virar espuma.' },
  ],
  npcs: [
    { id: 'a8-ze-malho', sprite: 'cl-ferreiro', x: 20, y: 9, dir: 's', mov: 'olhar', script: 'troca-a8' }, // troca com morador (src/data/trocas.ts)
    { id: 'a8-operario', sprite: 'npc-homem-1', x: 10, y: 16, mov: 'olhar', fala: ['Bem-vindo a Vila Ferrugem! Aqui o apito da fábrica toca às seis, ao meio-dia e quando o gato pisa no botão.', 'A Engenheira Bigorna transformou a fábrica velha em ginásio. As esteiras ainda andam. Para onde, só ela sabe.'] },
    { id: 'a8-soldadora', sprite: 'npc-mulher-2', x: 24, y: 14, mov: 'vagar', fala: ['Tipo Ferro aguenta quase tudo. Quase: Brasa derrete, Terra entorta e Ginga amassa.', 'Veneno em Ferro é igual xingar parede.'] },
    { id: 'a8-menino', sprite: 'cl-crianca-m', x: 38, y: 17, mov: 'vagar', fala: ['Meu pai disse que a Insígnia da Engrenagem vem com o Amuleto da Força.', 'Aí dá para empurrar o pedregulho da saída leste. Eu já tentei com a testa. Não recomendo.'] },
    { id: 'a8-fiscal', sprite: 'npc-homem-2', x: 51, y: 16, dir: 'o', fala: ['Depois do pedregulho é a Estrada do Buriti. No fim dela, Vila Buriti e o último ginásio da Costa do Sol.', 'E depois o Platô da Liga dos Guardiões. Eu fui lá uma vez. Assistir.'] },
    { id: 'a8-guia', sprite: 'cl-montanhista', x: 35, y: 3, dir: 'l', fala: ['A trilha do Monte Tupã começa aqui. Paredão, gruta escura e cascata: precisa de Escalar, Lampião e Cachoeira.', 'E o guardião lá de cima só abre o caminho para quem tem quinze insígnias. Eu tenho duas. E uma delas é de escoteiro.'] },
    { id: 'a8-sucateiro', sprite: 'npc-idoso', x: 6, y: 23, script: 'a2-m-sucata' },
    { id: 'A8-1', sprite: 'cl-ferreiro', ...g.p('1'), dir: 'l', treinador: 'A8-1', visao: 4 },
    { id: 'A8-2', sprite: 'cl-garimpeiro', ...g.p('2'), dir: 'o', mov: 'olhar', treinador: 'A8-2', visao: 3 },
    { id: 'A8-3', sprite: 'cl-capoeirista', ...g.p('3'), dir: 'n', treinador: 'A8-3', visao: 2 },
    { id: 'A8-4', sprite: 'cl-ferreiro', ...g.p('4'), dir: 'o', treinador: 'A8-4', visao: 4 },
    { id: 'A8-5', sprite: 'cl-crianca-f', ...g.p('5'), dir: 'n', treinador: 'A8-5', visao: 4 },
  ],
  itens: [
    { ...g.p('i'), item: 'pt-40', flag: 'item:A8:balcao' },
    { ...g.p('k'), item: 'pedra-solar', flag: 'item:A8:loca' },
    { ...g.p('n'), item: 'cuia-ouro', flag: 'item:A8:ilhota' },
    { x: 57, y: 14, item: 'engrenagem-velha', flag: 'item:A8:pedregulho' },
    { x: 5, y: 28, item: 'engrenagem-velha', oculto: true, flag: 'item:A8:sucata' },
    { x: 49, y: 8, item: 'elixir-andiroba', flag: 'item:A8:leste' },
    { x: 13, y: 4, item: 'pepita', oculto: true, flag: 'item:A8:acude' },
  ],
  habitats: [
    { metodo: 'grama', taxa: 0.09, dia: [{ e: 143, nv: [31, 33], peso: 30 }, { e: 161, nv: [31, 31], peso: 25 }, { e: 65, nv: [31, 34], peso: 25 }, { e: 163, nv: [31, 33], peso: 20 }], noite: [{ e: 141, nv: [24, 25], peso: 20 }, { e: 143, nv: [31, 33], peso: 30 }, { e: 59, nv: [24, 25], peso: 25 }, { e: 93, nv: [31, 33], peso: 25 }], camadas: [{ apos: 8, todos: [{ e: 144, nv: [37, 40], peso: 25 }, { e: 162, nv: [37, 40], peso: 25 }, { e: 66, nv: [37, 40], peso: 25 }, { e: 164, nv: [37, 40], peso: 25 }] }] },
    { metodo: 'arvore', todos: [{ e: 143, nv: [31, 33], peso: 60 }, { e: 151, nv: [26, 27], peso: 40 }] },
    { metodo: 'rocha', todos: [{ e: 163, nv: [31, 33], peso: 55 }, { e: 165, nv: [29, 29], peso: 45 }] },
    { metodo: 'agua', taxa: 0.06, todos: [{ e: 113, nv: [28, 29], peso: 55 }, { e: 75, nv: [28, 29], peso: 45 }] },
    { metodo: 'pesca-velha', todos: [{ e: 37, nv: [14, 18], peso: 100 }] },
    { metodo: 'pesca-boa', todos: [{ e: 113, nv: [27, 29], peso: 60 }, { e: 39, nv: [30, 33], peso: 40 }] },
  ],
};
export default zona;
