import type { ZonaDef } from '../../core/tipos';
import { grade } from './_a2-grade';

/**
 * A-PR Praia das Tartarugas (passo 5; a Capitania só deixa entrar com a insígnia Estrela). Chega-se de canoa pelo sul.
 * Restinga ao norte, cercados de desova do Projeto Tartaruí na areia (os ninhos estalam de noite) e o ninho do ovo
 * misterioso (`inicial-extra-2`). Na estação fria aparecem pinguins no capim da ponta leste.
 * Para depois: a loca rachada do noroeste (Quebra-pedra) e o mirante da trepadeira (Escalar).
 */
const g = grade('A-PR', 50, [
  'TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT|TTTTTTTTTT',
  'TT#######T|TTTTTTTTTT|TTTTTTTTTT|TTTTTTT###|#####TTTTT',
  'TT#.k...#.|..T....t..|...T......|..t....#..|.m..#..TTT',
  'TT#.....#.|..........|..........|.......#..|....#...TT',
  'TT##r####.|..""""....|..HHHH....|.""""".###|e###....TT',
  'TT.......,|.""""""...|..HHHH....|.""""""...|........TT',
  'TT........|.""""""...|..BHHH....|.""""""...|..."""".TT',
  'TT..C.C...|..""""....|...:......|..""""....|..""""""TT',
  'TT........|..........|...:..a...|..........|..""""""TT',
  'TTT.......|....1.....|...:......|....2.....|..."""".TT',
  'TTT;;;;...|..........|...:......|..........|......;;TT',
  'TT;;;;;;;;|;;;;......|...:......|......;;;;|;;;;;;;;;T',
  'TT;;;;;;;;|;;;;;;;;;;|;;;:;;;;;;|;;;;;;;;;;|;;;;;;;;;T',
  'T;;fffff;;|;;;;;;;;;;|;;;;;;;;;;|;;fffff;;;|;;;;;;;;;T',
  'T;;f;N;f;;|;;;;q;;;;;|;;;;;;;;;;|;;f;N;f;;;|;;;q;;;;;T',
  'T;;f;;;f;;|;;;;;;;;;;|;;;;3;;;;;|;;f;;;f;;;|;;;;;;;;;T',
  'T;;ff;ff;;|;;;;;;;;;;|;;;;;;;;;;|;;ff;ff;;;|;;;;;;;;;T',
  'T;;;;;;;;;|;;;fffff;;|;;;;;;;;;;|;;;;;;;;;;|;;;;;4;;;T',
  'T;;;;;;;;;|;;;f;O;f;;|;;;;;;;;;;|;;;;;;;;;;|;;;;;;;;;T',
  'T;q;;;;;;;|;;;f;;;f;;|;;;;;;;;;;|;;;q;;;;;;|;;;;;;;;TT',
  'T;;;;;;;;;|;;;ff;ff;;|;;;;;;;;;;|;;;;;;;;;;|;;;;;;;;TT',
  'TT;;;;;;;;|;;;;;;;;;;|;;;;;;;;;;|;;;;;;;;;;|;;;;;;;TTT',
  'TT;;;;;;~~|~~;;;;;;;;|;;;;;;;;;;|;;;;;;~~~~|;;;;;;TTTT',
  'T;;;;~~~~~|~~~~~;;;;;|;;;;;;;;;;|;;;~~~~~~~|~~;;;TTTTT',
  '~~~~~~~~~~|~~~~~~~~;;|;;;;;;;;;~|~~~~~~~~~~|~~~~~~~TTT',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~~~~~~~~~|~~~;;~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~;;;~~~~',
  '~~~~~~~~~~|~~;;h;~~~~|~~~~~~~~~~|~~~~~~~~~~|~~;;j;;~~~',
  '~~~~~~~~~~|~~~;;~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~;;;~~~~',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~|~~~~~~~~~~',
  '##########|##########|##########|####~~####|##########',
], { q: ';', N: ';', O: ';', h: ';', j: ';', '3': ';', '4': ';' });
const B = g.p('B');
const zona: ZonaDef = {
  id: 'A-PR', nome: 'Praia das Tartarugas', mapa: 'A', tipo: 'rota', tileset: 'costa', musica: 'rota-dia-A', arena: 'praia', passo: 5,
  mapaChars: g.mapa,
  objetos: [
    { o: 'casa-palafita', ...B },
    ...g.todos('N').map((p) => ({ o: 'ninho', ...p, script: 'a2-pr-ninho' })),
    { o: 'ninho', ...g.p('O'), script: 'a2-pr-ninho' },
    ...g.todos('q').map((p) => ({ o: 'coqueiro', ...p })),
    { o: 'placa', ...g.p('a'), texto: 'PROJETO TARTARUÍ — base de campo.\nNão pise nos cercados. Não acenda lanterna na areia. Não ensine as tartaruguinhas a pedir comida.' },
    { o: 'placa', x: 10, y: 21, texto: 'PRAIA DAS TARTARUGAS\nDesova à noite. De dia, quem manda é o siri.' },
    { o: 'canoa', x: 30, y: 23 }, { o: 'tronco-caido', x: 40, y: 20 }, { o: 'bromelia', x: 12, y: 3 }, { o: 'bromelia', x: 33, y: 9 },
  ],
  warps: [
    { x: 34, y: 35, para: { zona: 'A-BA', x: 60, y: 1, dir: 's' }, tipo: 'borda' }, { x: 35, y: 35, para: { zona: 'A-BA', x: 61, y: 1, dir: 's' }, tipo: 'borda' },
    { x: B.x + 1, y: B.y, para: { zona: 'A-BA', x: 60, y: 1 }, tipo: 'porta', requer: 'nunca', recusa: 'Na porta da base, um aviso: "MUTIRÃO DE CONTAGEM DE OVOS. Estamos no 4.312. Não bata: perde-se a conta."' },
  ],
  npcs: [
    { id: 'pr-chefe', sprite: 'cl-biologa', x: 18, y: 21, dir: 's', script: 'a2-pr-ovo' },
    { id: 'pr-vigia', sprite: 'cl-escoteira', x: 44, y: 11, mov: 'olhar', script: 'a2-pr-vigia' },
    { id: 'pr-voluntario', sprite: 'npc-homem-1', x: 8, y: 17, mov: 'vagar', fala: ['Sou voluntário do Projeto. Meu trabalho é espantar gaivota e turista. A gaivota obedece mais.', 'De noite, a Tartaruí sobe a areia bem devagar. Se você remar perto da praia no escuro, encontra as mães na água.'] },
    { id: 'pr-menina', sprite: 'cl-crianca-f', x: 27, y: 19, mov: 'vagar', fala: ['Eu vi uma Estrelinha andando na areia de noite! Ela brilha um pouquinho, igual adesivo de teto.', 'A Drª Maré disse que tem um ovo esquisito no cercado do meio. Não é de tartaruga. Eu acho que é de dragão.'] },
    { id: 'A-PR-1', sprite: 'cl-biologa', ...g.p('1'), dir: 's', treinador: 'A-PR-1', visao: 3 },
    { id: 'A-PR-2', sprite: 'cl-surfista', ...g.p('2'), dir: 's', mov: 'olhar', treinador: 'A-PR-2', visao: 3 },
    { id: 'A-PR-3', sprite: 'cl-pescador', ...g.p('3'), dir: 's', treinador: 'A-PR-3', visao: 4 },
    { id: 'A-PR-4', sprite: 'cl-escoteira', ...g.p('4'), dir: 'o', treinador: 'A-PR-4', visao: 4 },
  ],
  itens: [
    { ...g.p('k'), item: 'pt-16', flag: 'item:A-PR:pedra' },
    { ...g.p('m'), item: 'pedra-mare', flag: 'item:A-PR:mirante' },
    { ...g.p('h'), item: 'cuia-rede', qtd: 3, flag: 'item:A-PR:ilhota-o' },
    { ...g.p('j'), item: 'concha-rara', flag: 'item:A-PR:ilhota-l' },
    { x: 3, y: 9, item: 'garrafada', qtd: 2, flag: 'item:A-PR:restinga' },
    { x: 46, y: 21, item: 'concha-rara', oculto: true, flag: 'item:A-PR:ponta' },
    { x: 20, y: 13, item: 'acai', qtd: 2, oculto: true, flag: 'item:A-PR:areia' },
  ],
  habitats: [
    {
      metodo: 'grama', taxa: 0.1,
      todos: [{ e: 129, nv: [24, 27], peso: 40 }, { e: 35, nv: [24, 27], peso: 30 }, { e: 107, nv: [24, 28], peso: 22 }, { e: 133, nv: [25, 28], peso: 8, estacao: 'fria' }],
      noite: [{ e: 123, nv: [24, 27], peso: 40 }, { e: 129, nv: [24, 27], peso: 30 }, { e: 35, nv: [24, 27], peso: 22 }, { e: 133, nv: [25, 28], peso: 8, estacao: 'fria' }],
      camadas: [{ apos: 8, todos: [{ e: 36, nv: [38, 41], peso: 40 }, { e: 129, nv: [32, 33], peso: 30 }, { e: 108, nv: [37, 40], peso: 22 }, { e: 133, nv: [30, 31], peso: 8, estacao: 'fria' }], noite: [{ e: 36, nv: [38, 41], peso: 40 }, { e: 123, nv: [36, 40], peso: 30 }, { e: 129, nv: [32, 33], peso: 22 }, { e: 133, nv: [30, 31], peso: 8, estacao: 'fria' }] }],
    },
    { metodo: 'agua', taxa: 0.07, todos: [{ e: 125, nv: [24, 28], peso: 60 }, { e: 117, nv: [25, 28], peso: 25 }, { e: 37, nv: [24, 27], peso: 15 }], noite: [{ e: 79, nv: [24, 28], peso: 50 }, { e: 125, nv: [24, 28], peso: 35 }, { e: 123, nv: [24, 27], peso: 15 }], camadas: [{ apos: 8, todos: [{ e: 126, nv: [36, 40], peso: 45 }, { e: 125, nv: [28, 29], peso: 30 }, { e: 117, nv: [30, 31], peso: 25 }], noite: [{ e: 79, nv: [34, 37], peso: 45 }, { e: 80, nv: [38, 42], peso: 15 }, { e: 126, nv: [36, 40], peso: 40 }] }] },
    { metodo: 'pesca-velha', todos: [{ e: 37, nv: [12, 18], peso: 100 }] },
    { metodo: 'pesca-boa', todos: [{ e: 37, nv: [24, 28], peso: 55 }, { e: 125, nv: [24, 28], peso: 25 }, { e: 117, nv: [25, 28], peso: 20 }] },
  ],
};
export default zona;
