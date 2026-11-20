import type { ZonaDef } from '../../core/tipos';
import { grade, saidas, gente, duelista, item } from './_a1-grade';

/**
 * A-GE · Gruta do Eco (Trilha dos Cipós a sudoeste → Porto Sereia a nordeste). O rio subterrâneo corta a gruta em três:
 * a ponte de tábuas do meio é o caminho; a segunda ponte e a margem do lago levam ao salão do fundo (onde o morcego
 * Eco se esconde). Para depois: a ilhota da nascente e a do lago (Remo), a galeria alta atrás da rocha rachada
 * (Quebra-pedra; desce pela saliência) e o cofre do pedregulho (Força).
 */
const g = grade('A-GE', [
  '##########|##########|##########|##########|##########',
  '##########|##########|##########|##########|#####X####',
  '##~~~~~.j#|##i.......|..........|###.......|.....:...#',
  '#~~~a~~~.#|#...%%%%..|....%%%...|r.........|..%%.:.N.#',
  '#~~~~~~..#|##..%%%%..|...%%%%..#|###...%%%.|..%%.:...#',
  '##~~~~...#|####vvvvvv|vvvvvv####|####..%%%.|.1...:..##',
  '###~~.....|..7.......|........##|####......|.........#',
  '#~~~~~~~~~|~~~~~~~~~~|~~......##|######..##|##########',
  '#~~~~~~~~~|~~~~~~~~~~|~~......##|######..##|##########',
  '##########|########~~|~~..%%%.##|######..##|##########',
  '#........#|########~~|~~.%%%%%..|.....#..##|##########',
  '#..%%%%..#|###.....~~|~~.%%%%%%.|........##|##########',
  '#.%%%%%%.#|##......~~|~~..%%%%..|..2...####|##########',
  '#.%%%%%%..|........~~|~~.S......|......####|##########',
  '#..%%%%...|........~~|~~...T..T.|......####|##########',
  '#.........|...:::::==|==:::::::.|......####|##########',
  '#..3......|........~~|~~........|...%%%.###|##########',
  '##......##|###.....~~|~~..%%%%..|..%%%%.###|##########',
  '###..#####|####....~~|~~.%%%%%%.|..%%%...##|##########',
  '###..#####|#####...~~|~~..%%%%..|.........#|##########',
  '##....####|######..~~|~~........|...4.....#|##########',
  '#......###|######..~~|~~###..###|###.....##|##########',
  '#..%%%..##|######.~~~|~~~~~==~~~|~~~~~~~..#|##########',
  '#..%%%%..#|######.~~~|~~~~~==~~~|~~~~~~~~.#|##########',
  '#...%%...#|#######~~~|~~~~~==~~~|~~~~k~~~.#|##########',
  '#........#|##########|##.......#|#~~~~~~..#|##########',
  '#..5.....#|##########|#...%%%...|.~~~~~...#|##########',
  '#........#|###....###|#..%%%%%..|..~~~...##|##########',
  '#...:....#|###.m...p.|...%%%%...|.6.....###|##########',
  '#...:....#|##########|##..B....#|##########|##########',
  '####E#####|##########|##########|##########|##########',
  '##########|##########|##########|##########|##########',
], {
  E: ':', X: ':', a: ';', j: '.', i: '.', k: ';', m: '.', S: '.', N: '.', B: '.',
  '1': '.', '2': '.', '3': '.', '4': '.', '5': '.', '6': '.', '7': '.',
});
const zona: ZonaDef = {
  id: 'A-GE', nome: 'Gruta do Eco', mapa: 'A', tipo: 'caverna', tileset: 'caverna', musica: 'caverna', arena: 'caverna', passo: 3,
  mapaChars: g.mapa,
  warps: [
    ...saidas(g, 'E', 'A-R3', 73, 10, 's', 'caverna'),
    ...saidas(g, 'X', 'A4', 6, 5, 's', 'caverna'),
  ],
  npcs: [
    // rival semanal (spec 10A item 27): depois da Liga, às terças e quintas; flag mantida por src/data/eventos/regras.ts
    { id: 'rival-semanal', sprite: 'taina', x: 47, y: 6, dir: 'o', se: 'flag:rival-semana-hoje', script: 'rival-semanal' },
    gente(g, 'S', 'a-ge-espeleologa', 'cl-montanhista', 'Espeleóloga Dalva', { script: 'm-eco' }),
    { id: 'eco', sprite: 'c:morceguim', x: g.p('B')[0], y: g.p('B')[1], dir: 'n', se: 'flag:m-eco&!flag:m-eco-achou', script: 'm-eco-morcego' },
    gente(g, 'N', 'a-ge-garimpeiro', 'cl-garimpeiro', 'Garimpeiro Zé Faísca', { mov: 'olhar', fala: ['Sentiu o cheiro de maresia? A saída para Porto Sereia é logo ali em cima.', 'Aquela rocha rachada no canto esconde uma galeria. Eu ia quebrar, mas minha picareta pediu demissão.'] }),
    duelista(g, '1', 'A-GE-1', 'cl-garimpeiro', 'l', 4),
    duelista(g, '2', 'A-GE-2', 'cl-montanhista', 'o', 5),
    duelista(g, '3', 'A-GE-3', 'cl-crianca-m', 'l', 5),
    duelista(g, '4', 'A-GE-4', 'cl-garimpeiro', 'n', 3, { mov: 'olhar' }),
    duelista(g, '5', 'A-GE-5', 'cl-escoteira', 'l', 3),
    duelista(g, '6', 'A-GE-6', 'cl-pescador', 'o', 3),
    duelista(g, '7', 'A-GE-7', 'cl-biologa', 'l', 4),
  ],
  itens: [
    item(g, 'a', 'A-GE', 'pt-42'),
    item(g, 'j', 'A-GE', 'garrafada'),
    item(g, 'i', 'A-GE', 'pt-41'),
    item(g, 'k', 'A-GE', 'pepita'),
    item(g, 'm', 'A-GE', 'cuia-ouro', 2),
    { x: 8, y: 10, item: 'cha-guarana', oculto: true, flag: 'item:A-GE:8,10' },
    { x: 37, y: 9, item: 'cuia-noturna', oculto: true, flag: 'item:A-GE:37,9' },
    { x: 28, y: 25, item: 'unguento', flag: 'item:A-GE:28,25' },
  ],
  habitats: [
    {
      metodo: 'caverna', taxa: 0.1,
      todos: [{ e: 30, nv: [16, 18], peso: 55 }, { e: 167, nv: [16, 19], peso: 45 }],
      noite: [{ e: 30, nv: [16, 18], peso: 45 }, { e: 167, nv: [16, 19], peso: 35 }, { e: 147, nv: [17, 19], peso: 20 }],
      camadas: [
        { apos: 6, todos: [{ e: 30, nv: [26, 29], peso: 45 }, { e: 167, nv: [26, 30], peso: 40 }, { e: 31, nv: [28, 31], peso: 15 }], noite: [{ e: 30, nv: [26, 29], peso: 35 }, { e: 167, nv: [26, 30], peso: 30 }, { e: 147, nv: [27, 30], peso: 25 }, { e: 31, nv: [28, 31], peso: 10 }] },
        { apos: 11, todos: [{ e: 31, nv: [38, 42], peso: 45 }, { e: 168, nv: [38, 42], peso: 40 }, { e: 167, nv: [36, 39], peso: 15 }], noite: [{ e: 31, nv: [38, 42], peso: 35 }, { e: 168, nv: [38, 42], peso: 30 }, { e: 147, nv: [37, 40], peso: 20 }, { e: 148, nv: [39, 42], peso: 15 }] },
      ],
    },
    { metodo: 'rocha', todos: [{ e: 167, nv: [34, 38], peso: 100 }] },
    { metodo: 'agua', taxa: 0.08, todos: [{ e: 39, nv: [22, 27], peso: 100 }] },
    { metodo: 'pesca-velha', todos: [{ e: 39, nv: [12, 16], peso: 100 }] },
    { metodo: 'pesca-boa', todos: [{ e: 39, nv: [20, 25], peso: 100 }] },
    { metodo: 'pesca-mestra', todos: [{ e: 39, nv: [31, 34], peso: 60 }, { e: 40, nv: [35, 38], peso: 40 }] },
  ],
};
export default zona;
