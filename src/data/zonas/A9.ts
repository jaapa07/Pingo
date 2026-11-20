import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A9 Aldeia Tupã (passo 16): no alto do Monte Tupã, Ginásio da Lenda (Pajé Trovão-Velho). Chega-se pelo oeste.
 * A trilha do meio sobe à pedra mais alta, onde o Gavião-Tupã pousa depois da insígnia 16 (Escama).
 */
const g = grade('A9', 40, [
  '##########|##########|##########|##########',
  '##########|##########|##########|##########',
  '##########|#####....H|H....#####|##########',
  '##########|####.....Q|H.....####|##########',
  '##########|####......|y.....####|##########',
  '##########|######....|....######|##########',
  '##########|########.:|.#########|##########',
  '######....|.........:|..........|....######',
  '####......|...HHHH..:|..HHHHHH..|......####',
  '###...t...|...HHHH..:|..HHHHHH..|..t....###',
  '##........|...AHHH..:|..HHHHHH..|........##',
  '##..."""".|....:....:|..GHHHHH..|.""""...##',
  '##..""""""|....:....:|.....:....|""""""..##',
  '##..."""".|....:....:|.....:....|.""""...##',
  '#.........|....::::::|::::::::::|:::.....##',
  'W:::::::::|::::::::::|:.........|..:......#',
  '#.........|.....:....|:.........|..:......#',
  '##..HHHHH.|.....:....|:..HHHH...|..:.HHHH.#',
  '##..HHHHH.|.....:....|:..HHHH...|..:.HHHH.#',
  '##..OHHHH.|.....:....|:..VHHH...|..:.BHHH.#',
  '##....:...|.....:....|:...:.....|..:..:...#',
  '##....::::|::::::::::|::::::::::|::::::...#',
  '###.......|....F.....|..........|........##',
  '###..1....|..........|....2.....|...C.C..##',
  '####......|..t.......|..........|.......###',
  '####..""""|..........|.""""""...|......####',
  '#####.""""|"....3....|.""""""...|.....#####',
  '######....|..........|..""""....|...#######',
  '########..|..........|..........|.#########',
  '##########|##########|##########|##########',
], { W: ':' });
const G = g.p('G'), Q = g.p('Q');
const zona: ZonaDef = {
  id: 'A9', nome: 'Aldeia Tupã', mapa: 'A', tipo: 'cidade', tileset: 'pico', musica: 'cidade-catira', arena: 'pico', passo: 16,
  pouso: [6, 20],
  mapaChars: g.mapa,
  objetos: [
    { o: 'pedra-grande', ...Q, script: 'a2-a9-gaviao' },
    { o: 'casa-palafita', ...g.p('A') }, { o: 'ginasio', ...G, cor: '#2f6f6a,#58b8a8,#e8f8d8' },
    { o: 'posto', ...g.p('O') }, { o: 'venda', ...g.p('V') }, { o: 'casa-palafita', ...g.p('B') },
    { o: 'fogueira', ...g.p('F') },
    { o: 'totem', x: 18, y: 6 }, { o: 'totem', x: 21, y: 6 }, { o: 'totem', x: 3, y: 14 }, { o: 'totem', x: 3, y: 16 },
    { o: 'placa', x: 8, y: 14, texto: 'ALDEIA TUPÃ\n"O lugar mais perto do céu."\nNorte: a Pedra do Trovão · Ginásio: Pajé Trovão-Velho.' },
    { o: 'placa', x: 28, y: 12, texto: 'GINÁSIO DA ALDEIA TUPÃ\nLíder: Pajé Trovão-Velho.\nQuatro provas: mata, fogo, água e vento. Quem chegou até aqui já conhece as quatro.' },
    { o: 'araucaria', x: 9, y: 24 }, { o: 'araucaria', x: 33, y: 26 }, { o: 'bromelia', x: 12, y: 27 },
  ],
  warps: [
    { ...g.p('W'), para: { zona: 'A-MT', x: 38, y: 7, dir: 'o' }, tipo: 'borda' },
    { x: G.x + 3, y: G.y, para: { zona: 'A9-ginasio', x: 8, y: 17, dir: 'n' }, tipo: 'porta' },
    { ...g.d('O', 2, 0), para: { zona: 'A9-posto', x: 6, y: 8, dir: 'n' }, tipo: 'porta' },
    { ...g.d('V', 1, 0), para: { zona: 'A9-venda', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { ...g.d('A', 1, 0), para: { zona: 'A9-casa-1', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
    { ...g.d('B', 1, 0), para: { zona: 'A9-casa-2', x: 5, y: 7, dir: 'n' }, tipo: 'porta' },
  ],
  npcs: [
    { id: 'gaviao', sprite: 'c:gaviao-tupa', ...g.p('y'), dir: 's', se: 'insignia:16&!flag:gaviao-ok', script: 'a2-a9-gaviao' },
    { id: 'a9-anciao', sprite: 'npc-idoso', x: 15, y: 22, dir: 'o', script: 'a2-a9-paje-fora' },
    { id: 'a9-tecela', sprite: 'npc-mulher-2', x: 30, y: 16, mov: 'olhar', fala: ['Cada insígnia que você traz é um fio. Dezesseis fios fazem a rede que segura Pindorama no lugar.', 'A última o Pajé só entrega para quem passa nas quatro provas. Não tenha pressa: ele não tem.'] },
    { id: 'a9-curumim', sprite: 'cl-crianca-f', x: 21, y: 24, mov: 'vagar', fala: ['Você subiu o monte todinho? Eu subo todo dia para buscar água. Duas vezes!', 'Quando troveja sem nuvem, é o Gavião-Tupã passando. A gente dá tchau.'] },
    { id: 'A9-1', sprite: 'cl-vaqueiro', ...g.p('1'), dir: 'l', treinador: 'A9-1', visao: 4 },
    { id: 'A9-2', sprite: 'cl-rendeira', ...g.p('2'), dir: 's', mov: 'olhar', treinador: 'A9-2', visao: 3 },
    { id: 'A9-3', sprite: 'cl-crianca-m', ...g.p('3'), dir: 'o', treinador: 'A9-3', visao: 4 },
  ],
  itens: [
    { x: 36, y: 13, item: 'cuia-guardia', flag: 'item:A9:leste' },
    { x: 5, y: 9, item: 'elixir-andiroba', qtd: 3, flag: 'item:A9:oeste' },
    { x: 16, y: 4, item: 'pena-colorida', oculto: true, flag: 'item:A9:pedra' },
    { x: 32, y: 27, item: 'rapadura', oculto: true, flag: 'item:A9:sul' },
  ],
  habitats: [
    { metodo: 'grama', taxa: 0.08, todos: [{ e: 168, nv: [63, 66], peso: 30 }, { e: 110, nv: [63, 66], peso: 20 }, { e: 54, nv: [63, 66], peso: 25 }, { e: 156, nv: [63, 66], peso: 10 }, { e: 100, nv: [63, 66], peso: 15 }] },
    { metodo: 'arvore', todos: [{ e: 62, nv: [63, 66], peso: 70 }, { e: 68, nv: [63, 66], peso: 30 }] },
  ],
};
export default zona;
