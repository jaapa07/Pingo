/** Músicas de cenário: título, vila natal, rotas (dia/noite dos dois mapas), caverna, água, mergulho e Pico Pingorama. */
import type { Faixa } from './types';

const V8 = '- | - | - | - | - | - | - | -';

export const temaTitulo: Faixa = {
  id: 'tema-titulo', titulo: 'Adventures of Pingo', bpm: 116, loop: true, voltaEm: 4, envio: 0.28,
  inst: { melodia: 'pulso25', contra: 'pulso12', baixo: 'tri', harmonia: 'viola' },
  estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 3, 2, 1, 2, 1], passo: 2, oitava: 4 },
  vol: { harmonia: 0.5, contra: 0.5 },
  bateria: {
    i: { triF: 'x...x...x...x...', prato: 'X...............' },
    a: { zabumba: 'X..x....X..x....', bacalhau: '......x.......x.', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.' },
    b: { zabumba: 'X..x..x.X..x..x.', bacalhau: '....x.......x.x.', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.', chipCaixa: '............x...' },
    v: { zabumba: 'X..x....X..x.x..', chipCaixa: '........x.x.xxxx', triA: '..x...x...x...x.' },
    p: { triF: 'x.x.x.x.x.x.x.x.', zabumba: 'X.......x.......' },
  },
  secoes: {
    intro: {
      melodia: 'r:8 a4:2 d5 f#5 a5 | b5:6 a5:2 f#5:8 | g5:4 b5 d6:6 b5:2 | a5:8 _:4 r:4',
      contra: '-', baixo: '@1...............', acordes: 'D | Bm | G | A', bateria: 'i i i v',
      estilo: { tipo: 'pad', oitava: 4 }, inst: { harmonia: 'pad' },
    },
    A: {
      melodia: 'd5:4 f#5:2 a5:6 f#5:2 e5:2 | e5:4 a5:2 c#6:6 b5:2 a5:2 | b5:4 d6:2 f#6:4 e6:2 d6:2 b5:2 | a5:8 f#5:4 a5:4 | b5:4 g5:2 b5:6 a5:2 g5:2 | a5:4 f#5:2 a5:6 g5:2 f#5:2 | g5:4 e5:2 g5:4 f#5:2 e5:2 g5:2 | e5:8 _:4 a4:2 c#5:2',
      contra: 'f#4:8 a4:8 | e4:8 a4:8 | d4:8 f#4:8 | c#4:8 f#4:8 | b3:8 d4:8 | a3:8 d4:8 | g3:8 b3:8 | a3:8 c#4:8',
      baixo: '@1..1..5.1..1..5.', acordes: 'D | A/C# | Bm | F#m | G | D/F# | Em | A', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'f#5:3 b5:3 d6:2 c#6:3 b5:3 a5:2 | b5:3 g5:3 d5:2 g5:8 | a5:3 f#5:3 d5:2 f#5:3 a5:3 d6:2 | c#6:6 b5:2 a5:8 | c6:3 g5:3 e5:2 g5:3 c6:3 e6:2 | d6:6 b5:2 g5:8 | e5:2 g5 b5 e6 d6:4 b5:4 | c#6:4 e6:4 a5:4 r:4',
      contra: V8,
      baixo: '@1..1..5.1..5..8.', acordes: 'Bm | G | D | A | C | G | Em | A', bateria: 'b b b b b b b v',
      estilo: { tipo: 'ritmo', grade: 'x..x..x.x..x..x.', oitava: 4 },
    },
    C: {
      melodia: 'b5:2 d6 g6:4 f#6:2 e6 d6:4 | c#6:2 e6 a6:4 g6:2 f#6 e6:4 | f#6:6 e6:2 c#6:4 a5:4 | b5:4 d6:4 f#6:8 | g6:2 f#6 e6 d6 b5:4 d6:4 | e6:2 d6 c#6 b5 a5:4 c#6:4 | d6:12 a5:2 f#5:2 | d5:8 r:8',
      contra: 'd5:4 b4:4 g4:8 | e5:4 c#5:4 a4:8 | a4:8 c#5:8 | f#4:8 b4:8 | b4:4 g4:4 d5:8 | c#5:4 a4:4 e5:8 | f#4:4 a4:4 d5:8 | a4:8 r:8',
      baixo: '@1..1..5.1..5..8.', acordes: 'G | A | F#m | Bm | G | A | D | D', bateria: 'b b b b b b b v',
    },
    ponte: {
      melodia: 'g5:4 b5:2 e6:6 d6:4 | c#6:4 e6:2 a5:6 g5:4 | f#5:4 a5:2 c#6:6 b5:4 | a5:4 g5:4 a4:2 c#5:2 e5:2 a5:2',
      contra: '-', baixo: '@1.......5.......', acordes: 'Em | A | F#m | A7', bateria: 'p p p v',
      inst: { melodia: 'flauta' },
    },
  },
  ordem: ['intro', 'A', 'B', 'C', 'ponte'],
};

export const vilaJacaranda: Faixa = {
  id: 'vila-jacaranda', titulo: 'Vila Jacarandá', bpm: 96, loop: true, envio: 0.32,
  inst: { melodia: 'flauta', contra: 'kalimba', baixo: 'tri', harmonia: 'violao' },
  estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 1], passo: 2, oitava: 4 },
  vol: { melodia: 0.85, harmonia: 0.6, contra: 0.6, bateria: 0.55 },
  bateria: {
    a: { ganza: 'x.o.x.o.x.o.x.o.', aro: '....x.......x...', triF: '..x...x...x...x.' },
    b: { ganza: 'x.o.x.o.x.o.x.o.', aro: '....x.......x...', triF: '..x...x...x...x.', zabumba: 'x.......x..o....' },
  },
  secoes: {
    A: {
      melodia: 'b4:4 d5:4 g5:6 f#5:2 | e5:4 g5:4 b5:8 | c6:4 b5:2 a5:2 g5:4 e5:4 | f#5:6 g5:2 a5:8 | b5:4 d6:4 g5:6 a5:2 | b5:4 g5:4 e5:8 | c5:2 e5:2 a5:4 g5:4 e5:4 | d5:12 r:4',
      contra: 'r:8 r:4 b4:2 d5 | r:8 e4:2 g4 b4 e5 | - | r:8 d5:2 f#5 a5 d6 | - | r:8 b4:2 g4 e4 b3 | - | r:4 a4:2 d5 f#5 a5 d5:4',
      baixo: '@1.....5.1...5...', acordes: 'G | Em | C | D | G | Em | Am | D', bateria: 'a',
    },
    B: {
      melodia: 'e5:2 g5:2 c6:4 b5:2 a5:2 g5:4 | d5:2 g5:2 b5:4 a5:2 g5:2 d5:4 | c5:2 e5:2 a5:4 g5:2 f#5:2 e5:4 | f#5:4 a5:4 d6:8 | e6:4 d6:2 c6:2 g5:8 | d6:4 b5:2 a5:2 g5:8 | a5:2 b5:2 c6:4 a5:2 b5:2 c6:2 d6:2 | g5:12 r:4',
      contra: V8, baixo: '@1.....5.1...5...', acordes: 'C | G/B | Am | D | C | G/B | Am D | G', bateria: 'b',
    },
    C: {
      melodia: 'e5:6 f#5:2 g5:4 b5:4 | f#5:6 e5:2 d5:8 | e5:4 g5:4 c6:6 b5:2 | b5:8 d5:8 | g5:6 a5:2 b5:4 e6:4 | d6:6 c#6:2 b5:8 | c6:4 e6:4 g5:4 c6:4 | a5:8 d5:4 f#5:4',
      contra: 'b4:8 e4:8 | d4:8 f#4:8 | g4:8 e4:8 | d4:8 b3:8 | b4:8 g4:8 | f#4:8 d4:8 | e4:8 g4:8 | f#4:8 a4:8',
      baixo: '@1.......5...1...', acordes: 'Em | Bm | C | G | Em | Bm | C | D', bateria: 'a',
    },
    D: {
      melodia: 'g5:2 b5:2 d6:4 b5:2 d6:2 g6:4 | f#6:4 d6:4 a5:8 | g5:2 b5:2 e6:4 d6:2 b5:2 g5:4 | e5:4 g5:4 c6:8 | b5:2 d6:2 g6:4 f#6:2 e6:2 d6:4 | a5:4 d6:4 f#6:6 e6:2 | e6:4 c6:4 d6:4 a5:4 | g5:4 d5:4 g5:8',
      contra: V8, baixo: '@1.....5.1...5...', acordes: 'G | D/F# | Em | C | G | D | C D | G', bateria: 'b',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const rotaDiaA: Faixa = {
  id: 'rota-dia-A', titulo: 'Trilhas da Costa do Sol', bpm: 132, loop: true, envio: 0.22,
  inst: { melodia: 'pulso25', contra: 'pulso12', baixo: 'tri', harmonia: 'cavaquinho' },
  estilo: { tipo: 'ritmo', grade: 'x.xx.xx.x.xx.xx.', oitava: 4 },
  vol: { contra: 0.45, harmonia: 0.5 },
  bateria: {
    a: { chipBumbo: 'X.....X.X.......', chipCaixa: '....X.......X...', chipHat: 'x.x.x.x.x.x.x.x.', triF: '..x...x...x...x.' },
    v: { chipBumbo: 'X.....X.X.......', chipCaixa: '....X.....X.XXXX', chipHat: 'x.x.x.x.x.x.....' },
    c: { chipBumbo: 'X.......X.......', chipHat: 'x.x.x.x.x.x.x.x.', triA: '....x.......x...' },
  },
  secoes: {
    A: {
      melodia: 'g5:3 e5:1 g5:2 c6:6 b5:2 a5:2 | g5:4 e5:2 c5:2 e5:4 g5:4 | a5:3 f5:1 a5:2 c6:6 d6:2 c6:2 | b5:4 g5:2 d5:2 g5:8 | g5:3 e5:1 g5:2 c6:6 d6:2 e6:2 | e6:4 c6:2 a5:2 c6:4 e6:4 | f6:2 e6 d6 c6 a5:4 d6:4 | b5:2 a5 b5 c6 d6:4 g5:4',
      contra: 'e5:8 g5:8 | e5:8 c5:8 | f5:8 a5:8 | g5:8 d5:8 | e5:8 g5:8 | c5:8 a5:8 | a5:8 f5:8 | g5:8 b4:8',
      baixo: '@1...5...1...5.a.', acordes: 'C | C | F | G | C | Am | Dm | G', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'a5:2 c6 f6:4 e6:2 c6 a5:4 | g5:2 c6 e6:4 d6:2 c6 g5:4 | f5:2 a5 d6:4 c6:2 a5 f5:4 | g5:6 a5:2 b5:4 d6:4 | c6:2 a5 f5 a5 c6:4 f6:4 | e6:6 d6:2 b5:4 g#5:4 | a5:2 c6 e6:4 c6:2 e6 a6:4 | f#6:4 d6:4 g6:4 b5:4',
      contra: V8, baixo: '@1.1.5.1.1.1.5.a.', acordes: 'F | C/E | Dm | G | F | E7 | Am | D7 G', bateria: 'a a a a a a a v',
    },
    C: {
      melodia: 'e5:4 a5:4 c6:6 b5:2 | b5:6 g5:2 e5:8 | f5:4 a5:4 c6:6 a5:2 | g5:8 e5:4 c5:4 | e5:4 a5:4 c6:4 e6:4 | d6:6 b5:2 g5:8 | a5:2 c6 f6 e6 d6:4 c6:4 | d6:4 b5:4 g5:2 a5 b5 d6',
      contra: V8, baixo: '@1.......5...1...', acordes: 'Am | Em | F | C | Am | Em | F | G', bateria: 'c c c c c c c v',
      inst: { melodia: 'flauta' }, estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 1], passo: 2, oitava: 4 },
    },
    D: {
      melodia: 'e6:3 c6:1 e6:2 g6:6 e6:2 c6:2 | d6:3 b5:1 d6:2 g6:6 d6:2 b5:2 | c6:3 a5:1 c6:2 e6:6 c6:2 a5:2 | a5:4 c6:4 f6:8 | g6:4 e6:2 c6:2 g5:4 c6:4 | b5:2 d6 g6:4 f6:2 d6 b5:4 | a5:2 c6 f6:4 g6:2 f6 d6:4 | c6:12 r:4',
      contra: 'g5:8 c6:8 | g5:8 b5:8 | e5:8 a5:8 | f5:8 a5:8 | e5:8 e5:8 | d5:8 g5:8 | f5:8 b4:8 | e5:12 r:4',
      baixo: '@1...5...1...5.a.', acordes: 'C | G/B | Am | F | C | G | F G | C', bateria: 'a a a a a a a v',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const rotaNoiteA: Faixa = {
  id: 'rota-noite-A', titulo: 'Costa do Sol ao Luar', bpm: 96, loop: true, envio: 0.42,
  eco: { passos: 6, fb: 0.3, mix: 0.25 },
  inst: { melodia: 'tri', contra: 'sino', baixo: 'baixoSub', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 0.8, contra: 0.4, harmonia: 0.6, bateria: 0.5 },
  bateria: {
    a: { caxixi: 'x...o.x...o.x...', triF: '........x.......' },
    b: { caxixi: 'x...o.x...o.x.o.', triF: '....x.......x...', chipBumbo: 'x.........x.....' },
  },
  secoes: {
    A: {
      melodia: 'e5:6 a5:2 c6:8 | a5:6 f5:2 c5:8 | e5:4 g5:4 c6:6 e6:2 | d6:8 b5:4 g5:4 | e5:6 a5:2 c6:4 e6:4 | f6:6 e6:2 c6:8 | d6:4 a5:4 f5:4 d5:4 | e5:12 r:4',
      contra: '-', baixo: '@1.......5.......', acordes: 'Am | F | C | G | Am | F | Dm | E', bateria: 'a',
    },
    B: {
      melodia: 'c6:4 a5:4 f5:6 a5:2 | b5:4 g5:4 d5:6 g5:2 | g5:6 b5:2 e6:8 | c6:8 a5:8 | a5:2 c6 f6:4 e6:4 c6:4 | d6:2 b5 g5:4 b5:4 d6:4 | e6:12 c6:4 | a5:12 r:4',
      contra: 'r:12 c6:4 | r:12 d6:4 | r:12 b5:4 | r:12 e6:4 | r:12 c6:4 | r:12 g5:4 | r:8 a5:8 | e6:8 r:8',
      baixo: '@1.......5...1...', acordes: 'F | G | Em | Am | F | G | Am | Am', bateria: 'b',
    },
    C: {
      melodia: 'f5:4 a5:4 d6:8 | e6:6 c6:2 a5:8 | f5:4 a5:4 d6:4 f6:4 | e6:8 g#5:4 b5:4 | d6:6 f6:2 a5:8 | c6:6 e6:2 a5:8 | a5:4 c6:4 f6:6 e6:2 | e6:8 d6:4 b5:4',
      contra: '-', baixo: '@1.......5.......', acordes: 'Dm | Am | Dm | E | Dm | Am | F | E7', bateria: 'a',
      estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 1], passo: 2, oitava: 4 }, inst: { harmonia: 'kalimba' },
    },
    D: {
      melodia: 'a5:4 e5:4 a5:4 c6:4 | e6:6 d6:2 c6:4 g5:4 | b5:4 d6:4 g6:8 | e6:8 b5:8 | c6:4 a5:4 f5:4 a5:4 | g5:4 c6:4 e6:8 | f6:4 d6:4 e6:4 g#5:4 | a5:6 e5:2 a4:8',
      contra: '-', baixo: '@1.......5...1...', acordes: 'Am | C | G | Em | F | C | Dm E | Am', bateria: 'b',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const rotaDiaB: Faixa = {
  id: 'rota-dia-B', titulo: 'Veredas do Sertão', bpm: 124, loop: true, envio: 0.24,
  inst: { melodia: 'viola', contra: 'pulso12', baixo: 'tri', harmonia: 'violao' },
  estilo: { tipo: 'ritmo', grade: 'x..x..x.x..x..x.', oitava: 4 },
  vol: { melodia: 1, contra: 0.45, harmonia: 0.5 },
  bateria: {
    a: { zabumba: 'X..x....X..x....', bacalhau: '......x.......x.', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.' },
    b: { zabumba: 'X..x..x.X..x..x.', bacalhau: '....x.......x...', triF: 'xx.xxx.xxx.xxx.x', triA: '..x...x...x...x.', pandeiro: '....x.......x...' },
    v: { zabumba: 'X..x..X..x..X.x.', bacalhau: '..x..x..x..x...x', triA: '..x...x...x...x.' },
  },
  secoes: {
    A: {
      melodia: 'e5:3 g#5:3 b5:2 d6:3 c#6:3 b5:2 | g#5:3 b5:3 e5:2 g#5:8 | f#5:3 a5:3 d6:2 c#6:3 a5:3 f#5:2 | g#5:6 e5:2 b4:8 | e5:3 g#5:3 b5:2 d6:3 e6:3 d6:2 | c#6:3 a5:3 e5:2 a5:8 | d6:2 c#6 a5 f#5 a5:4 d5:4 | e5:12 r:4',
      contra: V8, baixo: '@1..1..5.1..1..5.', acordes: 'E | E | D | E | E | A | D | E', bateria: 'a a a a a a a v',
    },
    B: {
      melodia: 'c#6:4 e6:2 a5:6 c#6:4 | b5:4 g#5:2 e5:6 g#5:4 | a5:2 f#5 d5 f#5 a5:4 d6:4 | b5:6 g#5:2 e5:8 | c#6:2 e6 a6:4 g#6:2 e6 c#6:4 | b5:2 e6 g#6:4 e6:2 b5 g#5:4 | a5:4 f#5:4 d#5:4 b4:4 | e5:8 r:8',
      contra: V8, baixo: '@1..1..5.1..5..8.', acordes: 'A | E | D | E | A | E | B7 | E', bateria: 'b b b b b b b v',
      inst: { melodia: 'pulso25' },
    },
    C: {
      melodia: 'e5:4 g#5:4 c#6:6 b5:2 | a5:6 c#6:2 e6:8 | b5:4 g#5:4 e5:6 g#5:2 | f#5:8 d#5:4 b4:4 | c#6:4 e6:4 g#6:6 e6:2 | c#6:6 a5:2 e5:8 | f#5:2 a5 c#6:4 a5:2 c#6 f#6:4 | d#6:4 b5:4 f#5:4 b5:4',
      contra: 'c#5:8 e5:8 | c#5:8 a4:8 | b4:8 e5:8 | b4:8 f#4:8 | e5:8 g#5:8 | e5:8 c#5:8 | c#5:8 a4:8 | b4:8 d#5:8',
      baixo: '@1.......5...1...', acordes: 'C#m | A | E | B | C#m | A | F#m | B', bateria: 'a',
      inst: { melodia: 'flauta' }, estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 1], passo: 2, oitava: 4 },
    },
    D: {
      melodia: 'b5:3 e6:3 g#6:2 e6:3 b5:3 g#5:2 | a5:3 d6:3 f#6:2 d6:3 a5:3 f#5:2 | e5:2 a5 c#6 e6 c#6:4 a5:4 | g#5:6 b5:2 e6:8 | g#6:3 e6:3 b5:2 e6:3 g#6:3 b6:2 | a6:3 f#6:3 d6:2 f#6:3 a6:3 f#6:2 | e6:4 c#6:4 d#6:4 f#6:4 | e6:12 r:4',
      contra: V8, baixo: '@1..1..5.1..5..8.', acordes: 'E | D | A | E | E | D | A B | E', bateria: 'b b b b b b b v',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const rotaNoiteB: Faixa = {
  id: 'rota-noite-B', titulo: 'Sertão das Névoas à Noite', bpm: 84, loop: true, envio: 0.45,
  inst: { melodia: 'flauta', contra: 'kalimba', baixo: 'baixoSub', harmonia: 'viola' },
  estilo: { tipo: 'arpejo', padrao: [0, 2, 1, 2, 3, 2, 1, 2], passo: 2, oitava: 3 },
  vol: { melodia: 0.85, harmonia: 0.5, contra: 0.5, bateria: 0.45 },
  bateria: {
    a: { caxixi: 'x.....x...x.....', triF: '........x.......' },
    b: { caxixi: 'x..x..x...x..x..', zabumba: 'x..........o....' },
  },
  secoes: {
    A: {
      melodia: 'b4:4 e5:4 g5:6 f#5:2 | e5:6 c#5:2 a4:8 | b4:4 e5:4 g5:4 b5:4 | a5:6 f#5:2 d5:8 | e5:4 g5:4 b5:6 a5:2 | g5:6 e5:2 c#5:8 | e5:4 g5:4 c6:6 b5:2 | b5:8 f#5:4 d#5:4',
      contra: '-', baixo: '@1.......5.......', acordes: 'Em | A | Em | Bm | Em | A | C | B7', bateria: 'a',
    },
    B: {
      melodia: 'd5:4 g5:4 b5:6 a5:2 | a5:6 f#5:2 d5:8 | e5:2 g5 b5:4 a5:2 g5 e5:4 | e5:8 b4:4 e5:4 | b5:4 d6:4 g5:6 b5:2 | a5:4 d6:4 f#5:8 | e5:2 a5 c6:4 b5:2 a5 e5:4 | f#5:8 b4:8',
      contra: 'r:8 b4:4 d5:4 | r:8 a4:4 f#4:4 | - | r:4 b4:4 g4:4 e4:4 | r:8 d5:4 b4:4 | r:8 a4:4 d5:4 | - | r:8 d#5:4 f#5:4',
      baixo: '@1.......5...1...', acordes: 'G | D | Em | Em | G | D | Am | B7', bateria: 'b',
    },
    C: {
      melodia: 'g5:6 e5:2 c5:8 | b5:6 g5:2 d5:8 | c6:4 a5:4 e5:6 a5:2 | g5:8 e5:8 | e6:6 c6:2 g5:8 | d6:6 b5:2 g5:8 | c6:4 a5:4 e5:4 c5:4 | d#5:8 f#5:4 b5:4',
      contra: '-', baixo: '@1.......5.......', acordes: 'C | G | Am | Em | C | G | Am | B7', bateria: 'a',
    },
    D: {
      melodia: 'e6:8 b5:8 | c6:6 e6:2 g5:8 | b5:4 d6:4 g6:8 | f#6:6 d6:2 a5:8 | g5:4 b5:4 e6:6 d6:2 | c6:4 g5:4 e5:8 | a5:4 c6:4 b5:4 d#5:4 | e5:12 r:4',
      contra: '-', baixo: '@1.......5...1...', acordes: 'Em | C | G | D | Em | C | Am B7 | Em', bateria: 'b',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const caverna: Faixa = {
  id: 'caverna', titulo: 'Grutas e Túneis', bpm: 76, loop: true, envio: 0.55,
  eco: { passos: 3, fb: 0.4, mix: 0.3 },
  inst: { melodia: 'marimba', contra: 'sino', baixo: 'baixoSub', harmonia: 'pad' },
  estilo: { tipo: 'pad', oitava: 3 },
  vol: { melodia: 0.9, contra: 0.4, harmonia: 0.6, bateria: 0.5 },
  bateria: {
    a: { gota: '......x.......o.', caxixi: 'x.......x.......' },
    b: { gota: '..o.......x.....', caxixi: 'x...x...x...x...', surdo: 'x...............' },
  },
  secoes: {
    A: {
      melodia: 'd5:2 f5 a5 d5 f5 a5 d6:4 | c6:2 a5 f5 a5 d5:8 | eb5:2 g5 bb5 eb5 g5 bb5 eb6:4 | d6:2 a5 f5 a5 d5:8 | d5:2 f5 a5 d5 f5 a5 c6:4 | bb5:2 f5 d5 f5 bb4:8 | g5:2 bb5 d6 g5 bb5 d6 g6:4 | e6:2 c#6 a5 c#6 e5:8',
      contra: '-', baixo: '@1...............', acordes: 'Dm | Dm | Eb | Dm | Dm | Bb | Gm | A', bateria: 'a',
    },
    B: {
      melodia: 'a5:8 f5:4 d5:4 | g5:8 e5:4 c5:4 | f5:8 d5:4 bb4:4 | e5:8 c#5:8 | a5:4 d6:4 f6:8 | e6:4 c6:4 g5:8 | d6:4 bb5:4 c#6:4 e6:4 | d6:12 r:4',
      contra: 'r:8 d6:8 | r:8 c6:8 | r:8 bb5:8 | r:8 a5:8 | - | - | - | r:8 a5:8',
      baixo: '@1.......5.......', acordes: 'Dm | C | Bb | A | Dm | C | Bb A | Dm', bateria: 'b',
    },
    C: {
      melodia: 'g5:2 r bb5 r d6:4 bb5:4 | f5:2 r a5 r d6:4 a5:4 | eb5:2 r g5 r bb5:4 eb6:4 | c#6:8 a5:8 | d6:2 r bb5 r g5:4 d5:4 | a5:2 r f5 r d5:4 a4:4 | bb4:4 d5:4 f5:4 bb5:4 | a5:8 e5:8',
      contra: '-', baixo: '@1...............', acordes: 'Gm | Dm | Eb | A7 | Gm | Dm | Bb | A', bateria: 'a',
    },
    D: {
      melodia: 'd6:6 a5:2 f5:8 | c6:6 a5:2 f5:8 | e6:6 c6:2 g5:8 | d6:4 bb5:4 g5:8 | f5:2 a5 d6 f6 e6:4 d6:4 | c6:2 a5 f5 a5 c6:8 | c#6:4 e6:4 a5:4 c#5:4 | d5:12 r:4',
      contra: 'r:8 a5:4 d6:4 | r:8 c6:4 a5:4 | r:8 g5:4 c6:4 | r:8 d6:4 bb5:4 | - | - | - | r:4 a5:4 f5:4 d5:4',
      baixo: '@1.......5.......', acordes: 'Dm | F | C | Gm | Dm | F | A | Dm', bateria: 'b',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const agua: Faixa = {
  id: 'agua', titulo: 'Remando na Baía', bpm: 100, loop: true, envio: 0.38,
  inst: { melodia: 'flauta', contra: 'kalimba', baixo: 'tri', harmonia: 'viola' },
  estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 3, 2, 1], passo: 2, oitava: 4 },
  vol: { melodia: 0.9, harmonia: 0.45, contra: 0.5, bateria: 0.5 },
  bateria: {
    a: { ganza: 'x.oxx.oxx.oxx.ox', caxixi: '....x.......x...' },
    b: { ganza: 'x.oxx.oxx.oxx.ox', caxixi: '....x.......x...', zabumba: 'x.....x.x.......', triA: '..............x.' },
  },
  secoes: {
    A: {
      melodia: 'a5:6 c6:2 f6:8 | e6:6 c6:2 g5:8 | f5:4 a5:4 d6:6 c6:2 | d6:4 bb5:4 f5:8 | a5:6 c6:2 f6:4 a6:4 | g6:6 e6:2 c6:8 | d6:2 f6 bb5:4 d6:2 bb5 f5:4 | g5:8 c6:4 e6:4',
      contra: '-', baixo: '@1.....5.8.....5.', acordes: 'F | C/E | Dm | Bb | F | C | Bb | C', bateria: 'a',
    },
    B: {
      melodia: 'f6:4 d6:4 a5:6 d6:2 | e6:4 c6:4 a5:8 | d6:4 bb5:4 f5:6 bb5:2 | c6:4 a5:4 f5:8 | d6:2 f6 a6:4 f6:2 d6 a5:4 | c6:2 e6 a6:4 e6:2 c6 a5:4 | bb5:4 d6:4 g6:6 f6:2 | e6:8 c6:4 g5:4',
      contra: 'a4:8 d5:8 | a4:8 c5:8 | bb4:8 d5:8 | a4:8 c5:8 | - | - | d5:8 bb4:8 | c5:8 e5:8',
      baixo: '@1.....5.8.....5.', acordes: 'Dm | Am | Bb | F | Dm | Am | Gm | C', bateria: 'b',
    },
    C: {
      melodia: 'bb5:6 d6:2 f6:8 | e6:6 g6:2 c6:8 | e6:4 c6:4 a5:6 c6:2 | d6:8 a5:4 f5:4 | bb5:2 d6 f6:4 d6:2 f6 bb5:4 | c6:2 e6 g6:4 e6:2 g6 c6:4 | a5:4 c6:4 f6:8 | f6:8 r:8',
      contra: '-', baixo: '@1.....5.8.....5.', acordes: 'Bb | C | Am | Dm | Bb | C | F | F', bateria: 'b',
    },
    D: {
      melodia: 'c6:4 a5:4 f5:4 a5:4 | c6:4 e6:4 a6:8 | f6:6 d6:2 bb5:8 | e6:6 c6:2 g5:8 | a5:2 c6 f6:4 e6:2 c6 a5:4 | f5:2 a5 d6:4 c6:2 a5 f5:4 | d6:4 f6:4 e6:4 g6:4 | f6:12 r:4',
      contra: 'r:8 c5:4 f5:4 | r:8 e5:4 a5:4 | r:8 d5:4 f5:4 | r:8 c5:4 e5:4 | - | - | - | r:4 a5:4 c6:4 f5:4',
      baixo: '@1.....5.8.....5.', acordes: 'F | Am | Bb | C | F | Dm | Bb C | F', bateria: 'a a a a b b b b',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const mergulho: Faixa = {
  id: 'mergulho', titulo: 'Recife Submerso', bpm: 72, loop: true, envio: 0.6,
  eco: { passos: 4, fb: 0.45, mix: 0.35 },
  inst: { melodia: 'kalimba', contra: 'flauta', baixo: 'baixoSub', harmonia: 'padBrilho' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 0.9, contra: 0.4, harmonia: 0.6, bateria: 0.4 },
  bateria: {
    a: { gota: '..........x.....' },
    b: { gota: '....o.........x.', caxixi: 'x.......x.......' },
  },
  secoes: {
    A: {
      melodia: 'e5:4 g5:4 b5:4 f#5:4 | a5:4 d6:4 f#6:8 | g6:4 e6:4 b5:8 | a5:4 f#5:4 d5:8 | e5:4 b5:4 e6:4 g6:4 | f#6:4 d6:4 a5:8 | b5:4 d6:4 f#6:8 | e6:12 r:4',
      contra: 'g4:16 | f#4:16 | b4:16 | a4:16 | g4:16 | a4:16 | f#4:16 | g4:12 r:4',
      baixo: '@1...............', acordes: 'Cmaj7 | D | Em | D | Cmaj7 | D | Bm | Em', bateria: 'a',
    },
    B: {
      melodia: 'c6:8 a5:4 e5:4 | b5:8 g5:4 e5:4 | e5:4 g5:4 c6:4 e6:4 | d6:8 f#5:8 | e6:8 c6:4 a5:4 | g6:8 e6:4 b5:4 | c6:4 e6:4 d6:4 f#6:4 | g6:8 e6:8',
      contra: '-', baixo: '@1.......5.......', acordes: 'Am | Em | C | D | Am | Em | C D | Em', bateria: 'b',
    },
    C: {
      melodia: 'd6:4 b5:4 g5:8 | f#5:4 a5:4 d6:8 | e6:4 b5:4 g5:4 e5:4 | f#5:8 b5:8 | g5:4 c6:4 e6:8 | b5:4 d6:4 g6:8 | a5:4 c6:4 e6:4 a6:4 | f#6:8 d6:8',
      contra: '-', baixo: '@1.......5.......', acordes: 'G | D | Em | Bm | C | G | Am | D', bateria: 'b',
      estilo: { tipo: 'arpejo', padrao: [0, 1, 2, 1], passo: 4, oitava: 4 },
    },
    D: {
      melodia: 'b5:8 e6:8 | d6:8 f#6:8 | e6:4 c6:4 a5:8 | g5:8 b5:8 | b5:4 g5:4 e5:4 g5:4 | a5:4 f#5:4 d5:4 a5:4 | b5:8 g5:8 | e5:12 r:4',
      contra: 'g4:16 | f#4:16 | e4:16 | e4:16 | g4:16 | f#4:16 | e4:16 | e4:12 r:4',
      baixo: '@1...............', acordes: 'Cmaj7 | Bm | Am | Em | Cmaj7 | D | Em | Em', bateria: 'a',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};

export const pico: Faixa = {
  id: 'pico', titulo: 'Pico Pingorama', bpm: 80, loop: true, envio: 0.5,
  inst: { melodia: 'flauta', contra: 'metais', baixo: 'baixoSub', harmonia: 'cordas' },
  estilo: { tipo: 'pad', oitava: 4 },
  vol: { melodia: 0.95, contra: 0.5, harmonia: 0.7, bateria: 0.6 },
  bateria: {
    a: { surdo: 'x...............', triA: '........x.......' },
    b: { surdo: 'X.......x.......', caixa: '..........o.o.oo', triA: '....x.......x...' },
    c: { surdo: 'X.......x.......', prato: 'x...............', caixa: '....o.oo....o.oo' },
  },
  secoes: {
    A: {
      melodia: 'd5:8 a5:8 | bb5:6 a5:2 f5:8 | a5:8 c6:8 | e6:6 d6:2 c6:8 | d6:8 f6:8 | d6:6 c6:2 bb5:8 | g5:4 bb5:4 d6:8 | c#6:12 r:4',
      contra: '-', baixo: '@1...............', acordes: 'Dm | Bb | F | C | Dm | Bb | Gm | A', bateria: 'a',
    },
    B: {
      melodia: 'c6:4 a5:4 f5:6 a5:2 | g5:4 c6:4 e6:8 | f6:6 e6:2 d6:8 | c6:6 a5:2 e5:8 | d5:4 f5:4 bb5:6 d6:2 | c6:8 a5:8 | bb5:4 g5:4 d5:4 g5:4 | a5:8 e5:8',
      contra: 'f4:16 | e4:16 | f4:16 | e4:16 | d4:16 | f4:16 | g4:16 | e4:8 a4:8',
      baixo: '@1.......5.......', acordes: 'F | C | Dm | Am | Bb | F | Gm | A', bateria: 'b',
    },
    C: {
      melodia: 'f#5:8 a5:8 | e6:6 c#6:2 a5:8 | d6:8 f#6:8 | g6:6 f#6:2 d6:8 | a5:4 d6:4 f#6:4 a6:4 | g6:6 e6:2 c#6:8 | b5:4 d6:4 g6:8 | e6:12 r:4',
      contra: 'd4:16 | e4:16 | f#4:16 | g4:16 | f#4:16 | e4:16 | d4:16 | e4:12 r:4',
      baixo: '@1.......5...1...', acordes: 'D | A/C# | Bm | G | D | A | G | A', bateria: 'c',
    },
    D: {
      melodia: 'f#6:6 d6:2 b5:8 | g5:4 b5:4 d6:8 | f#6:8 a5:8 | e6:6 c#6:2 a5:8 | b5:4 d6:4 f#6:6 e6:2 | d6:6 b5:2 g5:8 | a5:4 c#6:4 e6:8 | d6:12 r:4',
      contra: '-', baixo: '@1.......5...1...', acordes: 'Bm | G | D | A | Bm | G | A | Dm', bateria: 'c c c c c c b a',
    },
  },
  ordem: ['A', 'B', 'C', 'D'],
};
